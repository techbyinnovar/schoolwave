import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FormDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setLoading(false);
      });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this form?')) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete');
      router.push('/admin/forms');
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handlePublish(published: boolean) {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update');
      setForm({ ...form, published });
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!form) return <div className="p-8 text-red-600">Form not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{form.name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/forms/${id}/edit`} className="btn btn-xs btn-secondary">Edit</Link>
          <button className="btn btn-xs btn-error" onClick={handleDelete}>Delete</button>
        </div>
      </div>
      <div className="mb-4">
        <div className="font-medium">Description:</div>
        <div>{form.description || <span className="text-gray-400">No description</span>}</div>
      </div>
      <div className="mb-4">
        <div className="font-medium">Stage:</div>
        <div>{form.stage?.name || <span className="text-gray-400">None</span>}</div>
      </div>
      <div className="mb-4">
        <div className="font-medium">Published:</div>
        <div>
          <span className={form.published ? 'text-green-600' : 'text-gray-400'}>{form.published ? 'Yes' : 'No'}</span>
          <button className="btn btn-xs ml-4" onClick={() => handlePublish(!form.published)}>{form.published ? 'Unpublish' : 'Publish'}</button>
        </div>
      </div>
      <div className="mb-4">
        <div className="font-medium">Fields:</div>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{JSON.stringify(form.fields, null, 2)}</pre>
      </div>
      <div>
        <Link href={`/admin/forms/${id}/responses`} className="btn btn-sm">View Responses</Link>
      </div>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
