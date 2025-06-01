// REST API for GET message templates
import { NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";


export async function GET() {
  const templates = await prisma.messageTemplate.findMany();
  return NextResponse.json({ result: { data: templates } });
}
