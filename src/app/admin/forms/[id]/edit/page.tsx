'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BannerImageUploader from '@/components/admin/forms/BannerImageUploader';

export default function EditFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState('');
  const [stageId, setStageId] = useState('');
  const [published, setPublished] = useState(false);
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setName(data.name);
        setDescription(data.description || '');
        setFields(JSON.stringify(data.fields, null, 2));
        setStageId(data.stageId || '');
        setPublished(!!data.published);
        setBannerImage(data.bannerImage || null);
        
        // Check if allowMultipleSubmissions is set in the form fields
        try {
          const fieldsObj = typeof data.fields === 'string' ? JSON.parse(data.fields) : data.fields;
          setAllowMultipleSubmissions(!!fieldsObj.allowMultipleSubmissions);
        } catch (e) {
          // If there's an error parsing the fields, default to false
          setAllowMultipleSubmissions(false);
        }
        
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // Parse the fields JSON and add the allowMultipleSubmissions setting
      let fieldsObj;
      try {
        fieldsObj = JSON.parse(fields);
      } catch (e) {
        throw new Error('Invalid JSON in fields');
      }
      
      // Add allowMultipleSubmissions to the fields object
      fieldsObj.allowMultipleSubmissions = allowMultipleSubmissions;
      
      const res = await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, fields: fieldsObj, stageId, published, bannerImage }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update form');
      router.push(`/admin/forms/${id}`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!form) return <div className="p-8 text-red-600">Form not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">Edit Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <BannerImageUploader value={bannerImage ?? undefined} onChange={setBannerImage} />
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
          <div className="text-xs text-gray-500 mt-1">Example: [{'{'}&quot;label&quot;:&quot;Email&quot;,&quot;type&quot;:&quot;email&quot;,&quot;name&quot;:&quot;email&quot;,&quot;required&quot;:true{'}'}]</div>
        </div>
        <div>
          <label className="block font-medium">Stage ID (optional)</label>
          <input className="input input-bordered w-full" value={stageId} onChange={e => setStageId(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} id="published" />
          <label htmlFor="published">Published</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            className="checkbox"
            checked={allowMultipleSubmissions} 
            onChange={e => setAllowMultipleSubmissions(e.target.checked)} 
            id="allowMultipleSubmissions" 
          />
          <label htmlFor="allowMultipleSubmissions">Allow multiple submissions from the same lead</label>
          <div className="tooltip" data-tip="If checked, the same lead can submit this form multiple times. If unchecked, leads can only submit this form once.">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button className="btn btn-primary" type="submit">Save Changes</button>
      </form>
    </div>
  );
}
