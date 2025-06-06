// REST API for Note CRUD
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const note = await prisma.note.findUnique({ where: { id }, include: { user: true } });
    return NextResponse.json({ note });
  }
  const notes = await prisma.note.findMany({ include: { user: true } });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.id) {
    const note = await prisma.note.update({ where: { id: data.id }, data });
    return NextResponse.json({ note });
  } else {
    // Only allow specific fields
    const { leadId, content, userId } = data;
    console.log('[NOTE CREATE] Incoming:', { leadId, content, userId, data });
    // Only set userId if it is a valid, non-empty string
    const normalizedUserId = userId && typeof userId === 'string' && userId.trim().length > 0 ? userId : null;
    const note = await prisma.note.create({
      data: { leadId, content, userId: normalizedUserId },
      include: { user: true },
    });
    console.log('[NOTE CREATE] Created:', note);
    return NextResponse.json({ note });
  }
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
