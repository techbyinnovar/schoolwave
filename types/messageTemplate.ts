export interface MessageTemplate {
  id: string;
  name: string;
  subject: string | null;
  emailHtml: string | null;
  emailImages: string[];
  emailAttachments: string[];
  whatsappText: string | null;
  whatsappImages: string[];
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
