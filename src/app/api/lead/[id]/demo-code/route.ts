import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/auth';

// POST /api/lead/[id]/demo-code - assign demo code to existing lead and log a note
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

  const session = await auth();
  const userId = session?.user?.id || null;
  const role = session?.user?.role || '';
  if (!userId || !['ADMIN', 'AGENT'].includes(role)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  // Parse request body for optional lead info updates
  const data = await req.json();
  // Only allow updating a subset of lead fields
  const allowedFields = ['schoolName', 'name', 'phone', 'email', 'address'];
  const leadUpdates: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      leadUpdates[key] = data[key];
    }
  }

  try {
    // Debug logging for id
    console.log('[DEMO CODE API] Looking for lead with id:', id);
    const lead = await prisma.lead.findUnique({ where: { id } });
    console.log('[DEMO CODE API] Lead found:', !!lead, lead?.id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // Detect if any info will be updated
    let infoUpdated = false;
    for (const key of allowedFields) {
      if (leadUpdates[key] !== undefined && leadUpdates[key] !== lead[key]) {
        infoUpdated = true;
        break;
      }
    }

    // Assign demo code if not present
    let demoCode = lead.demoCode;
    if (!demoCode) {
      // Generate a unique demo code (e.g., 8-char alphanumeric)
      demoCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      // Ensure uniqueness (could be improved for concurrency)
      const exists = await prisma.lead.findFirst({ where: { demoCode } });
      if (exists) {
        demoCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      }
      leadUpdates.demoCode = demoCode;
    }

    // Update lead with demo code and any info changes
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: leadUpdates,
    });

    // Create note for demo code issuance
    await prisma.note.create({
      data: {
        id: uuidv4(),
        leadId: id,
        content: `Demo code issued: ${demoCode}`,
        createdAt: new Date(),
        userId,
      },
    });

    // If info updated, create a note
    if (infoUpdated) {
      await prisma.note.create({
        data: {
          id: uuidv4(),
          leadId: id,
          content: `Lead info updated when issuing demo code.`,
          createdAt: new Date(),
          userId,
        },
      });
    }

    return NextResponse.json({ result: { data: updatedLead, demoCode } });
  } catch (error: any) {
    console.error('Error issuing demo code:', error);
    return NextResponse.json({ error: error.message || 'Failed to issue demo code' }, { status: 500 });
  }
}
