import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

// GET /api/demo_leads - List all leads who filled the demo form
export async function GET(req: NextRequest) {
  try {
    // Only leads who have a demoCode (i.e., have watched demo)
    const leads = await prisma.lead.findMany({
      where: { demoCode: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        schoolName: true,
        numberOfStudents: true,
        howHeard: true,
        demoCode: true,
        demoLog: true,
        address: true,
        createdAt: true,
      },
    });
    return NextResponse.json(leads);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch demo leads" }, { status: 500 });
  }
}
