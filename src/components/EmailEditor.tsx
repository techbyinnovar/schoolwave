import React, { useRef, useImperativeHandle, useState, useEffect } from 'react';
import EmailEditor from '@editex/react-email-editor';

export interface EmailEditorProps {
  initialDesign?: any;
  onExportHtml?: (html: string, design: object) => void;
  onLoad?: () => void;
  onReady?: () => void;
  style?: React.CSSProperties;
}

const variables = [
  { label: 'Agent Name', value: '{{agent.name}}' },
  { label: 'Agent Email', value: '{{agent.email}}' },
  { label: 'Lead School Name', value: '{{lead.schoolName}}' },
  { label: 'Lead Contact Name', value: '{{lead.contactName}}' },
  { label: 'Lead Email', value: '{{lead.email}}' },
  { label: 'Lead Phone', value: '{{lead.phone}}' },
  { label: 'Lead Address', value: '{{lead.address}}' },
];

const EmailBuilder = React.forwardRef<any, EmailEditorProps>(
  ({ initialDesign, onExportHtml, style, onLoad, onReady }, ref) => {
    const [copiedVar, setCopiedVar] = useState<string | null>(null);
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => editorRef.current);

    // Handle variable copy
    const copyVariable = (val: string) => {
      navigator.clipboard.writeText(val);
      setCopiedVar(val);
      setTimeout(() => setCopiedVar(null), 1200);
    };

    // Export HTML and design when requested
    const handleExport = () => {
      if (!editorRef.current) return;
      editorRef.current.exportHtml((data: any) => {
        const { design, html } = data;
        if (onExportHtml) onExportHtml(html, design);
      });
    };

    const defaultDesign = {
      body: {
        rows: [],
        values: {}
      },
      schemaVersion: 1
    };


    return (
      <div style={style}>
        {/* Variable Picker UI */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {variables.map((v) => (
            <div key={v.value} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                style={{ padding: '4px 10px', borderRadius: 4, background: '#e0e7ff', color: '#273c75', border: 'none', cursor: 'pointer' }}
                onClick={() => copyVariable(v.value)}
                title={`Copy ${v.label} to clipboard`}
              >
                {v.label}
              </button>
              {copiedVar === v.value && (
                <span style={{ position: 'absolute', top: '-1.5em', left: 0, right: 0, textAlign: 'center', color: '#16a34a', fontWeight: 600, fontSize: 13 }}>
                  Copied!
                </span>
              )}
            </div>
          ))}
        </div>
        <EmailEditor
          ref={editorRef}
          minHeight="500px"
          onLoad={onLoad}
          onReady={onReady}
          defaultBlockList={initialDesign || []}
        />
        {/* Optionally, add a button to export HTML/design manually */}
        {/* <button onClick={handleExport}>Export HTML</button> */}
      </div>
    );
  }
);

export default EmailBuilder;
