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

    // 1. Find or create Lead by email
    let lead = await prisma.lead.findUnique({ where: { email } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: name || email,
          phone,
          email,
          schoolName: schoolName || 'N/A',
        },
      });
    }

    // 2. Log a note for the lead
    const noteContent = note || `Call requested for ${preferredDay} at ${preferredTime}`;
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
