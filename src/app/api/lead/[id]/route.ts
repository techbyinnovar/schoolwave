import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";


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
    const lead = await prisma.lead.update({ where: { id }, data: filteredUpdate });
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
