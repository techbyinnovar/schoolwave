-- AlterTable
ALTER TABLE "webinars" ADD COLUMN     "learningObjectives" JSONB,
ADD COLUMN     "targetAudience" JSONB,
ADD COLUMN     "whyAttendReasons" JSONB;
