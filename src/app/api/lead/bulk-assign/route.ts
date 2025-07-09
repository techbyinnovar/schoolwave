// Bulk Lead Assignment API
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

// Store logs in memory for debugging
const apiLogs: string[] = [];

// Enhanced logging function that stores logs in memory
function log(stage: string, message: string, data?: any) {
  // Format the log message
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${stage}] ${message}`;
  
  // Try console.log
  console.log('BULK-ASSIGN-DEBUG:', logMessage, data || '');
  
  // Store in memory array for response
  if (data) {
    apiLogs.push(`${logMessage} ${JSON.stringify(data)}`);
  } else {
    apiLogs.push(logMessage);
  }
}

export async function POST(req: NextRequest) {
  log('INIT', 'API route called');
  
  try {
    // Authenticate the request
    log('AUTH', 'Authenticating request');
    const session = await auth();
    if (!session || !session.user) {
      log('AUTH', 'Authentication failed: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and manager roles should be able to bulk assign leads
    const role = session.user.role;
    log('AUTH', `Request from user: ${session.user.id}, role: ${role}`);
    
    if (role !== 'ADMIN' && role !== 'CONTENT_ADMIN') {
      log('AUTH', `Permission denied for role: ${role}`);
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Parse the request body
    log('INPUT', 'Parsing request body');
    const data = await req.json();
    const { leadIds, agentId } = data;
    log('INPUT', 'Request data received', { leadIds, agentId, leadCount: leadIds?.length });

    // Validate input
    log('VALIDATE', 'Validating input parameters');
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      log('VALIDATE', 'Validation failed: Invalid lead IDs');
      return NextResponse.json({ error: 'Invalid lead IDs' }, { status: 400 });
    }

    if (!agentId) {
      log('VALIDATE', 'Validation failed: Missing agent ID');
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Verify the agent exists
    log('AGENT', `Looking up agent with ID: ${agentId}`);
    const agent = await prisma.user.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      log('AGENT', `Agent not found with ID: ${agentId}`);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    log('AGENT', `Found agent: ${agent.email}`);

    // First, check if the leads exist and their current assignedTo values
    log('LEADS', 'Checking current lead assignments before update');
    const existingLeads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, assignedTo: true, name: true }
    });
    
    log('LEADS', `Found ${existingLeads.length} leads out of ${leadIds.length} requested`);
    
    if (existingLeads.length !== leadIds.length) {
      const foundIds = existingLeads.map(l => l.id);
      const missingIds = leadIds.filter(id => !foundIds.includes(id));
      log('LEADS', `Some leads were not found: ${missingIds.join(', ')}`);
    }

    // Update leads directly without transaction for simplicity
    log('UPDATE', `Updating ${existingLeads.length} leads to assign to agent ${agentId}`);
    
    // Track successful updates
    const updateResults = [];
    const updateErrors = [];
    
    // Update each lead individually
    for (const lead of existingLeads) {
      try {
        log('UPDATE', `Updating lead ${lead.id} from ${lead.assignedTo || 'unassigned'} to ${agentId}`);
        
        const updated = await prisma.lead.update({
          where: { id: lead.id },
          data: { 
            assignedTo: agentId,
            updatedAt: new Date()
          }
        });
        
        log('UPDATE', `Successfully updated lead ${lead.id}`);
        updateResults.push(updated);
      } catch (err) {
        log('ERROR', `Error updating lead ${lead.id}:`, err);
        updateErrors.push({ 
          leadId: lead.id, 
          error: err instanceof Error ? err.message : String(err) 
        });
      }
    }

    log('SUMMARY', `Updates completed: ${updateResults.length} successful, ${updateErrors.length} failed`);
    
    // Verify the updates by fetching the leads again
    log('VERIFY', 'Verifying lead assignments after update');
    const verifiedLeads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, assignedTo: true, name: true }
    });
    
    // Check if any leads weren't properly updated
    const incorrectlyAssigned = verifiedLeads.filter(lead => lead.assignedTo !== agentId);
    
    if (incorrectlyAssigned.length > 0) {
      log('VERIFY', `Some leads were not properly assigned: ${incorrectlyAssigned.length}`);
      log('VERIFY', 'Incorrectly assigned leads:', incorrectlyAssigned);
    } else {
      log('VERIFY', 'All leads were correctly assigned');
    }

    log('RESPONSE', 'Sending successful response');
    return NextResponse.json({ 
      success: true, 
      message: `${updateResults.length} leads assigned to agent successfully`,
      updatedLeads: updateResults.length,
      verificationResults: {
        totalVerified: verifiedLeads.length,
        correctlyAssigned: verifiedLeads.length - incorrectlyAssigned.length,
        incorrectlyAssigned: incorrectlyAssigned.length,
        errors: updateErrors.length > 0 ? updateErrors : undefined
      },
      // Include logs in the response for debugging
      logs: apiLogs
    });
  } catch (error) {
    log('ERROR', 'Unexpected error:', error);
    return NextResponse.json({ 
      error: `Failed to process request: ${error instanceof Error ? error.message : String(error)}`,
      stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
