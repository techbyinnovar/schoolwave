import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

function renderField(field: any, value: any, setValue: (v: any) => void) {
  switch (field.type) {
    case 'email':
      return <input type="email" className="input input-bordered w-full" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'text':
      return <input type="text" className="input input-bordered w-full" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'textarea':
      return <textarea className="textarea textarea-bordered w-full" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    case 'number':
      return <input type="number" className="input input-bordered w-full" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
    default:
      return <input type="text" className="input input-bordered w-full" required={field.required} value={value || ''} onChange={e => setValue(e.target.value)} placeholder={field.label} />;
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
      form.fields.forEach((f: any) => {
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!form || !form.published) return <div className="p-8 text-red-600">Form not found or not published</div>;
  if (submitted) return <div className="max-w-lg mx-auto p-8 text-center text-green-700">Thank you! Your response has been submitted.</div>;

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">{form.name}</h1>
      <div className="mb-4 text-gray-600">{form.description}</div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {form.fields.map((field: any) => (
          <div key={field.name}>
            <label className="block font-medium mb-1">{field.label}{field.required && ' *'}</label>
            {renderField(field, values[field.name], v => setFieldValue(field.name, v))}
          </div>
        ))}
        {error && <div className="text-red-600">{error}</div>}
        <button className="btn btn-primary w-full" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  );
}
