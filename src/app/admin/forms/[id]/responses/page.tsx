'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FormResponsesPage() {
  const { id } = useParams() as { id: string };
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        // Fix: Access FormResponse instead of responses
        setResponses(data.FormResponse || []);
        setLoading(false);
      });
  }, [id]);

  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  
  // Ensure form.fields is an array before filtering
  const getFieldsArray = () => {
    if (!form?.fields) return [];
    
    // If fields is already an array
    if (Array.isArray(form.fields)) {
      return form.fields;
    }
    
    // If fields is a string (JSON), try to parse it
    if (typeof form.fields === 'string') {
      try {
        const parsed = JSON.parse(form.fields);
        // Check if parsed result is an array
        if (Array.isArray(parsed)) {
          return parsed;
        }
        // If it's an object with numeric keys or allowMultipleSubmissions property
        if (typeof parsed === 'object' && parsed !== null) {
          // If allowMultipleSubmissions is a property, remove it before processing fields
          if ('allowMultipleSubmissions' in parsed) {
            const { allowMultipleSubmissions, ...restFields } = parsed;
            return Object.values(restFields);
          }
          return Object.values(parsed);
        }
      } catch (e) {
        console.error('Error parsing form fields:', e);
        return [];
      }
    }
    
    // If fields is an object with numeric keys
    if (typeof form.fields === 'object' && form.fields !== null) {
      // If allowMultipleSubmissions is a property, remove it before processing fields
      if ('allowMultipleSubmissions' in form.fields) {
        const { allowMultipleSubmissions, ...restFields } = form.fields;
        return Object.values(restFields);
      }
      return Object.values(form.fields);
    }
    
    return [];
  };
  
  const fieldsArray = getFieldsArray();
  const requiredFields = fieldsArray.filter((f: any) => f.required) || [];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Form Responses</h1>

      {loading ? (
        <div>Loading...</div>
      ) : !form ? (
        <div>Form not found.</div>
      ) : responses.length === 0 ? (
        <div>No responses yet.</div>
      ) : (
        <>
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Submitted</th>
              {requiredFields.map((field: any) => (
                <th key={field.name} className="border px-4 py-2 text-left">{field.label || field.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map(r => (
              <tr key={r.id} className="even:bg-gray-50 cursor-pointer hover:bg-indigo-50" onClick={() => setSelectedResponse(r)}>
                <td className="border px-4 py-2 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                {requiredFields.map((field: any) => {
                  // Try to get standard fields directly from the lead object
                  let value;
                  if (field.name === 'name' || field.name === 'email' || field.name === 'phone' || field.name === 'schoolName') {
                    value = r.Lead?.[field.name];
                  } else {
                    // For other fields, check the response JSON object
                    value = r.response?.[field.name];
                  }
                  if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
                  if (value === undefined || value === null || value === '') value = '-';
                  return (
                    <td key={field.name} className="border px-4 py-2 text-xs">{value}</td>
                  );
                })}

              </tr>
            ))}
          </tbody>
        </table>
        {/* Modal for full response details */}
        {selectedResponse && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setSelectedResponse(null)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Response Details</h2>
              <div className="mb-4 text-xs text-gray-500">Submitted: {new Date(selectedResponse.createdAt).toLocaleString()}</div>
              <table className="w-full text-sm mb-2">
                <tbody>
                  {fieldsArray.map((field: any) => {
                    let value;
                    if (field.name === 'name' || field.name === 'email' || field.name === 'phone' || field.name === 'schoolName') {
                      value = selectedResponse.Lead?.[field.name];
                    } else {
                      value = selectedResponse.response?.[field.name];
                    }
                    if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
                    if (value === undefined || value === null || value === '') value = '-';
                    return (
                      <tr key={field.name}>
                        <td className="font-semibold pr-2 align-top w-1/3">{field.label || field.name}</td>
                        <td className="break-all">{value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Debug: raw responseData */}
              <div className="mt-2 text-xs text-gray-400">
                <div>Raw responseData:</div>
                <pre className="bg-gray-100 rounded p-2 whitespace-pre-wrap">{JSON.stringify(selectedResponse.responseData, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}
