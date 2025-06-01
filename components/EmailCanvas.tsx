import React from 'react';
import { useDrop } from 'react-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Element } from '../types/email';
import EmailElement from './EmailElement';

interface EmailCanvasProps {
  elements: Element[];
  selectedElement: Element | { type: 'column', row: Element, colIdx: number } | null;
  onSelectElement: (element: Element | { type: 'column', row: Element, colIdx: number } | null) => void;
  onUpdateElement: (element: Element) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (startIndex: number, endIndex: number) => void;
}

const EmailCanvas: React.FC<EmailCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElements
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    onReorderElements(result.source.index, result.destination.index);
  };

  return (
    <div className="flex justify-center p-8 min-h-full">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">Email Preview</h2>
        </div>
        
        <div 
          className="min-h-[600px] bg-white"
          onClick={() => onSelectElement(null)}
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="email-canvas">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="email-canvas-container"
                >
                  {elements.map((element, index) => (
                    <Draggable key={element.id} draggableId={element.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectElement(element);
                          }}
                          className={`relative ${selectedElement && 'id' in selectedElement && selectedElement.id === element.id ? 'outline outline-2 outline-blue-500' : ''}`}

                        >
                          <EmailElement 
                            element={element}
                            onUpdateElement={onUpdateElement}
                            onUpdateElementInTree={onUpdateElement}
                            onSelectElement={onSelectElement}
                            selectedElement={selectedElement}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {elements.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                      <p className="mb-4">Drag elements here to build your email</p>
                      <p className="text-sm">Or click on elements in the library</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default EmailCanvas;