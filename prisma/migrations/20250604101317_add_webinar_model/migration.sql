-- CreateTable
CREATE TABLE "webinars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "platform" TEXT,
    "facilitators" JSONB,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "price" DOUBLE PRECISION,
    "attendeeLimit" INTEGER,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "authorId" TEXT,

    CONSTRAINT "webinars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webinars_slug_key" ON "webinars"("slug");

-- AddForeignKey
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
