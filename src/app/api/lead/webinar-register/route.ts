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

    // Upsert lead: find by email or create new
    let lead = await prisma.lead.findUnique({
      where: { email },
    });

    if (!lead) {
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
      // Optionally, update existing lead's details if necessary
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          schoolName: schoolName ?? lead.schoolName,
          name: name ?? lead.name,
          phone: phone ?? lead.phone,
          address: address ?? lead.address,
          // Update stageId only if a new valid one is provided and different
          ...(stageId && typeof stageId === 'string' && lead.stageId !== stageId && { stageId }),
        }
      });
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
