import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/client';
import { auth } from '../../../../auth';
import { Role } from '@prisma/client';

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.CONTENT_ADMIN];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !(session.user.role === Role.ADMIN || session.user.role === Role.CONTENT_ADMIN)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const webinarId = searchParams.get('webinarId');

  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (webinarId) {
    whereClause.webinarId = webinarId;
  }

  try {
    const registrants = await prisma.webinar_registrations.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        Lead: {
          select: {
            name: true,
            email: true,
            phone: true,
            schoolName: true,
          },
        },
        webinars: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    const totalRegistrants = await prisma.webinar_registrations.count({ where: whereClause });

    return NextResponse.json({
      registrants,
      totalPages: Math.ceil(totalRegistrants / limit),
      currentPage: page,
      totalRegistrants,
    });
  } catch (error) {
    console.error('Failed to fetch webinar registrants:', error);
    return NextResponse.json({ error: 'Failed to fetch webinar registrants' }, { status: 500 });
  }
}
