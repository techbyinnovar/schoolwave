import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const academicYears = await prisma.academic_years.findMany({
      include: {
        terms: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    return NextResponse.json(academicYears);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, startDate, endDate, isCurrent = false } = await req.json();

    // If setting as current, unset current from other years
    if (isCurrent) {
      await prisma.academic_years.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const academicYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(academicYear, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create academic year' },
      { status: 500 }
    );
  }
}
