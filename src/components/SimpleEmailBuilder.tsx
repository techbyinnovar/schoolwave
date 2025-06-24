import React, { useState } from 'react';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';

type Block = {
  type: string;
  props: { [key: string]: any };
};

const availableComponents: { type: string; label: string; props: { [key: string]: any } }[] = [
  { type: 'h1', label: 'Heading 1', props: { children: 'Your headline here', color: '#000000', fontSize: '32px', textAlign: 'left', fontFamily: 'Arial' } },
  { type: 'p', label: 'Paragraph', props: { children: 'Your text here', color: '#000000', fontSize: '16px', textAlign: 'left', fontFamily: 'Arial' } },
  { type: 'img', label: 'Image', props: { src: 'https://via.placeholder.com/300', alt: 'Image description', width: '300', height: 'auto' } },
  { type: 'a', label: 'Link', props: { href: 'https://example.com', children: 'Click here' } },
];

export interface SimpleEmailBuilderProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[], html: string) => void;
}

const EmailBuilder: React.FC<SimpleEmailBuilderProps> = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [html, setHtml] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    updateHtml(blocks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const addBlock = (block: Block) => {
    const updatedBlocks = [...blocks, block];
    setBlocks(updatedBlocks);
    updateHtml(updatedBlocks);
  };

  const updateBlockProp = (blockIndex: number, key: string, value: string) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[blockIndex].props[key] = value;
    setBlocks(updatedBlocks);
    updateHtml(updatedBlocks);
  };

  const removeBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    updateHtml(updated);
  };

  const updateHtml = (blocksToRender: Block[]) => {
    const buildStyleString = (props: any) => {
      const styleEntries: string[] = [];
      if (props.color) styleEntries.push(`color:${props.color}`);
      if (props.fontSize) styleEntries.push(`font-size:${props.fontSize}`);
      if (props.textAlign) styleEntries.push(`text-align:${props.textAlign}`);
      if (props.fontFamily) styleEntries.push(`font-family:${props.fontFamily}`);
      if (props.width && props.type === 'img') styleEntries.push(`width:${props.width}px`);
      if (props.height && props.type === 'img') styleEntries.push(`height:${props.height}px`);
      return styleEntries.length ? styleEntries.join(';') : undefined;
    };

    const inner = blocksToRender
      .map(({ type, props }) => {
        const { children, ...rest } = props;
        const styleStr = buildStyleString({ ...props, type });
        if (styleStr) rest.style = styleStr;
        const attrs = Object.entries(rest)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        return children == null
          ? `<${type} ${attrs} />`
          : `<${type} ${attrs}>${children || ''}</${type}>`;
      })
      .join('\n');

    const htmlOutput = `<div style="font-family: Arial, sans-serif;">\n${inner}\n</div>`;
    setHtml(htmlOutput);
    onChange?.(blocksToRender, htmlOutput);
  };

  const renderSidebar = (block: Block, i: number) => {
    if (!block) return null;
    return (
      <div className="space-y-4 pr-4">
        <h3 className="text-xl font-semibold mb-2">{block.type.toUpperCase()} Settings</h3>
        {block.type !== 'img' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Font Size (px)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-1"
                value={parseInt(block.props.fontSize || '16')}
                onChange={(e) => updateBlockProp(i, 'fontSize', e.target.value + 'px')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Font Color</label>
              <input
                type="color"
                className="w-full border rounded h-10"
                value={block.props.color}
                onChange={(e) => updateBlockProp(i, 'color', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Text Align</label>
              <select
                className="w-full border rounded px-3 py-1"
                value={block.props.textAlign}
                onChange={(e) => updateBlockProp(i, 'textAlign', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Email Builder</h1>

      {/* Component Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {availableComponents.map((comp) => (
          <button
            type="button"
            key={comp.type}
            onClick={() => addBlock({ type: comp.type, props: { ...comp.props } })}
            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
          >
            + {comp.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-2 ${activeTab === 'preview' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          Visual Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`pb-2 ${activeTab === 'edit' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          Edit Components
        </button>
      </div>

      {/* Preview */}
      {activeTab === 'preview' && (
        <div className="border p-4 rounded bg-white shadow prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      {/* Edit Tab */}
      {activeTab === 'edit' && (
        <div className="flex">
          {/* Blocks list */}
          <div className="flex-1 space-y-5">
            {blocks.map((block, i) => (
              <div
                key={i}
                className={`border rounded-lg p-4 bg-gray-50 shadow-sm ${selectedIndex === i ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedIndex(i)}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">{block.type.toUpperCase()}</h4>
                  <button
                    onClick={() => removeBlock(i)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3">
                  {Object.entries(block.props).map(([key, val]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key}
                      </label>
                      {block.type === 'img' && key === 'src' ? (
                        <CloudinaryUploadWidget
                          initialValue={val}
                          buttonText={val ? 'Change Image' : 'Upload Image'}
                          resourceType="image"
                          onUploadSuccess={({ url }: { url: string }) => updateBlockProp(i, 'src', url)}
                          clearable={!!val}
                          onClear={() => updateBlockProp(i, 'src', '')}
                        />
                      ) : key === 'children' ? (
                        <textarea
                          rows={2}
                          className="w-full border rounded px-3 py-2"
                          value={val}
                          onChange={(e) => updateBlockProp(i, key, e.target.value)}
                        />
                      ) : (
                        <input
                          type={key === 'src' || key === 'href' ? 'url' : 'text'}
                          className="w-full border rounded px-3 py-2"
                          value={val}
                          onChange={(e) => updateBlockProp(i, key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Sidebar */}
                <div className="mt-4">{renderSidebar(block, i)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailBuilder;
