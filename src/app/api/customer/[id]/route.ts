import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

// GET single customer
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the customer data with all relations
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        Invoice: {
          orderBy: { createdAt: 'desc' }
        },
        Subscription: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Fetch notes with users
    let notes: any[] = [];
    try {
      notes = await prisma.note.findMany({
        where: { 
          customerId: params.id 
        },
        include: { 
          User: true 
        },
        orderBy: { 
          createdAt: 'desc' 
        }
      });
    } catch (err) {
      console.error('Error fetching customer notes:', err);
      // Keep empty notes array if error occurs
    }

    // Fetch history 
    let history: any[] = [];
    try {
      history = await prisma.entityHistory.findMany({
        where: { 
          customerId: params.id 
        },
        include: { 
          User: true 
        },
        orderBy: { 
          createdAt: 'desc' 
        }
      });
    } catch (err) {
      console.error('Error fetching customer history:', err);
      // Keep empty history array if error occurs
    }

    // Combine all data
    const responseData = {
      ...customer,
      notes,
      history
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer', details: (error as any)?.message },
      { status: 500 }
    );
  }
}

// UPDATE customer
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await req.json();
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer', details: (error as any)?.message },
      { status: 400 }
    );
  }
}

// DELETE customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer', details: (error as any)?.message },
      { status: 400 }
    );
  }
}
