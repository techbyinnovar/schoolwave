import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '../../../../auth';
import { Role } from '@prisma/client';

// Define allowed roles as a plain string array for consistency with other routes
const allowedRoles = ['ADMIN', 'CONTENT_ADMIN'];

export const runtime = 'nodejs'; // Ensure Node.js runtime for database operations

export async function GET(req: NextRequest) {
  console.log('[API] Registrants API route called');
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      console.log('[API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
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

    // Log query parameters for debugging
    console.log('[API] Fetching registrants with params:', { page, limit, webinarId, whereClause });
    
    // Execute queries with proper error handling
    let registrants = [];
    let totalRegistrants = 0;
    
    try {
      // Get registrations with their related data
      registrants = await prisma.webinar_registrations.findMany({
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
      });
      
      // Get total count for pagination
      totalRegistrants = await prisma.webinar_registrations.count({ 
        where: whereClause 
      });
      
      // Log successful query results
      console.log('[API] Successfully fetched registrants:', {
        count: registrants.length,
        totalRegistrants,
        sampleId: registrants[0]?.id || 'none'
      });
    } catch (queryError) {
      console.error('[API] Database query error:', queryError);
      throw queryError;
    }
    
    // Log the raw data structure to help debug mapping issues
    if (registrants.length > 0) {
      const firstReg = registrants[0];
      console.log('[API] First registrant raw data structure:', {
        keys: Object.keys(firstReg),
        hasLead: !!firstReg.Lead,
        leadKeys: firstReg.Lead ? Object.keys(firstReg.Lead) : 'N/A',
        hasWebinar: !!firstReg.webinars,
        webinarKeys: firstReg.webinars ? Object.keys(firstReg.webinars) : 'N/A'
      });
    } else {
      console.log('[API] No registrants found for the given criteria');
    }
    
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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
