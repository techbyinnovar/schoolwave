import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';

// POST /api/form_responses - submit a response to a form (public endpoint)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Find or create lead by email
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
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
    if (!data.responseData || typeof data.responseData !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid response data' }, { status: 400 });
    }
    const response = await prisma.formResponse.create({
      data: {
        formId: data.formId,
        leadId: lead.id,
        response: data.responseData,
      },
    });

    // Fetch form name
    const form = await prisma.form.findUnique({ where: { id: data.formId } });
    let noteContent = `Form submitted: ${form?.name || data.formId}\n`;
    for (const [key, value] of Object.entries(data.responseData)) {
      noteContent += `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
    }
    await prisma.note.create({
      data: {
        leadId: lead.id,
        content: noteContent,
      },
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
