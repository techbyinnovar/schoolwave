/*
  This migration was originally intended to add a unique constraint to Lead.email,
  but the constraint was later removed. This file has been modified to match
  the current database state.
*/

-- Original code was:
-- CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- Now it's an empty migration to reflect that the constraint doesn't exist
