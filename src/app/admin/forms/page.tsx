'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Form {
  id: string;
  name: string;
  description?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  stage?: { id: string; name: string };
  _count?: { responses: number };
}

export default function FormsAdminPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forms')
      .then(res => res.json())
      .then(data => {
        setForms(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Link href="/admin/forms/new" className="btn btn-primary">New Form</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Stage</th>
              <th>Published</th>
              <th>Responses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id}>
                <td>
                  <Link href={`/admin/forms/${form.id}`} className="text-blue-600 underline">{form.name}</Link>
                </td>
                <td>{form.description}</td>
                <td>{form.stage?.name || '-'}</td>
                <td>{form.published ? 'Yes' : 'No'}</td>
                <td>{form._count?.responses ?? 0}</td>
                <td>
                  <Link href={`/admin/forms/${form.id}/edit`} className="btn btn-xs btn-secondary mr-2">Edit</Link>
                  <Link href={`/f/${form.id}`} className="btn btn-xs btn-accent" target="_blank" rel="noopener noreferrer">View Public Page</Link>
                  <Link href={`/admin/forms/${form.id}/responses`} className="btn btn-xs">Responses</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
