import React, { useRef } from 'react';

/**
 * MinimalEmailEditor: A simple rich text email editor with HTML export.
 * - Uses contentEditable div for editing.
 * - Supports basic formatting (bold, italic, underline, links).
 * - Exports HTML via parent callback.
 */

interface MinimalEmailEditorProps {
  initialHtml?: string;
  onExportHtml: (html: string) => void;
}

const toolbarButtons = [
  { label: 'B', style: 'bold', title: 'Bold' },
  { label: 'I', style: 'italic', title: 'Italic' },
  { label: 'U', style: 'underline', title: 'Underline' },
  { label: 'Link', style: 'createLink', title: 'Insert Link' },
  { label: '• List', style: 'insertUnorderedList', title: 'Bullet List' },
  { label: '1. List', style: 'insertOrderedList', title: 'Numbered List' },
];

export const MinimalEmailEditor: React.FC<MinimalEmailEditorProps> = ({ initialHtml = '', onExportHtml }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Format command handler
  const handleFormat = (style: string) => {
    if (style === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand(style, false, url);
    } else {
      document.execCommand(style, false);
    }
  };

  // Export HTML to parent
  const handleExport = () => {
    if (editorRef.current) {
      onExportHtml(editorRef.current.innerHTML);
    }
  };

  // Set initial HTML
  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  return (
    <div className="border rounded shadow-sm p-2 bg-white">
      <div className="flex gap-2 mb-2">
        {toolbarButtons.map(btn => (
          <button
            key={btn.style}
            type="button"
            title={btn.title}
            className="px-2 py-1 border rounded hover:bg-gray-100"
            onMouseDown={e => { e.preventDefault(); handleFormat(btn.style); }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] border rounded p-2 focus:outline-blue-400"
        style={{ fontFamily: 'inherit', fontSize: 16 }}
        spellCheck={true}
        aria-label="Email body editor"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleExport}
        >
          Export HTML
        </button>
      </div>
    </div>
  );
};

export default MinimalEmailEditor;
