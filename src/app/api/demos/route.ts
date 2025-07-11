import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth'; // Assuming your auth setup is in '@/auth'
import { DemoCreateSchema } from '@/lib/schemas/demoSchemas';
import { Role } from '@prisma/client'; // Make sure Role enum is in your prisma schema
import { v4 as uuidv4 } from 'uuid';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST /api/demos - Create a new demo
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = DemoCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const validatedData = validation.data;

    const newDemo = await prisma.demo.create({
      data: {
        id: uuidv4(),
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    return new Response(JSON.stringify(newDemo), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error creating demo:', error);
    if (error instanceof Error && error.name === 'PrismaClientValidationError') {
        return new Response(JSON.stringify({ error: 'Database validation error creating demo.', details: error.message }), {
      status: 400,
      headers: corsHeaders,
    });
    }
    return new Response(JSON.stringify({ error: 'Failed to create demo' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// GET /api/demos - Fetch all demos (with pagination and optional filtering)
export async function GET(req: Request) {
  try {
    // Public access or specific roles can be defined here
    // For now, let's allow any authenticated user to view demos, or adjust as needed.
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized to view demos' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const publishedOnly = searchParams.get('published') === 'true'; // Filter for published demos
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (publishedOnly) {
      whereClause.published = true;
    }

    const demos = await prisma.demo.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { priority: 'asc' }, // Assuming lower number means higher priority
        { createdAt: 'desc' },
      ],
      select: { // Select specific fields to optimize payload
        id: true,
        title: true,
        description: true,
        coverImage: true,
        videos: true, // Or just video count: videos: { select: { _count: true } } if that's enough for listing
        priority: true,
        published: true,
        createdAt: true,
      }
    });

    const totalCount = await prisma.demo.count({ where: whereClause });

    return new Response(JSON.stringify({
      demos,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error fetching demos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch demos' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
