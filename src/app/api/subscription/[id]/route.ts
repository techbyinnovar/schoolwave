import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET a single subscription by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscription = await db.subscription.findUnique({
      where: { id: params.id },
      include: {
        Customer: true, // This is the correct relation from the schema
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('[SUBSCRIPTION_GET_BY_ID]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE a subscription
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const values = await request.json();

    // The schema stores addons as a JSON field.
    // We reconstruct it from the form data if addonIds are provided.
    if (values.addonIds) {
        values.addons = values.addonIds.map((id: string) => ({
            addonId: id,
            terms: values.addonTerms[id] || 1,
        }));
    }

    // Create a clean data object for the update operation
    const dataToUpdate: Prisma.SubscriptionUpdateInput = {
        planName: values.planName,
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        studentCount: values.studentCount,
        discountPercent: values.discountPercent,
        terms: values.terms,
        addons: values.addons, // This is now the correct JSON format
    };

    // Remove any fields that are undefined to avoid overwriting with null
    Object.keys(dataToUpdate).forEach(key => {
        const k = key as keyof typeof dataToUpdate;
        if (dataToUpdate[k] === undefined) {
            delete dataToUpdate[k];
        }
    });

    const updatedSubscription = await db.subscription.update({
        where: { id: params.id },
        data: dataToUpdate,
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('[SUBSCRIPTION_UPDATE]', error);
    if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json({ error: 'Invalid data provided for update.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

