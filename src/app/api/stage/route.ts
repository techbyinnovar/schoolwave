import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';


// GET: /api/stage
export async function GET() {
  const stages = await prisma.stage.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ result: { data: stages } });
}

// POST: /api/stage
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }
    
    // Check if a stage with the same name already exists
    const existingStage = await prisma.stage.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    
    if (existingStage) {
      return NextResponse.json(
        { error: `A stage with the name "${name}" already exists` },
        { status: 409 }
      );
    }
    
    // Determine next order value
    const maxOrder = await prisma.stage.aggregate({ _max: { order: true } });
    const order = (maxOrder._max.order ?? 0) + 1;
    
    const stage = await prisma.stage.create({ 
      data: { id: uuidv4(), name, color, order } 
    });
    
    return NextResponse.json({ stage });
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      { error: `Failed to create stage: ${(error as Error).message}` },
      { status: 500 }
    );
  }
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
    
    // Check if stage exists
    const stageToDelete = await prisma.stage.findUnique({ where: { id } });
    if (!stageToDelete) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    
    // Check if stage has leads
    const leadCount = await prisma.lead.count({ where: { stageId: id } });
    
    // If stage has leads, require reassignToId
    if (leadCount > 0) {
      if (!reassignToId) {
        return NextResponse.json({ 
          error: 'This stage has leads. Please provide reassignToId to move leads before deletion.', 
          hasLeads: true,
          leadCount
        }, { status: 400 });
      }
      
      if (id === reassignToId) {
        return NextResponse.json({ error: 'Cannot reassign to the same stage' }, { status: 400 });
      }
      
      // Check reassign stage exists
      const stageToReassign = await prisma.stage.findUnique({ where: { id: reassignToId } });
      if (!stageToReassign) {
        return NextResponse.json({ error: 'Reassign-to stage not found' }, { status: 404 });
      }
      
      // Reassign leads
      await prisma.lead.updateMany({ where: { stageId: id }, data: { stageId: reassignToId } });
      await prisma.stage.delete({ where: { id } });
      return NextResponse.json({ result: 'Stage deleted and leads reassigned' });
    } else {
      // No leads, can delete directly
      await prisma.stage.delete({ where: { id } });
      return NextResponse.json({ result: 'Stage deleted successfully' });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
