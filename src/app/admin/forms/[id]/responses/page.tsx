import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FormResponsesPage() {
  const { id } = useParams() as { id: string };
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setResponses(data.responses || []);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Form Responses</h1>
      {loading ? (
        <div>Loading...</div>
      ) : responses.length === 0 ? (
        <div>No responses yet.</div>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Submitted</th>
              <th>Response Data</th>
            </tr>
          </thead>
          <tbody>
            {responses.map(r => (
              <tr key={r.id}>
                <td>{r.leadId}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(r.responseData, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
