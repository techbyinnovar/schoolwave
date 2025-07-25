import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

// GET /api/activity - Get lead activity data with agent stats
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const dateRange = url.searchParams.get('date') || 'last7days';
    const stageId = url.searchParams.get('stage') || '';
    const disposition = url.searchParams.get('disposition') || '';
    const agentId = url.searchParams.get('agent') || '';
    
    // Calculate date range
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate = undefined;
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Default to last 7 days
        startDate.setHours(0, 0, 0, 0);
    }
    
    // Build query filters
    const whereClause: any = {};
    
    // Date filter
    if (startDate) {
      whereClause.updatedAt = {
        gte: startDate
      };
    }
    
    // Stage filter
    if (stageId) {
      whereClause.stageId = stageId;
    }
    
    // Disposition filter
    if (disposition) {
      whereClause.lastDisposition = disposition;
    }
    
    // Agent filter (assigned user)
    if (agentId) {
      whereClause.assignedUser = { id: agentId };
    }
    
    // Access control - non-admin users can only see their own leads
    if (session.user.role !== 'ADMIN') {
      whereClause.assignedUser = { id: session.user.id };
    }
    
    // Fetch leads with activity data
    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        Stage: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ownedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Fetch agent stats
    const agents = await prisma.user.findMany({
      where: session.user.role === 'ADMIN' 
        ? {} // Admins can see all agents
        : { id: session.user.id }, // Non-admins only see themselves
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    // Calculate agent statistics
    const agentStats = await Promise.all(agents.map(async (agent: { id: string; name: string | null; email: string }) => {
      // Count leads assigned to this agent
      const leadsCount = await prisma.lead.count({
        where: {
          assignedUser: { id: agent.id },
          ...(startDate ? { updatedAt: { gte: startDate } } : {}),
        },
      });
      
      // Count leads with dispositions
      const dispositionsCount = await prisma.lead.count({
        where: {
          assignedUser: { id: agent.id },
          lastDisposition: { not: null },
          ...(startDate ? { updatedAt: { gte: startDate } } : {}),
        },
      });
      
      // Count active leads (leads in the filtered stage)
      const activeLeadsCount = await prisma.lead.count({
        where: {
          assignedUser: { id: agent.id },
          ...(stageId ? { stageId } : {}),
          ...(disposition ? { lastDisposition: disposition } : {}),
          ...(startDate ? { updatedAt: { gte: startDate } } : {}),
        },
      });
      
      // Count scheduled tasks completed by this agent
      const scheduledTasksCompleted = await prisma.tasks.count({
        where: {
          assignedToId: agent.id,
          status: 'COMPLETED',
          ...(startDate ? { updatedAt: { gte: startDate } } : {}),
        },
      });
      
      // Count outstanding tasks for this agent
      const outstandingTasksCount = await prisma.tasks.count({
        where: {
          assignedToId: agent.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          ...(startDate ? { dueDate: { gte: startDate.toISOString() } } : {}),
        },
      });
      
      // Count notes created by this agent
      const notesCount = await prisma.note.count({
        where: {
          User: { id: agent.id },
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
        },
      });
      
      // Count actions logged by this agent
      const actionsCount = await prisma.entityHistory.count({
        where: {
          User: { id: agent.id },
          type: 'ACTION',
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
        },
      });
      
      // Count stage transitions (changes in lead stages)
      const stageTransitions = await prisma.entityHistory.count({
        where: {
          User: { id: agent.id },
          type: 'STAGE_CHANGE',
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
        },
      });
      
      return {
        id: agent.id,
        name: agent.name || agent.email,
        email: agent.email,
        leadsCount,
        dispositionsCount,
        activeLeadsCount,
        scheduledTasksCompleted,
        outstandingTasksCount,
        notesCount,
        actionsCount,
        stageTransitions,
        totalActivity: notesCount + actionsCount + stageTransitions,
      };
    }));
    
    // Sort agents by total activity
    agentStats.sort((a: any, b: any) => b.totalActivity - a.totalActivity);
    
    // Return the data
    return NextResponse.json({
      result: {
        data: leads,
        agentStats,
      }
    });
    
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}
