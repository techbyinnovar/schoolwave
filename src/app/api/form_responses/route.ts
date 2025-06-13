import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'prisma/client';

// POST /api/form_responses - submit a response to a form (public endpoint)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Find or create lead by email
    let lead = await prisma.lead.findUnique({ where: { email: data.email } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          schoolName: data.schoolName,
          stageId: data.stageId || null, // fallback if not provided
        },
      });
    } else if (data.stageId) {
      // Optionally update stage if form specifies
      await prisma.lead.update({ where: { id: lead.id }, data: { stageId: data.stageId } });
    }
    // Store response
    const response = await prisma.formResponse.create({
      data: {
        formId: data.formId,
        leadId: lead.id,
        responseData: data.responseData,
      },
    });
    return NextResponse.json({ success: true, responseId: response.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
