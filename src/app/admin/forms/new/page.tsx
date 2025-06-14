'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState('[\n  {"label": "Name", "type": "text", "name": "name", "required": true},\n  {"label": "Email", "type": "email", "name": "email", "required": true},\n  {"label": "Phone", "type": "text", "name": "phone", "required": true},\n  {"label": "School Name", "type": "text", "name": "schoolName", "required": false}\n]');
  const [stageId, setStageId] = useState('');
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, fields: JSON.parse(fields), stageId, published }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create form');
      router.push('/admin/forms');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">New Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Fields (JSON array)</label>
          <textarea className="textarea textarea-bordered w-full font-mono" rows={4} value={fields} onChange={e => setFields(e.target.value)} required />
          <div className="text-xs text-gray-500 mt-1">Example: [{'{'}"label":"Email","type":"email","name":"email","required":true{'}'}]</div>
        </div>
        <div>
          <label className="block font-medium">Stage ID (optional)</label>
          <input className="input input-bordered w-full" value={stageId} onChange={e => setStageId(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} id="published" />
          <label htmlFor="published">Published</label>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Form'}</button>
      </form>
    </div>
  );
}
