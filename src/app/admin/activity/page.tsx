'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format, subDays, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';

// Define types
type Lead = {
  id: string;
  schoolName?: string | null;
  name: string;
  phone: string;
  email: string;
  updatedAt: string;
  lastDisposition?: string | null;
  stage?: { id: string; name: string; color?: string } | string;
  stageId?: string;
  assignedUser?: { id: string; name?: string | null; email: string } | null;
  ownedBy?: { id: string; name?: string | null; email: string | null } | null;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  leadId?: string;
};

type User = {
  id: string;
  name?: string | null;
  email: string;
  role?: string;
};

type Stage = {
  id: string;
  name: string;
  color?: string;
};

type AgentStats = {
  id: string;
  name: string;
  email: string;
  leadsCount: number;
  dispositionsCount: number;
  stageTransitions: number;
  notesCount: number;
  actionsCount: number;
  activeLeadsCount: number;
  scheduledTasksCompleted: number;
  outstandingTasksCount: number;
};

// Create a client component that uses useSearchParams
function ActivityPageClient() {
  // State for leads, filters, and stats
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [dispositions, setDispositions] = useState<string[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [dateFilter, setDateFilter] = useState<string>(searchParams?.get('date') || 'last7days');
  const [stageFilter, setStageFilter] = useState<string>(searchParams?.get('stage') || '');
  const [dispositionFilter, setDispositionFilter] = useState<string>(searchParams?.get('disposition') || '');
  const [agentFilter, setAgentFilter] = useState<string>(searchParams?.get('agent') || '');
  
  // Date range options
  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];
  
  // Update URL with filters
  const updateUrlWithFilters = (filters: {
    date?: string;
    stage?: string;
    disposition?: string;
    agent?: string;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // Update params with new filters
    if (filters.date !== undefined) {
      if (filters.date) params.set('date', filters.date);
      else params.delete('date');
    }
    
    if (filters.stage !== undefined) {
      if (filters.stage) params.set('stage', filters.stage);
      else params.delete('stage');
    }
    
    if (filters.disposition !== undefined) {
      if (filters.disposition) params.set('disposition', filters.disposition);
      else params.delete('disposition');
    }
    
    if (filters.agent !== undefined) {
      if (filters.agent) params.set('agent', filters.agent);
      else params.delete('agent');
    }
    
    // Update URL
    const url = `${pathname}?${params.toString()}`;
    router.push(url);
  };
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setDateFilter(params.get('date') || 'last7days');
      setStageFilter(params.get('stage') || '');
      setDispositionFilter(params.get('disposition') || '');
      setAgentFilter(params.get('agent') || '');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Fetch activity data, including leads, agent stats, etc.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build query parameters for the API request
        const params = new URLSearchParams();
        if (dateFilter) params.set('date', dateFilter);
        if (stageFilter) params.set('stage', stageFilter);
        if (dispositionFilter) params.set('disposition', dispositionFilter);
        if (agentFilter) params.set('agent', agentFilter);
        
        // Fetch activity data from our new endpoint
        const response = await fetch(`/api/activity?${params.toString()}`);
        const data = await response.json();
        
        if (data.result) {
          // Set leads from the activity data
          setLeads(data.result.data || []);
          
          // Initialize agent stats with data from API
          const initialAgentStats = data.result.agentStats || [];
          
          // We still need to fetch stages and dispositions separately
          // as they're needed for the filter dropdowns
          const [stagesRes, dispositionsRes, tasksRes] = await Promise.all([
            fetch('/api/stage'),
            fetch('/api/disposition'),
            fetch(`/api/tasks?${params.toString()}`) // Fetch tasks with the same filters
          ]);
          
          const stagesData = await stagesRes.json();
          const dispositionsData = await dispositionsRes.json();
          const tasksData = await tasksRes.json();
          
          if (stagesData.result?.data) {
            setStages(stagesData.result.data);
          }
          
          if (dispositionsData.result?.data) {
            setDispositions(dispositionsData.result.data);
          }
          
          // Fetch agents for the filter dropdown
          const usersResponse = await fetch('/api/user');
          const usersData = await usersResponse.json();
          
          if (usersData.result?.data) {
            setAgents(usersData.result.data.filter((user: User) => 
              user.id && (session?.user?.role === 'ADMIN' || user.id === session?.user?.id)
            ));
          }
          
          // Calculate additional metrics for agents
          if (data.result.data && tasksData.result?.data && agents.length > 0) {
            const leads = data.result.data;
            const tasks = tasksData.result.data;
            
            // Create a map to store agent stats
            const statsMap = new Map<string, AgentStats>();
            
            // Initialize stats for each agent, preserving existing stats from API
            agents.forEach(agent => {
              // Find existing stats for this agent if available
              const existingStats = initialAgentStats.find((stat: any) => stat.id === agent.id);
              
              statsMap.set(agent.id, {
                id: agent.id,
                name: agent.name || agent.email,
                email: agent.email,
                leadsCount: existingStats?.leadsCount || 0,
                dispositionsCount: existingStats?.dispositionsCount || 0,
                stageTransitions: existingStats?.stageTransitions || 0,
                notesCount: existingStats?.notesCount || 0,
                actionsCount: existingStats?.actionsCount || 0,
                activeLeadsCount: existingStats?.activeLeadsCount || 0,
                scheduledTasksCompleted: existingStats?.scheduledTasksCompleted || 0,
                outstandingTasksCount: existingStats?.outstandingTasksCount || 0
              });
            });
            
            // Count leads assigned to each agent
            leads.forEach((lead: Lead) => {
              if (lead.assignedUser?.id) {
                const agentId = lead.assignedUser.id;
                const agentStats = statsMap.get(agentId);
                
                if (agentStats) {
                  // Increment lead count
                  agentStats.leadsCount += 1;
                  
                  // Count disposition if present
                  if (lead.lastDisposition) {
                    agentStats.dispositionsCount += 1;
                  }
                  
                  // Count active leads (leads in the filtered stage)
                  const leadStageId = typeof lead.stage === 'object' && lead.stage ? lead.stage.id : lead.stageId;
                  if ((!stageFilter || leadStageId === stageFilter) && 
                      (!dispositionFilter || lead.lastDisposition === dispositionFilter)) {
                    agentStats.activeLeadsCount += 1;
                  }
                }
              }
            });
            
            // Count tasks for each agent
            tasks.forEach((task: Task) => {
              if (task.assignedTo) {
                const agentId = task.assignedTo;
                const agentStats = statsMap.get(agentId);
                
                if (agentStats) {
                  // Count completed tasks
                  if (task.status === 'COMPLETED') {
                    agentStats.scheduledTasksCompleted += 1;
                  }
                  // Count outstanding tasks
                  else if (task.status === 'PENDING' || task.status === 'IN_PROGRESS') {
                    agentStats.outstandingTasksCount += 1;
                  }
                }
              }
            });
            
            // Convert map to array for state
            const updatedStats = Array.from(statsMap.values());
            
            // Only update if we have stats to show
            if (updatedStats.length > 0) {
              setAgentStats(updatedStats);
            } else {
              // Fallback to initial stats if our calculation produced no results
              setAgentStats(initialAgentStats);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [session, dateFilter, stageFilter, dispositionFilter, agentFilter]);
  
  // Add a safety check to ensure agent stats are displayed
  useEffect(() => {
    if (agents.length > 0 && agentStats.length === 0) {
      // If we have agents but no stats, recalculate basic stats
      const basicStats = agents.map(agent => ({
        id: agent.id,
        name: agent.name || agent.email,
        email: agent.email,
        leadsCount: 0,
        dispositionsCount: 0,
        stageTransitions: 0,
        notesCount: 0,
        actionsCount: 0,
        activeLeadsCount: 0,
        scheduledTasksCompleted: 0,
        outstandingTasksCount: 0
      }));
      
      setAgentStats(basicStats);
    }
  }, [agents, agentStats]);
  
  // Apply filters to leads
  useEffect(() => {
    if (!loading) {
      let filtered = [...leads];
      
      // Apply date filter
      if (dateFilter && dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'yesterday':
            startDate = subDays(new Date(now.setHours(0, 0, 0, 0)), 1);
            break;
          case 'last7days':
            startDate = subDays(new Date(now.setHours(0, 0, 0, 0)), 7);
            break;
          case 'last30days':
            startDate = subDays(new Date(now.setHours(0, 0, 0, 0)), 30);
            break;
          default:
            startDate = new Date(0); // Beginning of time
        }
        
        filtered = filtered.filter(lead => {
          const updatedDate = new Date(lead.updatedAt);
          return updatedDate >= startDate;
        });
      }
      
      // Apply stage filter
      if (stageFilter) {
        filtered = filtered.filter(lead => {
          const stageId = typeof lead.stage === 'object' && lead.stage ? lead.stage.id : lead.stageId;
          return stageId === stageFilter;
        });
      }
      
      // Apply disposition filter
      if (dispositionFilter) {
        filtered = filtered.filter(lead => lead.lastDisposition === dispositionFilter);
      }
      
      // Apply agent filter
      if (agentFilter) {
        filtered = filtered.filter(lead => lead.assignedUser?.id === agentFilter);
      }
      
      // Sort by most recently updated
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setFilteredLeads(filtered);
    }
  }, [leads, dateFilter, stageFilter, dispositionFilter, agentFilter, loading]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get stage name from ID
  const getStageName = (lead: Lead) => {
    if (typeof lead.stage === 'object' && lead.stage) {
      return lead.stage.name;
    } else if (lead.stageId) {
      const stage = stages.find(s => s.id === lead.stageId);
      return stage ? stage.name : 'Unknown';
    }
    return 'Not Set';
  };
  
  // Get stage color from ID
  const getStageColor = (lead: Lead) => {
    if (typeof lead.stage === 'object' && lead.stage && lead.stage.color) {
      return lead.stage.color;
    } else if (lead.stageId) {
      const stage = stages.find(s => s.id === lead.stageId);
      return stage?.color || '#CBD5E0';
    }
    return '#CBD5E0'; // Default gray
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Lead Activity Tracker</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block mb-1 text-sm font-medium">Date Range:</label>
            <select 
              className="w-full p-2 border rounded"
              value={dateFilter} 
              onChange={(e) => {
                setDateFilter(e.target.value);
                updateUrlWithFilters({ date: e.target.value });
              }}
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          
          {/* Stage Filter */}
          <div>
            <label className="block mb-1 text-sm font-medium">By Stage:</label>
            <select 
              className="w-full p-2 border rounded"
              value={stageFilter} 
              onChange={(e) => {
                setStageFilter(e.target.value);
                updateUrlWithFilters({ stage: e.target.value });
              }}
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>
          
          {/* Disposition Filter */}
          <div>
            <label className="block mb-1 text-sm font-medium">By Disposition:</label>
            <select 
              className="w-full p-2 border rounded"
              value={dispositionFilter} 
              onChange={(e) => {
                setDispositionFilter(e.target.value);
                updateUrlWithFilters({ disposition: e.target.value });
              }}
            >
              <option value="">All Dispositions</option>
              {dispositions.map(disposition => (
                <option key={disposition} value={disposition}>{disposition}</option>
              ))}
            </select>
          </div>
          
          {/* Agent Filter */}
          <div>
            <label className="block mb-1 text-sm font-medium">By Agent:</label>
            <select 
              className="w-full p-2 border rounded"
              value={agentFilter} 
              onChange={(e) => {
                setAgentFilter(e.target.value);
                updateUrlWithFilters({ agent: e.target.value });
              }}
            >
              <option value="">All Agents</option>
              {agents.filter(agent => agent.id && (agent.role === 'AGENT' || !agent.role)).map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name || agent.email}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Agent Performance Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Agent Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentStats
            .filter(agent => {
              // Only show agents with AGENT role (exclude admin and content admin)
              const agentUser = agents.find(user => user.id === agent.id);
              return agentUser && (agentUser.role === 'AGENT' || !agentUser.role || agentUser.role !== 'ADMIN' && agentUser.role !== 'CONTENT_ADMIN');
            })
            .map(agent => (
            <div key={agent.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-lg">{agent.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{agent.email}</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Leads</p>
                  <p className="text-xl font-bold">{agent.leadsCount}</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Active Leads</p>
                  <p className="text-xl font-bold">{agent.activeLeadsCount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Tasks Completed</p>
                  <p className="text-xl font-bold">{agent.scheduledTasksCompleted}</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Outstanding Tasks</p>
                  <p className="text-xl font-bold">{agent.outstandingTasksCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Lead Activity Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">Lead Activity ({filteredLeads.length})</h2>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading activity data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No lead activity found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Lead</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Stage</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Last Disposition</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Assigned Agent</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.schoolName || 'No School'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getStageColor(lead) }}
                        ></div>
                        <span>{getStageName(lead)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.lastDisposition || 'None'}
                    </td>
                    <td className="px-4 py-3">
                      {lead.assignedUser ? (
                        <div>
                          <p>{lead.assignedUser.name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-500">{lead.assignedUser.email}</p>
                        </div>
                      ) : 'Unassigned'}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(lead.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the component wrapped in Suspense to fix the useSearchParams error
export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading activity page...</div>}>
      <ActivityPageClient />
    </Suspense>
  );
}
