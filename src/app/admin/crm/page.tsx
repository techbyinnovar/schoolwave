"use client";
import { useState, useEffect, useMemo, FormEvent, ReactNode } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import AdminSidebar from '@/components/AdminSidebar';
import { useSession } from "next-auth/react";


// Define the Lead type
export type Lead = {
  id: string;
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  demoCode?: string | null; // Added demoCode
  assignedTo?: string | null;
  agent?: { id: string; name?: string | null; email: string } | null;
  stage?: string | { name: string };
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >&#10005;</button>
        {children}
      </div>
    </div>
  );
}
export default function AdminCrmPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  const [tab, setTab] = useState<'leads' | 'stages'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<{ id: string; name?: string; email: string }[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Omit<Lead, "id">>({
    schoolName: "", // optional
    name: "",
    phone: "",
    email: "",
    address: "",
    assignedTo: null,
    stage: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  // Only show assigned leads if agent, otherwise show all
  const visibleLeads = useMemo(() => {
    if (userRole === "AGENT" && userId) {
      return leads.filter(lead => lead.assignedTo === userId);
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

  // Helper to get stage name by lead.stage
  const getStageName = (stageValue: string | { name: string } | undefined): string => {
    if (!stageValue) return '';
    if (typeof stageValue === 'object' && stageValue !== null) {
      // Defensive: if stageValue is an object, try to get its name
      return (stageValue as any).name || '[Invalid Stage]';
    }
    return String(stageValue);
  };

  // Fetch leads, agents, and stages
  useEffect(() => {
    fetch("/api/lead")
      .then(res => res.json())
      .then(data => setLeads(data.result?.data ?? []));
    fetch("/api/user?role=AGENT")
      .then(res => res.json())
      .then(data => setAgents(data.result?.data ?? []));
    fetch("/api/stage")
      .then(res => res.json())
      .then(data => setStages(data.result?.data ?? []));
    setTemplateLoading(true);
    fetch("/api/message-template")
      .then(res => res.json())
      .then(data => setMessageTemplates(data.result?.data ?? []))
      .finally(() => setTemplateLoading(false));
  }, []);

  // Populate Kanban leads when leads or stages change
  useEffect(() => {
    if (!stages.length) return;
    const grouped: Record<string, Lead[]> = {};
    stages.forEach(stage => {
      grouped[stage.name] = [];
    });
    visibleLeads.forEach(lead => {
      const stageName = lead.stage ? getStageName(lead.stage) : stages[0]?.name;
      if (grouped[stageName]) grouped[stageName].push(lead);
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
        const payload = { ...form, stageId };
        res = await fetch(`/api/lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("Failed to save lead");
      setForm({ schoolName: "", name: "", phone: "", email: "", address: "", assignedTo: null, stage: stages[0]?.name ?? "" });
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
    setForm({ schoolName: "", name: "", phone: "", email: "", address: "", assignedTo: null, stage: stages[0]?.name ?? "" });
    setModalOpen(true);
  };

  // Filter leads  // Search filter (use visibleLeads as base)
  const filteredLeads = useMemo(() => {
    if (!search.trim()) return visibleLeads;
    const q = search.trim().toLowerCase();
    return visibleLeads.filter(
      (l) =>
        (l.schoolName ?? '').toLowerCase().includes(q) ||
        (l.name ?? '').toLowerCase().includes(q) ||
        (l.phone ?? '').toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.address ?? '').toLowerCase().includes(q)
    );
  }, [search, visibleLeads]);

  // Kanban drag handler
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    const movedLead = kanbanLeads[sourceStage][source.index];
    // Find the stageId for the destination stage
    const destStageObj = stages.find(s => s.name === destStage);
    if (!destStageObj) return;
    // Optimistic update
    const updatedKanban = { ...kanbanLeads };
    updatedKanban[sourceStage] = [...updatedKanban[sourceStage]];
    updatedKanban[destStage] = [...updatedKanban[destStage]];
    const [removed] = updatedKanban[sourceStage].splice(source.index, 1);
    removed.stage = destStageObj.name; // ensure UI reflects new stage
    updatedKanban[destStage].splice(destination.index, 0, removed);
    setKanbanLeads(updatedKanban);
    // Update in DB
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggableId, stageId: destStageObj.id }),
      });
      // Refresh leads
      fetch("/api/lead")
        .then(res => res.json())
        .then(data => setLeads(data.result?.data ?? []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  // Bulk assign handler
  const handleBulkAssign = async () => {
    if (!assignAgentId || selectedLeads.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedLeads, agentId: assignAgentId }),
      });
      if (!res.ok) throw new Error("Failed to assign leads");
      setSelectedLeads([]);
      setAssignAgentId("");
      // Refresh leads
      fetch("/api/lead")
        .then(res => res.json())
        .then(data => setLeads(data.result?.data ?? []));
    } catch (err: unknown) {
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
      const url = editingStage.id ? "/api/stage" : "/api/stage";
      // Only send fields that are present
      const payload = {
        ...editingStage,
        defaultTemplateId: editingStage.defaultTemplateId || null,
      };
      const res = await fetch(url, {
        method: "POST",
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
            <button className={`px-4 py-2 rounded font-semibold ${tab === 'leads' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTab('leads')}>Leads Table</button>
            <button className={`px-4 py-2 rounded font-semibold ${tab === 'stages' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTab('stages')}>Kanban Board</button>
          </div>
          {tab === 'leads' && (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border px-2 py-1 rounded w-full md:w-64"
                  />
                  <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">+ Add Lead</button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedLeads(filteredLeads.map(l => l.id));
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                  />
                  <span>Select All</span>
                  <select value={assignAgentId} onChange={e => setAssignAgentId(e.target.value)} className="border px-2 py-1 rounded ml-4">
                    <option value="">Assign to Agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkAssign}
                    disabled={selectedLeads.length === 0 || !assignAgentId || loading}
                    className="bg-blue-600 text-white px-3 py-1 rounded font-semibold ml-2"
                  >Assign</button>
                  <div className="flex gap-2 mb-2">
                    {Object.entries(visibleColumns).map(([col, visible]) => (
                      <label key={col} className="flex items-center gap-1">
                        <input type="checkbox" checked={visible} onChange={() => setVisibleColumns(v => ({ ...v, [col as LeadColumnKey]: !v[col as LeadColumnKey] }))} />
                        <span className="capitalize">{col === 'agent' ? 'Assigned Agent' : col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <table className="min-w-full bg-white rounded shadow overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-4 py-2 w-8"></th>
                    {visibleColumns.schoolName && <th className="px-4 py-2">School Name</th>}
                    {visibleColumns.name && <th className="px-4 py-2">Name</th>}
                    {visibleColumns.phone && <th className="px-4 py-2">Phone</th>}
                    {visibleColumns.email && <th className="px-4 py-2">Email</th>}
                    {visibleColumns.address && <th className="px-4 py-2">Address</th>}
                    {visibleColumns.stage && <th className="px-4 py-2">Stage</th>}
                    {visibleColumns.agent && <th className="px-4 py-2">Assigned Agent</th>}
                    {visibleColumns.demoCode && <th className="px-4 py-2">Demo Code</th>}
                    {visibleColumns.actions && <th className="px-4 py-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-blue-50">
                      <td className="border px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedLeads(prev => [...prev, lead.id]);
                            } else {
                              setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                            }
                          }}
                        />
                      </td>
                      {visibleColumns.schoolName && (
                        <td className="border px-4 py-2">
                          <span
                            className="text-blue-700 hover:underline cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              window.location.href = `/admin/crm/lead/${lead.id}`;
                            }}
                          >
                            {lead.schoolName}
                          </span>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="border px-4 py-2">
                          <span
                            className="text-blue-700 hover:underline cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              window.location.href = `/admin/crm/lead/${lead.id}`;
                            }}
                          >
                            {lead.name}
                          </span>
                        </td>
                      )}
                      {visibleColumns.phone && <td className="border px-4 py-2">{lead.phone}</td>}
                      {visibleColumns.email && <td className="border px-4 py-2">{lead.email}</td>}
                      {visibleColumns.address && <td className="border px-4 py-2">{lead.address}</td>}
                      {visibleColumns.stage && <td className="border px-4 py-2">{getStageName(lead.stage)}</td>}
                      {visibleColumns.agent && <td className="border px-4 py-2">{lead.agent ? `${lead.agent.name ?? lead.agent.email}` : <span className="italic text-gray-400">Unassigned</span>}</td>}
                      {visibleColumns.demoCode && <td className="border px-4 py-2">{lead.demoCode ?? <span className="italic text-gray-400">N/A</span>}</td>}
                      {visibleColumns.actions && <td className="border px-4 py-2">
                        <button onClick={e => { e.stopPropagation(); handleEdit(lead); }} className="text-blue-600 hover:underline mr-2">Edit</button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(lead.id); }} className="text-red-600 hover:underline">Delete</button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {tab === 'stages' && (
            <div className="overflow-x-auto">
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
                            <div className="font-bold text-blue-700 mb-2 text-center flex items-center justify-center gap-2">
                              <span>{stage.name}</span>
                              {userRole !== "AGENT" && (
                                <button onClick={() => openEditStageModal(stage)} title="Edit Stage" className="hover:text-blue-500 focus:outline-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.415 1.415-4.243a4 4 0 01.828-1.414z" /></svg>
                                </button>
                              )}
                            </div>
                            {(kanbanLeads[stage.name] || []).map((lead, idx) => (
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
                                      <button onClick={e => { e.stopPropagation(); window.location.href = `/admin/crm/lead/${lead.id}`; }} className="text-gray-600 hover:underline text-xs">View</button>
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
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">{editId ? "Edit Lead" : "Create Lead"}</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" placeholder="School Name" value={form.schoolName} onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="text" placeholder="Contact Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="text" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="border px-2 py-1 rounded" required />
              <input type="text" placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="border px-2 py-1 rounded" required />
              <label className="text-sm font-semibold">Assign to Agent</label>
              <select value={form.assignedTo ?? ""} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value || null }))} className="border px-2 py-1 rounded">
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
                ))}
              </select>
              <label className="text-sm font-semibold">Stage</label>
              <select value={typeof form.stage === 'string' ? form.stage : form.stage?.name ?? ''} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="border px-2 py-1 rounded">
                {stages.map(stage => (
                  <option key={stage.id} value={stage.name}>{stage.name}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">{loading ? "Saving..." : editId ? "Update Lead" : "Create Lead"}</button>
            </form>
          </Modal>
          {/* Stage CRUD Modal */}
          {stageModalOpen && (
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
          )}
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
              <label className="text-sm font-semibold">Assign to Agent</label>
              <select value={form.assignedTo ?? ""} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value || null }))} className="border px-2 py-1 rounded">
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
                ))}
              </select>
              <label className="text-sm font-semibold">Stage</label>
              <select value={typeof form.stage === 'string' ? form.stage : form.stage?.name ?? ''} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="border px-2 py-1 rounded">
                {stages.map(stage => (
                  <option key={stage.id} value={stage.name}>{stage.name}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">{loading ? "Saving..." : editId ? "Update Lead" : "Create Lead"}</button>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  );
}
