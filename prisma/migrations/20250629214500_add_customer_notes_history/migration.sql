-- Add CustomerNote model
CREATE TABLE "CustomerNote" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerId" TEXT NOT NULL,
  "userId" TEXT,
  
  CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- Add CustomerHistory model
CREATE TABLE "CustomerHistory" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "actionType" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerId" TEXT NOT NULL,
  "userId" TEXT,
  
  CONSTRAINT "CustomerHistory_pkey" PRIMARY KEY ("id")
);

-- Add CustomerNote foreign keys
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add CustomerHistory foreign keys
ALTER TABLE "CustomerHistory" ADD CONSTRAINT "CustomerHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerHistory" ADD CONSTRAINT "CustomerHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update Task model to support CUSTOMER as a subject type
ALTER TYPE "TaskSubjectType" ADD VALUE 'CUSTOMER';
