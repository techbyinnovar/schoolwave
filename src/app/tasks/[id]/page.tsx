'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then(r => r.json())
      .then(data => {
        setTask(data.task);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load task');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;
  if (!task) return <div className="p-6">Task not found.</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
        <div className="mb-4 text-gray-700">{task.description}</div>
        <div className="mb-2"><span className="font-semibold">Due:</span> {formatDate(task.dueDate)}</div>
        <div className="mb-2"><span className="font-semibold">Status:</span> {task.status}</div>
        <div className="mb-2"><span className="font-semibold">Assigned to:</span> {task.assignedTo?.name || task.assignedTo?.email || '—'}</div>
        <div className="mb-2"><span className="font-semibold">Created by:</span> {task.createdBy?.name || task.createdBy?.email || '—'}</div>
        <div className="flex gap-3 mt-6">
          <Link href={`/tasks/${task.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit</Link>
          <button onClick={() => router.push('/tasks')} className="bg-gray-200 px-4 py-2 rounded">Back</button>
        </div>
      </main>
    </div>
  );
}
