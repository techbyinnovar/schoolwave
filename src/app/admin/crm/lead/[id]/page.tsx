"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface LeadDetail {
  id: string;
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  stage: { id: string; name: string } | null;
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
  type: string; // 'stage_change' | 'action' | ...
  fromStage?: string;
  toStage?: string;
  actionType?: string; // 'call', 'visit', etc
  note?: string;
  createdAt: string;
  user: { id: string; name: string | null };
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [showHistory, setShowHistory] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showLogAction, setShowLogAction] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [action, setAction] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch lead details
  useEffect(() => {
    setLoading(true);
    fetch(`/api/lead/${params.id}`)
      .then(res => res.json())
      .then(data => setLead(data.result?.data ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Add note
  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    // Debug: log session and user
    console.log('[NOTE DEBUG] session:', session);
    console.log('[NOTE DEBUG] session.user:', session?.user);
    console.log('[NOTE DEBUG] session.user.id:', session?.user?.id);
    await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: params.id, content: note, userId: typeof session?.user?.id === "string" ? session.user.id : undefined }),
    });
    setNote("");
    // Refresh lead
    fetch(`/api/lead/${params.id}`)
      .then(res => res.json())
      .then(data => setLead(data.result?.data ?? null))
      .finally(() => setSaving(false));
  };

  // Log action
  const handleLogAction = async () => {
    if (!action) return;
    setSaving(true);
    await fetch(`/api/lead/${params.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: params.id,
        type: "action",
        actionType: action,
        note: actionNote,
        userId: typeof session?.user?.id === "string" ? session.user.id : undefined,
      }),
    });
    setAction("");
    setActionNote("");
    // Refresh lead
    fetch(`/api/lead/${params.id}`)
      .then(res => res.json())
      .then(data => setLead(data.result?.data ?? null))
      .finally(() => setSaving(false));
  };

  if (loading) return <div>Loading lead details...</div>;
  if (!lead) return <div>Lead not found.</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded shadow p-8">
          <h1 className="text-2xl font-bold mb-4">Lead Details</h1>
          <div className="mb-4">
            <div><b>School Name:</b> {lead.schoolName}</div>
            <div><b>Contact Name:</b> {lead.name}</div>
            <div><b>Phone:</b> {lead.phone}</div>
            <div><b>Email:</b> {lead.email}</div>
            <div><b>Address:</b> {lead.address}</div>
            <div><b>Stage:</b> {lead.stage?.name || "-"}</div>
            <div><b>Created At:</b> {new Date(lead.createdAt).toLocaleString()}</div>
          </div>

          {/* Collapsible Stage & Action History */}
          <div className="mb-4">
            <button
              className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center"
              onClick={() => setShowHistory(s => !s)}
            >
              <span className="text-xl font-semibold">Stage & Action History</span>
              <span>{showHistory ? '▲' : '▼'}</span>
            </button>
            {showHistory && (
              <ul className="mb-8 border rounded p-4 bg-gray-50">
                {Array.isArray(lead.history) && lead.history.length === 0 && <li>No history yet.</li>}
                {Array.isArray(lead.history) && lead.history.map(h => (
                  <li key={h.id} className="mb-2">
                    <span className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</span> —
                    {h.type === "stage_change" && (
                      <span> <b>{h.user?.name || "System"}</b> moved from <b>{h.fromStage}</b> to <b>{h.toStage}</b></span>
                    )}
                    {h.type === "action" && (
                      <span> <b>{h.user?.name || "System"}</b> logged action <b>{h.actionType}</b>{h.note && `: ${h.note}`}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Collapsible Notes */}
          <div className="mb-4">
            <button
              className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center"
              onClick={() => setShowNotes(s => !s)}
            >
              <span className="text-xl font-semibold">Notes</span>
              <span>{showNotes ? '▲' : '▼'}</span>
            </button>
            {showNotes && (
              <>
                <ul className="mb-4 border rounded p-4 bg-gray-50">
                  {Array.isArray(lead.notes) && lead.notes.length === 0 && <li>No notes yet.</li>}
                  {Array.isArray(lead.notes) && lead.notes.map(n => (
                    <li key={n.id} className="mb-2">
                      <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span> — <b>{n.user?.name || "Unknown"}</b>: {n.content}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mb-6">
                  <input
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Add a note..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    disabled={saving}
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddNote} disabled={saving || !note.trim()}>Add Note</button>
                </div>
              </>
            )}
          </div>

          {/* Collapsible Log Action */}
          <div className="mb-4">
            <button
              className="mb-2 px-3 py-1 bg-gray-200 rounded text-left w-full flex justify-between items-center"
              onClick={() => setShowLogAction(s => !s)}
            >
              <span className="text-xl font-semibold">Log Action</span>
              <span>{showLogAction ? '▲' : '▼'}</span>
            </button>
            {showLogAction && (
              <div className="flex gap-2 mb-2">
                <select className="border rounded px-3 py-2" value={action} onChange={e => setAction(e.target.value)}>
                  <option value="">Select Action</option>
                  <option value="call">Call</option>
                  <option value="visit">Visit</option>
                  <option value="demo">Demo</option>
                  <option value="payment">Payment</option>
                </select>
                <input
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Optional note..."
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  disabled={saving}
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleLogAction} disabled={saving || !action}>Log Action</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
