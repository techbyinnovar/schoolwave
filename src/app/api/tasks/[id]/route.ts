import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/client';
import { auth } from '../../../../auth';
import { Role } from '@prisma/client';

// GET: Get single task by ID (must be creator or assigned, or admin)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role;
  const { id } = params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (role !== 'ADMIN' && task.createdById !== userId && task.assignedToId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ task });
}

// PUT: Update a task (must be creator or assigned, or admin)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role;
  const { id } = params;
  const data = await req.json();
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (role !== 'ADMIN' && task.createdById !== userId && task.assignedToId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Only admin can reassign to other users
  if (data.assignedToId && data.assignedToId !== userId && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admin can assign tasks to others' }, { status: 403 });
  }
  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status,
      assignedToId: data.assignedToId,
    },
  });
  return NextResponse.json({ task: updated });
}

// DELETE: Delete a task (must be creator or admin)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role;
  const { id } = params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (role !== 'ADMIN' && task.createdById !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
