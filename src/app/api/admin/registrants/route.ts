import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '../../../../auth';
import { Role } from '@prisma/client';

// Define allowed roles as a plain string array for consistency with other routes
const allowedRoles = ['ADMIN', 'CONTENT_ADMIN'];

export const runtime = 'nodejs'; // Ensure Node.js runtime for database operations

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const webinarId = searchParams.get('webinarId');

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (webinarId) {
      whereClause.webinarId = webinarId;
    }

    // Execute query with proper error handling
    const [registrants, totalRegistrants] = await Promise.all([
      prisma.webinar_registrations.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          Lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              schoolName: true,
            },
          },
          webinars: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          registeredAt: 'desc',
        },
      }),
      prisma.webinar_registrations.count({ where: whereClause })
    ]);

    // Map the response to match the frontend's expected data structure
    // Ensure we handle null values gracefully
    const mappedRegistrants = registrants.map((reg: any) => {
      // Destructure with default empty objects to prevent null reference errors
      const { Lead = {}, webinars = {}, ...rest } = reg;
      
      return {
        ...rest,
        lead: Lead || null,
        webinar: webinars || null,
      };
    });

    // Return consistent response format
    return NextResponse.json({
      registrants: mappedRegistrants,
      totalPages: Math.ceil(totalRegistrants / limit),
      currentPage: page,
      totalRegistrants,
    });
  } catch (error: any) {
    console.error('[API] Failed to fetch webinar registrants:', error);
    
    // More detailed error response
    return NextResponse.json({ 
      error: 'Failed to fetch webinar registrants',
      message: error.message || 'An unexpected error occurred',
    }, { status: 500 });
  }
}
