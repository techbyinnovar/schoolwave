"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Types
export type Agent = { id: string; name?: string | null; email: string };
export type Stage = { id: string; name: string };

interface LeadDetail {
  id: string;
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  stage: { id: string; name: string } | null;
  ownedBy?: { id: string; name: string | null; email: string | null } | null;
  agent?: { id: string; name?: string | null; email: string } | null;
  notes: Note[];
  history: LeadHistory[];
}
interface Note {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null };
}
interface LeadHistory {
  id: string;
  type: string;
  fromStage?: string;
  toStage?: string;
  actionType?: string;
  note?: string;
  disposition?: string;
  createdAt: string;
  user: { id: string; name: string | null };
}

interface Props {
  leadId: string;
}

export default function LeadDetailContent({ leadId }: Props) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  // UI state
  const [showHistory, setShowHistory] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showLogAction, setShowLogAction] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  // editing
  const [editOwner, setEditOwner] = useState<string | null>(null);
  const [editAssigned, setEditAssigned] = useState<string | null>(null);
  const [editStage, setEditStage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState("");

  // input
  const [note, setNote] = useState("");
  const [action, setAction] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [creatingNext, setCreatingNext] = useState(false);
  const [nextDesc, setNextDesc] = useState("");
  const [nextDue, setNextDue] = useState<string>("");
  const [nextAssignee, setNextAssignee] = useState<string>("");
  const [showNextAction, setShowNextAction] = useState(true);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [leadTasks, setLeadTasks] = useState<any[]>([]);
  const refreshTasks = () => {
    fetch(`/api/tasks?subjectType=LEAD&subjectId=${leadId}`)
      .then(r=>r.json())
      .then(d=> setLeadTasks(d.tasks || []));
  };
  const [actionNote, setActionNote] = useState("");
  const [disposition, setDisposition] = useState("");
  const [availableDispositions, setAvailableDispositions] = useState<string[]>([]);

  // fetch data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/user?role=AGENT`).then(r => r.json()),
      fetch(`/api/stage`).then(r => r.json()),
      fetch(`/api/lead/${leadId}`).then(r => r.json()),
      fetch('/api/action').then(r => r.json()),
      fetch('/api/disposition').then(r => r.json())
    ]).then(([aRes, sRes, lRes, actRes, dispRes]) => {
      setAgents(aRes.result?.data ?? []);
      setStages(sRes.result?.data ?? []);
      const l = lRes.result?.data ?? null;
      setLead(l);
      setEditOwner(l?.ownedBy?.id || null);
      setEditAssigned(l?.agent?.id || null);
      setEditStage(l?.stage?.id || null);
      
      // Set available actions
      setAvailableActions((actRes.result?.data || []).map((a: any) => a.name || a));
      
      // Set available dispositions
      setAvailableDispositions(dispRes.result?.data || []);
    }).catch(err => {
      console.error("Error loading lead:", err);
    }).finally(() => setLoading(false));

    refreshTasks();
  }, [leadId]);

  // create next action task
  const handleReschedule = async (task: any) => {
    const current = task.dueDate ? task.dueDate.slice(0,10) : "";
    const input = prompt("New due date (YYYY-MM-DD)", current);
    if (!input) return;
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: input })
      });
      refreshTasks();
    } catch(e) { console.error(e); alert('Failed to reschedule'); }
  };

  const handleMarkDone = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      refreshTasks();
    } catch(e) { console.error(e); alert('Failed to update task'); }
  };

  const handleSetNextAction = async () => {
    if (!nextAction || !lead) return;
    setCreatingNext(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${nextAction} – ${lead.name}`,
          description: nextDesc || `Follow up action (${nextAction}) for lead ${lead.name}`,
          dueDate: nextDue ? new Date(nextDue).toISOString() : new Date().toISOString(),
          subjectType: 'LEAD',
          subjectIds: [lead.id],
          assignedToId: nextAssignee || userId,
        }),
      });
      setNextAction("");
      setNextDesc("");
      setNextDue("");
      setNextAssignee("");
      alert('Next action task created');
      // reload tasks
      fetch(`/api/tasks?subjectType=LEAD&subjectId=${leadId}`)
        .then(r=>r.json())
        .then(d=> setLeadTasks(d.tasks || []));
    } catch (e) {
      console.error(e);
      alert('Failed to create task');
    } finally {
      setCreatingNext(false);
    }
  };

  // helpers
  const canEditOwner = userRole === "ADMIN";
  const canEditAssigned = userRole === "ADMIN";
  const canEditStage = userRole === "ADMIN" || userRole === "AGENT";
  const fieldsChanged = (
    (canEditOwner && editOwner !== (lead?.ownedBy?.id || null)) ||
    (canEditAssigned && editAssigned !== (lead?.agent?.id || null)) ||
    (canEditStage && editStage !== (lead?.stage?.id || null))
  );

  const refreshLead = () => fetch(`/api/lead/${leadId}`).then(r=>r.json()).then(d=>setLead(d.result?.data ?? null));

  const handleAddNote = async () => {
    if (!note.trim() || !lead) return;
    setSaving(true);
    await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, content: note, userId: typeof userId === "string" ? userId : undefined })
    });
    setNote("");
    refreshLead().finally(()=>setSaving(false));
  };

  const handleLogAction = async () => {
    if (!action) return;
    setSaving(true);
    await fetch(`/api/lead/${leadId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        type: "action",
        actionType: action,
        note: actionNote,
        disposition: disposition || null,
        userId: typeof userId === "string" ? userId : undefined
      })
    });
    setAction("");
    setActionNote("");
    setDisposition("");
    refreshLead().finally(()=>setSaving(false));
  };

  const handleEditSave = async () => {
    if (!lead) return;
    setSaving(true);
    setEditError("");
    try {
      const payload: any = { id: lead.id };
      if (canEditOwner) payload.ownedById = editOwner || null;
      if (canEditAssigned) payload.assignedTo = editAssigned || null;
      if (canEditStage) payload.stageId = editStage || null;
      const res = await fetch(`/api/lead/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update lead");
      const data = await res.json();
      setLead(data.result?.data ?? null);
      setEditMode(false);
    } catch (e: any) {
      setEditError(e.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading lead details...</div>;
  if (!lead) return <div>Lead not found.</div>;

  return (
    <div className="w-full p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Lead Details</h1>
        
      {/* basic info */}
      <div className="mb-4">
        <div><b>School Name:</b> {lead.schoolName}</div>
        <div><b>Contact Name:</b> {lead.name}</div>
        <div><b>Phone:</b> {lead.phone}</div>
        <div><b>Email:</b> {lead.email}</div>
        <div><b>Address:</b> {lead.address}</div>
        {/* stage */}
        <div className="flex items-center gap-2">
          <b>Stage:</b>
          {canEditStage && editMode ? (
            <select value={editStage || ""} onChange={e=>setEditStage(e.target.value||null)} className="border rounded px-2 py-1" disabled={saving}>
              <option value="">Unassigned</option>
              {stages.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          ) : (
            <span>{lead.stage?.name || <span className="italic text-gray-400">Unassigned</span>}</span>
          )}
        </div>
        {/* owner */}
        <div className="flex items-center gap-2">
          <b>Owner (Agent):</b>
          {canEditOwner && editMode ? (
            <select value={editOwner || ""} onChange={e=>setEditOwner(e.target.value||null)} className="border rounded px-2 py-1" disabled={saving}>
              <option value="">Unassigned</option>
              {agents.map(a=> <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
            </select>
          ) : (
            lead.ownedBy ? (lead.ownedBy.name || lead.ownedBy.email || lead.ownedBy.id) : <span className="italic text-gray-400">Unassigned</span>
          )}
        </div>
        {/* assigned */}
        <div className="flex items-center gap-2">
          <b>Assigned Agent:</b>
          {canEditAssigned && editMode ? (
            <select value={editAssigned || ""} onChange={e=>setEditAssigned(e.target.value||null)} className="border rounded px-2 py-1" disabled={saving}>
              <option value="">Unassigned</option>
              {agents.map(a=> <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
            </select>
          ) : (
            lead.agent ? (lead.agent.name || lead.agent.email || lead.agent.id) : <span className="italic text-gray-400">Unassigned</span>
          )}
        </div>
        <div><b>Created At:</b> {new Date(lead.createdAt).toLocaleString()}</div>
        {(canEditOwner || canEditAssigned || canEditStage) && (
          <div className="mt-2 flex gap-2">
            {!editMode ? (
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={()=>setEditMode(true)} disabled={saving}>Edit</button>
            ) : (
              <>
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleEditSave} disabled={saving || !fieldsChanged}>Save</button>
                <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={()=>{setEditMode(false); setEditOwner(lead.ownedBy?.id||null); setEditAssigned(lead.agent?.id||null); setEditStage(lead.stage?.id||null);}} disabled={saving}>Cancel</button>
              </>
            )}
            {editError && <span className="text-red-500 ml-2">{editError}</span>
            }
          </div>
        )}
      </div>

      {/* history */}
      <div className="mb-4">
        <button className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center" onClick={()=>setShowHistory(s=>!s)}>
          <span className="text-xl font-semibold">Stage & Action History</span>
          <span>{showHistory ? "▲" : "▼"}</span>
        </button>
        {showHistory && (
          <ul className="mb-8 border rounded p-4 bg-gray-50">
            {lead.history.length===0 && <li>No history yet.</li>}
            {lead.history.map(h=> (
              <li key={h.id} className="mb-2">
                <span className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</span> —
                {h.type === "stage_change" && (<span> <b>{h.user?.name || "System"}</b> moved from <b>{h.fromStage}</b> to <b>{h.toStage}</b></span>)}
                {h.type === "action" && (<span> <b>{h.user?.name || "System"}</b> logged action <b>{h.actionType}</b>{h.disposition && <span> with disposition <b>{h.disposition}</b></span>}{h.note && `: ${h.note}`}</span>)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* notes */}
      <div className="mb-4">
        <button
          className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center"
          onClick={() => setShowNotes(s => !s)}
        >
          <span className="text-xl font-semibold">Notes</span>
          <span>{showNotes ? "▲" : "▼"}</span>
        </button>
        {showNotes && (
          <>
            <ul className="mb-4 border rounded p-4 bg-gray-50">
              {lead.notes.length === 0 && <li>No notes yet.</li>}
              {lead.notes.map(n => (
                <li key={n.id} className="mb-2">
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span> — <b>{n.user?.name || "Unknown"}</b>: {n.content}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Add a note..."
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={saving}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAddNote}
                disabled={saving || !note.trim()}
              >
                Add Note
              </button>
            </div>
          </>
        )}
      </div>

      {/* log action */}
      <div className="mb-4">
        <button
          className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center"
          onClick={() => setShowLogAction(s => !s)}
        >
          <span className="text-xl font-semibold">Log Action</span>
          <span>{showLogAction ? "▲" : "▼"}</span>
        </button>
        {showLogAction && (
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex gap-2">
              <select
                className="border rounded px-3 py-2"
                value={action}
                onChange={e => setAction(e.target.value)}
              >
                <option value="">Select Action</option>
                {availableActions.map(act => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-3 py-2"
                value={disposition}
                onChange={e => setDisposition(e.target.value)}
              >
                <option value="">Select Disposition</option>
                {availableDispositions.map(disp => (
                  <option key={disp} value={disp}>
                    {disp}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Optional note..."
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                disabled={saving}
              />
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleLogAction}
                disabled={saving || !action}
              >
                Log Action
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Next Action */}
      <div className="mb-4">
        <button
          className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center"
          onClick={() => setShowNextAction(s => !s)}
        >
          <span className="text-xl font-semibold">Next Action</span>
          <span>{showNextAction ? "▲" : "▼"}</span>
        </button>

        {showNextAction && (
          <>
            {/* task list */}
            {leadTasks.length === 0 ? (
              <p className="mb-2 text-sm text-gray-500">No tasks yet for this lead.</p>
            ) : (
              <ul className="mb-2 list-disc list-inside text-sm">
                {leadTasks.map(t => (
                  <li key={t.id} className="mb-1">
                    <span className="font-medium">{t.title}</span> — due {new Date(t.dueDate).toLocaleDateString()} ({t.status})
                    {t.status !== 'completed' && (
                      <>
                        <button
                          className="ml-2 text-blue-600 underline"
                          onClick={() => handleReschedule(t)}
                        >
                          Reschedule
                        </button>
                        <button
                          className="ml-1 text-green-600 underline"
                          onClick={() => handleMarkDone(t.id)}
                        >
                          Done
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* create next action */}
            <div className="flex flex-wrap gap-2 mb-2">
              <select
                className="border rounded px-3 py-2"
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
              >
                <option value="">Select Action</option>
                {availableActions.map(act => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>

              <input
                className="border rounded px-3 py-2"
                placeholder="Description"
                value={nextDesc}
                onChange={e => setNextDesc(e.target.value)}
              />

              <input
                type="date"
                className="border rounded px-3 py-2"
                value={nextDue}
                onChange={e => setNextDue(e.target.value)}
              />

              {userRole === 'ADMIN' && (
                <select
                  className="border rounded px-3 py-2"
                  value={nextAssignee}
                  onChange={e => setNextAssignee(e.target.value)}
                >
                  <option value="">Assign to (default me)</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.email}
                    </option>
                  ))}
                </select>
              )}

              <button
                className="bg-purple-600 text-white px-4 py-2 rounded"
                onClick={handleSetNextAction}
                disabled={creatingNext || !nextAction}
              >
                Set Next
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
