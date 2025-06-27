// deduplicate-leads.ts - CommonJS format
const { PrismaClient } = require('@prisma/client');

// Create a single Prisma client instance
const prisma = new PrismaClient();

/**
 * Main deduplication function to find and merge duplicate leads
 */
async function deduplicateLeads() {
  console.log('Starting lead deduplication process...');

  // Step 1: Find duplicate leads by email
  const duplicatesByEmail = await prisma.$queryRaw`
    SELECT email, COUNT(*), array_agg(id) as lead_ids
    FROM "Lead"
    WHERE email != '' AND email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  console.log(`Found ${duplicatesByEmail.length} email groups with duplicates`);

  // Process each email group of duplicates
  for (const group of duplicatesByEmail) {
    const leadIds = group.lead_ids;
    // Keep the oldest lead as the canonical one (first in array)
    const canonicalLeadId = leadIds[0];
    const duplicateLeadIds = leadIds.slice(1);
    
    console.log(`Processing email group: ${leadIds.join(', ')}. Keeping ${canonicalLeadId} as canonical`);

    // Update all related records to point to the canonical lead
    await mergeLeadData(canonicalLeadId, duplicateLeadIds);
  }

  // Step 2: Find duplicate leads by phone
  const duplicatesByPhone = await prisma.$queryRaw`
    SELECT phone, COUNT(*), array_agg(id) as lead_ids
    FROM "Lead"
    WHERE phone != '' AND phone IS NOT NULL
    GROUP BY phone
    HAVING COUNT(*) > 1
  `;

  console.log(`Found ${duplicatesByPhone.length} phone number groups with duplicates`);

  // Process each phone group of duplicates
  for (const group of duplicatesByPhone) {
    const leadIds = group.lead_ids;
    // Keep the oldest lead as the canonical one
    const canonicalLeadId = leadIds[0];
    const duplicateLeadIds = leadIds.slice(1);
    
    console.log(`Processing phone group: ${leadIds.join(', ')}. Keeping ${canonicalLeadId} as canonical`);

    // Update all related records to point to the canonical lead
    await mergeLeadData(canonicalLeadId, duplicateLeadIds);
  }

  console.log('Deduplication completed!');
}

/**
 * Merge duplicate lead data into a canonical lead
 */
async function mergeLeadData(canonicalLeadId: string, duplicateLeadIds: string[]) {
  try {
    // Begin transaction to ensure atomicity
    await prisma.$transaction(async (tx: any) => {
      // First, check if the duplicate leads still exist (they might have been removed in a previous merge)
      const existingDuplicates = await tx.lead.findMany({
        where: { id: { in: duplicateLeadIds } },
        select: { id: true }
      });

      if (existingDuplicates.length === 0) {
        console.log(`No duplicates found for ${canonicalLeadId}, skipping`);
        return;
      }

      const existingDuplicateIds = existingDuplicates.map((d: { id: string }) => d.id);
      console.log(`Found ${existingDuplicateIds.length} existing duplicates for ${canonicalLeadId}`);

      // 1. Migrate all notes
      const noteCount = await tx.note.updateMany({
        where: { leadId: { in: existingDuplicateIds } },
        data: { leadId: canonicalLeadId }
      });
      console.log(`Migrated ${noteCount.count} notes`);

      // 2. Migrate all history records
      const historyCount = await tx.leadHistory.updateMany({
        where: { leadId: { in: existingDuplicateIds } },
        data: { leadId: canonicalLeadId }
      });
      console.log(`Migrated ${historyCount.count} history records`);

      // 3. Migrate all webinar registrations - handle uniqueness constraint
      for (const duplicateId of existingDuplicateIds) {
        const registrations = await tx.webinarRegistration.findMany({
          where: { leadId: duplicateId }
        });
        
        for (const reg of registrations) {
          // Check if the canonical lead already has registration for this webinar
          const existingReg = await tx.webinarRegistration.findFirst({
            where: {
              leadId: canonicalLeadId,
              webinarId: reg.webinarId
            }
          });
          
          if (!existingReg) {
            // If no existing registration, update this one
            await tx.webinarRegistration.update({
              where: { id: reg.id },
              data: { leadId: canonicalLeadId }
            });
            console.log(`Migrated webinar registration ${reg.id} to lead ${canonicalLeadId}`);
          } else {
            // If canonical lead already registered for this webinar, delete duplicate
            await tx.webinarRegistration.delete({
              where: { id: reg.id }
            });
            console.log(`Deleted duplicate webinar registration ${reg.id}`);
          }
        }
      }

      // 4. Migrate all requests
      const requestCount = await tx.request.updateMany({
        where: { leadId: { in: existingDuplicateIds } },
        data: { leadId: canonicalLeadId }
      });
      console.log(`Migrated ${requestCount.count} requests`);

      // 5. Migrate all form responses
      const formResponseCount = await tx.formResponse.updateMany({
        where: { leadId: { in: existingDuplicateIds } },
        data: { leadId: canonicalLeadId }
      });
      console.log(`Migrated ${formResponseCount.count} form responses`);

      // 6. Add a record in the history about the merge
      await tx.leadHistory.create({
        data: {
          leadId: canonicalLeadId,
          type: 'MERGE',
          note: `Merged duplicate leads: ${existingDuplicateIds.join(', ')}`,
          actionType: 'SYSTEM'
        }
      });

      // 7. Delete the duplicate leads (only after migrating all relationships)
      const deletedCount = await tx.lead.deleteMany({
        where: { id: { in: existingDuplicateIds } }
      });
      console.log(`Deleted ${deletedCount.count} duplicate leads`);
    });

    console.log(`Successfully processed canonical lead ${canonicalLeadId}`);
  } catch (error) {
    console.error(`Error merging lead data for ${canonicalLeadId}:`, error);
  }
}

/**
 * Analyze the leads table to provide insight into duplicates
 */
async function analyzeLeadDuplicates() {
  console.log('Analyzing lead duplicates...');

  try {
    // Count email duplicates
    const emailDuplicateCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM (
        SELECT email
        FROM "Lead"
        WHERE email != '' AND email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
      ) as duplicates
    `;
    
    const emailDuplicateLeadCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Lead"
      WHERE email IN (
        SELECT email
        FROM "Lead"
        WHERE email != '' AND email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
      )
    `;

    console.log(`Found ${emailDuplicateCount[0].count} unique emails with duplicates`);
    console.log(`Found ${emailDuplicateLeadCount[0].count} total leads with duplicate emails`);
    
    // Count phone duplicates
    const phoneDuplicateCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM (
        SELECT phone
        FROM "Lead"
        WHERE phone != '' AND phone IS NOT NULL
        GROUP BY phone
        HAVING COUNT(*) > 1
      ) as duplicates
    `;
    
    const phoneDuplicateLeadCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Lead"
      WHERE phone IN (
        SELECT phone
        FROM "Lead"
        WHERE phone != '' AND phone IS NOT NULL
        GROUP BY phone
        HAVING COUNT(*) > 1
      )
    `;

    console.log(`Found ${phoneDuplicateCount[0].count} unique phone numbers with duplicates`);
    console.log(`Found ${phoneDuplicateLeadCount[0].count} total leads with duplicate phone numbers`);
  } catch (error) {
    console.error('Error analyzing duplicates:', error);
  }
}

// Main script execution
async function main() {
  try {
    // Run the analyze function first to see the scope of duplicates
    await analyzeLeadDuplicates();
    
    console.log('\nIMPORTANT: This is a preview of duplicates in your database.');
    console.log('To actually perform the deduplication, run this script with --execute');
    console.log('For example: npx ts-node scripts/deduplicate-leads.ts --execute');
    
    // Only run deduplication if explicitly requested
    if (process.argv.includes('--execute')) {
      await deduplicateLeads();
    }
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();
