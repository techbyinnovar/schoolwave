import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';


// GET /api/message-template/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing template id' }, { status: 400 });
  const template = await prisma.messageTemplate.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json({ result: { data: template } });
}
