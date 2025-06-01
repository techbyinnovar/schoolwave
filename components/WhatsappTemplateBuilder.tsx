import React from "react";

interface WhatsappTemplateBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

const variables = [
  { label: "Agent Name", value: "{{agent.name}}" },
  { label: "Agent Email", value: "{{agent.email}}" },
  { label: "Agent Phone", value: "{{agent.phone}}" },
  { label: "Lead School Name", value: "{{lead.schoolName}}" },
  { label: "Lead Contact Name", value: "{{lead.contactName}}" },
  { label: "Lead Email", value: "{{lead.email}}" },
  { label: "Lead Phone", value: "{{lead.phone}}" },
  { label: "Lead Address", value: "{{lead.address}}" },
];

export default function WhatsappTemplateBuilder({ value, onChange }: WhatsappTemplateBuilderProps) {
  return (
    <div className="flex w-full gap-6">
      <div className="w-56 mr-6 p-3 bg-gray-50 border rounded h-fit self-start">
        <div className="font-semibold mb-2 text-gray-700 text-sm">Available Variables</div>
        <ul className="space-y-2 text-xs">
          {variables.map(v => (
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
                    const before = value.slice(0, start);
                    const after = value.slice(end);
                    const newText = before + v.value + after;
                    onChange(newText);
                    setTimeout(() => {
                      textarea.focus();
                      textarea.selectionStart = textarea.selectionEnd = start + v.value.length;
                    }, 0);
                  } else {
                    onChange(value + v.value);
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
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Compose your WhatsApp message template here..."
        />
      </div>
    </div>
  );
}
