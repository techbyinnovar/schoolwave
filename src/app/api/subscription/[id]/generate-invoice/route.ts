import { db as prisma } from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
    console.log('Subscription addons:', JSON.stringify(addonObjs, null, 2));
    console.log('Available addons from settings:', JSON.stringify(addonsList, null, 2));
    
    // Map addon IDs to their terms from the subscription.addons JSON
    const addonTermsMap: Record<string, number> = {};
    addonObjs.forEach((a: any) => {
      // Use addonId (not id) as this is how addons are stored in the subscription model
      if (a.addonId) {
        addonTermsMap[a.addonId] = a.terms || 1;
        console.log(`Mapping addon ID ${a.addonId} to terms ${a.terms || 1}`);
      } else {
        console.log(`Warning: Addon object missing addonId:`, JSON.stringify(a, null, 2));
      }
    });
    
    // Filter available addons based on the addonId in subscription.addons
    const selectedAddons = [];
    
    // Loop through each addon in the subscription
    for (const subAddon of addonObjs) {
      // Type guard to ensure subAddon is an object with addonId
      if (!subAddon || typeof subAddon !== 'object' || !('addonId' in subAddon) || !subAddon.addonId) {
        console.log(`Warning: Subscription addon missing addonId:`, JSON.stringify(subAddon, null, 2));
        continue;
      }
      
      // Find the matching addon in the available addons list
      const availableAddon = addonsList.find((a: any) => a.id === subAddon.addonId);
      
      if (availableAddon) {
        console.log(`Addon match found: ${availableAddon.name} (id: ${availableAddon.id}) matches subscription addon (addonId: ${subAddon.addonId})`);
        
        // Add the addon with its terms to the selected addons
        const terms = typeof subAddon === 'object' && 'terms' in subAddon ? subAddon.terms : 1;
        
        selectedAddons.push({
          ...availableAddon,
          terms: terms || 1
        });
      } else {
        console.log(`Warning: No matching available addon found for subscription addon with addonId: ${subAddon.addonId}`);
      }
    }
    
    console.log('Selected addons after filtering:', JSON.stringify(selectedAddons, null, 2));
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
        // The terms are already included in each addon object from our earlier processing
        const addonTerm = addon.terms || 1;
        const addonPrice = addon.price || 0;
        const addonTotal = addonPrice * addonTerm;
        
        console.log(`Creating line item for addon: ${addon.name}, price: ${addonPrice}, terms: ${addonTerm}, total: ${addonTotal}`);
        
        return {
          type: 'addon',
          name: addon.name,
          unitPrice: addonPrice,
          terms: addonTerm,
          total: addonTotal,
        };
      })
    ];
    const addonTotal = selectedAddons.reduce((sum: number, addon: any) => {
      // The terms are already included in each addon object from our earlier processing
      const addonTerm = addon.terms || 1;
      const addonPrice = addon.price || 0;
      const lineTotal = addonPrice * addonTerm;
      
      console.log(`Calculating addon total: ${addon.name}, price: ${addonPrice}, terms: ${addonTerm}, total: ${lineTotal}`);
      return sum + lineTotal;
    }, 0);
    
    const invoiceTotal = planTotal + addonTotal;
    
    console.log('Invoice total:', invoiceTotal, 'Plan total:', planTotal, 'Addon total:', addonTotal);
    
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
        id: crypto.randomUUID(), // Generate UUID for invoice ID
        invoiceNumber,
        amount: invoiceTotal,
        status: 'pending',
        dueDate: subscription.endDate ? new Date(subscription.endDate) : new Date(), // Fallback to now if null
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
        lineItems,
        updatedAt: new Date(), // Add updatedAt timestamp
      }
    });
    
    // Log this as a customer action directly in SQL to avoid prisma client issues
    if (subscription.customerId) {
      // Format amount for display in note
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN'
      }).format(invoiceTotal || 0);
      
      // Create action entry directly in the database using raw query
      try {
        // Using raw SQL to avoid Prisma client model issues
        await prisma.$executeRaw`
          INSERT INTO "EntityHistory" (
            "id", "type", "entityType", "customerId", "actionType", "note", "createdAt"
          ) VALUES (
            ${crypto.randomUUID()}, 'action', 'customer', ${subscription.customerId}, 'invoice', 
            ${`Subscription invoice #${invoiceNumber} created for ${formattedAmount}`}, ${new Date()}
          )
        `;
        
        // Log success for debugging
        console.log('Successfully logged customer action for invoice:', invoiceNumber);
        
        // Additionally, create a customer note using the Prisma client
        try {
          await prisma.note.create({
            data: {
              id: crypto.randomUUID(),
              content: `Subscription invoice #${invoiceNumber} created for ${formattedAmount}`,
              customerId: subscription.customerId,
              userId: null, // No user session in API context
              entityType: 'customer'
            } as any // Type assertion to bypass TypeScript errors due to schema drift
          });
          console.log('Successfully created customer note for invoice:', invoiceNumber);
        } catch (noteError) {
          console.error('Failed to create customer note:', noteError);
        }
      } catch (error) {
        // Log the error but don't fail the invoice creation
        console.error('Failed to log customer action:', error);
        console.error(error);
      }
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate invoice', details: (error as any)?.message }, { status: 400 });
  }
}
