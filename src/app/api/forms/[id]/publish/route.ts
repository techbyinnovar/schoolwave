import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'prisma/client';

// PATCH /api/forms/[id]/publish - publish/unpublish a form
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { published } = await req.json();
    const form = await prisma.form.update({
      where: { id: params.id },
      data: { published: !!published },
    });
    return NextResponse.json(form);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
