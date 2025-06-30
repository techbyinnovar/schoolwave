import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { randomUUID } from 'crypto';

// CREATE Invoice
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Ensure status is 'draft' by default
    const invoiceData = {
      ...data,
      status: data.status || 'draft'
    };
    
    const invoice = await prisma.invoice.create({ data: invoiceData });
    
    // Log this as a customer action if a customerId is provided
    if (data.customerId) {
      try {
        // Format amount for display in note
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'NGN'
        }).format(data.amount || 0);
        
        // Get invoice number or ID for the note
        const invoiceIdentifier = invoiceData.invoiceNumber || invoice.id;
        
        // Create action entry in EntityHistory
        await prisma.entityHistory.create({
          data: {
            id: randomUUID(),
            entityType: 'customer',
            customerId: data.customerId,
            type: 'action',
            actionType: 'invoice',
            note: `Invoice #${invoiceIdentifier} created for ${formattedAmount}`,
            userId: null, // No session in API route
          }
        });
        
        // Additionally create a customer note
        await prisma.note.create({
          data: {
            id: randomUUID(),
            entityType: 'customer',
            customerId: data.customerId,
            content: `Invoice #${invoiceIdentifier} created for ${formattedAmount}`,
            userId: null // No session in API route
          }
        });
        
        console.log('Successfully created customer note for invoice:', invoiceIdentifier);
      } catch (error) {
        console.error('Failed to log invoice creation:', error);
        // Continue processing even if logging fails
      }
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create invoice', details: (error as any)?.message }, { status: 400 });
  }
}

// READ (list all invoices)
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({ 
      include: { 
        Customer: true 
      } 
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices', details: (error as any)?.message }, { status: 500 });
  }
}
