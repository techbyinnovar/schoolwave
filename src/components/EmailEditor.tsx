import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-email-editor for SSR compatibility
const EmailEditor = dynamic(() => import('react-email-editor'), { ssr: false });

export interface EmailEditorProps {
  initialDesign?: object;
  onExportHtml?: (html: string, design: object) => void;
  style?: React.CSSProperties;
}

const EmailBuilder: React.FC<EmailEditorProps> = ({ initialDesign, onExportHtml, style }) => {
  const emailEditorRef = useRef<any>(null);

  useEffect(() => {
    // Load initial design if provided
    if (initialDesign && emailEditorRef.current) {
      emailEditorRef.current.loadDesign(initialDesign);
    }
  }, [initialDesign]);

  const handleExport = () => {
    if (emailEditorRef.current) {
      emailEditorRef.current.exportHtml((data: any) => {
        if (onExportHtml) {
          onExportHtml(data.html, data.design);
        }
      });
    }
  };

  return (
    <div style={style}>
      <EmailEditor
        ref={emailEditorRef}
        minHeight={500}
        onLoad={() => {
          if (initialDesign) {
            emailEditorRef.current.loadDesign(initialDesign);
          }
        }}
      />
      {/* Optionally, add a button to export HTML/design manually */}
      {/* <button onClick={handleExport}>Export HTML</button> */}
    </div>
  );
};

export default EmailBuilder;
