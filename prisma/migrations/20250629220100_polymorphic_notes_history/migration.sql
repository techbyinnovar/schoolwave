-- Add entityType field to Note model
ALTER TABLE "Note" ADD COLUMN "entityType" TEXT NOT NULL DEFAULT 'lead';
ALTER TABLE "Note" ADD COLUMN "customerId" TEXT;

-- Add customerId relation to Note model
ALTER TABLE "Note" ADD CONSTRAINT "Note_customerId_fkey" 
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Make leadId optional in Note model
ALTER TABLE "Note" ALTER COLUMN "leadId" DROP NOT NULL;

-- Rename LeadHistory to EntityHistory and add support for customers
ALTER TABLE "LeadHistory" RENAME TO "EntityHistory";

-- Add entityType field to EntityHistory model
ALTER TABLE "EntityHistory" ADD COLUMN "entityType" TEXT NOT NULL DEFAULT 'lead';
ALTER TABLE "EntityHistory" ADD COLUMN "customerId" TEXT;

-- Add customerId relation to EntityHistory model
ALTER TABLE "EntityHistory" ADD CONSTRAINT "EntityHistory_customerId_fkey" 
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Make leadId optional in EntityHistory model
ALTER TABLE "EntityHistory" ALTER COLUMN "leadId" DROP NOT NULL;

-- Update constraints for existing columns
ALTER TABLE "EntityHistory" RENAME CONSTRAINT "LeadHistory_pkey" TO "EntityHistory_pkey";
ALTER TABLE "EntityHistory" RENAME CONSTRAINT "LeadHistory_leadId_fkey" TO "EntityHistory_leadId_fkey";
ALTER TABLE "EntityHistory" RENAME CONSTRAINT "LeadHistory_userId_fkey" TO "EntityHistory_userId_fkey";
