import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { randomUUID } from 'crypto';

// Utility: fetch settings by key
async function fetchSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return [];
  if (typeof setting.value === 'string') {
    try {
      return JSON.parse(setting.value);
    } catch {
      return [setting.value];
    }
  }
  return Array.isArray(setting.value) ? setting.value : [setting.value];
}

// Utility: calculate number of terms (assuming 1 term = 3 months)
function calculateTerms(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(1, Math.ceil(months / 3));
}


// CREATE Subscription
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Ensure startDate and endDate are ISO strings
    if (data.startDate) data.startDate = new Date(data.startDate).toISOString();
    if (data.endDate) data.endDate = new Date(data.endDate).toISOString();

    // Only pick the allowed fields
    const {
      customerId,
      planName,
      startDate,
      endDate,
      studentCount,
      discountPercent,
      addons, // this could be directly provided as an array of objects
      addonIds, // or these could be provided separately
      addonTerms // and need to be combined
    } = data;
    
    // Transform addonIds and addonTerms into the expected addons array format if needed
    let processedAddons = addons;
    if (addonIds && Array.isArray(addonIds) && addonTerms && typeof addonTerms === 'object') {
      processedAddons = addonIds.map(addonId => ({
        addonId,
        terms: addonTerms[addonId] || 1
      }));
      console.log('Transformed addons:', processedAddons);
    }

    // Validate required fields and log missing ones
    const requiredFields = [
      { key: 'customerId', value: customerId },
      { key: 'planName', value: planName },
      { key: 'startDate', value: startDate },
      { key: 'studentCount', value: studentCount }
    ];
    const missingFields = requiredFields.filter(f => !f.value).map(f => f.key);
    if (missingFields.length > 0) {
      console.error(`Missing required field(s): ${missingFields.join(', ')}`);
      return NextResponse.json({ error: `Missing required field(s): ${missingFields.join(', ')}` }, { status: 400 });
    }

    // If endDate is not provided, set it to null
    const safeEndDate = endDate ? endDate : null;

    const subscription = await prisma.subscription.create({
      data: {
        id: randomUUID(),
        Customer: { connect: { id: customerId } },
        planName,
        startDate,
        endDate: safeEndDate,
        studentCount,
        discountPercent: discountPercent ?? null,
        addons: processedAddons ?? [], // Use the processed addons array
        updatedAt: new Date(), // Ensure updatedAt is set properly
      }
    });
    
    console.log('Created subscription with addons:', subscription.addons);
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create subscription', details: (error as any)?.message }, { status: 400 });
  }
}

// READ (list all subscriptions)
export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({ include: { Customer: true, Invoice: true } });
    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscriptions', details: (error as any)?.message }, { status: 500 });
  }
}
