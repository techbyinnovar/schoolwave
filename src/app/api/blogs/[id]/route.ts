import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

// Helper function to generate a slug (consistent with the other route file)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

const blogUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters long').optional(),
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().url().optional().or(z.literal('')).nullable(), // Allow empty string or null
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  category: z.string().optional().nullable(),
  keyphrase: z.string().optional().nullable(),
  tags: z.string().optional().nullable(), // e.g., comma-separated string
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const identifier = params.id;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const isUuid = uuidRegex.test(identifier);

  try {
    if (!isUuid) { // Assumed slug-based query for public access
      const blogPostBySlug = await prisma.blogs.findUnique({
        where: { slug: identifier, published: true }, // Must be published for public slug access
        include: {
          User: { select: { id: true, name: true } }, // Avoid exposing author email on public fetches
        },
      });

      if (!blogPostBySlug) {
        return NextResponse.json({ error: 'Blog post not found or not published' }, { status: 404 });
      }
      return NextResponse.json(blogPostBySlug);
    } else { // UUID-based query (potentially for admin or direct ID access)
      const blogPostById = await prisma.blogs.findUnique({
        where: { id: identifier },
        include: {
          User: { select: { id: true, name: true, email: true } }, // Admin/direct ID fetch can include email
        },
      });

      if (!blogPostById) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      // For UUID fetches, return the post. Access control for unpublished posts via ID is typically client-side (e.g., admin panel).
      return NextResponse.json(blogPostById);
    }
  } catch (error) {
    console.error(`Error fetching blog post ${identifier}:`, error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = blogUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const dataToUpdate: any = { ...validation.data };

    if (validation.data.title) {
      const newSlug = slugify(validation.data.title);
      // Check if the new slug conflicts with another post
      const existingSlug = await prisma.blogs.findFirst({
        where: {
          slug: newSlug,
          id: { not: id }, // Exclude the current post from the check
        },
      });
      if (existingSlug) {
        return NextResponse.json({ error: 'A blog post with this title (slug) already exists. Please choose a different title.' }, { status: 409 });
      }
      dataToUpdate.slug = newSlug;
    }

    // Handle publishedAt timestamp
    if (validation.data.published === true) {
      const currentPost = await prisma.blogs.findUnique({ where: { id }, select: { published: true } });
      if (currentPost && !currentPost.published) {
        dataToUpdate.publishedAt = new Date();
      }
    } else if (validation.data.published === false) {
      dataToUpdate.publishedAt = null;
    }

    const updatedBlogPost = await prisma.blogs.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedBlogPost);
  } catch (error: any) {
    console.error(`Error updating blog post ${id}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.blogs.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error(`Error deleting blog post ${id}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
