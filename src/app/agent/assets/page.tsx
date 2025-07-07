'use client';
import AdminSidebar from '@/components/AdminSidebar';
import React, { useEffect, useState } from 'react';

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

const AgentAssetsPage = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        console.log('Agent assets API response:', data);
        // Handle both direct array response and result.data pattern
        const assetsData = Array.isArray(data) ? data : (data.result?.data || []);
        // Filter for published assets only
        const publishedAssets = assetsData.filter((a: any) => a.published);
        console.log('Published assets count:', publishedAssets.length);
        setAssets(publishedAssets);
      })
      .catch((err) => {
        console.error('Error loading assets:', err);
        setError('Failed to load assets');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto py-8">
            <AdminSidebar/>
      <h1 className="text-2xl font-bold mb-8">Assets</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading…</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No assets found.</td></tr>
            ) : (
              assets.map(asset => (
                <tr key={asset.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-blue-700">{asset.title}</td>
                  <td className="px-4 py-2 text-gray-700">{truncate(asset.description, 50)}</td>
                  <td className="px-4 py-2 text-center">{Array.isArray(asset.files) ? asset.files.length : 0}</td>
                  <td className="px-4 py-2 text-center">{Array.isArray(asset.links) ? asset.links.length : 0}</td>
                  <td className="px-4 py-2 text-gray-500">{new Date(asset.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`/agent/assets/${asset.id}`}
                      className="inline-block px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition"
                      title="View Asset"
                    >
                      View
                    </a>
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

export default AgentAssetsPage;
