'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

const AdminAssetsPage = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(setAssets)
      .catch(() => setError('Failed to load assets'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    if (res.ok) setAssets(assets => assets.filter(a => a.id !== id));
    else alert('Failed to delete asset');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Link href="/admin/assets/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Asset</button>
        </Link>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8">Loading…</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No assets found.</td></tr>
            ) : (
              assets.map(asset => (
                <tr key={asset.id} className="border-b">
                  <td className="px-4 py-2 font-medium text-blue-700">
                    <Link href={`/admin/assets/${asset.id}/edit`} className="hover:underline">{asset.title}</Link>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{truncate(asset.description, 50)}</td>
                  <td className="px-4 py-2 text-center">{Array.isArray(asset.files) ? asset.files.length : 0}</td>
                  <td className="px-4 py-2 text-center">{Array.isArray(asset.links) ? asset.links.length : 0}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${asset.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{asset.published ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{asset.createdBy?.name || asset.createdBy?.email || '—'}</td>
                  <td className="px-4 py-2 text-gray-500">{new Date(asset.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={`/admin/assets/${asset.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAssetsPage;
