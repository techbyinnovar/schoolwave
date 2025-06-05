import { MailtrapClient } from "mailtrap";

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

const mailtrapToken = process.env.MAILTRAP_TOKEN;
const senderEmail = process.env.MAILTRAP_SENDER;

if (!mailtrapToken || !senderEmail) {
  throw new Error("Mailtrap API token or sender email not set in environment variables.");
}

const client = new MailtrapClient({ token: mailtrapToken });

export async function sendMail(options: SendMailOptions): Promise<void> {
  const { to, subject, html, text, from, attachments } = options;
  const sender = {
    name: from || "Schoolwave",
    email: senderEmail as string,
  };


  await client.send({
    from: sender,
    to: [{ email: to }],
    subject,
    text: text || undefined,
    html: html || undefined,
    attachments: attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
    })) || undefined,
  });
}
