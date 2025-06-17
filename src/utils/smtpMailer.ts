import nodemailer from 'nodemailer';

export interface SmtpMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const senderEmail = process.env.SMTP_SENDER_EMAIL;

if (!smtpHost || !smtpUser || !smtpPass || !senderEmail) {
  throw new Error('SMTP environment variables are not set.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  // Allow self-signed certificates (for development/testing only)
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendSmtpMail(options: SmtpMailOptions): Promise<void> {
  const { to, subject, html, text, from, attachments } = options;
  const mailOptions = {
    from: from || senderEmail,
    to,
    subject,
    text,
    html,
    attachments: attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
    })),
  };

  await transporter.sendMail(mailOptions);
}
