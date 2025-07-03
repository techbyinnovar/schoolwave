import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { schoolName, name, phone, email, address, webinarId } = data;

    // --- Start of Validation ---
    if (!webinarId) {
      return NextResponse.json({ error: 'Webinar ID is required' }, { status: 400 });
    }
    // Email is the primary unique identifier for a lead and is required.
    if (!email) {
      return NextResponse.json({ error: 'Email is required to register.' }, { status: 400 });
    }
    // --- End of Validation ---

    const setting = await prisma.setting.findUnique({ where: { key: 'webinar_stage_id' } });
    const stageId = setting?.value;

    if (!stageId || typeof stageId !== 'string') {
      return NextResponse.json({ error: 'Webinar stage ID is not configured in settings.' }, { status: 500 });
    }

    // --- Find or Create Lead ---
    // Using findFirst instead of findUnique since email is not marked as unique in the schema
    let lead = await prisma.lead.findFirst({
      where: { 
        email: { 
          equals: email 
        } 
      },
    });

    const isExistingLead = !!lead;

    if (isExistingLead) {
      // If the lead exists, update it with any new, non-null information
      const updateData: { [key: string]: any } = {};
      if (schoolName && schoolName !== lead!.schoolName) updateData.schoolName = schoolName;
      if (name && name !== lead!.name) updateData.name = name;
      if (phone && phone !== lead!.phone) updateData.phone = phone;
      if (address && address !== lead!.address) updateData.address = address;

      if (Object.keys(updateData).length > 0) {
        // Log changes before updating
        const changeLog = ['Lead information updated during webinar registration:'];
        for (const [key, newValue] of Object.entries(updateData)) {
            changeLog.push(`- ${key}: "${(lead as any)[key] || '(not set)'}" → "${newValue || '(not set)'}"`);
        }
        await prisma.note.create({
            data: { id: uuidv4(), leadId: lead!.id, content: changeLog.join('\n') }
        });

        lead = await prisma.lead.update({
          where: { id: lead!.id },
          data: updateData,
        });
      }
    } else {
      // If the lead does not exist, create a new one
      lead = await prisma.lead.create({
        data: {
          id: uuidv4(),
          schoolName,
          name,
          phone,
          email,
          address,
          stageId,
          updatedAt: new Date(), // Required field in the Lead model
        },
      });
    }

    // --- Final Guardrail ---
    // This check is critical. If 'lead' is null here, something has gone wrong,
    // and we must not proceed to create an orphan registration.
    if (!lead) {
      console.error('Fatal: Lead could not be found or created. Registration aborted.');
      return NextResponse.json({ error: 'Could not process lead information' }, { status: 500 });
    }

    // Check if already registered
    const existingRegistration = await prisma.webinar_registrations.findUnique({
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
    const webinarRegistration = await prisma.webinar_registrations.create({
      data: {
        id: uuidv4(),
        registeredAt: new Date(),
        leadId: lead.id,
        webinarId: webinarId,
      },
    });

    // Get webinar details for the note
    const webinar = await prisma.webinars.findUnique({
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
        id: uuidv4(),
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
