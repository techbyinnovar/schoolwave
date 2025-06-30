import { sendSmtpMail } from '@/utils/smtpMailer';
import { sendWhatsAppMessage } from '@/utils/whatsappApi';
import { db as prisma } from '@/lib/db';

interface SendTemplateToLeadParams {
  lead: any;
  agent: any;
  template: any;
  userId?: string | null;
  fromStage?: string | null;
  toStage?: string | null;
}

export async function sendTemplateToLead({ lead, agent, template, userId, fromStage, toStage }: SendTemplateToLeadParams) {
  // Normalize userId for FK constraint (used everywhere in this function)
  const normalizedUserId = userId && typeof userId === 'string' && userId.trim().length > 0 ? userId : null;
  // If stage movement is present, create a note for it
  if (fromStage && toStage && fromStage !== toStage) {
    // Normalize userId for FK constraint
    const normalizedUserId = userId && typeof userId === 'string' && userId.trim().length > 0 ? userId : null;
    await prisma.note.create({
      data: {
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
  if (lead.email && template.emailHtml) {
    try {
      // Fetch attachments from DB if present
      let attachments: any[] = [];

      await sendSmtpMail({
        to: lead.email,
        subject: render(template.subject || ''),
        html: render(template.emailHtml),
        attachments,
      });
      emailStatus = 'success';
      emailNote = 'Email sent successfully.';
    } catch (err) {
      emailStatus = 'error';
      emailNote = `Email failed: ${err instanceof Error ? err.message : String(err)}`;
    }
    await prisma.leadHistory.create({
      data: {
        leadId: lead.id,
        type: 'action',
        actionType: 'Email',
        note: emailNote,
        userId: normalizedUserId,
      },
    });
  }

  // --- Send WhatsApp (log result as action) ---
  let waStatus = 'not attempted';
  let waNote = '';
  if (lead.phone && template.whatsappText) {
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
    }
    await prisma.leadHistory.create({
      data: {
        leadId: lead.id,
        type: 'action',
        actionType: 'WhatsApp',
        note: waNote,
        userId: normalizedUserId,
      },
    });
  }
}
