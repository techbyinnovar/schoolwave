import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { sendTemplateToLead } from "../sendTemplateToLead";


// GET /api/lead/[id] - get a single lead by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { agent: true, stage: true, ownedBy: true, notes: { include: { user: true } }, history: { include: { user: true } } },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ result: { data: lead } });
}

// PATCH /api/lead/[id] - update a lead by id
import { auth } from '@/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  const data = await req.json();

  // Fetch current lead (with relations) to detect stage change later
  const existingLead = await prisma.lead.findUnique({
    where: { id },
    include: { stage: true, agent: true }
  });

  // Role-based allowed fields
  let allowedFields: string[] = [];
  if (role === 'ADMIN') {
    allowedFields = [
      'schoolName', 'name', 'phone', 'email', 'address', 'assignedTo', 'stageId', 'ownedById'
    ];
  } else if (role === 'AGENT') {
    allowedFields = ['stageId'];
    // Prevent AGENT from changing other fields
    if (Object.keys(data).some(key => key !== 'id' && key !== 'stageId')) {
      return NextResponse.json({ error: 'Permission denied: AGENT can only change stage' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  const filteredUpdate: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) filteredUpdate[key] = data[key];
  }

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: filteredUpdate,
      include: { stage: true, agent: true }
    });

    // ---- Auto send template if stage changed & new stage has default template ----
    if (existingLead?.stageId !== lead.stageId && lead.stageId) {
      const stage = await prisma.stage.findUnique({
        where: { id: lead.stageId },
        include: { defaultTemplate: true }
      });
      if (stage?.defaultTemplate) {
        // fire and forget; do not block response
        sendTemplateToLead({
          lead,
          agent: lead.agent,
          template: stage.defaultTemplate,
          userId,
          fromStage: existingLead?.stage?.name ?? null,
          toStage: stage.name ?? null,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ result: { data: lead } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update lead' }, { status: 500 });
  }
}


// DELETE /api/lead/[id] - delete a lead by id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
