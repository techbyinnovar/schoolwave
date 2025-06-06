import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// CREATE Customer
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const customer = await prisma.customer.create({ data });
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer', details: (error as any)?.message }, { status: 400 });
  }
}

// READ (list all customers)
export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers', details: (error as any)?.message }, { status: 500 });
  }
}
