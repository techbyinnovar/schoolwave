import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';

// GET /api/forms/[id] - get a single form
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: { stage: true, responses: true },
  });
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  return NextResponse.json(form);
}

// PUT /api/forms/[id] - update a form
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const form = await prisma.form.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        fields: data.fields,
        published: !!data.published,
        stageId: data.stageId || null,
      },
    });
    return NextResponse.json(form);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

// DELETE /api/forms/[id] - delete a form
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.form.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
