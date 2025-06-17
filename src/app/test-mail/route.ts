import { NextRequest, NextResponse } from 'next/server';
import { sendSmtpMail } from '@/utils/smtpMailer';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text, html } = await req.json();
    await sendSmtpMail({
      to,
      subject: subject || 'SMTP Test Email',
      text: text || 'This is a test email sent via SMTP.',
      html: html || '<p>This is a <strong>test email</strong> sent via SMTP.</p>',
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
