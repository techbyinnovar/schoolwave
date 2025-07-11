import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';
import crypto from 'crypto';

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
  
  try {
    const assets = await prisma.assets.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { User: { select: { id: true, name: true, email: true } } },
    });
    
    // Return in the consistent format used by other API routes
    return NextResponse.json({ 
      result: { 
        data: assets,
        count: assets.length
      } 
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
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
  const asset = await prisma.assets.create({
    data: {
      ...parsed.data,
      id: crypto.randomUUID(),
      updatedAt: new Date(),
      createdById: session.user.id,
    },
  });
  return NextResponse.json(asset, { status: 201 });
}
