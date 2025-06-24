"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NestedEmailBuilder from "@/components/NestedEmailBuilder";
import { cloudinaryUpload } from "@/utils/cloudinaryUpload";

interface MessageTemplateFormProps {
  template?: any;
  onSaved?: () => void;
  onClose?: () => void;
}

export default function MessageTemplateForm({
  template,
  onSaved,
  onClose,
}: MessageTemplateFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [emailHtml, setEmailHtml] = useState(template?.emailHtml || "");
  const [emailDesign, setEmailDesign] = useState<object | null>(
    template?.emailDesign || null
  );
  const [blocks, setBlocks] = useState<any[]>(template?.emailDesign || []);

  const variables = [
    { label: 'Agent Name', value: '{{agent.name}}' },
    { label: 'Agent Email', value: '{{agent.email}}' },
    { label: 'Agent Phone', value: '{{agent.phone}}' },
    { label: 'Lead School Name', value: '{{lead.schoolName}}' },
    { label: 'Lead Contact Name', value: '{{lead.contactName}}' },
    { label: 'Lead Email', value: '{{lead.email}}' },
    { label: 'Lead Phone', value: '{{lead.phone}}' },
    { label: 'Lead Address', value: '{{lead.address}}' },
  ];

  function copyToClipboard(text: string) {
    try {
      navigator.clipboard.writeText(text);
      // Optional feedback
      console.info(`Copied ${text}`);
    } catch (err) {
      alert('Failed to copy');
    }
  }
  const handleBuilderChange = (b: any[], html: string) => {
    setBlocks(b);
    setEmailDesign(b);
    setEmailHtml(html);
  };
  const [emailImages, setEmailImages] = useState<string[]>(
    template?.emailImages || []
  );
  const [emailAttachments, setEmailAttachments] = useState<
    Array<{ id: string; filename: string; url: string; mimetype?: string }>
  >(template?.emailAttachments || []);
  const [whatsappText, setWhatsappText] = useState(
    template?.whatsappText || ""
  );
  const [whatsappImages, setWhatsappImages] = useState<string[]>(
    template?.whatsappImages || []
  );
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string | undefined>(template?.id);
  const router = useRouter();
  
  const emailAttachmentInput = useRef<HTMLInputElement>(null);
  const whatsappImageInput = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"base" | "email" | "whatsapp">("base");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    let htmlToSave: string | null | undefined = emailHtml as any;
    // some server utilities may wrap the html inside a `{ status, value }` object – unwrap if so
    if (htmlToSave && typeof htmlToSave === "object" && "value" in htmlToSave) {
      htmlToSave = (htmlToSave as any).value;
    }
    let designToSave = emailDesign;

    const payload = {
      name,
      subject,
      emailHtml: htmlToSave,
      emailDesign: designToSave,
      emailImages,
      whatsappText,
      whatsappImages,
    };

    try {
      const response = await fetch(
        templateId ? `/api/messages/${templateId}` : "/api/messages",
        {
          method: templateId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!templateId) {
        const newId = data?.id ?? data?.template?.id ?? data?.messageTemplate?.id;
        if (newId) {
          setTemplateId(newId);
          router.replace(`/admin/messages/${newId}/edit`);
        }
      }
      if (!response.ok) throw new Error(data.error || "Failed to save template");
      setSuccess("Template saved successfully!");
      onSaved?.();
    } catch (err: any) {
      setError(err.message || "Failed to save template.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded shadow mx-auto">
      <div className="mb-6 flex border-b">
        {["base", "email", "whatsapp"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-700 font-bold"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab === "base"
              ? "Base Info"
              : tab === "email"
              ? "Email Template"
              : "WhatsApp Template"}
          </button>
        ))}
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <form onSubmit={handleSubmit}>
        {activeTab === "base" && (
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

        {activeTab === "email" && (
          <div className="mb-4 w-full">
            <div className="font-semibold mb-2 text-gray-700 text-sm">Available Variables</div>
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              {variables.map(v => (
                <button
                  key={v.value}
                  type="button"
                  className="px-2 py-1 rounded hover:bg-blue-100 text-blue-700 border border-blue-100 whitespace-nowrap"
                  onClick={() => copyToClipboard(v.value)}
                >
                  {v.label} <span className="text-gray-400">{v.value}</span>
                </button>
              ))}
            </div>

            <label className="block font-semibold mb-1">Email Body</label>
            <NestedEmailBuilder
              initialBlocks={blocks}
              onChange={handleBuilderChange}
            />
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">WhatsApp Message</label>
            <div className="flex w-full">
              <div className="w-56 mr-6 p-3 bg-gray-50 border rounded h-fit self-start">
                <div className="font-semibold mb-2 text-gray-700 text-sm">
                  Available Variables
                </div>
                <ul className="space-y-2 text-xs">
                  {[
                    { label: "Agent Name", value: "{{agent.name}}" },
                    { label: "Agent Email", value: "{{agent.email}}" },
                    { label: "Agent Phone", value: "{{agent.phone}}" },
                    { label: "Lead School Name", value: "{{lead.schoolName}}" },
                    { label: "Lead Contact Name", value: "{{lead.contactName}}" },
                    { label: "Lead Email", value: "{{lead.email}}" },
                    { label: "Lead Phone", value: "{{lead.phone}}" },
                    { label: "Lead Address", value: "{{lead.address}}" },
                  ].map((v) => (
                    <li key={v.value}>
                      <button
                        type="button"
                        className="w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700 border border-blue-100"
                        onClick={() => {
                          const textarea = document.getElementById(
                            "whatsapp-textarea"
                          ) as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const before = whatsappText.slice(0, start);
                            const after = whatsappText.slice(end);
                            const newText = before + v.value + after;
                            setWhatsappText(newText);
                            setTimeout(() => {
                              textarea.focus();
                              textarea.selectionStart =
                                textarea.selectionEnd = start + v.value.length;
                            }, 0);
                          } else {
                            setWhatsappText(whatsappText + v.value);
                          }
                        }}
                      >
                        {v.label}{" "}
                        <span className="text-gray-400">{v.value}</span>
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

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Template"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
