import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/auth";

// GET /api/pages/[slug] - Get a single page by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await auth();
    
    // Build query
    const where: any = { slug };
    
    // For non-admin users, only return published pages
    if (!session || session.user.role !== "ADMIN") {
      where.published = true;
    }
    
    const page = await prisma.page.findUnique({
      where,
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error(`Error fetching page with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[slug] - Update a page by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Find the page
    const existingPage = await prisma.Page.findUnique({
      where: { slug },
    });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { title, content, description, published, newSlug } = body;
    
    // Check if new slug is already taken
    if (newSlug && newSlug !== slug) {
      const existingPage = await prisma.Page.findUnique({
        where: { slug: newSlug },
      });
      
      if (existingPage) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }
    
    // Update page
    const updatedPage = await prisma.page.update({
      where: { id: existingPage.id },
      data: {
        title: title || existingPage.title,
        slug: newSlug || existingPage.slug,
        content: content || existingPage.content,
        description: description !== undefined ? description : existingPage.description,
        published: published !== undefined ? published : existingPage.published,
        publishedAt: published && !existingPage.published ? new Date() : existingPage.publishedAt,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error(`Error updating page with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[slug] - Delete a page by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Find the page
    const existingPage = await prisma.Page.findUnique({
      where: { slug },
    });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }
    
    // Delete page
    await prisma.page.delete({
      where: { id: existingPage.id },
    });
    
    return NextResponse.json(
      { message: "Page deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting page with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
