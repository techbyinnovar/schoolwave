'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [links, setLinks] = useState([{ url: '', label: '' }]);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/assets/${id}`)
      .then(res => res.json())
      .then(asset => {
        setTitle(asset.title);
        setDescription(asset.description);
        setFiles(Array.isArray(asset.files) ? asset.files : []);
        setLinks(Array.isArray(asset.links) && asset.links.length ? asset.links : [{ url: '', label: '' }]);
        setPublished(!!asset.published);
      })
      .catch(() => setError('Failed to load asset'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileUpload = (uploaded: { url: string; public_id: string; resource_type: string }) => {
    // For backward compatibility, create a file object with url, name, and type
    const fileObj = {
      url: uploaded.url,
      name: uploaded.public_id || uploaded.url.split('/').pop() || 'file',
      type: uploaded.resource_type || 'application/octet-stream',
    };
    setFiles(prev => [...prev, fileObj]);
    // If it's an image, add to links
    if (uploaded.resource_type === 'image') {
      setLinks(prev => [...prev, { url: uploaded.url, label: fileObj.name || 'Image' }]);
    }
  };


  const handleLinkChange = (i: number, field: 'url' | 'label', value: string) => {
    const newLinks = [...links];
    newLinks[i][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => setLinks([...links, { url: '', label: '' }]);
  const removeLink = (i: number) => setLinks(links.filter((_: any, idx: number) => idx !== i));

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
      const res = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          files: files.map(f => ({
            url: f.url,
            name: f.name || (typeof f.url === 'string' ? f.url.split('/').pop() : 'file'),
            type: f.type || 'application/octet-stream',
          })),
          links: filteredLinks,
          published,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to update asset');
      }
      router.push('/admin/assets');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-8">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-6">Edit Asset</h1>
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
          <CloudinaryUploadWidget onUploadSuccess={handleFileUpload} />
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
        <div>
          <label className="block font-medium mb-1">Published</label>
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
          /> <span className="ml-2">Visible to agents</span>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
