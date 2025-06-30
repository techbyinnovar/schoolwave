-- Add EntityHistory table if it doesn't exist
CREATE TABLE IF NOT EXISTS "EntityHistory" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "fromStage" TEXT,
  "toStage" TEXT,
  "actionType" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leadId" TEXT,
  "customerId" TEXT,
  "userId" TEXT,
  "disposition" TEXT,
  "entityType" TEXT NOT NULL,

  CONSTRAINT "EntityHistory_pkey" PRIMARY KEY ("id")
);

-- Add customerId column to Note table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Note' AND column_name = 'customerId'
  ) THEN
    ALTER TABLE "Note" ADD COLUMN "customerId" TEXT;
  END IF;
END $$;

-- Add entityType column to Note table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Note' AND column_name = 'entityType'
  ) THEN
    ALTER TABLE "Note" ADD COLUMN "entityType" TEXT;
  END IF;
END $$;

-- Add foreign keys
ALTER TABLE "EntityHistory" ADD CONSTRAINT "EntityHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EntityHistory" ADD CONSTRAINT "EntityHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EntityHistory" ADD CONSTRAINT "EntityHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
