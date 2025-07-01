import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST: Book a demo and log request/note
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, schoolName, demoDate, demoTime, note, address, numStudents, contactName, contactPhone } = data;
    if (!email || !name || !phone || !schoolName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find or create Lead by email or phone
    let lead = await prisma.lead.findFirst({ where: { email } });

    // If not found by email, try to find by phone
    if (!lead && phone) {
      lead = await prisma.lead.findFirst({ where: { phone } });
    }

    const isExistingLead = !!lead;
    
    if (!lead) {
      // Create new lead if doesn't exist
      lead = await prisma.lead.create({
        data: {
          id: uuidv4(),
          name,
          phone,
          email,
          schoolName,
          address: address || undefined,
          numberOfStudents: numStudents ? String(numStudents) : undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      // Store the old lead information before updating
      const oldLeadInfo = {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        schoolName: lead.schoolName,
        address: lead.address,
        numberOfStudents: lead.numberOfStudents
      };
      
      // Prepare the new lead data
      const updateData = {
        name: name || lead.name,
        phone: phone || lead.phone,
        email: email || lead.email,
        schoolName: schoolName || lead.schoolName,
        address: address || lead.address,
        numberOfStudents: numStudents ? String(numStudents) : lead.numberOfStudents,
      };
      
      // Update existing lead with any new information
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: updateData
      });
      
      // Log changes if any field was actually updated
      let changesDetected = false;
      const changeLog = ['Lead information updated during demo booking:'];
      
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
            id: uuidv4(),
            leadId: lead.id,
            content: changeLog.join('\n')
          }
        });
      }
    }

    // 2. Log a note for the lead
    let noteContent = note || `Demo requested for ${demoDate} at ${demoTime}`;
    
    // If we're using an existing lead, add that context to the note
    if (isExistingLead) {
      noteContent = `[EXISTING LEAD] ${noteContent}`;
    }
    
    await prisma.note.create({
      data: {
        id: uuidv4(),
        leadId: lead.id,
        content: noteContent,
        // Note: The Note model doesn't have a type field
      },
    });

    // 3. Create a Request entry (DEMO)
    await prisma.request.create({
      data: {
        id: uuidv4(),
        type: 'DEMO',
        leadId: lead.id,
        details: {
          demoDate,
          demoTime,
          note,
          contactName,
          contactPhone,
        }
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error('[BOOK_DEMO_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
