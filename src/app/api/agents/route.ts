import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { auth } from '@/auth';

export const runtime = "nodejs";

// GET /api/agents - Get all agents (users with AGENT role)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only ADMIN and AGENT roles can fetch agents
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch all users with AGENT role
    const agents = await prisma.user.findMany({
      where: {
        role: 'AGENT'
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}
