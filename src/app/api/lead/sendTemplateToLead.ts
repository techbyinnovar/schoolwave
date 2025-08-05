import { sendSmtpMail } from "@/utils/smtpMailer";
import { sendWhatsAppMessage } from '@/utils/whatsappApi';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send template-based email and WhatsApp message to a lead, including handling inline images and attachments from DB.
 *
 * @param {Object} params
 * @param {Object} params.lead
 * @param {Object|null} params.agent
 * @param {Object} params.template
 * @param {string} [params.userId]
 * @param {string} [params.fromStage]
 * @param {string} [params.toStage]
 */
interface SendTemplateToLeadParams {
  lead: any;
  agent: any;
  template: any;
  userId?: string | null;
  fromStage?: string | null;
  toStage?: string | null;
}

export async function sendTemplateToLead({ lead, agent, template, userId, fromStage, toStage }: SendTemplateToLeadParams) {
  console.log('[sendTemplateToLead] called with', {
    leadId: lead?.id,
    agent,
    templateId: template?.id,
    userId,
    fromStage,
    toStage
  });
  // Normalize userId for FK constraint (used everywhere in this function)
  const normalizedUserId = userId && typeof userId === 'string' && userId.trim().length > 0 ? userId : null;
  // If stage movement is present, create a note for it
  if (fromStage && toStage && fromStage !== toStage) {
        await prisma.note.create({
      data: {
        id: uuidv4(),
        leadId: lead.id,
        userId: normalizedUserId,
        content: `moved from ${fromStage} stage to ${toStage} stage`,
      },
    });
  }

  // Render variables in template
  function render(str: string) {
    if (!str) return '';
    return str
      .replace(/{{agent.name}}/g, agent?.name || '')
      .replace(/{{agent.email}}/g, agent?.email || '')
      .replace(/{{agent.phone}}/g, agent?.phone || '')
      .replace(/{{lead.schoolName}}/g, lead?.schoolName || '')
      .replace(/{{lead.contactName}}/g, lead?.name || '')
      .replace(/{{lead.email}}/g, lead?.email || '')
      .replace(/{{lead.phone}}/g, lead?.phone || '')
      .replace(/{{lead.address}}/g, lead?.address || '');
  }

  // --- Send Email (log result as action) ---
  let emailStatus = 'not attempted';
  let emailNote = '';
  console.log('[sendTemplateToLead] Checking email send condition', {
    leadEmail: lead.email,
    templateEmailHtml: template.emailHtml ? '[present]' : '[missing]'
  });
  if (lead.email && template.emailHtml) {
    try {
      // Fetch attachments from DB if present
      let attachments: any[] = [];
      let html = render(template.emailHtml);



      // No inline images or DB attachments, so just use attachments (empty array)
      const allAttachments = attachments;

      console.log('[sendTemplateToLead] Sending email with', {
        to: lead.email,
        subject: render(template.subject || ''),
        html,
        attachments: allAttachments,
      });
      await sendSmtpMail({
        to: lead.email,
        subject: render(template.subject || ''),
        html,
        attachments: allAttachments,
      });
      emailStatus = 'success';
      emailNote = 'Email sent successfully.';
    } catch (err) {
      emailStatus = 'error';
      emailNote = `Email failed: ${err instanceof Error ? err.message : String(err)}`;
      console.error('[sendTemplateToLead] Email send error:', err);
    }
    await prisma.entityHistory.create({
      data: {
        id: uuidv4(),
        leadId: lead.id,
        type: 'action',
        actionType: 'Email',
        note: emailNote,
        userId: normalizedUserId,
        entityType: 'lead', // Required field in the EntityHistory model
      },
    });
  } else {
    if (!lead.email) console.log('[sendTemplateToLead] Lead has no email, skipping email send');
    if (!template.emailHtml) console.log('[sendTemplateToLead] Template has no emailHtml, skipping email send');
  }

  // --- Send WhatsApp (log result as action) ---
  let waStatus = 'not attempted';
  let waNote = '';
  console.log('[sendTemplateToLead] Checking WhatsApp send condition', {
    leadPhone: lead.phone,
    templateWhatsappText: template.whatsappText ? '[present]' : '[missing]'
  });
  if (lead.phone && template.whatsappText) {
    console.log('[sendTemplateToLead] Sending WhatsApp to', lead.phone, 'with text:', render(template.whatsappText));
    const result = await sendWhatsAppMessage(
      lead.phone,
      render(template.whatsappText)
    );
    
    if (result.success) {
      waStatus = 'success';
      waNote = 'WhatsApp message sent successfully.';
    } else {
      waStatus = 'error';
      waNote = `WhatsApp failed: ${result.error || 'Unknown error'}`;
      console.error('[sendTemplateToLead] WhatsApp send error:', result.error);
    }
    await prisma.entityHistory.create({
      data: {
        id: uuidv4(),
        leadId: lead.id,
        type: 'action',
        actionType: 'WhatsApp',
        note: waNote,
        userId: normalizedUserId,
        entityType: 'lead', // Required field in the EntityHistory model
      },
    });
  } else {
    if (!lead.phone) console.log('[sendTemplateToLead] Lead has no phone, skipping WhatsApp send');
    if (!template.whatsappText) console.log('[sendTemplateToLead] Template has no whatsappText, skipping WhatsApp send');
  }
}

