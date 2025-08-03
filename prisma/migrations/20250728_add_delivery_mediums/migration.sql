-- Add deliveryMediums field to MessageTemplate model
ALTER TABLE "MessageTemplate" ADD COLUMN "deliveryMediums" JSONB NOT NULL DEFAULT '{"email": true, "whatsapp": false}';
