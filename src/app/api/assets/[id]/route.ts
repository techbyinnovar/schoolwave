import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';

const AssetSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  files: z.array(z.object({ url: z.string().url(), name: z.string(), type: z.string() })).optional(),
  links: z.array(z.object({ url: z.string().url(), label: z.string() })).optional(),
  published: z.boolean().optional(),
});

// GET /api/assets/[id] - Get asset by id (agents see only published, admins see all)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'CONTENT_ADMIN';
  const where = isAdmin ? { id: params.id } : { id: params.id, published: true };
  const asset = await prisma.asset.findFirst({
    where,
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(asset);
}

// PUT /api/assets/[id] - Update asset (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = AssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const asset = await prisma.asset.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(asset);
}

// DELETE /api/assets/[id] - Delete asset (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await prisma.asset.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
