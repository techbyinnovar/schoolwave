import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Lead {
  id: string;
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  demoCode?: string | null;
  stage?: { id: string; name: string } | string;
  ownedBy?: { id: string; name: string | null; email: string | null } | null;
  agent?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
  notes: { id: string; content: string; createdAt: string }[];
  history: { id: string; fromStage: string; toStage: string; createdAt: string }[];
}

interface Props {
  leadId: string;
}

export default function LeadDetailModal({ leadId }: Props) {
  const { data: session } = useSession();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lead/${leadId}`)
      .then((res) => res.json())
      .then((data) => {
        // Log the raw API response for debugging
        console.log('Lead detail API response:', data.result?.data);
        
        // Map the API response to the expected format
        const leadData = data.result?.data ?? null;
        if (leadData) {
          // Create a properly structured agent object from assignedUser
          if (leadData.assignedUser) {
            leadData.agent = {
              id: leadData.assignedUser.id,
              name: leadData.assignedUser.name,
              email: leadData.assignedUser.email
            };
          } else if (leadData.assignedTo) {
            // If we only have assignedTo (ID), create a minimal agent object
            leadData.agent = {
              id: leadData.assignedTo,
              name: null,
              email: null
            };
          } else {
            leadData.agent = null;
          }
          
          // Log the assigned user data
          console.log('assignedUser data:', leadData.assignedUser);
          console.log('mapped agent data:', leadData.agent);
          
          // Map Note to notes and EntityHistory to history
          leadData.notes = leadData.Note || [];
          leadData.history = leadData.EntityHistory || [];
        }
        setLead(leadData);
      })
      .catch((err) => {
        console.error('Error fetching lead:', err);
        setError('Failed to load lead');
      })
      .finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!lead) return <p>Lead not found</p>;

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
      <h2 className="text-2xl font-bold">Lead Details</h2>
      <div className="text-sm space-y-1">
        <div><span className="font-semibold">School Name:</span> {lead.schoolName}</div>
        <div><span className="font-semibold">Contact Name:</span> {lead.name}</div>
        <div><span className="font-semibold">Phone:</span> {lead.phone}</div>
        <div><span className="font-semibold">Email:</span> {lead.email}</div>
        <div><span className="font-semibold">Address:</span> {lead.address}</div>
        <div><span className="font-semibold">Stage:</span> {typeof lead.stage === 'object' ? lead.stage?.name : lead.stage}</div>
        <div><span className="font-semibold">Owner (Agent):</span> {lead.ownedBy ? (lead.ownedBy.name || lead.ownedBy.email) : 'Unassigned'}</div>
        <div>
          <span className="font-semibold">Assigned Agent:</span> 
          {lead.agent ? 
            (lead.agent.name || lead.agent.email || 'Agent ID: ' + lead.agent.id) : 
            'Unassigned'
          }
        </div>
        <div><span className="font-semibold">Created At:</span> {new Date(lead.createdAt).toLocaleString()}</div>
      </div>

      <details open className="border rounded">
        <summary className="cursor-pointer bg-gray-100 px-2 py-1 font-semibold text-sm">Stage & Action History</summary>
        {lead.history && lead.history.length ? (
          <ul className="text-xs p-2 space-y-1">
            {lead.history.map((h) => (
              <li key={h.id}>{new Date(h.createdAt).toLocaleString()}: {h.fromStage} → {h.toStage}</li>
            ))}
          </ul>
        ) : (
          <p className="p-2 text-xs text-gray-500">No history yet.</p>
        )}
      </details>

      <details open className="border rounded">
        <summary className="cursor-pointer bg-gray-100 px-2 py-1 font-semibold text-sm">Notes</summary>
        {lead.notes && lead.notes.length ? (
          <ul className="text-xs p-2 space-y-1">
            {lead.notes.map((n) => (
              <li key={n.id}>{new Date(n.createdAt).toLocaleString()}: {n.content}</li>
            ))}
          </ul>
        ) : (
          <p className="p-2 text-xs text-gray-500">No notes yet.</p>
        )}
      </details>
    </div>
  );
}
