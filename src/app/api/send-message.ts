import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '../../auth';
import { sendTemplateToLead } from './lead/sendTemplateToLead';
import type { MessageTemplate } from 'types/messageTemplate';
import { sendWhatsAppMessage } from '@/utils/whatsappApi';

export async function POST(req: NextRequest) {
  try {
    // Authenticate using modern auth() approach
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id; // Get user ID from session
    
    // Log authentication success for debugging
    console.log('Send message authenticated for user:', userId);

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
          createdById: userId, // Using userId from auth() session
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (medium === 'whatsapp') {
        // Use WhatsApp API to send the message directly
        try {
          console.log('Sending WhatsApp message to', lead.phone);
          
          // Get the WhatsApp content
          const whatsappText = usedTemplate.whatsappText || body || '';
          const whatsappImages = usedTemplate.whatsappImages || [];
          
          // If there are images, send them with the text
          if (whatsappImages && whatsappImages.length > 0) {
            await sendWhatsAppMessage(
              lead.phone,
              whatsappText,
              whatsappImages.map((img: any) => img.url)
            );
          } else {
            // Otherwise just send text
            await sendWhatsAppMessage(lead.phone, whatsappText);
          }
          
          console.log('WhatsApp message sent successfully to', lead.phone);
        } catch (error) {
          console.error('Error sending WhatsApp message:', error);
          // Continue to create logs even if WhatsApp sending fails
        }
      } else {
        // Use existing email sending logic for email medium
        await sendTemplateToLead({
          lead,
          agent: lead.assignedUser,
          template: usedTemplate,
          userId: userId,
          fromStage: null,
          toStage: null,
        });
      }
      // Create a message record
      await prisma.message.create({
        data: {
          id: uuidv4(),
          subject: usedTemplate.subject || subject || '',
          body: medium === 'email' ? usedTemplate.emailHtml || '' : usedTemplate.whatsappText || '',
          status: 'SENT',
          senderType: 'USER',
          senderId: userId, // Updated to use userId from auth() session
          recipient: medium === 'email' ? lead.email : lead.phone,
          templateId: templateId || null,
          updatedAt: new Date(),
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
