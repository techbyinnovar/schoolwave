import React from 'react';
import { Element } from '../../types/email';
import { AddElementToColumnButton } from './AddElementToColumnButton';
// If needed, import getDefaultContent and getDefaultStyles from EmailBuilder or utils

interface EmailElementProps {
  element: Element;
  onUpdateElement: (updated: Element) => void;
  onUpdateElementInTree?: (updated: Element) => void;
  onSelectElement?: (element: Element | { type: 'column', row: Element, colIdx: number }) => void;
  selectedElement?: Element | { type: 'column', row: Element, colIdx: number } | null;
}

const EmailElement: React.FC<EmailElementProps> = ({ element, onUpdateElement, onUpdateElementInTree, onSelectElement, selectedElement }) => {
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateElement({
      ...element,
      content: e.target.value
    });
  };

  const renderElement = () => {
    const { type, content, styles } = element;

    switch (type) {
      case 'row':
        return (
          <div style={{ display: 'flex', width: '100%', position: 'relative', border: selectedElement === element ? '2px solid #007bff' : 'none' }}>
            {/* Row select icon */}
            <div
              style={{ position: 'absolute', left: -24, top: 8, cursor: 'pointer', zIndex: 2 }}
              title="Select Row"
              onClick={e => { e.stopPropagation(); onSelectElement?.(element); }}
            >
              <span role="img" aria-label="Row" style={{ fontSize: 18, color: selectedElement === element ? '#007bff' : '#888' }}>▤</span>
            </div>
            {element.columns?.map((col, colIdx) => {
              const isColSelected = selectedElement && typeof selectedElement === 'object' && 'type' in selectedElement && selectedElement.type === 'column' && selectedElement.row === element && selectedElement.colIdx === colIdx;
              return (
                <div
                  key={colIdx}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: isColSelected ? '2px solid #28a745' : '1px dashed #ccc',
                    margin: 2,
                    padding: 4,
                    position: 'relative',
                    background: isColSelected ? '#eafbe7' : undefined
                  }}
                >
                  {/* Column select icon */}
                  <div
                    style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer', zIndex: 2 }}
                    title={`Select Column ${colIdx+1}`}
                    onClick={e => { e.stopPropagation(); onSelectElement?.({ type: 'column', row: element, colIdx }); }}
                  >
                    <span role="img" aria-label="Column" style={{ fontSize: 16, color: isColSelected ? '#28a745' : '#aaa' }}>▦</span>
                  </div>
                  {col.length === 0 && (
                    <div style={{ color: '#bbb', fontSize: 12, textAlign: 'center' }}>Empty Column</div>
                  )}
                  {col.map((child, idx) => (
                    <EmailElement
                      key={child.id || idx}
                      element={child}
                      onUpdateElement={childUpdated => {
                        if (!element.columns) return;
                        const newColumns = element.columns.map((c, i) => i === colIdx ? c.map((el, j) => j === idx ? childUpdated : el) : c);
                        const updatedRow = { ...element, columns: newColumns };
                        onUpdateElement(updatedRow);
                        if (onUpdateElementInTree) onUpdateElementInTree(updatedRow);
                      }}
                      onUpdateElementInTree={onUpdateElementInTree}
                      onSelectElement={onSelectElement}
                      selectedElement={selectedElement}
                    />
                  ))}
                  <AddElementToColumnButton
                    rowElement={element}
                    colIdx={colIdx}
                    onUpdateElement={updatedRow => {
                      onUpdateElement(updatedRow);
                      if (onUpdateElementInTree) onUpdateElementInTree(updatedRow);
                    }}
                  />
                </div>
              );
            })}
          </div>
        );
      case 'text':
        return (
          <div style={styles as React.CSSProperties}>
            {content}
          </div>
        );
      case 'heading':
        return (
          <h2 style={styles as React.CSSProperties}>
            {content}
          </h2>
        );
      case 'button':
        return (
          <div style={{ textAlign: styles.textAlign as any }}>
            <button style={styles as React.CSSProperties}>
              {content}
            </button>
          </div>
        );
      case 'image':
        return (
          <div style={{ textAlign: styles.textAlign as any, padding: styles.padding }}>
            <img 
              src={content} 
              alt="Email content" 
              style={{ maxWidth: '100%', height: 'auto' }} 
            />
          </div>
        );
      case 'divider':
        return <hr style={styles as React.CSSProperties} />;
      case 'spacer':
        return <div style={styles as React.CSSProperties}></div>;
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div className="email-element">
      {renderElement()}
    </div>
  );
};

export default EmailElement;