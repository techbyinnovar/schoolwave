import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { auth } from '@/auth';

export const runtime = "nodejs";

// GET /api/stages - Get all lead stages
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only ADMIN and AGENT roles can fetch stages
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch all stages
    const stages = await prisma.stage.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
  }
}
