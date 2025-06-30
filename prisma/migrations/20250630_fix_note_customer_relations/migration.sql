-- Add missing columns to Note table for polymorphic relationships
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "entityType" TEXT DEFAULT 'lead';

-- Create EntityHistory table if it doesn't exist
-- This supports polymorphic relationships for both leads and customers
CREATE TABLE IF NOT EXISTS "EntityHistory" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "entityType" TEXT NOT NULL DEFAULT 'lead',
  "fromStage" TEXT,
  "toStage" TEXT,
  "actionType" TEXT,
  "note" TEXT,
  "disposition" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leadId" TEXT,
  "customerId" TEXT,
  "userId" TEXT,
  
  CONSTRAINT "EntityHistory_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys if they don't exist
DO $$ 
BEGIN
  -- Only add FK if it doesn't exist yet
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'EntityHistory_leadId_fkey'
  ) THEN
    ALTER TABLE "EntityHistory" 
    ADD CONSTRAINT "EntityHistory_leadId_fkey" 
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'EntityHistory_customerId_fkey'
  ) THEN
    ALTER TABLE "EntityHistory" 
    ADD CONSTRAINT "EntityHistory_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'EntityHistory_userId_fkey'
  ) THEN
    ALTER TABLE "EntityHistory" 
    ADD CONSTRAINT "EntityHistory_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Note_customerId_fkey'
  ) THEN
    ALTER TABLE "Note" 
    ADD CONSTRAINT "Note_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Mark this migration as applied in Prisma
