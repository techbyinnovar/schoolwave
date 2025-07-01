import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const termsWithRelations = await prisma.terms.findMany({
      include: {
        academic_years: true
      },
      orderBy: [
        { academic_years: { startDate: 'desc' } },
        { startDate: 'asc' }
      ]
    });

    const terms = termsWithRelations.map(term => {
      const { academic_years, ...rest } = term;
      return {
        ...rest,
        academicYear: academic_years,
      };
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
      await prisma.terms.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const term = await prisma.terms.create({
      data: {
        id: uuidv4(),
        name,
        academicYearId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent,
        updatedAt: new Date(),
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
