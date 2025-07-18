import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '../../../auth';
import { sendTemplateToLead } from '../lead/sendTemplateToLead';
import type { MessageTemplate } from 'types/messageTemplate';

export async function POST(req: NextRequest) {
  try {
    // Authenticate using modern auth() approach
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse request
    const { leadIds, medium, subject, body, templateId } = await req.json();
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No leads specified' }, { status: 400 });
    }
    if (!medium || !['email','whatsapp'].includes(medium)) {
      return NextResponse.json({ error: 'Invalid medium' }, { status: 400 });
    }
    // Fetch leads
    const leads = await prisma.lead.findMany({ where: { id: { in: leadIds } }, include: { assignedUser: true } });
    if (!leads.length) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 });
    }
    // Fetch template if provided
    let template = null;
    if (templateId) {
      template = await prisma.messageTemplate.findUnique({ where: { id: templateId } });
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
    }
    // Send and log for each lead
    const results = [];
    for (const lead of leads) {
      let usedTemplate: MessageTemplate | null = template;
      // If no template, build a pseudo-template from subject/body
      if (!usedTemplate) {
        usedTemplate = {
          id: '',
          name: '',
          subject: subject ?? '',
          emailHtml: medium === 'email' ? body ?? '' : '',
          emailImages: [],
          emailAttachments: [],
          whatsappText: medium === 'whatsapp' ? body ?? '' : '',
          whatsappImages: [],
          createdById: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      // Use existing logic
      await sendTemplateToLead({
        lead,
        agent: lead.assignedUser,
        template: usedTemplate,
        userId: userId,
        fromStage: null,
        toStage: null,
      });
      // Create a message record
      await prisma.message.create({
        data: {
          id: uuidv4(),
          subject: (usedTemplate?.subject ?? subject) || '',
          body: medium === 'email' ? (usedTemplate?.emailHtml ?? '') : (usedTemplate?.whatsappText ?? ''),
          recipient: medium === 'email' ? lead.email : lead.phone,
          status: 'SENT',
          senderType: 'USER',
          senderId: userId,
          updatedAt: new Date(),
          ...(templateId ? { templateId } : {}),
        },
      });
      results.push({ leadId: lead.id, status: 'sent' });
    }
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Error in send-message:', error);
    // Prisma validation error
    if (error.code === 'P2009' || error.name === 'PrismaClientValidationError') {
      return NextResponse.json({
        error: 'Invalid request: One or more fields are invalid or missing.',
        prismaMessage: error.message,
      }, { status: 400 });
    }
    // Prisma known request error
    if (error.code && error.meta) {
      return NextResponse.json({
        error: `Database error: ${error.code}`,
        details: error.meta,
      }, { status: 500 });
    }
    // Generic error
    return NextResponse.json({
      error: 'Failed to send message. Please check your input and try again.',
      details: error?.message || error?.toString(),
    }, { status: 500 });
  }
}
