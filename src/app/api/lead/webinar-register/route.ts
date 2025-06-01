import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { schoolName, name, phone, email, address } = data;
    // Fetch webinar stage id from settings
    const setting = await prisma.setting.findUnique({ where: { key: 'webinar_stage_id' } });
    if (!setting || !setting.value) {
      return NextResponse.json({ error: 'Webinar stage not set' }, { status: 400 });
    }
    const stageId = setting.value;
    if (typeof stageId !== 'string') {
      return NextResponse.json({ error: 'Webinar stage ID is not a string' }, { status: 500 });
    }
    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        schoolName,
        name,
        phone,
        email,
        address,
        stageId,
      },
    });
    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error registering webinar lead:', error);
    return NextResponse.json({ error: 'Failed to register lead' }, { status: 500 });
  }
}
