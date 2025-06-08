import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth'; // Assuming your auth setup is in '@/auth'
import { DemoUpdateSchema } from '@/lib/schemas/demoSchemas';
import { Role } from '@prisma/client'; // Make sure Role enum is in your prisma schema

interface Params {
  params: { id: string };
}

// GET /api/demos/[id] - Fetch a single demo
export async function GET(req: Request, { params }: Params) {
  try {
    // Public access or specific roles can be defined here
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = params;
    const demo = await prisma.demo.findUnique({
      where: { id },
    });

    if (!demo) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }
    // Optionally, only return if published or user has specific rights
    // if (!demo.published) {
    //   const session = await auth();
    //   if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
    //     return NextResponse.json({ error: 'Demo not found or not published' }, { status: 404 });
    //   }
    // }
    return NextResponse.json(demo);
  } catch (error) {
    console.error(`Error fetching demo ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch demo' }, { status: 500 });
  }
}

// PUT /api/demos/[id] - Update a demo
export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    
    const validation = DemoUpdateSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    // Construct dataToUpdate carefully to handle optional fields
    // Prisma's Json type for 'videos' will correctly handle the array of objects
    const dataToUpdate = validation.data;

    const updatedDemo = await prisma.demo.update({
      where: { id },
      data: dataToUpdate, // Pass all validated fields directly
    });

    return NextResponse.json(updatedDemo);
  } catch (error) {
    console.error(`Error updating demo ${params.id}:`, error);
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      // @ts-ignore
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Demo not found for update' }, { status: 404 });
      }
    }
    if (error instanceof Error && error.name === 'PrismaClientValidationError') {
        return NextResponse.json({ error: 'Database validation error updating demo.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update demo' }, { status: 500 });
  }
}

// DELETE /api/demos/[id] - Delete a demo
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await prisma.demo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Demo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting demo ${params.id}:`, error);
     if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      // @ts-ignore
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Demo not found for deletion' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Failed to delete demo' }, { status: 500 });
  }
}
