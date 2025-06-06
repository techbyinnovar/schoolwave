import React, { useState, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PanelLeft, Code, Save, Download, Undo, Redo } from 'lucide-react';
import { Element, ElementType } from '../../types/email';
import ElementLibrary from './ElementLibrary';
import EmailCanvas from './EmailCanvas';
import PropertyPanel from './PropertyPanel';
import ExportPanel from './ExportPanel';
import { generateHTML } from '../utils/hrmlGenerator';

interface EmailBuilderProps {
  onExportHTML?: (html: string) => void;
  initialHtml?: string;
}

import { parseElementsFromHtml } from '../utils/parseHtmlToElements';

const EmailBuilder: React.FC<EmailBuilderProps> = ({ onExportHTML, initialHtml }) => {
  const [elements, setElements] = useState<Element[]>([]);

  // Set initial elements from initialHtml (if provided)
  useEffect(() => {
    if (initialHtml) {
      const parsed = parseElementsFromHtml(initialHtml);
      if (parsed.length > 0) {
        setElements(parsed);
      }
    }
  }, [initialHtml]);
  const [selectedElement, setSelectedElement] = useState<Element | { type: 'column', row: Element, colIdx: number } | null>(null);
  const [history, setHistory] = useState<Element[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showLibrary, setShowLibrary] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [exportHTML, setExportHTML] = useState('');
  
  // Update history when elements change
  useEffect(() => {
    if (JSON.stringify(elements) !== JSON.stringify(history[historyIndex])) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...elements]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [elements]);

  // Update exportHTML whenever elements change
  useEffect(() => {
    setExportHTML(generateHTML(elements));
  }, [elements]);

  // Call onExportHTML when exportHTML changes
  useEffect(() => {
    if (onExportHTML) {
      onExportHTML(exportHTML);
    }
  }, [exportHTML, onExportHTML]);

  const handleAddElement = (elementType: ElementType) => {
    if (elementType === 'row') {
      const colCount = parseInt(prompt('How many columns? (2-6)', '2') || '2', 10);
      const columns = Array.from({ length: Math.max(2, Math.min(colCount, 6)) }, () => []);
      const newRow: Element = {
        id: Date.now().toString(),
        type: 'row',
        content: '',
        styles: {},
        columns
      };
      setElements([...elements, newRow]);
      return;
    }
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type: elementType,
      content: getDefaultContent(elementType),
      styles: getDefaultStyles(elementType),
    };
    
    setElements([...elements, newElement]);
  };

  const handleUpdateElement = (updatedElement: Element) => {
    setElements(elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
    setSelectedElement(updatedElement);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement && 'id' in selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };

  const handleSelectElement = (element: Element | { type: 'column', row: Element, colIdx: number } | null) => {
    setSelectedElement(element);
  };

  const handleReorderElements = (startIndex: number, endIndex: number) => {
    const result = Array.from(elements);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setElements(result);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

  const handleSave = () => {
    const templateData = {
      elements,
      exportHTML
    };
    
    localStorage.setItem('emailTemplate', JSON.stringify(templateData));
    alert('Template saved successfully!');
  };

  const handleLoad = () => {
    const savedData = localStorage.getItem('emailTemplate');
    if (savedData) {
      const templateData = JSON.parse(savedData);
      setElements(templateData.elements);
      setExportHTML(templateData.exportHTML);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowLibrary(!showLibrary)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Toggle element library"
            >
              <PanelLeft size={20} className={showLibrary ? "text-blue-600" : "text-gray-600"} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Email Builder</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className={`p-2 rounded ${historyIndex <= 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Undo"
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded ${historyIndex >= history.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Redo"
            >
              <Redo size={18} />
            </button>
            <button 
              onClick={handleSave}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Save template"
            >
              <Save size={18} />
            </button>
            <button 
              onClick={handleLoad}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Load template"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => setShowExport(!showExport)}
              className={`p-2 rounded ${showExport ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              aria-label="Export HTML"
            >
              <Code size={18} />
            </button>
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Element library */}
          {showLibrary && (
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <ElementLibrary onAddElement={handleAddElement} />
            </div>
          )}
          
          {/* Main canvas area */}
          <div className="flex-1 overflow-auto bg-gray-100">
            <EmailCanvas 
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={handleSelectElement}
              onUpdateElement={(updated) => {
                // Find and update the element in elements array
                const idx = elements.findIndex(e => e.id === updated.id);
                if (idx !== -1) handleUpdateElement(updated);
              }}
              onDeleteElement={handleDeleteElement}
              onReorderElements={handleReorderElements}
            />
          </div>
          
          {/* Property panel */}
          {selectedElement && (
            <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto shadow-inner">
              <PropertyPanel 
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                elements={elements}
                setElements={setElements}
              />
            </div>
          )}
          
          {/* Export panel */}
          {showExport && (
            <div className="w-1/3 bg-white border-l border-gray-200 overflow-y-auto shadow-inner">
              <ExportPanel exportHTML={exportHTML} />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

// Helper functions
const getDefaultContent = (type: ElementType): string => {
  switch (type) {
    case 'text':
      return 'Enter your text here';
    case 'heading':
      return 'Heading';
    case 'button':
      return 'Click Me';
    case 'image':
      return 'https://via.placeholder.com/600x200';
    case 'divider':
      return '';
    case 'spacer':
      return '';
    default:
      return '';
  }
};

const getDefaultStyles = (type: ElementType): Record<string, string> => {
  const baseStyles = {
    padding: '16px',
    margin: '0px',
    width: '100%',
    textAlign: 'left',
    color: '#000000',
    backgroundColor: '#ffffff',
  };

  switch (type) {
    case 'text':
      return { ...baseStyles, fontSize: '16px', lineHeight: '1.5' };
    case 'heading':
      return { ...baseStyles, fontSize: '24px', fontWeight: 'bold', padding: '16px 16px 8px 16px' };
    case 'button':
      return { 
        ...baseStyles, 
        backgroundColor: '#0066CC', 
        color: '#ffffff', 
        textAlign: 'center',
        padding: '12px 24px',
        borderRadius: '4px',
        display: 'inline-block',
        margin: '8px 0'
      };
    case 'image':
      return { ...baseStyles, padding: '0' };
    case 'divider':
      return { 
        ...baseStyles, 
        borderTop: '1px solid #E5E5EA', 
        margin: '16px 0', 
        padding: '0' 
      };
    case 'spacer':
      return { ...baseStyles, height: '32px', padding: '0' };
    default:
      return baseStyles;
  }
};

export { getDefaultContent, getDefaultStyles };
export default EmailBuilder;