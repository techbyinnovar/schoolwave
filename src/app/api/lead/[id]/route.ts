import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export const runtime = "nodejs";
import { sendTemplateToLead } from "@/app/api/lead/sendTemplateToLead";


// GET /api/lead/[id] - get a single lead by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { assignedUser: true, Stage: true, ownedBy: true, Note: { include: { User: true } }, EntityHistory: { include: { User: true } } },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ result: { data: lead } });
}

// PATCH /api/lead/[id] - update a lead by id
import { auth } from '@/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  const data = await req.json();

  // Fetch current lead (with relations) to detect stage change later
  const existingLead = await prisma.lead.findUnique({
    where: { id },
    include: { Stage: true, assignedUser: true }
  });

  // Role-based allowed fields
  let allowedFields: string[] = [];
  if (role === 'ADMIN') {
    allowedFields = [
      'schoolName', 'name', 'phone', 'email', 'address', 'assignedTo', 'stageId', 'ownedById'
    ];
  } else if (role === 'AGENT') {
    allowedFields = ['stageId'];
    // Prevent AGENT from changing other fields
    if (Object.keys(data).some(key => key !== 'id' && key !== 'stageId')) {
      return NextResponse.json({ error: 'Permission denied: AGENT can only change stage' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  const filteredUpdate: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      // Convert empty strings to null for foreign key fields
      if ((key === 'ownedById' || key === 'assignedTo' || key === 'stageId') && data[key] === '') {
        filteredUpdate[key] = null;
      } else {
        filteredUpdate[key] = data[key];
      }
    }
  }

  try {
    // Check for duplicate phone if phone is being updated
    if (filteredUpdate.phone) {
      const existingLeadWithPhone = await prisma.lead.findFirst({
        where: {
          phone: filteredUpdate.phone,
          id: { not: id } // Exclude current lead
        }
      });
      
      if (existingLeadWithPhone) {
        // Instead of returning an error, we'll transfer form responses from current lead to existing lead
        // and then redirect to the existing lead
        
        // 1. Get all form responses for the current lead
        const formResponses = await prisma.formResponse.findMany({
          where: { leadId: id }
        });
        
        // 2. Update all form responses to point to the existing lead
        if (formResponses.length > 0) {
          await Promise.all(formResponses.map(response => 
            prisma.formResponse.update({
              where: { id: response.id },
              data: { leadId: existingLeadWithPhone.id }
            })
          ));
        }
        
        // 3. Create a note on the existing lead about the merge
        await prisma.note.create({
          data: {
            id: uuidv4(),
            leadId: existingLeadWithPhone.id,
            content: `Lead with ID ${id} was merged into this lead due to duplicate phone number.`,
            createdAt: new Date()
          }
        });
        
        // 4. Return the existing lead with a message about the merge
        return NextResponse.json({ 
          result: { 
            data: existingLeadWithPhone,
            message: `Found duplicate phone number. Form responses have been linked to the existing lead (ID: ${existingLeadWithPhone.id}).`
          } 
        });
      }
    }
    
    const lead = await prisma.lead.update({
      where: { id },
      data: filteredUpdate,
      include: { Stage: true, assignedUser: true }
    });

    // ---- Auto send template if stage changed & new stage has default template ----
    if (existingLead?.stageId !== lead.stageId && lead.stageId) {
      const stage = await prisma.stage.findUnique({
        where: { id: lead.stageId },
        include: { MessageTemplate: true }
      });
      if (stage?.MessageTemplate) {
        // fire and forget; do not block response
        sendTemplateToLead({
          lead,
          agent: lead.assignedUser,
          template: stage.MessageTemplate,
          userId,
          fromStage: existingLead?.Stage?.name ?? null,
          toStage: stage.name ?? null,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ result: { data: lead } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update lead' }, { status: 500 });
  }
}


// DELETE /api/lead/[id] - delete a lead by id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
