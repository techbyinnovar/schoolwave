import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
    // Try to find a lead by email first
    let lead = await prisma.lead.findFirst({ where: { email: data.email } });

    // If not found by email, try to find by phone
    if (!lead && data.phone) {
      lead = await prisma.lead.findFirst({ where: { phone: data.phone } });
    }

    const isExistingLead = !!lead;
    
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
      // Using existing lead

      
      // Store the old lead information before updating
      const oldLeadInfo = {
        name: lead.name,
        phone: lead.phone,
        schoolName: lead.schoolName,
        stageId: lead.stageId
      };
      
      // Prepare the new lead data
      const updateData = {
        name: data.name || lead.name,
        phone: data.phone || lead.phone,
        schoolName: data.schoolName || lead.schoolName,
        stageId: data.stageId || lead.stageId
      };
      
      // Update existing lead with any new information
      lead = await prisma.lead.update({ 
        where: { id: lead.id }, 
        data: updateData
      });
      
      // Log changes if any field was actually updated
      let changesDetected = false;
      const changeLog = ['Lead information updated during form submission:'];
      
      for (const [key, newValue] of Object.entries(updateData)) {
        // Check if this field in updateData is different from the old value
        if (newValue !== oldLeadInfo[key as keyof typeof oldLeadInfo]) {
          changesDetected = true;
          changeLog.push(`- ${key}: "${oldLeadInfo[key as keyof typeof oldLeadInfo] || '(not set)'}" → "${newValue || '(not set)'}"`);
        }
      }
      
      // If changes were made, create a note about them
      if (changesDetected) {
        await prisma.note.create({
          data: {
            id: uuidv4(),
            leadId: lead.id,
            content: changeLog.join('\n')
          }
        });
      }
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

    // Fetch form name
    const form = await prisma.form.findUnique({ where: { id: data.formId } });
    
    // Prepare note content
    let noteContent = '';
    
    // Add existing lead marker if applicable
    if (isExistingLead) {
      noteContent += `[EXISTING LEAD] `;
    }
    
    // Add form details
    noteContent += `Form submitted: ${form?.name || data.formId}\n`;
    
    // Add form field values
    for (const [key, value] of Object.entries(data.responseData)) {
      noteContent += `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
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
