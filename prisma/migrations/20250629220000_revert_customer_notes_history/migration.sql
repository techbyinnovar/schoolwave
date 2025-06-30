-- Drop the CustomerNote and CustomerHistory tables if they exist
DROP TABLE IF EXISTS "CustomerNote";
DROP TABLE IF EXISTS "CustomerHistory";

-- Update TaskSubjectType to remove CUSTOMER value if needed
-- Note: in PostgreSQL we can't easily remove enum values, so we'll skip this part
-- and just leave the CUSTOMER value in the enum
