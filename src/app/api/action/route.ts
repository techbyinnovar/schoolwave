// REST API for Action CRUD
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const action = await prisma.action.findUnique({ where: { id } });
    return NextResponse.json({ action });
  }
  const actions = await prisma.action.findMany();
  return NextResponse.json({ result: { data: actions } });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.id) {
    const action = await prisma.action.update({ where: { id: data.id }, data });
    return NextResponse.json({ action });
  } else {
    const action = await prisma.action.create({ data });
    return NextResponse.json({ action });
  }
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.action.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
