import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST /api/form_responses - submit a response to a form (public endpoint)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Find or create lead by email
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'formId'];
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] !== 'string' && field !== 'formId') || (typeof data[field] === 'string' && data[field].trim() === '')) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Fetch the form
    const form = await prisma.form.findUnique({ 
      where: { id: data.formId }
    });
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    // Check if the form allows multiple submissions (using form.fields which is a JSON field)
    // We'll store this setting in the form's fields JSON as a property
    const formFields = form.fields as any;
    const allowMultipleSubmissions = formFields?.allowMultipleSubmissions === true;
    
    // Try to find a lead by email first
    let lead = await prisma.lead.findFirst({ where: { email: data.email } });

    // If not found by email, try to find by phone
    if (!lead && data.phone) {
      lead = await prisma.lead.findFirst({ where: { phone: data.phone } });
    }

    const isExistingLead = !!lead;
    
    // If this is an existing lead, check if they've already submitted this form
    if (isExistingLead) {
      // Check for existing form submissions from this lead for this form
      const existingSubmission = await prisma.formResponse.findFirst({
        where: {
          formId: data.formId,
          leadId: lead!.id
        }
      });
      
      // If there's an existing submission and multiple submissions are not allowed, return an error
      if (existingSubmission && !allowMultipleSubmissions) {
        return NextResponse.json({ 
          error: 'You have already submitted this form. Multiple submissions are not allowed.',
          existingSubmissionId: existingSubmission.id
        }, { status: 409 }); // 409 Conflict
      }
    }
    
    if (!lead) {
      // Create a new lead if one doesn't exist
      lead = await prisma.lead.create({
        data: {
          id: uuidv4(),
          name: data.name,
          email: data.email,
          phone: data.phone,
          schoolName: data.schoolName,
          stageId: data.stageId || null, // fallback if not provided
          updatedAt: new Date(),
        },
      });
    } else {
      // Using existing lead - do not update the lead information
      // Just create a note that a new form submission was linked to this lead
      // We'll create a more detailed note after fetching the form information
    }
    // Store response
    if (!data.responseData || typeof data.responseData !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid response data' }, { status: 400 });
    }
    const response = await prisma.formResponse.create({
      data: {
        id: uuidv4(),
        formId: data.formId,
        leadId: lead.id,
        response: data.responseData,
      },
    });

    // No need to fetch the form again as we already have it from earlier
    // We already have the form object from the beginning of this function
    
    // Prepare note content
    let noteContent = '';
    
    // Add existing lead marker if applicable
    if (isExistingLead) {
      noteContent += `[EXISTING LEAD] `;
    }
    
    // Add form details with timestamp
    noteContent += `Form submitted: ${form?.name || data.formId} (${new Date().toLocaleString()})\n\n`;
    
    // Add lead information section
    noteContent += `Lead Information:\n`;
    noteContent += `- Name: ${data.name}\n`;
    noteContent += `- Email: ${data.email}\n`;
    noteContent += `- Phone: ${data.phone}\n`;
    if (data.schoolName) noteContent += `- School/Organization: ${data.schoolName}\n`;
    
    // Add form response section with all field values
    noteContent += `\nForm Response Data:\n`;
    for (const [key, value] of Object.entries(data.responseData)) {
      noteContent += `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
    }
    
    // Create the note
    await prisma.note.create({
      data: {
        id: uuidv4(),
        leadId: lead.id,
        content: noteContent,
        // Note: The Note model doesn't have a type field, so we'll include the info in content
      },
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
