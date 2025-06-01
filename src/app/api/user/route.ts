// REST API for User CRUD
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const role = searchParams.get('role');
  if (id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return NextResponse.json({ user });
  }
  // Convert role string to enum if present
  const where = role ? { role: role as any } : undefined;
  const users = await prisma.user.findMany({ where });
  return NextResponse.json({ result: { data: users } });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.id) {
    const user = await prisma.user.update({ where: { id: data.id }, data });
    return NextResponse.json({ user });
  } else {
    const user = await prisma.user.create({ data });
    return NextResponse.json({ user });
  }
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
