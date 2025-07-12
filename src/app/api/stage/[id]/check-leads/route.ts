import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET: /api/stage/:id/check-leads
// Checks if a stage has any leads associated with it
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stageId = params.id;
    
    if (!stageId) {
      return NextResponse.json({ error: 'Stage ID is required' }, { status: 400 });
    }

    // Check if the stage exists
    const stage = await prisma.stage.findUnique({
      where: { id: stageId }
    });

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Count leads associated with this stage
    const leadCount = await prisma.lead.count({
      where: { stageId }
    });

    // Return whether the stage has leads or not
    return NextResponse.json({ 
      hasLeads: leadCount > 0,
      leadCount
    });
  } catch (error) {
    console.error('Error checking stage leads:', error);
    return NextResponse.json(
      { error: `Failed to check stage leads: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
