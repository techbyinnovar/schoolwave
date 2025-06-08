/*
  Warnings:

  - A unique constraint covering the columns `[demoCode]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_stageId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "demoCode" TEXT,
ADD COLUMN     "demoLog" JSONB,
ADD COLUMN     "howHeard" TEXT,
ADD COLUMN     "numberOfStudents" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "stageId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_demoCode_key" ON "Lead"("demoCode");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
