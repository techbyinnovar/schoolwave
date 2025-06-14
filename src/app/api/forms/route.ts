import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';

// GET /api/forms - list all forms
export async function GET() {
  const forms = await prisma.form.findMany({
    include: { stage: true, _count: { select: { responses: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(forms);
}

// POST /api/forms - create a new form
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const form = await prisma.form.create({
      data: {
        name: data.name,
        description: data.description,
        fields: data.fields,
        published: !!data.published,
        stageId: data.stageId || null,
        bannerImage: data.bannerImage || null,
      },
    });
    return NextResponse.json(form, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
