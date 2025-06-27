// uniqueness-migration.ts - CommonJS format
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * This script:
 * 1. Adds unique indexes to Lead table on email and phone
 * 2. Sets up trigger functions to prevent duplicate leads
 * 
 * Run this script AFTER running the deduplication script to ensure there are no duplicates
 */

async function checkForDuplicates() {
  console.log('Checking for duplicate leads...');

  // Check for email duplicates
  const emailDuplicates = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM (
      SELECT email
      FROM "Lead"
      WHERE email != '' AND email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    ) as duplicates
  `;

  // Check for phone duplicates
  const phoneDuplicates = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM (
      SELECT phone
      FROM "Lead"
      WHERE phone != '' AND phone IS NOT NULL
      GROUP BY phone
      HAVING COUNT(*) > 1
    ) as duplicates
  `;

  return {
    emailDuplicates: Number(emailDuplicates[0].count),
    phoneDuplicates: Number(phoneDuplicates[0].count)
  };
}

async function createUniqueConstraints() {
  console.log('Adding unique constraints on email and phone...');
  
  // Add uniqueness constraint for email (excluding NULL and empty strings)
  await prisma.$executeRaw`
    CREATE UNIQUE INDEX IF NOT EXISTS "Lead_email_unique"
    ON "Lead" (email)
    WHERE email IS NOT NULL AND email != ''
  `;
  console.log('✓ Added unique index on email field');

  // Add uniqueness constraint for phone (excluding NULL and empty strings)
  await prisma.$executeRaw`
    CREATE UNIQUE INDEX IF NOT EXISTS "Lead_phone_unique"
    ON "Lead" (phone)
    WHERE phone IS NOT NULL AND phone != ''
  `;
  console.log('✓ Added unique index on phone field');
}

async function createTriggerFunctions() {
  console.log('Creating trigger functions to prevent future duplicates...');
  
  try {
    // Using regular SQL strings and executeRaw instead of template literals
    // Creating the trigger function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION prevent_duplicate_leads()
      RETURNS TRIGGER AS $$
      DECLARE
        existing_id TEXT;
      BEGIN
        -- Check for email duplicates if email is provided
        IF NEW.email IS NOT NULL AND NEW.email != '' THEN
          SELECT id INTO existing_id FROM "Lead"
          WHERE email = NEW.email AND id != NEW.id
          LIMIT 1;
          
          IF existing_id IS NOT NULL THEN
            RAISE EXCEPTION 'A lead with this email already exists (ID: %)', existing_id;
          END IF;
        END IF;
        
        -- Check for phone duplicates if phone is provided
        IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
          SELECT id INTO existing_id FROM "Lead"
          WHERE phone = NEW.phone AND id != NEW.id
          LIMIT 1;
          
          IF existing_id IS NOT NULL THEN
            RAISE EXCEPTION 'A lead with this phone already exists (ID: %)', existing_id;
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await prisma.$executeRawUnsafe(createFunctionSQL);
    console.log('✓ Created prevent_duplicate_leads trigger function');

    // Drop existing trigger if it exists
    const dropTriggerSQL = 'DROP TRIGGER IF EXISTS check_lead_duplicates ON "Lead";';
    await prisma.$executeRawUnsafe(dropTriggerSQL);
    
    // Create the trigger on the Lead table
    const createTriggerSQL = `
      CREATE TRIGGER check_lead_duplicates
      BEFORE INSERT OR UPDATE ON "Lead"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_duplicate_leads();
    `;
    await prisma.$executeRawUnsafe(createTriggerSQL);
    
    console.log('✓ Created trigger on Lead table');
  } catch (error) {
    console.error('Error creating trigger functions:', error);
    throw error;
  }
}

/**
 * Main function that coordinates script execution
 */
async function main() {
  try {
    // First, check if we still have duplicates (should be run after deduplication)
    const { emailDuplicates, phoneDuplicates } = await checkForDuplicates();
    
    if (emailDuplicates > 0 || phoneDuplicates > 0) {
      console.error('\nERROR: There are still duplicates in the database:');
      console.error(`- ${emailDuplicates} duplicate email groups`);
      console.error(`- ${phoneDuplicates} duplicate phone groups`);
      console.error('\nPlease run the deduplication script first:');
      console.error('npx ts-node scripts/deduplicate-leads.ts --execute\n');
      return;
    }

    console.log('✓ No duplicates found, proceeding with uniqueness constraints...');

    // Add the unique constraints
    if (process.argv.includes('--execute')) {
      await createUniqueConstraints();
      await createTriggerFunctions();
      console.log('\n✓ Success! All uniqueness constraints and triggers have been applied.\n');
    } else {
      console.log('\n⚠️ DRY RUN ONLY - No changes have been made.');
      console.log('To actually apply the uniqueness constraints, run with --execute');
      console.log('Example: npx ts-node scripts/uniqueness-migration.ts --execute\n');
    }
  } catch (error) {
    console.error('\n❌ Script error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
