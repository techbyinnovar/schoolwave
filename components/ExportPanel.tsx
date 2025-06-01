import React, { useRef } from 'react';
import { Copy, Download } from 'lucide-react';

interface ExportPanelProps {
  exportHTML: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ exportHTML }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyHTML = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
      
      // Show a brief notification
      const notification = document.createElement('div');
      notification.textContent = 'HTML copied to clipboard!';
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([exportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-700">HTML Export</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleCopyHTML}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm"
          >
            <Copy size={14} className="mr-1" />
            Copy
          </button>
          <button
            onClick={handleDownloadHTML}
            className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
          >
            <Download size={14} className="mr-1" />
            Download
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <textarea
          ref={textareaRef}
          readOnly
          value={exportHTML}
          className="w-full h-[calc(100vh-200px)] p-3 font-mono text-sm border border-gray-300 rounded-md shadow-inner bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Preview</h3>
        <div className="bg-white border border-gray-200 rounded-md p-3 max-h-80 overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: exportHTML }} />
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;