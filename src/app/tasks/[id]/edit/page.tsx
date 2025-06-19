'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter, useParams } from 'next/navigation';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [task, setTask] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then(r => r.json())
      .then(data => {
        setTask(data.task);
        setTitle(data.task.title);
        setDescription(data.task.description || '');
        setDueDate(data.task.dueDate ? data.task.dueDate.slice(0, 16) : '');
        setStatus(data.task.status || 'pending');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load task');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, dueDate, status }),
    });
    if (res.ok) {
      router.push(`/tasks/${id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update task');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;
  if (!task) return <div className="p-6">Task not found.</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Task</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input className="w-full border px-3 py-2 rounded" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea className="w-full border px-3 py-2 rounded" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-1">Due Date</label>
            <input type="datetime-local" className="w-full border px-3 py-2 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select className="w-full border px-3 py-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => router.push(`/tasks/${id}`)}>Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
}
