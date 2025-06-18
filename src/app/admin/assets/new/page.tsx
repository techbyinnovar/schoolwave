'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';

export default function NewAssetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  type AssetFile = { url: string; name?: string; type?: string };
  type AssetLink = { url: string; label: string };

  const [files, setFiles] = useState<AssetFile[]>([]);
  const [links, setLinks] = useState<AssetLink[]>([{ url: '', label: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (uploaded: AssetFile[]) => {
    setFiles(prev => [...prev, ...uploaded]);
    // Add images/videos to links
    const newLinks = uploaded
      .filter(f => f.type?.startsWith('image') || f.type?.startsWith('video'))
      .map(f => ({ url: f.url, label: f.name || (f.type?.startsWith('image') ? 'Image' : 'Video') }));
    if (newLinks.length > 0) setLinks(prev => [...prev, ...newLinks]);
  };

  const handleLinkChange = (i: number, field: keyof AssetLink, value: string) => {
    const newLinks = [...links];
    newLinks[i][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => setLinks([...links, { url: '', label: '' }]);
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  const isValidUrl = (url: string) => {
  try { new URL(url); return true; } catch { return false; }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('You must upload at least one file.');
      return;
    }
    // Only include links with valid url and label
    const filteredLinks = links.filter(l => l.url && l.label && isValidUrl(l.url));
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          files: files.map(f => ({
            url: f.url,
            name: f.name || f.url.split('/').pop() || 'file',
            type: f.type || 'application/octet-stream',
          })),
          links: filteredLinks,
          published: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to create asset');
      }
      router.push('/admin/assets');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-6">Create New Asset</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded p-6">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded min-h-[100px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Files</label>
          {/* Note: CloudinaryUploadWidget does not support a 'multiple' prop; handle multiple uploads by repeated use */}
<CloudinaryUploadWidget 
  onUploadSuccess={(file: AssetFile | AssetFile[]) => {
    if (Array.isArray(file)) handleFileUpload(file);
    else handleFileUpload([file]);
  }}
/>
          <ul className="mt-2">
            {files.map((file, i) => (
              <li key={i} className="text-sm text-gray-700">{file.name || file.url}</li>
            ))}
          </ul>
        </div>
        <div>
          <label className="block font-medium mb-1">Links</label>
          {links.map((link, i) => (
            <div className="flex gap-2 mb-2" key={i}>
              <input
                className="flex-1 border px-2 py-1 rounded"
                placeholder="URL"
                value={link.url}
                onChange={e => handleLinkChange(i, 'url', e.target.value)}
                required
              />
              <input
                className="flex-1 border px-2 py-1 rounded"
                placeholder="Label"
                value={link.label}
                onChange={e => handleLinkChange(i, 'label', e.target.value)}
                required
              />
              <button type="button" onClick={() => removeLink(i)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addLink} className="text-blue-600">+ Add Link</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Asset'}
        </button>
      </form>
    </div>
  );
}
