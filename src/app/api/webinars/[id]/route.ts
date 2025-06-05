import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';
import type { Session } from 'next-auth';
import { authConfig } from '@/utils/authOptions';
import { Role } from '@prisma/client';

const prisma = new PrismaClient();

// Zod schema for webinar update (similar to create, but all fields optional for partial updates)
// ID is not in the schema as it comes from the URL
const WebinarUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')), 
  dateTime: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  platform: z.string().optional(),
  facilitators: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    bio: z.string().optional(),
    imageUrl: z.string().url().optional(),
  })).optional().nullable(), // Allow null to clear facilitators
  isFree: z.boolean().optional(),
  price: z.number().optional().nullable(), // Allow null
  attendeeLimit: z.number().int().positive().optional().nullable(), // Allow null
  registrationOpen: z.boolean().optional(),
  published: z.boolean().optional(),
  // publishedAt is handled by published flag
  category: z.string().optional().nullable(), // Allow null
  tags: z.string().optional().nullable(), // Allow null
});

// Slugify function
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a single webinar by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }
    return NextResponse.json(webinar);
  } catch (error) {
    console.error(`Error fetching webinar ${id}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// PUT (update) a webinar by ID
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const session = await auth() as unknown as Session | null;
  console.log("API ROUTE HANDLER - Session object:", JSON.stringify(session, null, 2));

  if (!session?.user?.role || !(session.user.role === Role.ADMIN || session.user.role === Role.CONTENT_ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsedData = WebinarUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsedData.error.flatten() }, { status: 400 });
    }

    const updatePayload: any = { ...parsedData.data };

    // If title is being updated, regenerate slug
    if (updatePayload.title) {
      let newSlug = slugify(updatePayload.title);
      let counter = 1;
      const originalSlug = newSlug;
      while (await prisma.webinar.findFirst({ where: { slug: newSlug, NOT: { id } } })) {
        newSlug = `${originalSlug}-${counter}`;
        counter++;
      }
      updatePayload.slug = newSlug;
    }

    // Handle publishedAt logic based on published flag
    if (typeof updatePayload.published === 'boolean') {
      updatePayload.publishedAt = updatePayload.published ? new Date() : null;
    }
    
    // Convert dateTime string to Date object if present
    if (updatePayload.dateTime) {
      updatePayload.dateTime = new Date(updatePayload.dateTime);
    }

    // Prisma expects null for explicit nulls in JSON fields, or undefined to leave unchanged
    if (body.hasOwnProperty('facilitators')) {
        updatePayload.facilitators = body.facilitators === null ? null : body.facilitators;
    }


    const updatedWebinar = await prisma.webinar.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(updatedWebinar);
  } catch (error) {
    console.error(`Error updating webinar ${id}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    // Using type assertion for error code and meta
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2025') { // Prisma: Record to update not found
        return NextResponse.json({ error: 'Webinar not found to update' }, { status: 404 });
    }
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('slug')) { // Prisma: Unique constraint failed
        return NextResponse.json({ error: 'A webinar with the new title (slug) already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred while updating the webinar.' }, { status: 500 });
  }
}

// DELETE a webinar by ID
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const session = await auth() as unknown as Session | null;
  console.log("API ROUTE HANDLER - Session object:", JSON.stringify(session, null, 2));

  if (!session?.user?.role || !(session.user.role === Role.ADMIN || session.user.role === Role.CONTENT_ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.webinar.delete({
      where: { id },
    });
    // Successfully deleted, return 204 No Content or a success message
    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error(`Error deleting webinar ${id}:`, error);
    // Using type assertion for error code
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') { // Prisma: Record to delete not found
        return NextResponse.json({ error: 'Webinar not found to delete' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred while deleting the webinar.' }, { status: 500 });
  }
}
