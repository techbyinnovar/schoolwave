'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BannerImageUploader from '@/components/admin/forms/BannerImageUploader';
import ChoiceOptionsEditor from '@/components/admin/forms/ChoiceOptionsEditor';

export default function EditFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Define field type
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
  
  const [fields, setFields] = useState<FieldType[]>([]);
  const [stages, setStages] = useState<{id: string, name: string}[]>([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [stageId, setStageId] = useState('');
  const [published, setPublished] = useState(false);
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to handle field changes
  function handleFieldChange(idx: number, key: string, value: any) {
    setFields(f => f.map((field, i) => i === idx ? { ...field, [key]: value } : field));
  }

  function addField() {
    setFields(f => [...f, { label: '', type: 'text', name: '', required: false }]);
  }

  function removeField(idx: number) {
    setFields(f => f.filter((_, i) => i !== idx));
  }
  
  // Fetch form data and stages
  useEffect(() => {
    // Fetch form data
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setName(data.name);
        setDescription(data.description || '');
        
        // Parse fields data
        let fieldsArray = [];
        try {
          const fieldsData = typeof data.fields === 'string' ? JSON.parse(data.fields) : data.fields;
          
          // Check if fields is an array
          if (Array.isArray(fieldsData)) {
            fieldsArray = fieldsData;
          } 
          // Check if fields is an object with numeric keys (like {0: {...}, 1: {...}})
          else if (typeof fieldsData === 'object' && fieldsData !== null) {
            // If allowMultipleSubmissions is a property, extract it first
            if ('allowMultipleSubmissions' in fieldsData) {
              setAllowMultipleSubmissions(!!fieldsData.allowMultipleSubmissions);
              // Remove it from the object before processing fields
              const { allowMultipleSubmissions, ...restFields } = fieldsData;
              fieldsArray = Object.values(restFields);
            } else {
              fieldsArray = Object.values(fieldsData);
            }
          }
        } catch (e) {
          console.error('Error parsing fields:', e);
          fieldsArray = [];
        }
        
        setFields(fieldsArray);
        setStageId(data.stageId || '');
        setPublished(!!data.published);
        setBannerImage(data.bannerImage || null);
        setLoading(false);
      });
      
    // Fetch stages for dropdown
    setLoadingStages(true);
    fetch('/api/stages', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load stages: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setStages(data);
        setLoadingStages(false);
      })
      .catch(err => {
        console.error('Failed to load stages:', err);
        setLoadingStages(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // Create a fields object that includes the allowMultipleSubmissions setting
      const fieldsWithSettings = {
        ...fields,
        allowMultipleSubmissions: allowMultipleSubmissions
      };
      
      const res = await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, fields: fieldsWithSettings, stageId, published, bannerImage }),
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
          <label className="block font-medium">Stage (optional)</label>
          <select 
            className="select select-bordered w-full" 
            value={stageId} 
            onChange={e => setStageId(e.target.value)}
          >
            <option value="">Select a stage</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
          {loadingStages && <div className="text-sm text-gray-500 mt-1">Loading stages...</div>}
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
