import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma/client'; // Updated to use path alias
import { auth } from '@/auth'; // Updated to use path alias (assuming auth.ts is at project root)

// Helper function to generate a slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

const blogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')), // Allow empty string for optional URL
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  category: z.string().optional(),
  keyphrase: z.string().optional(),
  tags: z.string().optional(), // e.g., comma-separated string
});

export async function POST(request: NextRequest) {
  const session = await auth();

  // Ensure user is authenticated and has the correct role
  if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'CONTENT_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = blogSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { title, content, excerpt, coverImage, published, featured, category, keyphrase, tags } = validation.data;
    const slug = slugify(title);

    // Check if slug already exists to prevent duplicates
    const existingSlug = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'A blog post with this title (slug) already exists. Please choose a different title.' }, { status: 409 });
    }

    const newBlogPost = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        published,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id, // Use the authenticated user's ID
        featured,
        category: category || undefined,
        keyphrase: keyphrase || undefined,
        tags: tags || undefined,
      },
    });

    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    // Consider more specific error handling based on Prisma errors if needed
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  // Default to true, allow fetching unpublished posts by explicitly setting publishedOnly=false
  const publishedOnly = searchParams.get('publishedOnly') !== 'false'; 

  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {};
    if (publishedOnly) {
      whereClause.published = true;
    }

    const blogPosts = await prisma.blog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Or publishedAt: 'desc' if preferred for published posts
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true, // Be mindful of exposing emails if not necessary
          },
        },
      },
    });

    const totalPosts = await prisma.blog.count({
      where: whereClause,
    });

    return NextResponse.json({
      data: blogPosts,
      meta: {
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        limit,
        totalPosts,
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
