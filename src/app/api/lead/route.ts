// REST API for Lead CRUD
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { sendTemplateToLead } from './sendTemplateToLead';


import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    return NextResponse.json({ lead });
  }
  let leads;
  if (role === "AGENT" && userId) {
    leads = await prisma.lead.findMany({
      where: {
        OR: [
          { assignedTo: userId },
          { ownedById: userId }
        ]
      },
      include: { agent: true, ownedBy: true, stage: true }
    });
  } else {
    leads = await prisma.lead.findMany({ include: { agent: true, ownedBy: true, stage: true } });
  }
  return NextResponse.json({ result: { data: leads } });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Sanitize and map incoming data
  const {
    schoolName,
    name,
    phone,
    email,
    address,
    assignedTo,
    stageId,
  } = data;

  // Only send valid fields to prisma
  const lead = await prisma.lead.create({
    data: {
      schoolName,
      name,
      phone,
      email,
      address,
      assignedTo: assignedTo && assignedTo !== 'Unassigned' ? assignedTo : null,
      ownedById: data.ownedById && data.ownedById !== 'Unassigned' ? data.ownedById : null,
      stageId,
    },
    include: { agent: true, ownedBy: true, stage: true },
  });

  // Trigger default message for the stage if any
  if (stageId) {
    const stage = await prisma.stage.findUnique({ where: { id: stageId }, include: { defaultTemplate: true } });
    if (stage?.defaultTemplateId && stage.defaultTemplate) {
      await sendTemplateToLead({
        lead,
        agent: null,
        template: stage.defaultTemplate,
        userId: null,
        fromStage: null,
        toStage: null,
      });
    }
  }

  return NextResponse.json({ lead });
}



export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, ...update } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Only allow valid fields for update
  const allowedFields = [
    'schoolName', 'name', 'phone', 'email', 'address', 'assignedTo', 'ownedById', 'stageId'
  ];
  const filteredUpdate: any = {};
  for (const key of allowedFields) {
    if (update[key] !== undefined) filteredUpdate[key] = update[key];
  }

  // Fetch previous lead to check for stage change
  const prevLead = await prisma.lead.findUnique({ where: { id }, include: { agent: true, stage: true } });
  const prevStageId = prevLead?.stageId;
  const newStageId = update.stageId || prevStageId;

  const lead = await prisma.lead.update({ where: { id }, data: filteredUpdate, include: { agent: true, ownedBy: true, stage: true } });

  // Log a note about the update (diff)
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const changedFields: string[] = [];
    const changes: string[] = [];
    for (const key of Object.keys(filteredUpdate)) {
      if (prevLead && prevLead[key] !== filteredUpdate[key]) {
        changedFields.push(key);
        changes.push(`${key}: '${prevLead[key] ?? ''}' → '${filteredUpdate[key] ?? ''}'`);
      }
    }
    if (changedFields.length > 0) {
      const content = `Lead updated.\n${changes.join("\n")}`;
      await prisma.note.create({
        data: {
          leadId: id,
          content,
          userId,
        },
      });
    }
  } catch (err) {
    console.error('[Lead Update Note Error]', err);
  }

  // If stageId changed, and new stage has defaultTemplateId, send template
  if (update.stageId && update.stageId !== prevStageId) {
    const stage = await prisma.stage.findUnique({ where: { id: update.stageId }, include: { defaultTemplate: true } });
    if (stage?.defaultTemplateId && stage.defaultTemplate) {
      await sendTemplateToLead({
        lead,
        agent: lead.agent,
        template: stage.defaultTemplate,
        userId: null,
        fromStage: prevStageId,
        toStage: update.stageId,
      });
    }
  }

  return NextResponse.json({ lead });
}


export async function DELETE(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
