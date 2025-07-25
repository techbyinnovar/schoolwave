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
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-center w-full">Forms</h1>
        <Link href="/admin/forms/new" className="ml-4 btn btn-primary shadow">New Form</Link>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Published</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Responses</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {forms.map((form, idx) => (
                <tr
                  key={form.id}
                  className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50 transition' : 'bg-white hover:bg-blue-50 transition'}
                >
                  <td className="px-4 py-3 font-medium text-blue-700">
                    <Link href={`/admin/forms/${form.id}`} className="hover:underline">{form.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{form.description}</td>
                  <td className="px-4 py-3">{form.stage?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${form.published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{form.published ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{form._count?.responses ?? 0}</td>
                  <td className="px-4 py-3 space-x-1">
                    <Link href={`/admin/forms/${form.id}/edit`} className="btn btn-xs btn-secondary">Edit</Link>
                    <Link href={`/f/${form.id}`} className="btn btn-xs btn-accent" target="_blank" rel="noopener noreferrer">View Public Page</Link>
                    <Link href={`/admin/forms/${form.id}/responses`} className="btn btn-xs">Responses</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
