"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useSession } from "next-auth/react";
import MinimalEmailEditor from "@/components/MinimalEmailEditor";

interface Lead {
  id: string;
  name: string;
  assignedTo?: string;
  [key: string]: any;
}

interface Stage {
  id: string;
  name: string;
  [key: string]: any;
}

interface Template {
  id: string;
  name?: string;
  subject?: string;
  emailHtml?: string;
  whatsappText?: string;
  [key: string]: any;
}

export default function SendMessagePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectByStage, setSelectByStage] = useState(false);

  const [subject, setSubject] = useState("");
  const [medium, setMedium] = useState("email");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingStages, setLoadingStages] = useState(true);
  const [errorLeads, setErrorLeads] = useState<string | null>(null);
  const [errorStages, setErrorStages] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    // Fetch leads
    fetch("/api/lead")
      .then(res => res.json())
      .then(data => {
        let fetchedLeads = data.result?.data || [];
        if (userRole === "AGENT" && userId) {
          fetchedLeads = fetchedLeads.filter((lead: Lead) => lead.assignedTo === userId);
        }
        setLeads(fetchedLeads);
        setLoadingLeads(false);
      })
      .catch(() => {
        setErrorLeads("Failed to fetch leads");
        setLoadingLeads(false);
      });

    // Fetch stages
    fetch("/api/stage")
      .then(res => res.json())
      .then(data => {
        setStages(data.result?.data || []);
        setLoadingStages(false);
      })
      .catch(() => {
        setErrorStages("Failed to fetch stages");
        setLoadingStages(false);
      });

    // Fetch templates
    fetch("/api/message-template")
      .then(res => res.json())
      .then(data => {
        setTemplates(data.result?.data || []);
      });
  }, [userId, userRole]);

  const handleSend = async () => {
    setSendError(null);
    setSendSuccess(null);
    setSending(true);

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectByStage ? selectedStages : selectedLeads,
          medium,
          subject,
          body,
          templateId: selectedTemplateId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setSendSuccess("Message(s) sent successfully!");
    } catch (err: any) {
      setSendError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-4xl bg-white rounded shadow p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-700">Send Message</h1>

          {/* Recipient Selection */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Recipients</label>
            <div className="flex items-center gap-4 mb-2">
              <input
                id="selectByStage"
                type="checkbox"
                checked={selectByStage}
                onChange={() => {
                  setSelectByStage(v => !v);
                  setSelectedLeads([]);
                  setSelectedStages([]);
                }}
                className="mr-2"
              />
              <label htmlFor="selectByStage" className="text-sm cursor-pointer select-none">
                Select by Stage
              </label>
            </div>

            {selectByStage ? (
              loadingStages ? (
                <div>Loading stages...</div>
              ) : errorStages ? (
                <div className="text-red-500 text-sm">{errorStages}</div>
              ) : (
                <Select
                  isMulti
                  options={stages.map(stage => ({ value: stage.id, label: stage.name }))}
                  value={stages
                    .filter(stage => selectedStages.includes(stage.id))
                    .map(stage => ({ value: stage.id, label: stage.name }))}
                  onChange={opts => setSelectedStages((opts ?? []).map(opt => opt.value))}
                  placeholder="Select lead stages..."
                  className="min-w-[240px]"
                />
              )
            ) : loadingLeads ? (
              <div>Loading leads...</div>
            ) : errorLeads ? (
              <div className="text-red-500 text-sm">{errorLeads}</div>
            ) : (
              <Select
                isMulti
                options={leads.map(lead => ({ value: lead.id, label: lead.name }))}
                value={leads
                  .filter(lead => selectedLeads.includes(lead.id))
                  .map(lead => ({ value: lead.id, label: lead.name }))}
                onChange={opts => setSelectedLeads((opts ?? []).map(opt => opt.value))}
                placeholder="Select leads..."
                className="min-w-[240px]"
              />
            )}
          </div>

          {/* Medium & Subject */}
          <div className="mb-6 flex gap-4">
            <div>
              <label className="block font-semibold mb-2">Medium</label>
              <select
                className="border rounded px-2 py-2 min-w-[120px]"
                value={medium}
                onChange={e => setMedium(e.target.value)}
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2">Subject</label>
              <input
                className="border rounded w-full px-3 py-2"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter subject"
                disabled={!!selectedTemplate}
              />
            </div>
          </div>

          {/* Template Selector */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Message Template (optional)</label>
            <Select
              options={templates.map(t => ({
                value: t.id,
                label: t.name?.trim() || t.subject?.trim() || t.id,
                subject: t.subject,
                emailHtml: t.emailHtml,
                whatsappText: t.whatsappText,
              }))}
              value={templates
                .filter(t => t.id === selectedTemplateId)
                .map(t => ({
                  value: t.id,
                  label: t.name?.trim() || t.subject?.trim() || t.id,
                  subject: t.subject,
                  emailHtml: t.emailHtml,
                  whatsappText: t.whatsappText,
                }))}
              onChange={opt => setSelectedTemplateId(opt ? opt.value : "")}
              isClearable
              placeholder={templates.length === 0 ? "No templates found." : "Select a message template..."}
              className="min-w-[340px]"
              components={{
                Option: (props) => {
                  const { data } = props;
                  const preview = medium === "email"
                    ? data.emailHtml?.replace(/<[^>]+>/g, "").slice(0, 80)
                    : data.whatsappText?.slice(0, 80);
                  return (
                    <div {...props.innerProps} className={props.isFocused ? "bg-blue-50 px-3 py-2" : "px-3 py-2"}>
                      <div className="font-semibold">{data.label}</div>
                      {data.subject && <div className="text-xs text-gray-600">Subject: {data.subject}</div>}
                      {preview && (
                        <div className="text-xs text-gray-500 truncate">
                          {preview}{preview.length === 80 ? "..." : ""}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </div>

          {/* Email Editor */}
          {medium === "email" ? (
            <MinimalEmailEditor
              initialHtml={selectedTemplate?.emailHtml || body}
              onExportHtml={setBody}
              // TODO: Add support for disabling the editor if needed
            />
          ) : (
            <textarea
              className="w-full border rounded p-3 mb-4"
              rows={6}
              value={selectedTemplate?.whatsappText || body}
              onChange={e => setBody(e.target.value)}
              disabled={!!selectedTemplate}
              placeholder="Enter WhatsApp message..."
            />
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 text-white rounded px-6 py-2 hover:bg-blue-700"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>

          {/* Feedback */}
          {sendSuccess && <div className="text-green-600 mt-4">{sendSuccess}</div>}
          {sendError && <div className="text-red-600 mt-4">{sendError}</div>}
        </div>
      </main>
    </div>
  );
}
