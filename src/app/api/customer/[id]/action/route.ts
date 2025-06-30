import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { randomUUID } from 'crypto';

// POST /api/customer/[id]/action - log an action for a customer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
  
  const data = await req.json();
  const { type, actionType, note, disposition } = data;
  // You may want to get userId from session in a real app
  // For now, we'll use a placeholder userId if not provided
  const userId = data.userId || null;
  
  if (!type || !actionType) {
    return NextResponse.json({ error: 'Missing type or actionType' }, { status: 400 });
  }
  
  try {
    // Create a history entry using the EntityHistory model
    const history = await prisma.entityHistory.create({
      data: {
        id: randomUUID(),
        entityType: 'customer',
        customerId: id,
        type,
        actionType,
        note: note || null,
        disposition: disposition || null,
        userId,
      },
      include: { User: true },
    });
    
    return NextResponse.json({ result: { data: history } });
  } catch (error) {
    console.error('Error creating customer action:', error);
    return NextResponse.json({ error: 'Failed to create customer action' }, { status: 500 });
  }
}
