import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const terms = await prisma.term.findMany({
      include: {
        academicYear: true
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { startDate: 'asc' }
      ]
    });
    return NextResponse.json(terms);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch terms' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, academicYearId, startDate, endDate, isCurrent = false } = await req.json();

    // If setting as current, unset current from other terms
    if (isCurrent) {
      await prisma.term.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const term = await prisma.term.create({
      data: {
        name,
        academicYearId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent
      }
    });

    return NextResponse.json(term, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create term' },
      { status: 500 }
    );
  }
}
