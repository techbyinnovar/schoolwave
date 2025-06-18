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

// GET /api/assets - List all published assets (agents see only published, admins see all)
export async function GET(req: NextRequest) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'CONTENT_ADMIN';
  const where = isAdmin ? {} : { published: true };
  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(assets);
}

// POST /api/assets - Create asset (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = AssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const asset = await prisma.asset.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });
  return NextResponse.json(asset, { status: 201 });
}
