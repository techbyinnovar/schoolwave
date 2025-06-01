import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { subscriptionId: string } }) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { subscriptionId: params.subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices for subscription', details: (error as any)?.message }, { status: 500 });
  }
}
