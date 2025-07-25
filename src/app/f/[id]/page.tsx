'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FileUploadField from '@/components/form/FileUploadField';

function renderField(field: any, value: any, setValue: (v: any) => void) {
  switch (field.type) {
    case 'email':
      return <input type="email" className="input input-bordered w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'text':
      return <input type="text" className="input input-bordered w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'textarea':
      return <textarea className="textarea textarea-bordered w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'number':
      return <input type="number" className="input input-bordered w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'fileUpload':
      return (
        <FileUploadField
          value={value || (field.allowMultiple ? [] : '')}
          onChange={setValue}
          label={field.label}
          required={field.required}
          maxSize={field.maxSize}
          allowedTypes={field.allowedTypes}
          allowMultiple={field.allowMultiple}
        />
      );
    default:
      return <input type="text" className="input input-bordered w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
  }
}

export default function PublicFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [values, setValues] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Form data:', data);
        console.log('Form fields type:', typeof data.fields);
        console.log('Is array:', Array.isArray(data.fields));
        
        // If fields is a string, try to parse it
        if (typeof data.fields === 'string') {
          try {
            data.fields = JSON.parse(data.fields);
            console.log('Parsed fields:', data.fields);
          } catch (e) {
            console.error('Failed to parse fields:', e);
          }
        }
        
        setForm(data);
        setLoading(false);
      });
  }, [id]);

  function setFieldValue(name: string, value: any) {
    setValues((v: any) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Compose lead fields and response fields
      const leadFields = ['name', 'email', 'phone', 'schoolName'];
      const lead: any = {};
      const responseData: any = {};
      
      // Handle fields whether they're an array or object
      const fieldsArray = Array.isArray(form.fields) 
        ? form.fields 
        : typeof form.fields === 'object' && form.fields !== null 
          ? Object.values(form.fields) 
          : [];
          
      fieldsArray.forEach((f: any) => {
        if (leadFields.includes(f.name)) {
          lead[f.name] = values[f.name] || '';
        } else {
          responseData[f.name] = values[f.name] || '';
        }
      });
      const res = await fetch('/api/form_responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          formId: id,
          stageId: form.stageId,
          responseData,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Submission failed');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-white dark:text-white">Loading...</div>;
  if (!form || !form.published) return <div className="p-8 text-red-600 dark:text-red-400">Form not found or not published</div>;
  if (submitted) return <div className="max-w-lg mx-auto p-8 text-center text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">Thank you! Your response has been submitted.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#00164E] bg-[url('/sch_elementwhite.png')] bg-contain bg-center">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="max-w-2xl w-full mx-auto py-10 px-4 bg-white bg-opacity-95 rounded-xl shadow-lg">
          {form?.bannerImage && (
            <img
              src={form.bannerImage}
              alt="Form Banner"
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">{form?.name}</h1>
          <p className="mb-6 text-center text-gray-700 dark:text-gray-300">{form?.description}</p>
          <form className="space-y-4" onSubmit={handleSubmit}>

            {Array.isArray(form?.fields) ? (
              form.fields.map((field: any) => (
                <div key={field.name}>
                  <label className="block mb-1 font-semibold text-gray-900 dark:text-white">{field.label || field.name}{field.required && <span className="text-red-500 dark:text-red-400">*</span>}</label>
                  {renderField(field, values[field.name], (v: any) => setFieldValue(field.name, v))}
                </div>
              ))
            ) : typeof form?.fields === 'object' && form?.fields !== null ? (
              // If fields is an object but not array, try to convert to array
              Object.values(form.fields).map((field: any, index: number) => (
                <div key={index}>
                  <label className="block mb-1 font-semibold text-gray-900 dark:text-white">{field.label || field.name}{field.required && <span className="text-red-500 dark:text-red-400">*</span>}</label>
                  {renderField(field, values[field.name], (v: any) => setFieldValue(field.name, v))}
                </div>
              ))
            ) : (
              <div className="text-yellow-600 p-4 bg-yellow-100 rounded">No form fields available</div>
            )}
            {error && <div className="alert alert-error text-white dark:text-white">{error}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
