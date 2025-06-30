"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
  history?: EntityHistory[];
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

interface EntityHistory {
  id: string;
  type: string;
  actionType?: string;
  note?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [action, setAction] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [saving, setSaving] = useState(false);
  const isEmbedded = searchParams?.get('embed') === '1';

  useEffect(() => {
    async function fetchCustomer() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/customer/${params.id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch customer: ${res.status}`);
        }
        const data = await res.json();
        setCustomer(data.result?.data ?? data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch customer");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [params.id]);
  
  // Add note
  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        customerId: params.id, 
        content: note, 
        userId: typeof session?.user?.id === "string" ? session.user.id : undefined 
      }),
    });
    setNote("");
    // Refresh customer
    fetch(`/api/customer/${params.id}`)
      .then(res => res.json())
      .then(data => setCustomer(data.result?.data ?? data))
      .finally(() => setSaving(false));
  };

  // Log action
  const handleLogAction = async () => {
    if (!action) return;
    setSaving(true);
    await fetch(`/api/customer/${params.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: params.id,
        type: "action",
        actionType: action,
        note: actionNote,
        userId: typeof session?.user?.id === "string" ? session.user.id : undefined,
      }),
    });
    setAction("");
    setActionNote("");
    // Refresh customer
    fetch(`/api/customer/${params.id}`)
      .then(res => res.json())
      .then(data => setCustomer(data.result?.data ?? data))
      .finally(() => setSaving(false));
  };

  const handleEdit = () => {
    router.push(`/admin/customer/${params.id}/edit`);
  };

  const handleBack = () => {
    router.push("/admin/customer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Customers
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              Customer not found
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Customers
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "" : "min-h-screen bg-gray-100"}>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Customer Details</h1>
            <div className="space-x-2">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg">{customer.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg">{customer.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-lg">{customer.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-lg">{customer.address || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1">{new Date(customer.createdAt).toLocaleString()}</p>
            <h3 className="text-sm font-medium text-gray-500 mt-4">Last Updated</h3>
            <p className="mt-1">{new Date(customer.updatedAt).toLocaleString()}</p>
          </div>

          {/* Notes Section */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="mb-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Add a note about this customer..."
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded" 
                  onClick={handleAddNote} 
                  disabled={saving || !note.trim()}
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {customer.notes?.length ? (
                customer.notes.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                    <p>{note.content}</p>
                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                      <span>By: {note.user?.name || 'System'}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No notes yet</p>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Log Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1">
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Action</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="demo">Demo</option>
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Notes about this action"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded" 
                onClick={handleLogAction} 
                disabled={saving || !action}
              >
                Log Action
              </button>
            </div>

            {/* Action History */}
            <div className="mt-6">
              <h3 className="font-medium mb-3">Action History</h3>
              {customer.history?.filter(h => h.type === 'action').length ? (
                <div className="space-y-3">
                  {customer.history
                    .filter(h => h.type === 'action')
                    .map((action) => (
                      <div key={action.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{action.actionType}</div>
                        {action.note && <p className="mt-1">{action.note}</p>}
                        <div className="mt-2 text-sm text-gray-500 flex justify-between">
                          <span>By: {action.user?.name || 'System'}</span>
                          <span>{new Date(action.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No actions logged yet</p>
              )}
            </div>
          </div>

          {/* Next Action Section */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Next Action</h2>
            <div className="flex justify-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={() => router.push(`/admin/tasks/new?customerId=${customer.id}`)}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
