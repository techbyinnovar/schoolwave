import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const academicYear = await prisma.academic_years.findUnique({
      where: { id: params.id },
      include: { terms: true }
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(academicYear);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch academic year' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, startDate, endDate, isCurrent = false } = await request.json();

    // If setting as current, unset current from other years
    if (isCurrent) {
      await prisma.academic_years.updateMany({
        where: { isCurrent: true, id: { not: params.id } },
        data: { isCurrent: false }
      });
    }

    const academicYear = await prisma.academic_years.update({
      where: { id: params.id },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent
      }
    });

    return NextResponse.json(academicYear);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update academic year' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if there are any terms associated
    const terms = await prisma.terms.findMany({
      where: { academicYearId: params.id }
    });

    if (terms.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete academic year with existing terms' },
        { status: 400 }
      );
    }

    await prisma.academic_years.delete({
      where: { id: params.id }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete academic year' },
      { status: 500 }
    );
  }
}
