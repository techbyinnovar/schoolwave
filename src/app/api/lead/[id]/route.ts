import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";


// GET /api/lead/[id] - get a single lead by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { agent: true, stage: true, notes: { include: { user: true } }, history: { include: { user: true } } },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ result: { data: lead } });
}

// PATCH /api/lead/[id] - update a lead by id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const data = await req.json();
  const allowedFields = [
    'schoolName', 'name', 'phone', 'email', 'address', 'assignedTo', 'stageId'
  ];
  const filteredUpdate: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) filteredUpdate[key] = data[key];
  }
  const lead = await prisma.lead.update({ where: { id }, data: filteredUpdate });
  return NextResponse.json({ result: { data: lead } });
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
