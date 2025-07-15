'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChoiceOptionsEditor from '@/components/admin/forms/ChoiceOptionsEditor';
import BannerImageUploader from '@/components/admin/forms/BannerImageUploader';

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  type FieldType = {
    label: string;
    type: string;
    name: string;
    required: boolean;
    options?: string[];
    maxSize?: number; // in MB
    allowedTypes?: string; // comma-separated MIME types or extensions
    allowMultiple?: boolean; // allow multiple files
  };
  const [fields, setFields] = useState<FieldType[]>([
    { label: 'Name', type: 'text', name: 'name', required: true },
    { label: 'Email', type: 'email', name: 'email', required: true },
    { label: 'Phone', type: 'text', name: 'phone', required: true },
    { label: 'School Name', type: 'text', name: 'schoolName', required: false }
  ]);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  function handleFieldChange(idx: number, key: string, value: any) {
    setFields(f => f.map((field, i) => i === idx ? { ...field, [key]: value } : field));
  }

  function addField() {
    setFields(f => [...f, { label: '', type: 'text', name: '', required: false }]);
  }

  function removeField(idx: number) {
    setFields(f => f.filter((_, i) => i !== idx));
  }
  const [stageId, setStageId] = useState('');
  const [published, setPublished] = useState(false);
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Create a fields object that includes the allowMultipleSubmissions setting
      const fieldsWithSettings = {
        ...fields,
        allowMultipleSubmissions: allowMultipleSubmissions
      };
      
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description, 
          fields: fieldsWithSettings, 
          stageId, 
          published, 
          bannerImage 
        }),
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
          <label className="block font-medium mb-2">Fields</label>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={idx} className="border p-3 rounded bg-gray-50">
                <div className="flex gap-2 mb-2">
                  <input
                    className="input input-bordered flex-1"
                    placeholder="Label"
                    value={field.label}
                    onChange={e => handleFieldChange(idx, 'label', e.target.value)}
                    required
                  />
                  <select
                    className="select select-bordered"
                    value={field.type}
                    onChange={e => {
                      const newType = e.target.value;
                      handleFieldChange(idx, 'type', newType);
                      // Initialize options for choice fields if not present
                      if ((newType === 'singleChoice' || newType === 'multiChoice') && !field.options) {
                        handleFieldChange(idx, 'options', ['']);
                      }
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="textarea">Textarea</option>
                    <option value="singleChoice">Single Choice (Radio)</option>
                    <option value="multiChoice">Multi Choice (Checkboxes)</option>
                    <option value="fileUpload">File Upload</option>
                  </select>
                  <input
                    className="input input-bordered flex-1"
                    placeholder="Name"
                    value={field.name}
                    onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                    required
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => handleFieldChange(idx, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                  <button type="button" className="btn btn-error btn-sm" onClick={() => removeField(idx)} disabled={fields.length <= 1}>
                    Remove
                  </button>
                </div>
                {/* Render options editor for choice fields */}
                {(field.type === 'singleChoice' || field.type === 'multiChoice') && (
                  <div className="mt-2">
                    {/* Lazy import to avoid SSR issues */}
                    {/* @ts-ignore */}
                    {typeof window !== 'undefined' && (
                      <ChoiceOptionsEditor
                        options={field.options || ['']}
                        setOptions={(opts: string[]) => handleFieldChange(idx, 'options', opts)}
                        multiple={field.type === 'multiChoice'}
                      />
                    )}
                  </div>
                )}
                {/* Render file upload config for fileUpload fields */}
                {field.type === 'fileUpload' && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium">Max File Size (MB):</label>
                      <input
                        type="number"
                        min={1}
                        className="input input-bordered w-24"
                        value={field.maxSize ?? ''}
                        onChange={e => handleFieldChange(idx, 'maxSize', Number(e.target.value))}
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium">Allowed Types:</label>
                      <input
                        type="text"
                        className="input input-bordered flex-1"
                        value={field.allowedTypes ?? ''}
                        onChange={e => handleFieldChange(idx, 'allowedTypes', e.target.value)}
                        placeholder="e.g. image/*, .pdf, .docx"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={field.allowMultiple || false}
                        onChange={e => handleFieldChange(idx, 'allowMultiple', e.target.checked)}
                        id={`allow-multiple-${idx}`}
                      />
                      <label htmlFor={`allow-multiple-${idx}`} className="text-sm">Allow multiple files</label>
                    </div>
                    <div className="text-xs text-gray-500">Comma-separated list of allowed MIME types or extensions. E.g. <code>image/*, .pdf, .docx</code></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-sm mt-2" onClick={addField}>Add Field</button>
        </div>
        <div>
          <label className="block font-medium">Stage ID (optional)</label>
          <input className="input input-bordered w-full" value={stageId} onChange={e => setStageId(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
          />
          <label>Publish form</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox"
            checked={allowMultipleSubmissions}
            onChange={e => setAllowMultipleSubmissions(e.target.checked)}
          />
          <label>Allow multiple submissions from the same lead</label>
          <div className="tooltip" data-tip="If checked, the same lead can submit this form multiple times. If unchecked, leads can only submit this form once.">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Form'}</button>
      </form>
    </div>
  );
}
