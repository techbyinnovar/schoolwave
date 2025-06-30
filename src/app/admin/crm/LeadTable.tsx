"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lead } from "./page";

interface LeadTableProps {
  leads: Lead[];
  agents: { id: string; name?: string; email: string }[];
  stages: { id: string; name: string }[];
  userRole: string | undefined;
  onSelectLead?: (id: string) => void;
  dispositions?: string[];
  leadTasks?: { leadId: string; dueDate: string; status: string }[];
}

export default function LeadTable({ leads, agents, stages, userRole, onSelectLead, dispositions = [], leadTasks = [] }: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter state - initialize from URL params
  const [search, setSearch] = useState(searchParams?.get('search') || "");
  const [ownerFilter, setOwnerFilter] = useState<string>(searchParams?.get('owner') || "");
  const [assignedFilter, setAssignedFilter] = useState<string>(searchParams?.get('assigned') || "");
  const [stageFilter, setStageFilter] = useState<string>(searchParams?.get('stage') || "");
  const [dispositionFilter, setDispositionFilter] = useState<string>(searchParams?.get('disposition') || "");
  const [tasksDueFilter, setTasksDueFilter] = useState<string>(
    searchParams?.get('dueToday') === 'true' ? 'today' : 
    searchParams?.get('dueWeek') === 'true' ? 'this-week' : ""
  );
  
  // Function to update URL with current filters
  const updateUrlWithFilters = useCallback(() => {
    // Start with a new URLSearchParams object
    const params = new URLSearchParams(window.location.search);
    
    // Update params based on current filter states
    if (search) params.set('search', search);
    else params.delete('search');
    
    if (ownerFilter) params.set('owner', ownerFilter);
    else params.delete('owner');
    
    if (assignedFilter) params.set('assigned', assignedFilter);
    else params.delete('assigned');
    
    if (stageFilter) params.set('stage', stageFilter);
    else params.delete('stage');
    
    if (dispositionFilter) params.set('disposition', dispositionFilter);
    else params.delete('disposition');
    
    if (tasksDueFilter === 'today') params.set('dueToday', 'true');
    else params.delete('dueToday');
    
    if (tasksDueFilter === 'this-week') params.set('dueWeek', 'true');
    else params.delete('dueWeek');
    
    // Create the URL string
    const queryString = params.toString();
    const pathname = window.location.pathname;
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Log for debugging
    console.log('Updating URL to:', url);
    
    // Update URL using the history API (client-side navigation)
    try {
      // Use Next.js router to update URL without page reload
      router.push(url, { scroll: false });
    } catch (e) {
      console.error('router.push failed:', e);
      try {
        // Fall back to browser history API
        window.history.pushState({}, '', url);
      } catch (e) {
        console.error('history.pushState failed:', e);
      }
    }
  }, [search, ownerFilter, assignedFilter, stageFilter, dispositionFilter, tasksDueFilter, router]);
  
  // Update URL whenever filters change
  useEffect(() => {
    updateUrlWithFilters();
  }, [search, ownerFilter, assignedFilter, stageFilter, dispositionFilter, tasksDueFilter, updateUrlWithFilters]);
  
  // Handle URL changes (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || "");
      setOwnerFilter(params.get('owner') || "");
      setAssignedFilter(params.get('assigned') || "");
      setStageFilter(params.get('stage') || "");
      setDispositionFilter(params.get('disposition') || "");
      
      if (params.get('dueToday') === 'true') {
        setTasksDueFilter('today');
      } else if (params.get('dueWeek') === 'true') {
        setTasksDueFilter('this-week');
      } else {
        setTasksDueFilter('');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper function to check if a date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Helper function to check if a date is within this week
  const isThisWeek = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Get lead tasks organized by lead ID
  const leadTasksMap = useMemo(() => {
    const taskMap: Record<string, { leadId: string; dueDate: string; status: string }[]> = {};
    for (const task of leadTasks) {
      if (!taskMap[task.leadId]) {
        taskMap[task.leadId] = [];
      }
      taskMap[task.leadId].push(task);
    }
    return taskMap;
  }, [leadTasks]);

  // Filtering logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search.trim() === "" ||
        [lead.schoolName, lead.name, lead.phone, lead.email, lead.address]
          .filter(Boolean)
          .some((val) => val && val.toLowerCase().includes(search.toLowerCase()));
      const matchesOwner =
        !ownerFilter || lead.ownedById === ownerFilter;
      const matchesAssigned =
        !assignedFilter || lead.assignedTo === assignedFilter;
      const matchesStage =
        !stageFilter || (typeof lead.stage === "object" ? lead.stage?.name === stageFilter : lead.stage === stageFilter);
      
      // Last disposition filter
      const matchesDisposition = !dispositionFilter || (
        // Note: In real implementation, we'd need to fetch lead history with dispositions
        // This is a placeholder for the actual implementation
        lead.lastDisposition === dispositionFilter
      );

      // Task due filters
      const leadTasksList = leadTasksMap[lead.id] || [];
      const activeTasksList = leadTasksList.filter(task => task.status !== 'completed');
      
      let matchesTasksDue = true;
      if (tasksDueFilter === 'today') {
        matchesTasksDue = activeTasksList.some(task => isToday(task.dueDate));
      } else if (tasksDueFilter === 'this-week') {
        matchesTasksDue = activeTasksList.some(task => isThisWeek(task.dueDate));
      }

      return matchesSearch && matchesOwner && matchesAssigned && matchesStage && 
             matchesDisposition && matchesTasksDue;
    });
  }, [leads, search, ownerFilter, assignedFilter, stageFilter, dispositionFilter, tasksDueFilter, leadTasksMap]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search leads..."
          className="border rounded px-3 py-2 flex-1 min-w-[180px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
        >
          <option value="">All Owners</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={assignedFilter}
          onChange={e => setAssignedFilter(e.target.value)}
        >
          <option value="">All Assigned</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
        >
          <option value="">All Stages</option>
          {stages.map(stage => (
            <option key={stage.id} value={stage.name}>{stage.name}</option>
          ))}
        </select>
        {/* Disposition filter */}
        <select
          className="border rounded px-3 py-2"
          value={dispositionFilter}
          onChange={e => setDispositionFilter(e.target.value)}
        >
          <option value="">All Dispositions</option>
          {dispositions.map(disp => (
            <option key={disp} value={disp}>{disp}</option>
          ))}
        </select>
        {/* Tasks due filter */}
        <select
          className="border rounded px-3 py-2"
          value={tasksDueFilter}
          onChange={e => setTasksDueFilter(e.target.value)}
        >
          <option value="">All Tasks</option>
          <option value="today">Tasks Due Today</option>
          <option value="this-week">Tasks Due This Week</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">School Name</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Stage</th>
              <th className="px-4 py-2 text-left">Owner</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Demo Code</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">No leads found.</td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors cursor-pointer group"
                  onClick={e => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    if (onSelectLead) {
                      onSelectLead(lead.id);
                    } else {
                      router.push(`/admin/crm/lead/${lead.id}`);
                    }
                  }}
                >
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.schoolName}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.name}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.phone}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.email}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.address}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{typeof lead.stage === "object" ? lead.stage?.name : lead.stage}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.ownedBy ? (lead.ownedBy.name || lead.ownedBy.email) : <span className="italic text-gray-400">Unassigned</span>}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.agent ? (lead.agent.name || lead.agent.email) : <span className="italic text-gray-400">Unassigned</span>}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.demoCode ?? <span className="italic text-gray-400">N/A</span>}</td>
                  <td className="border px-4 py-2 whitespace-nowrap space-x-2">
                    <button className="text-blue-600 hover:underline" onClick={()=>router.push(`/tasks/new?subjectType=LEAD&subjectIds=${lead.id}`)}>Add Task</button>
                    <button 
                      className="text-blue-600 hover:underline" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click handler from firing
                        router.push(`/admin/crm/lead/${lead.id}/edit`);
                      }}
                    >
                      Edit
                    </button>
                    {userRole !== "AGENT" && (
                      <button className="text-red-600 hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
