-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "category" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keyphrase" TEXT,
ADD COLUMN     "tags" TEXT;
