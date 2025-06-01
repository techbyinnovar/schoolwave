import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";


// GET: /api/stage
export async function GET() {
  const stages = await prisma.stage.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ result: { data: stages } });
}

// POST: /api/stage
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, color } = body;
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  // Determine next order value
  const maxOrder = await prisma.stage.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;
  const stage = await prisma.stage.create({ data: { name, color, order } });
  return NextResponse.json({ stage });
}

// PATCH: /api/stage
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, defaultTemplateId, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const dataToUpdate: any = { ...rest };
    if (defaultTemplateId !== undefined) dataToUpdate.defaultTemplateId = defaultTemplateId;
    const stage = await prisma.stage.update({ where: { id }, data: dataToUpdate });
    return NextResponse.json({ result: { data: stage } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: /api/stage
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reassignToId } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (!reassignToId) return NextResponse.json({ error: 'Missing reassignToId' }, { status: 400 });
    if (id === reassignToId) return NextResponse.json({ error: 'Cannot reassign to the same stage' }, { status: 400 });

    // Check both stages exist
    const stageToDelete = await prisma.stage.findUnique({ where: { id } });
    const stageToReassign = await prisma.stage.findUnique({ where: { id: reassignToId } });
    if (!stageToDelete) return NextResponse.json({ error: 'Stage to delete not found' }, { status: 404 });
    if (!stageToReassign) return NextResponse.json({ error: 'Reassign-to stage not found' }, { status: 404 });

    // Reassign leads
    await prisma.lead.updateMany({ where: { stageId: id }, data: { stageId: reassignToId } });
    // Delete the stage
    await prisma.stage.delete({ where: { id } });
    return NextResponse.json({ result: 'Stage deleted and leads reassigned' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
