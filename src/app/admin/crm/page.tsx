"use client";
import { useState, useEffect, useMemo, useCallback, FormEvent, ReactNode, Suspense } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdminSidebar from '@/components/AdminSidebar';
import { useSession } from "next-auth/react";
import LeadTable from './LeadTable';
import LeadDetailContent from '@/components/admin/LeadDetailContent';
import LeadStatsSummary from './LeadStatsSummary';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';



// Define the Lead type
export type Lead = {
  id: string;
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  demoCode?: string | null;
  assignedTo?: string | null;
  agent?: { id: string; name?: string | null; email: string } | null;
  ownedById?: string | null;
  ownedBy?: { id: string; name?: string | null; email: string | null } | null;
  stage?: string | { id: string; name: string };
  stageId?: string; // Added stageId property
  lastDisposition?: string | null;
};

export type LeadTask = {
  id: string;
  leadId: string;
  title: string;
  dueDate: string;
  status: string;
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  full?: boolean; // if true, modal takes full viewport
};

function Modal({ open, onClose, children, full }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      {full ? (
        <div className="bg-white w-[80%] h-[80%] relative rounded shadow-lg overflow-y-auto">
          <button
            className="absolute top-3 right-4 z-10 text-gray-600 hover:text-gray-800 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >&times;</button>
          {children}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >&#10005;</button>
          {children}
        </div>
      )}
    </div>
  );
}

// Wrapper component that provides the Suspense boundary
export default function AdminCrmPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading lead management...</div>}>
      <AdminCrmPageInner />
    </Suspense>
  );
}

function AdminCrmPageInner() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  
  // State for lead modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Initialize tab state from URL or default to 'leads'
  const initialTab = searchParams?.get('view') as 'leads' | 'stages' || 'leads';
  const [tab, setTab] = useState<'leads' | 'stages'>(initialTab);
  const [leads, setLeads] = useState<Lead[]>([]);


  
  // Handle URL changes
  useEffect(() => {
    const handlePopState = () => {
      // Update filter states from current URL parameters
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || "");
      setOwnerFilter(params.get('owner') || "");
      setAssignedFilter(params.get('assigned') || "");
      setStageFilter(params.get('stage') || "");
      setDispositionFilter(params.get('disposition') || "");
      setDueTodayFilter(params.get('dueToday') === 'true');
      setDueWeekFilter(params.get('dueWeek') === 'true');
      
      // Update tab state from URL
      const viewParam = params.get('view') as 'leads' | 'stages';
      if (viewParam && (viewParam === 'leads' || viewParam === 'stages')) {
        setTab(viewParam);
      }
      
      // Check for lead parameter
      const leadId = params.get('lead');
      if (leadId) {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          setSelectedLead(lead);
          setShowLeadModal(true);
        }
      } else {
        setShowLeadModal(false);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [leads]);
  
  // Debug logging for current URL
  useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('Current search params:', window.location.search);
    
    // Check for lead parameter in URL on initial load
    const leadId = searchParams.get('lead');
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setSelectedLead(lead);
        setShowLeadModal(true);
      }
    }
  }, [searchParams, leads]);

  // Log ownedBy details for debugging
  useEffect(() => {
    if (leads && leads.length > 0) {
      leads.forEach((lead) => {
        console.log(`[LEAD DEBUG] Lead: ${lead.id}, ownedBy:`, lead.ownedBy);
      });
    }
  }, [leads]);

  const [agents, setAgents] = useState<{ id: string; name?: string; email: string }[]>([]);
  // Initialize filter state from URL params
  const [search, setSearch] = useState(searchParams?.get('search') || "");
  const [ownerFilter, setOwnerFilter] = useState<string>(searchParams?.get('owner') || "");
  const [assignedFilter, setAssignedFilter] = useState<string>(searchParams?.get('assigned') || "");
  const [stageFilter, setStageFilter] = useState<string>(searchParams?.get('stage') || "");
  const [dispositionFilter, setDispositionFilter] = useState<string>(searchParams?.get('disposition') || "");
  const [dueTodayFilter, setDueTodayFilter] = useState<boolean>(searchParams?.get('dueToday') === 'true');
  const [dueWeekFilter, setDueWeekFilter] = useState<boolean>(searchParams?.get('dueWeek') === 'true');
  const [dispositions, setDispositions] = useState<string[]>([]);
  const [leadTasks, setLeadTasks] = useState<LeadTask[]>([]);
  const [leadsWithLastDisposition, setLeadsWithLastDisposition] = useState<Record<string, string>>({});
  
  // Create a function to generate a URL with current filters
  const getFilterUrl = useCallback((options: {
    search?: string;
    owner?: string;
    assigned?: string;
    stage?: string;
    disposition?: string;
    dueTodayFilter?: boolean;
    dueWeekFilter?: boolean;
    leadId?: string;
  }) => {
    // Start with base URL
    const baseUrl = '/admin/crm';
    const params = new URLSearchParams();
    
    // Add current search param if present
    if (options.search) params.set('search', options.search);
    
    // Add owner filter if present
    if (options.owner) params.set('owner', options.owner);
    
    // Add assigned filter if present
    if (options.assigned) params.set('assigned', options.assigned);
    
    // Add stage filter if present
    if (options.stage) params.set('stage', options.stage);
    
    // Add disposition filter if present
    if (options.disposition) params.set('disposition', options.disposition);
    
    // Add due today filter if true
    if (options.dueTodayFilter) params.set('dueToday', 'true');
    
    // Add due week filter if true
    if (options.dueWeekFilter) params.set('dueWeek', 'true');
    
    // Add lead ID if present
    if (options.leadId) params.set('lead', options.leadId);
    
    // Return full URL with query string
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, []);
  // Add updateUrlWithFilters function
  const updateUrlWithFilters = (filters: {
    search?: string;
    owner?: string;
    assigned?: string;
    stage?: string;
    disposition?: string;
    dueTodayFilter?: boolean;
    dueWeekFilter?: boolean;
  }) => {
    // Start with a new URLSearchParams object
    const params = new URLSearchParams(window.location.search);
    
    // Update params based on provided filters
    if (filters.search !== undefined) {
      if (filters.search) params.set('search', filters.search);
      else params.delete('search');
    }
    
    if (filters.owner !== undefined) {
      if (filters.owner) params.set('owner', filters.owner);
      else params.delete('owner');
    }
    
    if (filters.assigned !== undefined) {
      if (filters.assigned) params.set('assigned', filters.assigned);
      else params.delete('assigned');
    }
    
    if (filters.stage !== undefined) {
      if (filters.stage) params.set('stage', filters.stage);
      else params.delete('stage');
    }
    
    if (filters.disposition !== undefined) {
      if (filters.disposition) params.set('disposition', filters.disposition);
      else params.delete('disposition');
    }
    
    if (filters.dueTodayFilter !== undefined) {
      if (filters.dueTodayFilter) params.set('dueToday', 'true');
      else params.delete('dueToday');
    }
    
    if (filters.dueWeekFilter !== undefined) {
      if (filters.dueWeekFilter) params.set('dueWeek', 'true');
      else params.delete('dueWeek');
    }
    
    // Create the URL string
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Log for debugging
    console.log('Updating URL to:', url);
    
    // Update URL using the history API (client-side navigation)
    window.history.pushState({}, '', url);
  };
  
  const [form, setForm] = useState<Omit<Lead, "id">>({
    schoolName: "", // optional
    name: "",
    phone: "",
    email: "",
    address: "",
    assignedTo: null,
    ownedById: null,
    stage: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // if selectedLeadId is set, modalOpen will show LeadDetailModal; otherwise it shows create/edit form
  
  const initialLeadParam = searchParams?.get('lead') || null;
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadParam);
  const [leadDetailLoading, setLeadDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stages, setStages] = useState<{ id: string; name: string; order: number; color?: string }[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [assignAgentId, setAssignAgentId] = useState<string>("");

  // Define a LeadColumnKey union type for visibleColumns keys
  type LeadColumnKey = 'schoolName' | 'name' | 'phone' | 'email' | 'address' | 'stage' | 'agent' | 'demoCode' | 'actions';

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<LeadColumnKey, boolean>>({
    schoolName: true,
    name: true,
    phone: true,
    email: true,
    address: true,
    stage: true,
    agent: true,
    demoCode: true, // Added demoCode, defaulting to visible
    actions: true,
  });

  // Only show leads owned by or assigned to agent, otherwise show all
  const visibleLeads = useMemo(() => {
    if (userRole === "AGENT" && userId) {
      return leads.filter(lead => lead.assignedTo === userId || lead.ownedById === userId);
    }
    return leads;
  }, [leads, userRole, userId]);

  // Kanban column (stage) visibility state
  const [visibleStages, setVisibleStages] = useState<Record<string, boolean>>({});
  useEffect(() => {
    // Initialize all stages as visible when stages change
    if (stages.length) {
      setVisibleStages(prev => {
        const newState: Record<string, boolean> = { ...prev };
        stages.forEach(s => {
          if (!(s.id in newState)) newState[s.id] = true;
        });
        // Remove any that are no longer present
        Object.keys(newState).forEach(id => {
          if (!stages.find(s => s.id === id)) delete newState[id];
        });
        return newState;
      });
    }
  }, [stages]);

  // Stage CRUD modal state
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<{ id?: string; name: string; color?: string; defaultTemplateId?: string }>({ name: "" });
  const [stageFormError, setStageFormError] = useState("");
  // Message templates for default template selection
  const [messageTemplates, setMessageTemplates] = useState<{ id: string; name: string }[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Kanban state for leads by stage
  const [kanbanLeads, setKanbanLeads] = useState<Record<string, Lead[]>>({});

  // Handle bulk assignment of leads to an agent
  const handleBulkAssign = async (leadIds: string[], agentId: string) => {
    console.log('Page component: handleBulkAssign called with:', { leadIds, agentId });
    
    try {
      // Find agent details for logging
      const agent = agents.find(a => a.id === agentId);
      console.log('Assigning to agent:', agent);
      
      console.log('Sending bulk assignment request to API...');
      const response = await fetch('/api/lead/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadIds, agentId }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API returned error:', errorData);
        throw new Error(errorData.error || 'Failed to assign leads');
      }

      const result = await response.json();
      console.log('Bulk assignment API result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Assignment failed on server');
      }
      
      // Update leads in state to reflect the new assignments
      console.log('Updating local state with new assignments');
      setLeads(prevLeads => {
        const updatedLeads = prevLeads.map(lead => 
          leadIds.includes(lead.id) 
            ? { ...lead, assignedTo: agentId, agent: agents.find(a => a.id === agentId) } 
            : lead
        );
        console.log('State updated, sample lead:', updatedLeads.find(l => leadIds.includes(l.id)));
        return updatedLeads;
      });

      // Show success message
      const message = `Successfully assigned ${result.updatedLeads} leads to agent`;
      console.log(message);
      alert(message);
      
      // Return the result for the UI component to handle
      return result;
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      alert(`Failed to assign leads: ${(error as Error).message}`);
      throw error;
    }
  };

  // Helper to get stage name by lead.stage
  const getStageName = (stageValue: string | { name: string } | undefined): string => {
    if (!stageValue) return '';
    if (typeof stageValue === 'object' && stageValue !== null) {
      // Defensive: if stageValue is an object, try to get its name
      return (stageValue as any).name || '[Invalid Stage]';
    }
    return String(stageValue);
  };

  // Handler when a lead row is clicked
  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
    router.push(`?lead=${id}`, { scroll: false });
  };

  // Fetch the selected lead whenever selectedLeadId changes
  useEffect(() => {
    if (!selectedLeadId) return;
    setLeadDetailLoading(true);
    fetch(`/api/lead/${selectedLeadId}`)
      .then(res => res.json())
      .then(data => setSelectedLead(data.result?.data ?? null))
      .catch(() => setSelectedLead(null))
      .finally(() => setLeadDetailLoading(false));
  }, [selectedLeadId]);

  // Fetch leads, agents, and stages
  useEffect(() => {
    // Fetch leads
    fetch("/api/lead")
      .then(res => res.json())
      .then(data => {
        // Map the Stage property to stage for consistency with the Lead type
        // Also map assignedUser to agent for display in the UI
        const fetchedLeads = (data.result?.data ?? []).map((lead: any) => ({
          ...lead,
          // Map Stage to stage for consistency
          stage: lead.Stage || lead.stage,
          // Map assignedUser to agent for display in the UI
          agent: lead.assignedUser || null,
          // Remove the original properties to avoid confusion
          Stage: undefined,
          assignedUser: undefined
        }));
        console.log('Mapped leads with stage and agent:', fetchedLeads);
        setLeads(fetchedLeads);
        
        // For each lead, fetch its last disposition from history
        const leadIds = fetchedLeads.map((lead: Lead) => lead.id);
        fetchLeadsLastDispositions(leadIds);
      });
      
    // Fetch agents
    fetch("/api/user?role=AGENT")
      .then(res => res.json())
      .then(data => setAgents(data.result?.data ?? []));
      
    // Fetch stages
    fetch("/api/stage")
      .then(res => res.json())
      .then(data => setStages(data.result?.data ?? []));
      
    // Fetch message templates
    setTemplateLoading(true);
    fetch("/api/message-template")
      .then(res => res.json())
      .then(data => setMessageTemplates(data.result?.data ?? []))
      .finally(() => setTemplateLoading(false));
      
    // Fetch available dispositions
    fetch("/api/disposition")
      .then(res => res.json())
      .then(data => setDispositions(data.result?.data ?? []));
      
    // Fetch all tasks
    fetchAllLeadTasks();
  }, []);
  
  // Helper function to fetch the last disposition for each lead
  const fetchLeadsLastDispositions = async (leadIds: string[]) => {
    // This would be replaced with an actual API call to get last dispositions
    // For now, we'll just simulate this with placeholder data
    const dispositionsMap: Record<string, string> = {};
    
    // In a real implementation, you would fetch the actual last dispositions from your API
    // Something like:
    // const promises = leadIds.map(id => fetch(`/api/lead/${id}/history?type=action&limit=1`).then(r => r.json()));
    // const results = await Promise.all(promises);
    // results.forEach((result, index) => {
    //   const lastAction = result.result?.data[0];
    //   if (lastAction && lastAction.disposition) {
    //     dispositionsMap[leadIds[index]] = lastAction.disposition;
    //   }
    // });
    
    setLeadsWithLastDisposition(dispositionsMap);
  };
  
  // Helper function to fetch tasks for all leads
  const fetchAllLeadTasks = () => {
    fetch('/api/tasks?type=LEAD')
      .then(res => res.json())
      .then(data => {
        setLeadTasks(data.tasks || []);
      });
  };

  // Populate Kanban leads when leads or stages change
  useEffect(() => {
    if (!stages.length) return;
    const grouped: Record<string, Lead[]> = {};
    stages.forEach(stage => {
      grouped[stage.id] = [];
    });
    visibleLeads.forEach(lead => {
      // Get the stage ID from the lead
      const stageId = typeof lead.stage === 'object' && lead.stage ? lead.stage.id : lead.stageId;
      // If we have a valid stage ID and it exists in our grouped object
      if (stageId && grouped[stageId]) {
        grouped[stageId].push(lead);
      } else {
        // Fallback to the first stage if no valid stage is found
        if (stages.length > 0) {
          grouped[stages[0].id].push(lead);
        }
      }
    });
    setKanbanLeads(grouped);
  }, [visibleLeads, stages]);

  // Handle create/update lead
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Find the selected stageId from the fetched stages
      let stageId = undefined;
      if (Array.isArray(stages) && stages.length > 0) {
        const found = stages.find((s) => s.name === form.stage);
        stageId = found ? found.id : undefined;
      }
      if (!stageId) {
        setError('Stage is required and must be selected.');
        setLoading(false);
        return;
      }
      let res;
      if (editId) {
        // Update existing lead
        const payload = { ...form, id: editId, stageId };
        res = await fetch(`/api/lead`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new lead
        let payload = { ...form, stageId };
        if (userRole === "AGENT" && userId) {
          payload.ownedById = userId;
          payload.assignedTo = userId;
        }
        res = await fetch(`/api/lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("Failed to save lead");
      setForm({ schoolName: "", name: "", phone: "", email: "", address: "", assignedTo: null, ownedById: null, stage: stages[0]?.name ?? "" });
      setEditId(null);
      setModalOpen(false);
      // Refresh leads
      fetch("/api/lead")
        .then(res => res.json())
        .then(data => setLeads(data.result?.data ?? []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (lead: Lead) => {
    setEditId(lead.id);
    setForm({
      schoolName: lead.schoolName,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      assignedTo: lead.assignedTo ?? null,
      stage: lead.stage ? getStageName(lead.stage) : "",
    });
    setModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    setLoading(true);
    await fetch(`/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id),
    });
    // Refresh leads
    fetch("/api/lead")
      .then(res => res.json())
      .then(data => setLeads(data.result?.data ?? []));
    setLoading(false);
  };

  // Open modal for new lead
  const openCreateModal = () => {
    setEditId(null);
    if (userRole === "AGENT" && userId) {
      setForm({
        schoolName: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        assignedTo: userId,
        ownedById: userId,
        stage: stages[0]?.name ?? ""
      });
    } else {
      setForm({
        schoolName: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        assignedTo: null,
        ownedById: null,
        stage: stages[0]?.name ?? ""
      });
    }
    setModalOpen(true);
  };

  // Filter leads  // Search filter (use visibleLeads as base)
  const filteredLeads = useMemo(() => {
    // Start with base leads (for role restrictions)
    let filtered = visibleLeads;
    
    // Apply search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.schoolName ?? '').toLowerCase().includes(q) ||
          (l.name ?? '').toLowerCase().includes(q) ||
          (l.phone ?? '').toLowerCase().includes(q) ||
          (l.email ?? '').toLowerCase().includes(q) ||
          (l.address ?? '').toLowerCase().includes(q)
      );
    }
    
    // Apply owner filter
    if (ownerFilter) {
      filtered = filtered.filter(lead => lead.ownedById === ownerFilter);
    }
    
    // Apply assigned filter
    if (assignedFilter) {
      filtered = filtered.filter(lead => lead.assignedTo === assignedFilter);
    }
    
    // Apply stage filter
    if (stageFilter) {
      filtered = filtered.filter(lead => {
        const stageName = getStageName(lead.stage);
        return stageName === stageFilter;
      });
    }
    
    // Apply disposition filter
    if (dispositionFilter) {
      filtered = filtered.filter(lead => 
        leadsWithLastDisposition[lead.id] === dispositionFilter
      );
    }
    
    // Apply due today filter
    if (dueTodayFilter) {
      const todayTasks = leadTasks.filter(task => {
        // Check if task is due today and not completed
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        return task.status !== 'completed' && 
          taskDate.getDate() === today.getDate() && 
          taskDate.getMonth() === today.getMonth() && 
          taskDate.getFullYear() === today.getFullYear();
      });
      const leadsWithTasksDueToday = new Set(todayTasks.map(task => task.leadId));
      filtered = filtered.filter(lead => leadsWithTasksDueToday.has(lead.id));
    }
    
    // Apply due this week filter
    if (dueWeekFilter) {
      const weekTasks = leadTasks.filter(task => {
        // Check if task is due this week and not completed
        if (task.status === 'completed') return false;
        
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      });
      const leadsWithTasksDueThisWeek = new Set(weekTasks.map(task => task.leadId));
      filtered = filtered.filter(lead => leadsWithTasksDueThisWeek.has(lead.id));
    }
    
    return filtered;
  }, [search, visibleLeads, ownerFilter, assignedFilter, stageFilter, dispositionFilter, dueTodayFilter, dueWeekFilter, leadTasks, leadsWithLastDisposition]);

  // Kanban drag handler
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    // Find the stageId for the destination stage
    const destStageObj = stages.find(s => s.name === destStage);
    if (!destStageObj) return;
    // Optimistic UI update
    const updatedKanban = { ...kanbanLeads };
    updatedKanban[sourceStage] = [...updatedKanban[sourceStage]];
    updatedKanban[destStage] = [...updatedKanban[destStage]];
    const [removed] = updatedKanban[sourceStage].splice(source.index, 1);
    if (removed) {
      removed.stage = { id: destStageObj.id, name: destStageObj.name }; // ensure UI reflects new stage
      updatedKanban[destStage].splice(destination.index, 0, removed);
      setKanbanLeads(updatedKanban);
    }
    setLoading(true);
    try {
      // Persist stage change to backend using PATCH with id and stageId
      await fetch("/api/lead", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggableId, stageId: destStageObj.id }),
      });
      // Always refresh leads from backend after move
      fetch("/api/lead")
        .then(res => res.json())
        .then(data => setLeads(data.result?.data ?? []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };


  // Bulk assign UI handler
  const handleBulkAssignUI = async (leadIds: string[], agentId: string) => {
    if (!agentId || agentId.trim() === "") {
      setError("Please select an agent to assign leads to");
      console.log('Bulk assign validation failed: Missing agent ID', { agentId });
      return;
    }
    
    if (leadIds.length === 0) {
      setError("Please select at least one lead to assign");
      console.log('Bulk assign validation failed: No leads selected', { selectedLeadsCount: leadIds.length });
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      console.log('Sending bulk assignment request to /api/lead/bulk-assign', { 
        leadIds, 
        agentId 
      });
      
      const res = await fetch("/api/lead/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds,
          agentId,
          leadCount: leadIds.length
        }),
      });
      
      console.log('Bulk assignment response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Bulk assignment API error:', errorData);
        throw new Error(errorData.error || "Failed to assign leads");
      }
      
      const result = await res.json();
      console.log('Bulk assignment result:', result);
      
      setSelectedLeads([]);
      setAssignAgentId("");
      
      // Refresh leads
      console.log('Refreshing leads after assignment');
      fetch("/api/lead")
        .then(res => res.json())
        .then(data => {
          console.log('Refreshed leads data:', data);
          setLeads(data.result?.data ?? []);
        });
        
      // Show success message with verification details
      if (result.verificationResults) {
        const { totalVerified, correctlyAssigned, incorrectlyAssigned } = result.verificationResults;
        if (incorrectlyAssigned > 0) {
          alert(`Assignment partially successful: ${correctlyAssigned} of ${totalVerified} leads were assigned correctly.`);
        } else {
          alert(`Successfully assigned ${correctlyAssigned} leads to agent.`);
        }
      }
    } catch (err: unknown) {
      console.error('Error in bulk assignment:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  // Stage CRUD handlers
  const openNewStageModal = () => {
    setEditingStage({ name: "", defaultTemplateId: undefined });
    setStageModalOpen(true);
    setStageFormError("");
  };
  const openEditStageModal = (stage: { id: string; name: string; color?: string; defaultTemplateId?: string }) => {
    setEditingStage({ ...stage });
    setStageModalOpen(true);
    setStageFormError("");
  };
  const handleStageSave = async () => {
    if (!editingStage.name.trim()) {
      setStageFormError("Stage name is required");
      return;
    }
    setLoading(true);
    try {
      const url = "/api/stage";
      // Only send fields that are present
      const payload = {
        ...editingStage,
        defaultTemplateId: editingStage.defaultTemplateId || null,
      };
      const res = await fetch(url, {
        method: editingStage.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save stage");
      setStageModalOpen(false);
      setEditingStage({ name: "" });
      // Refresh stages
      fetch("/api/stage")
        .then(res => res.json())
        .then(data => setStages(data.result?.data ?? []));
    } catch (err: unknown) {
      setStageFormError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };
  // Modal state for stage deletion
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [reassignToId, setReassignToId] = useState<string>("");
  const [deleteStageError, setDeleteStageError] = useState<string | null>(null);
  const [deleteStageLoading, setDeleteStageLoading] = useState(false);

  const handleStageDelete = async () => {
    if (!deleteStageId || !reassignToId) return;
    setDeleteStageLoading(true);
    setDeleteStageError(null);
    try {
      const res = await fetch("/api/stage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteStageId, reassignToId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete stage");
      setDeleteStageId(null);
      setReassignToId("");
      // Refresh stages
      fetch("/api/stage")
        .then(res => res.json())
        .then(data => setStages(data.result?.data ?? []));
    } catch (err: any) {
      setDeleteStageError(err.message || String(err));
    }
    setDeleteStageLoading(false);
  };

  // Add at the top, after useState declarations
  const [signupStageId, setSignupStageId] = useState<string>("");

  // Fetch stages and set default signup stage
  useEffect(() => {
    fetch("/api/stage")
      .then(res => res.json())
      .then(data => {
        setStages(data.result?.data ?? []);
      });
    // Fetch signup_stage_id from settings
    fetch("/api/action?input=signup_stage_id")
      .then(res => res.json())
      .then(val => {
        if (val.result?.data) setSignupStageId(val.result.data);
      });
  }, []);

  // Add state for signup stage save feedback
  const [signupStageSaveLoading, setSignupStageSaveLoading] = useState(false);
  const [signupStageSaveSuccess, setSignupStageSaveSuccess] = useState(false);
  const [signupStageSaveError, setSignupStageSaveError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-blue-700">Lead Management</h1>
          <div className="flex gap-4 mb-6">
            <button 
              className={`px-4 py-2 rounded font-semibold ${tab === 'leads' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} 
              onClick={() => {
                setTab('leads');
                // Update URL to reflect tab change
                const params = new URLSearchParams(window.location.search);
                params.set('view', 'leads');
                const url = `${pathname}?${params.toString()}`;
                window.history.pushState({}, '', url);
              }}
            >
              Leads Table
            </button>
            <button 
              className={`px-4 py-2 rounded font-semibold ${tab === 'stages' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} 
              onClick={() => {
                setTab('stages');
                // Update URL to reflect tab change
                const params = new URLSearchParams(window.location.search);
                params.set('view', 'stages');
                const url = `${pathname}?${params.toString()}`;
                window.history.pushState({}, '', url);
              }}
            >
              Kanban Board
            </button>
          </div>
          {tab === "leads" && (
            <>
              <LeadStatsSummary 
                leads={leads} 
                userRole={userRole} 
                userId={userId} 
                leadTasks={leadTasks} 
              />
              <div className="flex justify-between mb-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={() => {
                    setEditId(null);
                    setModalOpen(true);
                  }}
                >
                  + Create Lead
                </button>
              </div>
              <LeadTable
                leads={visibleLeads.map(lead => ({
                  ...lead,
                  lastDisposition: leadsWithLastDisposition[lead.id] || null
                }))}
                agents={agents}
                stages={stages}
                userRole={userRole}
                onSelectLead={handleSelectLead}
                dispositions={dispositions}
                leadTasks={leadTasks}
                onBulkAssign={handleBulkAssignUI}
                selectedLeads={selectedLeads}
                setSelectedLeads={setSelectedLeads}
                bulkAssignAgent={assignAgentId}
                setBulkAssignAgent={setAssignAgentId}
              />
            </>
          )}
          {tab === 'stages' && (
            <div className="overflow-x-auto">
              <div className="flex flex-wrap gap-4 mb-4 items-center">
                {/* Search input - only for agents */}
                {userRole === "AGENT" && (
                  <>
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
                  </>
                )}
                
                {/* Agent filter - available for all users */}
                <div className="mb-2">
                  <label className="block mb-1 text-sm font-medium">By Agent:</label>
                  <select
                    className="p-2 border rounded w-full"
                    value={assignedFilter}
                    onChange={(e) => {
                      setAssignedFilter(e.target.value);
                      updateUrlWithFilters({ assigned: e.target.value });
                    }}
                  >
                    <option value="">All Agents</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name ? `${agent.name} (${agent.email})` : agent.email}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  className="border rounded px-3 py-2"
                  value={stageFilter}
                  onChange={(e) => {
                    setStageFilter(e.target.value);
                    updateUrlWithFilters({ stage: e.target.value });
                  }}
                >
                  <option value="">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.name}>{stage.name}</option>
                  ))}
                </select>
                <div className="mb-2">
                  <label className="block mb-1 text-sm font-medium">By Disposition:</label>
                  <select 
                    className="p-2 border rounded mb-2 w-full" 
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
                <div className="mb-2">
                  <label className="block mb-1 text-sm font-medium">Tasks Due:</label>
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={dueTodayFilter}
                        onChange={(e) => {
                          setDueTodayFilter(e.target.checked);
                          updateUrlWithFilters({ dueTodayFilter: e.target.checked });
                        }}
                      />
                      <span>Due Today</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={dueWeekFilter}
                        onChange={(e) => {
                          setDueWeekFilter(e.target.checked);
                          updateUrlWithFilters({ dueWeekFilter: e.target.checked });
                        }}
                      />
                      <span>Due This Week</span>
                    </label>
                  </div>
                </div>
              </div>
              <div style={{ minHeight: '480px' }}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="flex gap-6 min-w-[1200px]">
                    {stages.filter(stage => visibleStages[stage.id] ?? true).map(stage => (
                      <Droppable droppableId={stage.name} key={stage.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 min-w-[240px] bg-blue-50 rounded-lg p-3 shadow ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}`}
                          >
                            {/* Color bar at the top of the column */}
                            <div 
                              className="h-2 rounded-t-md -mt-3 -mx-3 mb-3"
                              style={{ backgroundColor: stage.color || '#3b82f6' }}
                            ></div>
                            <div className="font-bold text-blue-700 mb-2 text-center flex items-center justify-center gap-2">
                              <span>{stage.name}</span>
                              {userRole !== "AGENT" && (
                                <button onClick={() => openEditStageModal(stage)} title="Edit Stage" className="hover:text-blue-500 focus:outline-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.415 1.415-4.243a4 4 0 01.828-1.414z" /></svg>
                                </button>
                              )}
                            </div>
                            {(kanbanLeads[stage.id] || []).map((lead, idx) => (
                              <Draggable draggableId={lead.id} index={idx} key={lead.id}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`mb-3 p-3 bg-white rounded shadow border border-blue-200 cursor-move ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                                    style={{ ...provided.draggableProps.style, cursor: 'move' }}
                                  >
                                    <div className="font-semibold">{lead.schoolName}</div>
                                    <div className="text-sm text-gray-600">{lead.name} &bull; {lead.email}</div>
                                    <div className="text-xs text-gray-400">{lead.phone}</div>
                                    <div className="text-xs text-gray-500 mt-1">Assigned: {lead.agent ? `${lead.agent.name ?? lead.agent.email}` : <span className="italic text-gray-400">Unassigned</span>}</div>
                                    <div className="flex gap-2 mt-2">
                                      <button onClick={e => { e.stopPropagation(); handleEdit(lead); }} className="text-blue-600 hover:underline text-xs">Edit</button>
                                      <button 
                                        onClick={e => { 
                                          e.stopPropagation(); 
                                          // Update URL with lead ID as query parameter
                                          const params = new URLSearchParams(window.location.search);
                                          params.set('lead', lead.id);
                                          router.push(`${pathname}?${params.toString()}`);
                                          setSelectedLead(lead);
                                          setSelectedLeadId(lead.id);
                                          setShowLeadModal(true);
                                        }} 
                                        className="text-gray-600 hover:underline text-xs"
                                      >
                                        View
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </DragDropContext>
              </div>
              <div className="flex gap-2 mb-2">
                <span className="font-semibold text-xs text-gray-700">Kanban Columns:</span>
                {stages.map(stage => (
                  <label key={stage.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={visibleStages[stage.id] ?? true} onChange={() => setVisibleStages(v => ({ ...v, [stage.id]: !v[stage.id] }))} />
                    <span>{stage.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <Modal open={!!selectedLeadId} onClose={() => {setSelectedLeadId(null); router.push('?');}} full>
            {selectedLeadId && (
              <LeadDetailContent leadId={selectedLeadId!} />
            )}
            
          </Modal>
          {/* Delete/Reassign Modal */}
          <Modal open={!!deleteStageId} onClose={() => setDeleteStageId(null)}>
            <h2 className="text-lg font-bold mb-2">Delete Stage</h2>
            <div className="mb-2">To delete this stage, you must select another stage to reassign all its leads to.</div>
            <select
              className="border rounded px-2 py-1 w-full mb-3"
              value={reassignToId}
              onChange={e => setReassignToId(e.target.value)}
            >
              <option value="">Select replacement stage...</option>
              {stages.filter(s => s.id !== deleteStageId).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {deleteStageError && <div className="text-red-600 mb-2">{deleteStageError}</div>}
            <div className="flex gap-2">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold"
                disabled={!reassignToId || deleteStageLoading}
                onClick={handleStageDelete}
              >{deleteStageLoading ? "Deleting..." : "Delete & Reassign"}</button>
              <button className="px-4 py-2 rounded font-semibold border" onClick={() => setDeleteStageId(null)}>Cancel</button>
            </div>
          </Modal>
          <Modal open={stageModalOpen} onClose={() => setStageModalOpen(false)}>
            <h2 className="text-lg font-bold mb-2">{editingStage.id ? "Edit Stage" : "New Stage"}</h2>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Stage Name</label>
              <input
                type="text"
                value={editingStage.name}
                onChange={e => setEditingStage(s => ({ ...s, name: e.target.value }))}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Color</label>
              <input
                type="color"
                value={editingStage.color || "#000000"}
                onChange={e => setEditingStage(s => ({ ...s, color: e.target.value }))}
                className="w-12 h-8 p-0 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Default Message Template</label>
              <select
                value={editingStage.defaultTemplateId || ""}
                onChange={e => setEditingStage(s => ({ ...s, defaultTemplateId: e.target.value || undefined }))}
                className="border px-2 py-1 rounded w-full"
                disabled={templateLoading}
              >
                <option value="">No Default</option>
                {messageTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {stageFormError && <div className="text-red-600 mb-2">{stageFormError}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-300" onClick={() => setStageModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleStageSave} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
            </div>
          </Modal>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">{editId ? "Edit Lead" : "Create Lead"}</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" placeholder="School Name" value={form.schoolName} onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="text" placeholder="Contact Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="text" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="text" placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="border px-2 py-1 rounded" required />
              {userRole === "ADMIN" && (
                <>
                  <label className="text-sm font-semibold">Assign to Agent</label>
                  <select value={form.assignedTo ?? ""} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value || null }))} className="border px-2 py-1 rounded">
                    <option value="">Unassigned</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
                    ))}
                  </select>
                </>
              )}
              <label className="text-sm font-semibold">Stage</label>
              <select value={typeof form.stage === 'string' ? form.stage : form.stage?.name ?? ''} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="border px-2 py-1 rounded">
                {stages.map(stage => (
                  <option key={stage.id} value={stage.name}>{stage.name}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">{loading ? "Saving..." : editId ? "Update Lead" : "Create Lead"}</button>
            </form>
          </Modal>
          {/* Lead Detail Modal */}
          <Modal 
            open={showLeadModal && selectedLead !== null} 
            onClose={() => {
              setShowLeadModal(false);
              // Remove lead parameter from URL
              const params = new URLSearchParams(window.location.search);
              params.delete('lead');
              router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            full={true}
          >
            {selectedLead && (
              <div className="p-6">
                <LeadDetailContent leadId={selectedLead.id} />
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
}
