import { prisma } from 'lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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
function calculateTerms(startDate: Date, endDate: Date) {
  const start = startDate;
  const end = endDate;
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(1, Math.ceil(months / 3));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    const plans = await fetchSetting('available_plans');
    const addonsList = await fetchSetting('available_addons');

    // Find plan and addons
    const plan = plans.find((p: any) => p.name === subscription.planName);
    const addonObjs = Array.isArray(subscription.addons) ? subscription.addons : [];
    // Map addon IDs to their terms from the subscription.addons JSON
    const addonTermsMap: Record<string, number> = {};
    addonObjs.forEach((a: any) => {
      if (a.id) addonTermsMap[a.id] = a.terms || 1;
    });
    const selectedAddons = addonsList.filter((a: any) => addonObjs.some((o: any) => o.id === a.id));
    const planTerms = subscription.terms || (
      subscription.startDate && subscription.endDate
        ? calculateTerms(subscription.startDate, subscription.endDate)
        : 1
    );
    const planUnitPrice = plan?.pricePerStudentPerTerm || 0;
    const discount = subscription.discountPercent ? (planUnitPrice * subscription.discountPercent / 100) : 0;
    const netUnitPrice = planUnitPrice - discount;
    const planTotal = netUnitPrice * subscription.studentCount * planTerms;
    const lineItems = [
      {
        type: 'plan',
        name: plan?.name || subscription.planName,
        unitPrice: planUnitPrice,
        discount: subscription.discountPercent || 0,
        studentCount: subscription.studentCount,
        terms: planTerms,
        total: planTotal,
      },
      ...selectedAddons.map((addon: any) => {
        const addonTerm = addonTermsMap[addon.id] || 1;
        return {
          type: 'addon',
          name: addon.name,
          unitPrice: addon.price || 0,
          terms: addonTerm,
          total: (addon.price || 0) * addonTerm,
        };
      })
    ];
    const invoiceTotal = planTotal + selectedAddons.reduce((sum: number, a: any) => {
      const addonTerm = addonTermsMap[a.id] || 1;
      return sum + ((a.price || 0) * addonTerm);
    }, 0);
    
    // Generate invoice number in format: SW-YYYY-NNN-R
    const currentYear = new Date().getFullYear();
    
    // Find the latest invoice for this year
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `SW-${currentYear}-`
        }
      },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true }
    });
    
    // Extract the sequential number from the latest invoice or start from 1
    let nextNumber = 1;
    if (latestInvoice?.invoiceNumber) {
      const matches = latestInvoice.invoiceNumber.match(/SW-\d{4}-(\d{3})-R/);
      if (matches && matches[1]) {
        nextNumber = parseInt(matches[1], 10) + 1;
      }
    }
    
    // Format the invoice number (e.g., SW-2025-001-R)
    const invoiceNumber = `SW-${currentYear}-${String(nextNumber).padStart(3, '0')}-R`;
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: invoiceTotal,
        status: 'pending',
        dueDate: subscription.endDate ? new Date(subscription.endDate) : new Date(), // Fallback to now if null
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
        lineItems,
      }
    });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate invoice', details: (error as any)?.message }, { status: 400 });
  }
}
