import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { schoolName, name, phone, email, address, webinarId } = data;

    // --- Start of Validation ---
    if (!webinarId) {
      return NextResponse.json({ error: 'Webinar ID is required' }, { status: 400 });
    }
    // Email is the primary unique identifier for a lead and is required.
    if (!email) {
      return NextResponse.json({ error: 'Email is required to register.' }, { status: 400 });
    }
    // --- End of Validation ---

    const setting = await prisma.setting.findUnique({ where: { key: 'webinar_stage_id' } });
    const stageId = setting?.value;

    if (!stageId || typeof stageId !== 'string') {
      return NextResponse.json({ error: 'Webinar stage ID is not configured in settings.' }, { status: 500 });
    }

    // --- Find or Create Lead ---
    // Using findFirst instead of findUnique since email is not marked as unique in the schema
    let lead = await prisma.lead.findFirst({
      where: { 
        email: { 
          equals: email 
        } 
      },
    });

    const isExistingLead = !!lead;

    if (isExistingLead) {
      // If the lead exists, DO NOT update it with new information as requested
      // Instead, just create a note that they attempted to register with potentially different information
      
      // Check if any information is different from what we have
      const differentInfo = [];
      if (schoolName && schoolName !== lead!.schoolName) differentInfo.push(`School Name: "${lead!.schoolName || '(not set)'}" vs "${schoolName}"`);
      if (name && name !== lead!.name) differentInfo.push(`Name: "${lead!.name || '(not set)'}" vs "${name}"`);
      if (phone && phone !== lead!.phone) differentInfo.push(`Phone: "${lead!.phone || '(not set)'}" vs "${phone}"`);
      if (address && address !== lead!.address) differentInfo.push(`Address: "${lead!.address || '(not set)'}" vs "${address}"`);
      
      // If there's different information, log it but don't update
      if (differentInfo.length > 0) {
        await prisma.note.create({
          data: { 
            id: uuidv4(), 
            leadId: lead!.id, 
            content: `Lead registered for webinar with different information than in database. Not updating lead record as per configuration.\n\nDifferences detected:\n${differentInfo.join('\n')}` 
          }
        });
      }
      
      // No updates to the lead record - using existing data only
    } else {
      // If the lead does not exist, check if phone exists on another lead
      let phoneConflict = null;
      if (phone) {
        phoneConflict = await prisma.lead.findFirst({
          where: { phone }
        });
      }
      
      if (phoneConflict) {
        // Phone already exists - use that lead instead of creating a new one
        lead = phoneConflict;
        
        // Update the existing lead with any new information
        const updateData: { [key: string]: any } = {};
        if (schoolName && schoolName !== lead.schoolName) updateData.schoolName = schoolName;
        if (name && name !== lead.name) updateData.name = name;
        if (email && email !== lead.email) updateData.email = email;
        if (address && address !== lead.address) updateData.address = address;
        
        if (Object.keys(updateData).length > 0) {
          try {
            // Log changes before updating
            const changeLog = ['Lead information updated during webinar registration (matched by phone):'];
            for (const [key, newValue] of Object.entries(updateData)) {
                changeLog.push(`- ${key}: "${(lead as any)[key] || '(not set)'}" → "${newValue || '(not set)'}"`);
            }
            await prisma.note.create({
                data: { id: uuidv4(), leadId: lead.id, content: changeLog.join('\n') }
            });
            
            lead = await prisma.lead.update({
              where: { id: lead.id },
              data: updateData,
            });
          } catch (updateError) {
            console.error('Error updating lead with phone match:', updateError);
            // Continue with existing lead data
            await prisma.note.create({
              data: { 
                id: uuidv4(), 
                leadId: lead.id, 
                content: `Error updating lead information during webinar registration (phone match): ${updateError instanceof Error ? updateError.message : 'Unknown error'}` 
              }
            });
          }
        } else {
          // No updates needed, just log that we found a match
          await prisma.note.create({
            data: { 
              id: uuidv4(), 
              leadId: lead.id, 
              content: `Found existing lead by phone number during webinar registration.` 
            }
          });
        }
      } else {
        // No phone conflict - create a new lead
        try {
          lead = await prisma.lead.create({
            data: {
              id: uuidv4(),
              schoolName,
              name,
              phone,
              email,
              address,
              stageId,
              updatedAt: new Date(), // Required field in the Lead model
            },
          });
        } catch (createError) {
          console.error('Error creating lead:', createError);
          
          // If creation failed, try to find by email as a fallback
          const fallbackLead = await prisma.lead.findFirst({
            where: { email }
          });
          
          if (fallbackLead) {
            lead = fallbackLead;
            await prisma.note.create({
              data: { 
                id: uuidv4(), 
                leadId: lead.id, 
                content: `Failed to create new lead during webinar registration due to error: ${createError instanceof Error ? createError.message : 'Unknown error'}. Using existing lead found by email.` 
              }
            });
          } else {
            // No fallback found - must throw error
            throw new Error(`Could not create lead and no fallback found: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
          }
        }
      }
    }

    // --- Final Guardrail ---
    // This check is critical. If 'lead' is null here, something has gone wrong,
    // and we must not proceed to create an orphan registration.
    if (!lead) {
      console.error('Fatal: Lead could not be found or created. Registration aborted.');
      return NextResponse.json({ error: 'Could not process lead information' }, { status: 500 });
    }

    // Check if already registered
    const existingRegistration = await prisma.webinar_registrations.findUnique({
      where: {
        webinarId_leadId: {
          webinarId: webinarId,
          leadId: lead.id,
        },
      },
    });

    if (existingRegistration) {
      // Even though already registered, add a note about the repeat registration attempt
      try {
        // Get webinar details for the note
        const webinar = await prisma.webinars.findUnique({
          where: { id: webinarId },
          select: { title: true, dateTime: true }
        });
        
        // Create a note about the repeat registration attempt
        await prisma.note.create({
          data: {
            id: uuidv4(),
            leadId: lead.id,
            content: `Lead attempted to register again for webinar: ${webinar?.title || webinarId}${webinar?.dateTime ? ` (scheduled for ${new Date(webinar.dateTime).toLocaleString()})` : ''}`
          }
        });
      } catch (noteError) {
        console.error('Error creating note for repeat registration:', noteError);
        // Continue despite note error
      }
      
      return NextResponse.json({ message: 'Lead already registered for this webinar', lead, registration: existingRegistration }, { status: 200 });
    }

    // Create the webinar registration
    let webinarRegistration;
    try {
      webinarRegistration = await prisma.webinar_registrations.create({
        data: {
          id: uuidv4(),
          registeredAt: new Date(),
          leadId: lead.id,
          webinarId: webinarId,
        },
      });
    } catch (registrationError) {
      console.error('Error creating webinar registration:', registrationError);
      
      // Check if it's a unique constraint error (already registered)
      if (registrationError instanceof Error && registrationError.message.includes('Unique constraint')) {
        // Find the existing registration
        const existingReg = await prisma.webinar_registrations.findUnique({
          where: {
            webinarId_leadId: {
              webinarId: webinarId,
              leadId: lead.id,
            },
          },
        });
        
        if (existingReg) {
          webinarRegistration = existingReg;
          // Add note about duplicate registration attempt
          await prisma.note.create({
            data: {
              id: uuidv4(),
              leadId: lead.id,
              content: `System detected duplicate webinar registration attempt and used existing registration.`,
            },
          });
        } else {
          // This shouldn't happen, but handle it gracefully
          throw new Error(`Registration failed with unique constraint error but no existing registration found: ${registrationError.message}`);
        }
      } else {
        // Re-throw other errors
        throw registrationError;
      }
    }

    // Get detailed webinar information for the note
    const webinar = await prisma.webinars.findUnique({
      where: { id: webinarId },
      select: { title: true, dateTime: true, description: true, subtitle: true }
    });

    // Create a detailed note about the webinar registration
    const details = [];
    if (webinar) {
      details.push(`Title: ${webinar.title || 'Untitled'}`);
      if (webinar.dateTime) details.push(`Date: ${new Date(webinar.dateTime).toLocaleString()}`);
      if (webinar.subtitle) details.push(`Subtitle: ${webinar.subtitle}`);
      if (webinar.description) details.push(`Description: ${webinar.description}`);
    }
    
    // Build the note content
    let notePrefix = isExistingLead ? '[EXISTING LEAD] ' : '';
    let noteContent = `${notePrefix}Lead registered for webinar: ${webinar?.title || webinarId}`;
    
    // Add details if available
    if (details.length > 0) {
      noteContent += '\n\nWebinar Details:\n' + details.join('\n');
    }
    
    // Add registration time
    noteContent += `\n\nRegistered at: ${new Date().toLocaleString()}`;
    
    // Create the note
    await prisma.note.create({
      data: {
        id: uuidv4(),
        leadId: lead.id,
        content: noteContent,
      },
    });

    return NextResponse.json({ lead, webinarRegistration });
  } catch (error) {
    console.error('Error registering webinar lead:', error);
    // Consider more specific error handling, e.g., Prisma known errors
    if (error instanceof Error && 'code' in error && error.code === 'P2002') { // Unique constraint failed
        return NextResponse.json({ error: 'A registration for this lead and webinar might already exist or another unique constraint failed.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to register lead' }, { status: 500 });
  }
}
