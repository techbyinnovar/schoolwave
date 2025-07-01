"use client";
import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NestedEmailBuilder from "@/components/NestedEmailBuilder";
import { cloudinaryUpload } from "@/utils/cloudinaryUpload";
import CloudinaryUploadWidget from "@/components/shared/CloudinaryUploadWidget";
import { toast } from "sonner";

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
  const [cloudinaryWhatsappMedia, setCloudinaryWhatsappMedia] = useState<string>("");
  // Track delivery options
  const [deliveryMediums, setDeliveryMediums] = useState<{
    email: boolean;
    whatsapp: boolean;
  }>({ email: true, whatsapp: false });
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
      emailHtml: deliveryMediums.email ? htmlToSave : '',
      emailDesign: designToSave,
      emailImages,
      whatsappText: deliveryMediums.whatsapp ? whatsappText : '',
      whatsappImages: deliveryMediums.whatsapp ? whatsappImages : [],
      deliveryMediums,
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
          <>
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
                    placeholder="Enter your WhatsApp message here. This text will be sent as a caption with any media."
                  />
                </div>
              </div>
            </div>
            
            {/* WhatsApp Media Upload Section */}
            <div className="mb-6 border-t pt-4 mt-6">
              <label className="block font-semibold mb-2">WhatsApp Media (Optional)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cloudinary Upload Widget */}
                <div>
                  <div className="mb-2">
                    <CloudinaryUploadWidget
                      onUploadSuccess={useCallback((result: any) => {
                        if (result?.secure_url) {
                          setCloudinaryWhatsappMedia(result.secure_url);
                          setWhatsappImages(prev => [...prev, result.secure_url]);
                          toast.success('Media uploaded successfully');
                        }
                      }, [])}
                      buttonText="Upload Media to WhatsApp"
                      folder="whatsapp-media"
                      resourceType="auto"
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: Images, Videos, PDFs (max 5MB)
                  </p>
                </div>
                
                {/* Preview Area */}
                <div>
                  {whatsappImages.length > 0 ? (
                    <div>
                      <p className="font-medium text-sm mb-2">
                        {whatsappImages.length} Media {whatsappImages.length === 1 ? 'File' : 'Files'}
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                        {whatsappImages.map((url, index) => (
                          <div key={index} className="flex items-center justify-between text-sm p-1 hover:bg-gray-50">
                            <div className="truncate flex-1">
                              {url.includes('image') ? '🖼️' : 
                               url.includes('video') ? '🎬' : 
                               url.includes('pdf') ? '📄' : '📎'} {url.split('/').pop()}
                            </div>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800 px-2"
                              onClick={() => {
                                setWhatsappImages(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      {whatsappImages.length > 0 && (
                        <button
                          type="button"
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                          onClick={() => setWhatsappImages([])}
                        >
                          Clear All Media
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded p-4 text-center text-gray-500">
                      No media files selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delivery Options */}
        <div className="mt-6 border-t pt-4">
          <label className="block font-semibold mb-2">Delivery Options</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deliveryMediums.email}
                onChange={(e) => setDeliveryMediums(prev => ({ ...prev, email: e.target.checked }))}
                className="mr-2 h-4 w-4"
              />
              <span>Send as Email</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deliveryMediums.whatsapp}
                onChange={(e) => setDeliveryMediums(prev => ({ ...prev, whatsapp: e.target.checked }))}
                className="mr-2 h-4 w-4"
              />
              <span>Send as WhatsApp</span>
            </label>
          </div>
          
          {/* Validation warnings */}
          {!deliveryMediums.email && !deliveryMediums.whatsapp && (
            <p className="text-amber-600 text-sm mt-2">
              Please select at least one delivery method
            </p>
          )}
          {deliveryMediums.email && emailHtml === '' && (
            <p className="text-amber-600 text-sm mt-1">
              Warning: Email is selected but email content is empty
            </p>
          )}
          {deliveryMediums.whatsapp && whatsappText === '' && (
            <p className="text-amber-600 text-sm mt-1">
              Warning: WhatsApp is selected but message content is empty
            </p>
          )}
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading || (!deliveryMediums.email && !deliveryMediums.whatsapp)}
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
