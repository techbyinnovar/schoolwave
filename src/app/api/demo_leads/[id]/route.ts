import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

// GET /api/demo_leads/[id] - Get a single lead by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    const lead = await prisma.lead.findUnique({
      where: { id },
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
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(lead);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch lead details" }, { status: 500 });
  }
}
