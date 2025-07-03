import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
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
    // Log the query parameters for debugging
    console.log('Fetching registrants with params:', { page, limit, skip, webinarId, whereClause });
    
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
    
    // Log the first result to inspect the data structure
    if (registrants.length > 0) {
      console.log('First registrant data:', JSON.stringify(registrants[0], null, 2));
      console.log('Lead data exists?', !!registrants[0].Lead);
    } else {
      console.log('No registrants found for the given criteria');
    }

    const totalRegistrants = await prisma.webinar_registrations.count({ where: whereClause });

    // Map the response to match the frontend's expected data structure
    const mappedRegistrants = registrants.map((reg: any) => {
      const { Lead, webinars, ...rest } = reg;
      return {
        ...rest,
        lead: Lead,
        webinar: webinars,
      };
    });

    return NextResponse.json({
      registrants: mappedRegistrants,
      totalPages: Math.ceil(totalRegistrants / limit),
      currentPage: page,
      totalRegistrants,
    });
  } catch (error) {
    console.error('Failed to fetch webinar registrants:', error);
    return NextResponse.json({ error: 'Failed to fetch webinar registrants' }, { status: 500 });
  }
}
