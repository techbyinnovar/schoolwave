import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Heading, 
  Image, 
  Square, 
  MousePointer, 
  SplitSquareVertical 
} from 'lucide-react';
import { ElementType } from '../types/email';

interface ElementLibraryProps {
  onAddElement: (type: ElementType) => void;
}

interface ElementItemProps {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
  onAddElement: (type: ElementType) => void;
}

const ElementItem: React.FC<ElementItemProps> = ({ type, icon, label, onAddElement }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { type },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onAddElement(type);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`flex items-center p-3 mb-2 rounded-md cursor-grab transition-all ${
        isDragging ? 'opacity-50 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => onAddElement(type)}
    >
      <div className="mr-3 text-gray-600">{icon}</div>
      <span className="text-gray-700">{label}</span>
    </div>
  );
};

const ElementLibrary: React.FC<ElementLibraryProps> = ({ onAddElement }) => {
  const elements = [
    { type: 'heading', icon: <Heading size={18} />, label: 'Heading' },
    { type: 'text', icon: <Type size={18} />, label: 'Text' },
    { type: 'image', icon: <Image size={18} />, label: 'Image' },
    { type: 'button', icon: <MousePointer size={18} />, label: 'Button' },
    { type: 'divider', icon: <SplitSquareVertical size={18} />, label: 'Divider' },
    { type: 'spacer', icon: <Square size={18} />, label: 'Spacer' },
    { type: 'row', icon: <SplitSquareVertical size={18} />, label: 'Row (Columns)' },
  ];

  return (
    <div className="p-4">
      <h2 className="font-medium text-gray-700 mb-4">Email Elements</h2>
      <div className="space-y-1">
        {elements.map((element) => (
          <ElementItem
            key={element.type}
            type={element.type as ElementType}
            icon={element.icon}
            label={element.label}
            onAddElement={onAddElement}
          />
        ))}
      </div>
    </div>
  );
};

export default ElementLibrary;