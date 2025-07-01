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
  const history = await prisma.leadHistory.create({
    data: {
      id: uuidv4(),
      leadId: id,
      type,
      actionType,
      note: note || null,
      disposition: disposition || null,  // Include disposition if provided
      userId,
    },
    include: { User: true },
  });
  return NextResponse.json({ result: { data: history } });
}
