import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { sendTemplateToLead } from './lead/sendTemplateToLead';
import type { MessageTemplate } from 'types/messageTemplate';

export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request
    const { leadIds, medium, subject, body, templateId } = await req.json();
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No leads specified' }, { status: 400 });
    }
    if (!medium || !['email','whatsapp'].includes(medium)) {
      return NextResponse.json({ error: 'Invalid medium' }, { status: 400 });
    }
    // Fetch leads
    const leads = await prisma.lead.findMany({ where: { id: { in: leadIds } }, include: { agent: true } });
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
      let usedTemplate: MessageTemplate = template as MessageTemplate;
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
          createdById: token.sub,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      // Use existing logic
      await sendTemplateToLead({
        lead,
        agent: lead.agent,
        template: usedTemplate,
        userId: token.sub,
        fromStage: null,
        toStage: null,
      });
      // Create a message record
      await prisma.message.create({
        data: {
          subject: usedTemplate.subject || subject || '',
          body: medium === 'email' ? usedTemplate.emailHtml || '' : usedTemplate.whatsappText || '',
          status: 'SENT',
          senderType: 'USER',
          senderId: token.sub,
          recipient: medium === 'email' ? lead.email : lead.phone,
          templateId: templateId || null,
        },
      });
      results.push({ leadId: lead.id, status: 'sent' });
    }
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error in send-message:', error);
    return NextResponse.json({ error: 'Failed to send message', details: (error as any)?.message }, { status: 500 });
  }
}
