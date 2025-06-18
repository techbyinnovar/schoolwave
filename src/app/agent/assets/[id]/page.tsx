'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AssetPreviewCarousel from './AssetPreviewCarousel';

const AssetDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/assets/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.published) throw new Error('Not found');
        setAsset(data);
      })
      .catch(() => setError('Could not load asset'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto py-8">Loading…</div>;
  if (error || !asset) return <div className="max-w-2xl mx-auto py-8 text-red-600">{error || 'Asset not found'}</div>;

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 max-w-[75%] mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{asset.title}</h1>
        <div className="mb-4 text-gray-700 whitespace-pre-line">{asset.description}</div>
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Files</h2>
          {/* Preview section for images and videos with modal carousel */}
          {Array.isArray(asset.files) && asset.files.length > 0 && (
            <AssetPreviewCarousel files={asset.files} />
          )}


        </div>
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Links</h2>
          {Array.isArray(asset.links) && asset.links.length > 0 ? (
            <ul className="list-disc ml-6">
              {asset.links.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : <span className="text-gray-400">No links.</span>}
        </div>
        <div className="text-sm text-gray-500">Created: {new Date(asset.createdAt).toLocaleString()}</div>
      </main>
    </div>
  );
};

export default AssetDetailPage;
