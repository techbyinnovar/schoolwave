'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';


export default function NewTaskPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Assignment dropdown state
  const [assignedToId, setAssignedToId] = useState('');
  const [users, setUsers] = useState<{ id: string; name?: string | null; email: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setUsersLoading(true);
      fetch('/api/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [isAdmin]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload: any = { title, description, dueDate };
    if (isAdmin && assignedToId) payload.assignedToId = assignedToId;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/tasks');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create task');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">New Task</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input className="w-full border px-3 py-2 rounded" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          {isAdmin && (
            <div>
              <label className="block font-medium mb-1">Assign To</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                disabled={usersLoading}
              >
                <option value="">Select user…</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name ? `${user.name} (${user.email})` : user.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea className="w-full border px-3 py-2 rounded" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-1">Due Date</label>
            <input type="datetime-local" className="w-full border px-3 py-2 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? 'Creating…' : 'Create Task'}</button>
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => router.push('/tasks')}>Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
}
