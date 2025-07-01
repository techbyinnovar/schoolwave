import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET /api/forms - list all forms
export async function GET() {
  const forms = await prisma.form.findMany({
    include: { Stage: true, _count: { select: { FormResponse: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(forms);
}

// POST /api/forms - create a new form
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newForm = await prisma.form.create({
      data: {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        fields: data.fields,
        published: !!data.published,
        stageId: data.stageId || null,
        bannerImage: data.bannerImage || null,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newForm, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
