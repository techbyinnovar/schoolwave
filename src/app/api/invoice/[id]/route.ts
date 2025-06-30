import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getSession } from "next-auth/react";
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        Customer: true, // Changed to capitalized relation field
      },
    });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice', details: (error as any)?.message }, { status: 500 });
  }
}

// UPDATE Invoice Status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { status } = data;
    
    // Validate status
    const validStatuses = ['draft', 'pending', 'paid', 'canceled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be one of: draft, pending, paid, canceled' }, { status: 400 });
    }
    
    // Find invoice first
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { Customer: true }
    });
    
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: { Customer: true }
    });
    
    // Log this as a customer action if a customerId is available
    if (existingInvoice.customerId) {
      try {
        // In API routes, we can't use getSession from next-auth/react, so we'll create the history without user ID
        // Create action entry in EntityHistory
        await prisma.entityHistory.create({
          data: {
            id: randomUUID(),
            entityType: 'customer',
            customerId: existingInvoice.customerId,
            type: 'action',
            actionType: 'invoice_status_change',
            note: `Invoice status changed from ${existingInvoice.status} to ${status}`,
            userId: null, // We can't get user session in API routes easily, so setting null
          }
        });
        
        // Additionally, create a note for the customer about the invoice update
        await prisma.note.create({
          data: {
            id: randomUUID(),
            entityType: 'customer',
            customerId: existingInvoice.customerId,
            content: `Invoice #${existingInvoice.invoiceNumber || params.id} status updated from ${existingInvoice.status} to ${status}`,
            userId: null // We can't get user session in API routes easily, so setting null
          }
        });
      } catch (error) {
        console.error('Failed to log invoice status change:', error);
        // Continue processing even if logging fails
      }
    }
    
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice', details: (error as any)?.message }, { status: 500 });
  }
}
