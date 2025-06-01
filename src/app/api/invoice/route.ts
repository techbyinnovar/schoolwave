import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";

// CREATE Invoice
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const invoice = await prisma.invoice.create({ data });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice', details: (error as any)?.message }, { status: 400 });
  }
}

// READ (list all invoices)
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({ include: { customer: true } });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices', details: (error as any)?.message }, { status: 500 });
  }
}
