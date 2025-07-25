import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/auth";
import { v4 as uuidv4 } from "uuid";

// GET /api/pages - Get all pages
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get("published");
    
    // Filter options
    const where: any = {};
    
    // Filter by published status if specified
    if (published === "true") {
      where.published = true;
    } else if (published === "false") {
      where.published = false;
    }
    
    // If not admin, only show published pages
    if (!session || !session.user || session.user.role !== "ADMIN") {
      where.published = true;
    }
    
    // Get pages from database
    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { User: { select: { name: true, email: true } } },
    });
    
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    // Only admins can create pages
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, slug, content, description, published } = body;
    
    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }
    
    // Check if slug is already taken
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (existingPage) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }
    
    // Create new page
    const newPage = await prisma.page.create({
      data: {
        id: uuidv4(),
        title,
        slug,
        content,
        description,
        published: published || false,
        publishedAt: published ? new Date() : null,
        updatedAt: new Date(),
        createdById: session.user.id,
      },
    });
    
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
