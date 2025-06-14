-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "ownedById" TEXT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownedById_fkey" FOREIGN KEY ("ownedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
