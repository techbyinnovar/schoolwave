// REST API for Note CRUD
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { randomUUID } from 'crypto';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const note = await prisma.note.findUnique({ where: { id }, include: { User: true } });
    return NextResponse.json({ note });
  }
  const notes = await prisma.note.findMany({ include: { User: true } });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.id) {
    const note = await prisma.note.update({ where: { id: data.id }, data });
    return NextResponse.json({ note });
  } else {
    // Only allow specific fields
    const { leadId, customerId, content, userId } = data;
    const entityType = customerId ? 'customer' : 'lead';
    
    console.log('[NOTE CREATE] Incoming:', { leadId, customerId, entityType, content, userId, data });
    
    // Only set userId if it is a valid, non-empty string
    const normalizedUserId = userId && typeof userId === 'string' && userId.trim().length > 0 ? userId : null;
    
    // Create the complete data object for the note
    const note = await prisma.note.create({
      data: {
        id: randomUUID(),
        content,
        entityType,
        // Only set one of leadId or customerId based on entityType
        ...(entityType === 'customer' ? { customerId } : {}),
        ...(entityType === 'lead' ? { leadId } : {}),
        // Add user if available
        ...(normalizedUserId ? { userId: normalizedUserId } : {})
      } as any, // Use type assertion since schema may be ahead of generated types
      include: { User: true },
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
