import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/client';
import { auth } from '../../../auth';
import { Role } from '@prisma/client';

// GET /api/users - List all users (ADMIN only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Optional: filter by role
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const where: any = role ? { role } : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      referralCode: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ users });
}
