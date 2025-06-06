import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const term = await prisma.term.findUnique({
      where: { id: params.id },
      include: { academicYear: true }
    });

    if (!term) {
      return NextResponse.json(
        { error: 'Term not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(term);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch term' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, academicYearId, startDate, endDate, isCurrent = false } = await request.json();

    // If setting as current, unset current from other terms
    if (isCurrent) {
      await prisma.term.updateMany({
        where: { isCurrent: true, id: { not: params.id } },
        data: { isCurrent: false }
      });
    }

    const term = await prisma.term.update({
      where: { id: params.id },
      data: {
        name,
        academicYearId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent
      }
    });

    return NextResponse.json(term);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update term' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.term.delete({
      where: { id: params.id }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete term' },
      { status: 500 }
    );
  }
}
