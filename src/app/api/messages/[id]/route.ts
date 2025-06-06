import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// PATCH /api/messages/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
  }
  const data = await req.json();
  try {
    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ template });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update message template' }, { status: 500 });
  }
}
