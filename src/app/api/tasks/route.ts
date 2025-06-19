import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/client';
import { auth } from '../../../auth';
import { Role } from '@prisma/client';

// GET: List/filter tasks for current user (created by or assigned to)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'today', 'week', or undefined

  const now = new Date();
  let start: Date | undefined, end: Date | undefined;
  if (filter === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (filter === 'week') {
    // Start of week (Monday)
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  }

  const where: any = {
    OR: [
      { createdById: userId },
      { assignedToId: userId },
    ],
  };
  if (start && end) {
    where.dueDate = { gte: start, lt: end };
  }

  // Admin can see all if no filter
  if (role === 'ADMIN' && !filter) {
    delete where.OR;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ tasks });
}

// POST: Create a new task
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role;
  const data = await req.json();

  // Only admin can assign to others
  if (data.assignedToId && data.assignedToId !== userId && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admin can assign tasks to others' }, { status: 403 });
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      status: data.status || 'pending',
      assignedToId: data.assignedToId || null,
      createdById: userId,
    },
  });
  return NextResponse.json({ task });
}
