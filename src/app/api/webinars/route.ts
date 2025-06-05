import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { prisma } from '../../../../prisma/client';
import { Role, Webinar } from '@prisma/client';
import { z } from 'zod';
import slugify from 'slugify';

// Zod schema for facilitator
const facilitatorSchema = z.object({
  name: z.string().min(1, "Facilitator name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url("Invalid URL for image").optional().or(z.literal(''))
});

// Zod schema for creating a webinar
const createWebinarSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverImage: z.string().url("Invalid URL format for cover image").optional().or(z.literal('')).nullable(),
  dateTime: z.string().datetime({ message: "Invalid datetime string. Must be in ISO 8601 format" }),
  durationMinutes: z.coerce.number().int().positive("Duration must be a positive integer"),
  platform: z.string().min(1, "Platform is required"),
  facilitators: z.array(facilitatorSchema).optional().nullable(),
  isFree: z.boolean().default(false),
  price: z.coerce.number().nonnegative("Price must be non-negative").optional().nullable(),
  attendeeLimit: z.coerce.number().int().positive("Attendee limit must be positive").optional().nullable(),
  registrationOpen: z.boolean().default(true),
  published: z.boolean().default(false),
  category: z.string().optional().nullable(),
  tags: z.string().optional().nullable(), // Assuming tags are comma-separated string for now
}).refine(data => {
  if (!data.isFree && (data.price === undefined || data.price === null || data.price < 0)) {
    return false;
  }
  return true;
}, {
  message: "Price is required and must be non-negative if the webinar is not free",
  path: ["price"],
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const allowedRoles: Role[] = [Role.ADMIN, Role.CONTENT_ADMIN];
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = createWebinarSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { title, published, ...restData } = validation.data;
    const slug = slugify(title, { lower: true, strict: true });

    // Check for slug uniqueness (optional, but good practice)
    const existingWebinar = await prisma.webinar.findUnique({
      where: { slug },
    });
    if (existingWebinar) {
      return NextResponse.json({ error: 'A webinar with this title (slug) already exists. Please choose a different title.' }, { status: 409 });
    }

    const webinarData: Omit<Webinar, 'id' | 'createdAt' | 'updatedAt' | 'authorId'> & { authorId: string } = {
      ...restData,
      title,
      slug,
      published,
      publishedAt: published ? new Date() : null,
      authorId: session.user.id,
      price: restData.isFree ? null : restData.price,
      facilitators: restData.facilitators || [], // Ensure facilitators is an array
    };

    const newWebinar = await prisma.webinar.create({
      data: webinarData as any, // Prisma will validate the types
    });

    return NextResponse.json(newWebinar, { status: 201 });
  } catch (error) {
    console.error('Failed to create webinar:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // For admin listing, could add session check here if needed, or filter by author etc.
  // For now, making it public for simplicity, or assuming admin pages handle auth before calling.
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const searchTerm = searchParams.get('search') || '';
  const publishedFilter = searchParams.get('published'); // 'true', 'false', or undefined

  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (searchTerm) {
    whereClause.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { category: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (publishedFilter === 'true') {
    whereClause.published = true;
  } else if (publishedFilter === 'false') {
    whereClause.published = false;
  }

  try {
    const webinars = await prisma.webinar.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    const totalWebinars = await prisma.webinar.count({ where: whereClause });

    return NextResponse.json({
      webinars,
      totalPages: Math.ceil(totalWebinars / limit),
      currentPage: page,
      totalWebinars,
    });
  } catch (error) {
    console.error('Failed to fetch webinars:', error);
    return NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 });
  }
}
