import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
try {
  // Try to import from lib/db, fallback to direct instantiation
  // This covers both edge and node runtimes
  // @ts-ignore
  prisma = (await import('@/lib/db')).db || new PrismaClient();
} catch (e) {
  prisma = new PrismaClient();
  console.error('Falling back to new PrismaClient()', e);
}


// POST: Book a call and log request/note
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, schoolName, preferredDay, preferredTime, note } = data;
    if (!email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find or create Lead by email or phone
    let lead = await prisma.lead.findUnique({ where: { email } });
    let isExistingLead = false;
    
    // If not found by email, try to find by phone
    if (!lead && phone) {
      const leadByPhone = await prisma.lead.findFirst({
        where: { phone },
      });
      if (leadByPhone) lead = leadByPhone;
    }
    
    if (!lead) {
      // Create new lead if doesn't exist
      lead = await prisma.lead.create({
        data: {
          name: name || email,
          phone,
          email,
          schoolName: schoolName || 'N/A',
        },
      });
    } else {
      // Using existing lead
      isExistingLead = true;
      
      // Store the old lead information before updating
      const oldLeadInfo = {
        name: lead.name,
        phone: lead.phone,
        schoolName: lead.schoolName
      };
      
      // Prepare the new lead data
      const updateData = {
        // Update fields only if new values are provided
        name: name || lead.name,
        phone: phone || lead.phone,
        schoolName: schoolName || lead.schoolName,
      };
      
      // Update existing lead with any new information
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: updateData
      });
      
      // Log changes if any field was actually updated
      let changesDetected = false;
      const changeLog = ['Lead information updated during call booking:'];
      
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

    // 2. Log a note for the lead
    let noteContent = note || `Call requested for ${preferredDay} at ${preferredTime}`;
    
    // If we're using an existing lead, add that context to the note
    if (isExistingLead) {
      noteContent = `[EXISTING LEAD] ${noteContent}`;
    }
    
    await prisma.note.create({
      data: {
        leadId: lead.id,
        content: noteContent,
      },
    });

    // 3. Create a Request entry (CALL)
    await prisma.request.create({
      data: {
        type: 'CALL',
        leadId: lead.id,
        details: {
          preferredDay,
          preferredTime,
          note: noteContent,
        },
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error('[BOOK_A_CALL_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
