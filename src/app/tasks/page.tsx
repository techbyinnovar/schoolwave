'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks${filter ? `?filter=${filter}` : ''}`)
      .then(r => r.json())
      .then(data => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load tasks');
        setLoading(false);
      });
  }, [filter]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Link href="/tasks/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">New Task</Link>
        </div>
        <div className="mb-4 flex gap-2">
          <button onClick={() => setFilter('')} className={`px-3 py-1 rounded ${filter === '' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>All</button>
          <button onClick={() => setFilter('today')} className={`px-3 py-1 rounded ${filter === 'today' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Due Today</button>
          <button onClick={() => setFilter('week')} className={`px-3 py-1 rounded ${filter === 'week' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Due This Week</button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Assigned To</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading…</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No tasks found.</td></tr>
              ) : tasks.map(task => (
                <tr key={task.id} className="border-b">
                  <td className="px-4 py-2">{task.title}</td>
                  <td className="px-4 py-2">{formatDate(task.dueDate)}</td>
                  <td className="px-4 py-2">{task.status}</td>
                  <td className="px-4 py-2">{task.assignedTo?.name || task.assignedTo?.email || '—'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={`/tasks/${task.id}`} className="text-indigo-600 hover:underline">View</Link>
                    <Link href={`/tasks/${task.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
