import React, { useState } from 'react';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';

type Block = {
  type: string;
  props: { [key: string]: string };
};

const availableComponents: { type: string; label: string; props: { [key: string]: string } }[] = [
  { type: 'h1', label: 'Heading 1', props: { children: 'Your headline here' } },
  { type: 'p', label: 'Paragraph', props: { children: 'Your text here' } },
  { type: 'img', label: 'Image', props: { src: 'https://via.placeholder.com/300', alt: 'Image description' } },
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

  // always regenerate HTML and notify parent when blocks array changes
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
    const inner = blocksToRender
      .map(({ type, props }) => {
        const { children, ...rest } = props;
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

  const renderBlock = (block: Block, index: number) => {
    const { type, props } = block;
    if (type === 'img') {
      return <img key={index} {...props} className="max-w-full" />;
    } else if (type === 'a') {
      return (
        <a key={index} href={props.href} className="text-blue-600 underline">
          {props.children}
        </a>
      );
    } else {
      const Tag = type as keyof JSX.IntrinsicElements;
      return <Tag key={index}>{props.children}</Tag>;
    }
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
        <div className="space-y-4 border p-4 rounded bg-gray-50 shadow">
          {blocks.map((block, i) => renderBlock(block, i))}
        </div>
      )}

      {/* Edit Tab */}
      {activeTab === 'edit' && (
        <div className="space-y-5">
          {blocks.map((block, i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-700">{block.type.toUpperCase()}</h4>
                <button
                  onClick={() => removeBlock(i)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>

              {/* Edit Props */}
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
            </div>
          ))}
        </div>
      )}

      {/* Raw HTML */}
      {html && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">HTML Output</h3>
          <pre className="bg-gray-100 p-4 rounded max-h-64 overflow-auto whitespace-pre-wrap text-sm border">
            {html}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EmailBuilder;
