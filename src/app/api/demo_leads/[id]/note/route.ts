// Moved from note.ts for Next.js app directory routing compliance
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id;
    const { videoTitle } = await req.json();
    if (!leadId || !videoTitle) {
      console.log("Missing leadId or videoTitle", { leadId, videoTitle });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const now = new Date();
    const noteContent = `Watched ${videoTitle} ${now.toLocaleString("en-GB", { hour12: false })}`;
    console.log("Creating note for lead", { leadId, noteContent });
    const note = await db.note.create({
      data: {
        id: uuidv4(),
        leadId,
        content: noteContent,
      },
    });
    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Error creating note", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
