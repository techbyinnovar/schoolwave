// REST API for GET message templates
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';


export async function GET() {
  const templates = await prisma.messageTemplate.findMany();
  return NextResponse.json({ result: { data: templates } });
}
