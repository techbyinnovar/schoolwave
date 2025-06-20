"use client";
import React, { useRef, useState } from "react";
import EmailEditor from "@/components/EmailEditor";
import { cloudinaryUpload } from '@/utils/cloudinaryUpload';

interface MessageTemplateFormProps {
  template?: any;
  onSaved?: () => void;
  onClose?: () => void;
}

export default function MessageTemplateForm({ template, onSaved, onClose }: MessageTemplateFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [emailHtml, setEmailHtml] = useState(template?.emailHtml || "");
  const [emailDesign, setEmailDesign] = useState<object | null>(template?.emailDesign || null);
  const emailEditorRef = useRef<any>(null);

  // For image URLs to embed in email body
  const [emailImages, setEmailImages] = useState<string[]>(template?.emailImages || []);
  // For uploaded attachment objects: { id, filename, url }
  const [emailAttachments, setEmailAttachments] = useState<Array<{ id: string, filename: string, url: string, mimetype?: string }>>(template?.emailAttachments || []);
  const [whatsappText, setWhatsappText] = useState(template?.whatsappText || "");
  const [whatsappImages, setWhatsappImages] = useState<string[]>(template?.whatsappImages || []);
  const [loading, setLoading] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const emailAttachmentInput = useRef<HTMLInputElement>(null);
  const whatsappImageInput = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'base' | 'email' | 'whatsapp'>('base');

  // Upload images for embedding in email body (Cloudinary)
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const uploaded: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      setError('Cloudinary config missing');
      return;
    }
    for (const file of Array.from(files)) {
      try {
        const result = await cloudinaryUpload(file, { cloudName, uploadPreset });
        if (result.url) uploaded.push(result.url);
      } catch (err) {
        setError('Image upload failed');
        console.error(err);
      }
    }
    setEmailImages(prev => [...prev, ...uploaded]);
  }

  // Upload files to be sent as attachments
  async function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const uploaded: Array<{ id: string, filename: string, url: string, mimetype?: string }> = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.attachmentId) {
        uploaded.push({ id: data.attachmentId, filename: data.filename, url: data.url, mimetype: data.mimetype });
      }
    }
    setEmailAttachments(prev => [...prev, ...uploaded]);
  }

  function handleRemoveAttachment(id: string) {
    setEmailAttachments(prev => prev.filter(att => att.id !== id));
  }

  function handleRemoveImage(url: string) {
    setEmailImages(prev => prev.filter(img => img !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    console.log('handleSubmit called');
    console.log('editorLoaded:', editorLoaded);
    console.log('emailEditorRef.current:', emailEditorRef.current);
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    let htmlToSave = emailHtml;
    let designToSave = emailDesign;

    if (activeTab === 'email' && emailEditorRef.current) {
      await new Promise<void>((resolve) => {
        emailEditorRef.current.exportHtml((data: any) => {
          setEmailHtml(data.html);
          setEmailDesign(data.design);
          htmlToSave = data.html;
          designToSave = data.design;
          resolve();
        });
      });
    }

    const payload = {
      name,
      subject,
      emailHtml: htmlToSave,
      emailDesign: designToSave,
      emailImages,
      whatsappText,
      whatsappImages,
    };
    console.log('Saving emailHtml to backend:', htmlToSave);

    try {
      const response = await fetch(
        template?.id ? `/api/messages/${template.id}` : '/api/messages',
        {
          method: template?.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save template');
      setSuccess('Template saved successfully!');
      onSaved?.();
      onClose?.() ?? (window.location.href = '/admin/messages');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Save error:', err);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-8 rounded shadow mx-auto">
      <div className="mb-6 flex border-b">
        {['base', 'email', 'whatsapp'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab === 'base' ? 'Base Info' : tab === 'email' ? 'Email Template' : 'WhatsApp Template'}
          </button>
        ))}
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <form onSubmit={handleSubmit}>
        {activeTab === 'base' && (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Name</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Subject</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </>
        )}

        {activeTab === 'email' && (
  <div className="flex w-full gap-6">
    <div className="flex-1">
      <div className="mb-4">
        <label className="block font-semibold mb-1">Email Body</label>
        <EmailEditor
          initialDesign={emailDesign || undefined}
          onExportHtml={(html, design) => {
            setEmailHtml(html);
            setEmailDesign(design);
          }}
        />
        <div className="text-xs text-gray-500 mt-2">
          You can insert variables using the merge tag dropdown in the editor above.
        </div>
      </div>
    </div>
  </div>
)}

        {activeTab === 'whatsapp' && (
  <div className="mb-4">
    <label className="block font-semibold mb-1">WhatsApp Message</label>
    <div className="flex w-full">
      <div className="w-56 mr-6 p-3 bg-gray-50 border rounded h-fit self-start">
        <div className="font-semibold mb-2 text-gray-700 text-sm">Available Variables</div>
        <ul className="space-y-2 text-xs">
          {[
            { label: 'Agent Name', value: '{{agent.name}}' },
            { label: 'Agent Email', value: '{{agent.email}}' },
            { label: 'Agent Phone', value: '{{agent.phone}}' },
            { label: 'Lead School Name', value: '{{lead.schoolName}}' },
            { label: 'Lead Contact Name', value: '{{lead.contactName}}' },
            { label: 'Lead Email', value: '{{lead.email}}' },
            { label: 'Lead Phone', value: '{{lead.phone}}' },
            { label: 'Lead Address', value: '{{lead.address}}' },
          ].map(v => (
            <li key={v.value}>
              <button
                type="button"
                className="w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700 border border-blue-100"
                onClick={() => {
                  // Insert variable at cursor position
                  const textarea = document.getElementById('whatsapp-textarea') as HTMLTextAreaElement;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const before = whatsappText.slice(0, start);
                    const after = whatsappText.slice(end);
                    const newText = before + v.value + after;
                    setWhatsappText(newText);
                    setTimeout(() => {
                      textarea.focus();
                      textarea.selectionStart = textarea.selectionEnd = start + v.value.length;
                    }, 0);
                  } else {
                    setWhatsappText(whatsappText + v.value);
                  }
                }}
              >
                {v.label} <span className="text-gray-400">{v.value}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <textarea
          id="whatsapp-textarea"
          className="w-full border px-3 py-2 rounded min-h-[120px]"
          value={whatsappText}
          onChange={(e) => setWhatsappText(e.target.value)}
        />
      </div>
    </div>
  </div>
)}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Template'}
        </button>
      </form>
    </div>
  );
}


