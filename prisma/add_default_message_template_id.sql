-- Add default_message_template_id column to webinars table
ALTER TABLE "public"."webinars" ADD COLUMN "default_message_template_id" TEXT;

-- Add foreign key constraint to reference the MessageTemplate table
ALTER TABLE "public"."webinars" ADD CONSTRAINT "webinars_default_message_template_id_fkey" 
FOREIGN KEY ("default_message_template_id") REFERENCES "public"."MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
