import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

// POST /api/lead/[id]/action - log an action for a lead
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
  const data = await req.json();
  const { type, actionType, note, disposition } = data;
  // You may want to get userId from session in a real app
  // For now, we'll use a placeholder userId if not provided
  const userId = data.userId || null;
  if (!type || !actionType) {
    return NextResponse.json({ error: 'Missing type or actionType' }, { status: 400 });
  }
  
  // Start a transaction to ensure both operations succeed or fail together
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the entity history record
      const history = await tx.entityHistory.create({
        data: {
          id: uuidv4(),
          leadId: id,
          type,
          actionType,
          note: note || null,
          disposition: disposition || null,  // Include disposition if provided
          userId,
          entityType: 'lead', // Set the entityType to 'lead' since this is for a lead
        },
        include: { User: true },
      });
      
      // Update the lead's last active date
      const now = new Date();
      await tx.lead.update({
        where: { id },
        data: {
          updatedAt: now, // Update the standard updatedAt field
          // If disposition is provided, update the last disposition as well
          ...(disposition ? { lastDisposition: disposition } : {})
        }
      });
      
      return history;
    });
    
    return NextResponse.json({ result: { data: result } });
  } catch (error: any) {
    console.error('Error logging lead action:', error);
    return NextResponse.json({ error: error.message || 'Failed to log action' }, { status: 500 });
  }
}
