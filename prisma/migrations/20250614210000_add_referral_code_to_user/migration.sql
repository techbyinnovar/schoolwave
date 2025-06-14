-- Add referralCode to User (nullable, unique)
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT UNIQUE;
