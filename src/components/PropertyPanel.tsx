import React from 'react';
import { Trash2 } from 'lucide-react';
import { Element } from '../../types/email';

interface PropertyPanelProps {
  element: Element | { type: 'column', row: Element, colIdx: number };
  onUpdateElement: (element: Element) => void;
  onDeleteElement: (id: string) => void;
  elements?: Element[];
  setElements?: (elements: Element[]) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  element, 
  onUpdateElement,
  onDeleteElement,
  elements,
  setElements
}) => {
  // Support both Element and column selector
  const isColumn = typeof element === 'object' && 'type' in element && element.type === 'column';
  let colStyles: Record<string, string> = {};
  let colIdx = -1;
  let row: Element | undefined = undefined;
  if (isColumn) {
    row = element.row;
    colIdx = element.colIdx;
    colStyles = {};
  }

  const handleColStyleChange = (property: string, value: string) => {
    if (!row || colIdx === -1 || !Array.isArray(row.columns)) return;
    // Ensure columns[colIdx] exists and is an array
    const columns = row.columns.map((col, i) => {
      if (i !== colIdx) return col;
      // No columnStyles support for now
      return col;
    });
    const updatedRow = { ...row, columns };
    onUpdateElement(updatedRow);
    if (setElements && elements) {
      setElements(elements.map(el => el.id === row!.id ? updatedRow : el));
    }
  }
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if ('id' in element && 'styles' in element) {
      onUpdateElement({
        ...element,
        content: e.target.value
      });
    }
  };

  const handleStyleChange = (property: string, value: string) => {
    if ('id' in element && 'styles' in element) {
      onUpdateElement({
        ...element,
        styles: {
          ...element.styles,
          [property]: value
        }
      });
    }
  };


  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-700">
          {isColumn ? `Column ${colIdx + 1}` : getElementTitle((element as Element).type)}
        </h2>
        {!isColumn && (
          <button 
            onClick={() => onDeleteElement((element as Element).id)}
            className="p-2 text-red-500 rounded hover:bg-red-50"
            aria-label="Delete element"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Column property editor */}
        {isColumn && (
          <>
            {/* Background color */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colStyles.backgroundColor || '#ffffff'}
                  onChange={e => handleColStyleChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={colStyles.backgroundColor || '#ffffff'}
                  onChange={e => handleColStyleChange('backgroundColor', e.target.value)}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Padding */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Padding (px)
              </label>
              <input
                type="number"
                value={parseInt(colStyles.padding?.split('px')[0] || '16')}
                onChange={e => handleColStyleChange('padding', `${e.target.value}px`)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>
          </>
        )}
        {/* Content editor for specific element types */}
        {!isColumn && ((element as Element).type === 'text' || (element as Element).type === 'heading' || (element as Element).type === 'button') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {(element as Element).type === 'text' ? 'Text content' : 
               (element as Element).type === 'heading' ? 'Heading text' : 'Button label'}
            </label>
            {/* Variable Insert Buttons */}
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: 'Agent Name', value: '{{agent.name}}' },
                { label: 'Agent Email', value: '{{agent.email}}' },
                { label: 'Lead School Name', value: '{{lead.schoolName}}' },
                { label: 'Lead Contact Name', value: '{{lead.contactName}}' },
                { label: 'Lead Email', value: '{{lead.email}}' },
                { label: 'Lead Phone', value: '{{lead.phone}}' },
                { label: 'Lead Address', value: '{{lead.address}}' },
              ].map(v => (
                <button
                  type="button"
                  key={v.value}
                  className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  onClick={e => {
                    e.preventDefault();
                    // Insert variable at cursor position
                    const input = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
                    if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
                      const start = input.selectionStart || 0;
                      const end = input.selectionEnd || 0;
                      const before = element.content.slice(0, start);
                      const after = element.content.slice(end);
                      const newContent = before + v.value + after;
                      onUpdateElement({ ...element, content: newContent });
                      setTimeout(() => {
                        input.focus();
                        input.selectionStart = input.selectionEnd = start + v.value.length;
                      }, 0);
                    } else {
                      onUpdateElement({ ...element, content: element.content + v.value });
                    }
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            {element.type === 'text' ? (
              <textarea
                value={element.content}
                onChange={handleContentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={element.content}
                onChange={handleContentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        )}
        
        {/* Image URL editor */}
        {element.type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={element.content}
              onChange={handleContentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 h-24 bg-gray-100 rounded flex items-center justify-center">
              <img 
                src={element.content} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
            </div>
          </div>
        )}
        
        {/* Style editors for all elements */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Style Properties</h3>
          
          {/* Text align (only for non-column elements) */}
          {!(typeof element === 'object' && 'type' in element && element.type === 'column') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Text Alignment</label>
              <div className="flex space-x-2">
                {['left', 'center', 'right'].map(align => (
                  <button
                    type="button"
                    key={align}
                    onClick={() => handleStyleChange('textAlign', align)}
                    className={`px-3 py-1 text-sm rounded ${
                      (element as Element).styles.textAlign === align 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Font size for text elements */}
          {(element.type === 'text' || element.type === 'heading' || element.type === 'button') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Font Size (px)
              </label>
              <input
                type="number"
                value={parseInt(element.styles.fontSize || '16')}
                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="8"
                max="72"
              />
            </div>
          )}
          
          {/* Color picker */}
          {/* Color picker (only for non-column elements) */}
          {!(typeof element === 'object' && 'type' in element && element.type === 'column') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                {(element as Element).type === 'divider' ? 'Divider Color' : 'Text Color'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={(element as Element).type === 'divider' ? 
                    ((element as Element).styles.borderTop?.split(' ')[2] || '#E5E5EA') : 
                    (element as Element).styles.color || '#000000'}
                  onChange={(e) => 
                    (element as Element).type === 'divider' ? 
                      handleStyleChange('borderTop', `1px solid ${e.target.value}`) : 
                      handleStyleChange('color', e.target.value)
                  }
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={(element as Element).type === 'divider' ? 
                    ((element as Element).styles.borderTop?.split(' ')[2] || '#E5E5EA') : 
                    (element as Element).styles.color || '#000000'}
                  onChange={(e) => 
                    (element as Element).type === 'divider' ? 
                      handleStyleChange('borderTop', `1px solid ${e.target.value}`) : 
                      handleStyleChange('color', e.target.value)
                  }
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          {/* Background color */}
          {/* Background color (only for non-column elements) */}
          {!(typeof element === 'object' && 'type' in element && element.type === 'column') &&
            (element.type !== 'divider' && element.type !== 'spacer') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={(element as Element).styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={(element as Element).styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          {/* Padding */}
          {/* Padding (only for non-column elements) */}
          {!(typeof element === 'object' && 'type' in element && element.type === 'column') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Padding (px)
              </label>
              <input
                type="number"
                value={parseInt((element as Element).styles.padding?.split('px')[0] || '16')}
                onChange={(e) => handleStyleChange('padding', `${e.target.value}px`)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>
          )}
          
          {/* Spacer height */}
          {element.type === 'spacer' && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={parseInt(element.styles.height?.split('px')[0] || '32')}
                onChange={(e) => handleStyleChange('height', `${e.target.value}px`)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="4"
                max="200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get a nice title for element types
const getElementTitle = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1) + ' Element';
};

export default PropertyPanel;