import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { schoolName, name, phone, email, address, webinarId } = data;

    if (!webinarId) {
      return NextResponse.json({ error: 'Webinar ID is required' }, { status: 400 });
    }

    // Fetch webinar stage id from settings (optional, could be handled differently)
    const setting = await prisma.setting.findUnique({ where: { key: 'webinar_stage_id' } });
    const stageId = setting?.value;

    if (!stageId || typeof stageId !== 'string') {
      return NextResponse.json({ error: 'Webinar stage ID is required and not found in settings.' }, { status: 400 });
    }

    // Try to find an existing lead by email or phone
    let lead = await prisma.lead.findUnique({
      where: { email },
    });
    let isExistingLead = false;
    
    // If not found by email, try to find by phone
    if (!lead && phone) {
      const leadByPhone = await prisma.lead.findFirst({
        where: { phone },
      });
      if (leadByPhone) {
        lead = leadByPhone;
        isExistingLead = true;
      }
    } else if (lead) {
      isExistingLead = true;
    }

    if (!lead) {
      // No existing lead found by email or phone, create a new one
      lead = await prisma.lead.create({
        data: {
          schoolName,
          name,
          phone,
          email,
          address,
          stageId, // always a valid string here
        },
      });
    } else {
      // Store the old lead information before updating
      const oldLeadInfo = {
        schoolName: lead.schoolName,
        name: lead.name,
        phone: lead.phone,
        address: lead.address,
        stageId: lead.stageId
      };
      
      // Prepare the new lead data
      const updateData = {
        schoolName: schoolName ?? lead.schoolName,
        name: name ?? lead.name,
        phone: phone ?? lead.phone,
        address: address ?? lead.address,
        // Update stageId only if a new valid one is provided and different
        ...(stageId && typeof stageId === 'string' && lead.stageId !== stageId && { stageId }),
      };
      
      // Update the lead
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: updateData
      });
      
      // Log changes if any field was actually updated
      let changesDetected = false;
      const changeLog = ['Lead information updated during webinar registration:'];
      
      for (const [key, newValue] of Object.entries(updateData)) {
        // Check if this field in updateData is different from the old value
        if (newValue !== oldLeadInfo[key as keyof typeof oldLeadInfo]) {
          changesDetected = true;
          changeLog.push(`- ${key}: "${oldLeadInfo[key as keyof typeof oldLeadInfo] || '(not set)'}" → "${newValue || '(not set)'}"`);
        }
      }
      
      // If changes were made, create a note about them
      if (changesDetected) {
        await prisma.note.create({
          data: {
            leadId: lead.id,
            content: changeLog.join('\n')
          }
        });
      }
    }

    // Check if already registered
    const existingRegistration = await prisma.webinarRegistration.findUnique({
      where: {
        webinarId_leadId: {
          webinarId: webinarId,
          leadId: lead.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ message: 'Lead already registered for this webinar', lead, registration: existingRegistration }, { status: 200 });
    }

    // Create the webinar registration
    const webinarRegistration = await prisma.webinarRegistration.create({
      data: {
        leadId: lead.id,
        webinarId: webinarId,
      },
    });

    // Get webinar details for the note
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      select: { title: true }
    });

    // Log a note for this lead about the webinar registration
    // Create note indicating registration (with [EXISTING LEAD] prefix if applicable)
    let noteContent = `Lead registered for webinar: ${webinar?.title || webinarId}`;
    
    // If we had an existing lead by email or phone, prefix the note
    if (isExistingLead) {
      noteContent = `[EXISTING LEAD] ${noteContent}`;
    }
    
    await prisma.note.create({
      data: {
        leadId: lead.id,
        content: noteContent,
      },
    });

    return NextResponse.json({ lead, webinarRegistration });
  } catch (error) {
    console.error('Error registering webinar lead:', error);
    // Consider more specific error handling, e.g., Prisma known errors
    if (error instanceof Error && 'code' in error && error.code === 'P2002') { // Unique constraint failed
        return NextResponse.json({ error: 'A registration for this lead and webinar might already exist or another unique constraint failed.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to register lead' }, { status: 500 });
  }
}
