import React, { useState } from 'react';
import { Element, ElementType } from '../types/email';

import { getDefaultContent, getDefaultStyles } from './EmailBuilder';

interface AddElementToColumnButtonProps {
  rowElement: Element;
  colIdx: number;
  onUpdateElement: (updated: Element) => void;
}

const ELEMENT_TYPES: { type: ElementType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'heading', label: 'Heading' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button' },
  { type: 'divider', label: 'Divider' },
  { type: 'spacer', label: 'Spacer' },
];

export const AddElementToColumnButton: React.FC<AddElementToColumnButtonProps> = ({ rowElement, colIdx, onUpdateElement }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleAdd = (type: ElementType) => {
    setShowMenu(false);
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };
    // Clone columns so we don't mutate props
    const newColumns = rowElement.columns ? rowElement.columns.map((col, idx) => idx === colIdx ? [...col, newElement] : col) : [];
    const updatedRow = { ...rowElement, columns: newColumns };
    onUpdateElement(updatedRow);
  };

  return (
    <div style={{ marginTop: 8, textAlign: 'center' }}>
      <button
        type="button"
        style={{ fontSize: 12, color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        onClick={() => setShowMenu((v) => !v)}
      >
        + Add Element
      </button>
      {showMenu && (
        <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4, padding: 6, marginTop: 4, zIndex: 10, position: 'absolute' }}>
          {ELEMENT_TYPES.map((el) => (
            <div key={el.type}>
              <button
                type="button"
                style={{ fontSize: 12, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', width: '100%', textAlign: 'left' }}
                onClick={() => handleAdd(el.type)}
              >
                {el.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
