import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// POST: Book a demo and log request/note
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, schoolName, demoDate, demoTime, note, address, numStudents, contactName, contactPhone } = data;
    if (!email || !name || !phone || !schoolName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find or create Lead by email
    let lead = await prisma.lead.findUnique({ where: { email } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name,
          phone,
          email,
          schoolName,
          address: address || undefined,
          numberOfStudents: numStudents ? String(numStudents) : undefined,
        },
      });
    }

    // 2. Log a note for the lead
    const noteContent = note || `Demo requested for ${demoDate} at ${demoTime}`;
    await prisma.note.create({
      data: {
        leadId: lead.id,
        content: noteContent,
      },
    });

    // 3. Create a Request entry (DEMO)
    await prisma.request.create({
      data: {
        type: 'DEMO',
        leadId: lead.id,
        details: {
          demoDate,
          demoTime,
          note: noteContent,
          contactName,
          contactPhone,
        },
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error('[BOOK_DEMO_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
