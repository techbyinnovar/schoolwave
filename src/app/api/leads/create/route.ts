import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schema
const leadSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  schoolName: z.string().min(1, { message: 'School name is required' }),
  numberOfStudents: z.string().min(1, { message: 'Number of students is required' }),
  howHeard: z.string().min(1, { message: 'This field is required' }),
});

function generateDemoCode(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SWDEMO-';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  let validatedEmailForCatch: string | undefined;
  try {
    const body = await req.json();
    const validation = leadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, phone, email, schoolName, numberOfStudents, howHeard } = validation.data;
    validatedEmailForCatch = email; // Capture email for use in catch block

    // Check if email already exists
    const existingLeadByEmail = await prisma.lead.findUnique({
      where: { email },
    });

    if (existingLeadByEmail) {
      return NextResponse.json(
        { message: 'A lead with this email already exists. Your demo code is: ' + existingLeadByEmail.demoCode, demoCode: existingLeadByEmail.demoCode }, 
        { status: 409 } // Conflict
      );
    }

    // Fetch watched_demo_stage_id from settings
    let watchedDemoStageId: string | null = null;
    try {
      const setting = await prisma.setting.findUnique({ where: { key: 'watched_demo_stage_id' } });
      if (setting && setting.value) {
        watchedDemoStageId = typeof setting.value === 'string' 
          ? setting.value 
          : String(setting.value);
      }
    } catch (e) {
      // If error, just skip assigning stage
      watchedDemoStageId = null;
    }

    let demoCode = generateDemoCode();
    let attempts = 0;
    // Ensure demo code is unique
    while (await prisma.lead.findUnique({ where: { demoCode } }) && attempts < 5) {
      demoCode = generateDemoCode();
      attempts++;
    }
    if (attempts >= 5) {
        console.error('[LEAD_API_ERROR] Could not generate a unique demo code after 5 attempts.');
        return NextResponse.json({ message: 'Could not generate a unique demo code. Please try again.' }, { status: 500 });
    }


    const newLead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        schoolName,
        numberOfStudents,
        howHeard,
        demoCode,
        demoLog: { initialStatus: 'Demo code generated', generatedAt: new Date().toISOString() }, // Initial demo_log as JSON
        ...(watchedDemoStageId ? { stageId: watchedDemoStageId } : {}),
      },
    });

    return NextResponse.json(
      { 
        message: 'Lead created successfully!', 
        demoCode: newLead.demoCode,
        leadId: newLead.id
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[LEAD_API_ERROR] Error creating lead:', error);
    let errorMessage = 'An unexpected error occurred.';
    // Prisma unique constraint violation for email (P2002)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        // This case should be caught by the explicit check above, but as a fallback:
        if (validatedEmailForCatch) {
          const existingLead = await prisma.lead.findUnique({ where: { email: validatedEmailForCatch } });
          errorMessage = 'A lead with this email already exists.';
          return NextResponse.json({ message: errorMessage, demoCode: existingLead?.demoCode }, { status: 409 });
        } else {
          errorMessage = 'A lead with this email already exists, but the specific email could not be retrieved for demo code lookup.';
          return NextResponse.json({ message: errorMessage }, { status: 409 });
        }
    }
    // Prisma unique constraint violation for demoCode (P2002) - less likely with check but possible
    if (error.code === 'P2002' && error.meta?.target?.includes('demoCode')) {
        errorMessage = 'Failed to generate a unique demo code. Please try submitting again.';
         return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
    return NextResponse.json({ message: errorMessage, details: error.message }, { status: 500 });
  }
}
