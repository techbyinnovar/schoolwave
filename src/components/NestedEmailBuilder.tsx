import React, { useState } from "react";
import CloudinaryUploadWidget from "@/components/shared/CloudinaryUploadWidget";

// ---------- Types ----------
export type BlockType = "h1" | "p" | "img" | "a" | "container";

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children?: Block[]; // only container uses this
}

export interface EmailBuilderProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[], html: string) => void;
}

// ---------- Helpers ----------
const createBlock = (type: BlockType): Block => {
  switch (type) {
    case "h1":
      return {
        id: crypto.randomUUID(),
        type,
        props: {
          children: "Your headline here",
          color: "#000000",
          fontSize: "32px",
          textAlign: "left",
          fontFamily: "Arial",
          paddingTop: "",
          paddingRight: "",
          paddingBottom: "",
          paddingLeft: "",
          marginTop: "",
          marginRight: "",
          marginBottom: "",
          marginLeft: "",
        },
      };
    case "p":
      return {
        id: crypto.randomUUID(),
        type,
        props: {
          children: "Your text here",
          color: "#000000",
          fontSize: "16px",
          textAlign: "left",
          fontFamily: "Arial",
          paddingTop: "",
          paddingRight: "",
          paddingBottom: "",
          paddingLeft: "",
          marginTop: "",
          marginRight: "",
          marginBottom: "",
          marginLeft: "",
        },
      };
    case "img":
      return {
        id: crypto.randomUUID(),
        type,
        props: {
          src: "https://via.placeholder.com/300",
          alt: "Image description",
          width: "300",
          height: "auto",
          borderRadius: 0,
          objectFit: "contain",
          linkUrl: "",
          linkTarget: "_self",
          maxWidth: "100%",
        },
      };
    case "a":
      return {
        id: crypto.randomUUID(),
        type,
        props: {
          href: "https://example.com",
          children: "Click here",
          fontWeight: "",
          lineHeight: "",
          letterSpacing: "",
          textDecoration: "",
          target: "_self",
          hoverColor: "",
        },
      };
    case "container":
    default:
      return {
        id: crypto.randomUUID(),
        type: "container",
        props: {
          columns: 1,
          bg: "#ffffff",
          padding: "0px",
          margin: "0px",
          paddingTop: "",
          paddingRight: "",
          paddingBottom: "",
          paddingLeft: "",
          marginTop: "",
          marginRight: "",
          marginBottom: "",
          marginLeft: "",
        },
        children: [],
      };
  }
};

const styleString = (props: Record<string, any>, type: BlockType) => {
  const s: string[] = [];
  if (props.color) s.push(`color:${props.color}`);
  if (props.fontSize) s.push(`font-size:${props.fontSize}`);
  if (props.textAlign) s.push(`text-align:${props.textAlign}`);
  if (props.fontFamily) s.push(`font-family:${props.fontFamily}`);
  const spacingSides = ["Top","Right","Bottom","Left"] as const;
  
  if (type === "img") {
    if (props.width) s.push(`width:${props.width}${props.width.toString().endsWith("%") ? "" : "px"}`);
    if (props.height) s.push(`height:${props.height}`);
  }
  if (type === "container") {
    if (props.bg) s.push(`background-color:${props.bg}`);
    if (props.padding) s.push(`padding:${props.padding}`);
    if (props.margin) s.push(`margin:${props.margin}`);
  }
    spacingSides.forEach(side=>{
    const pt=props[`padding${side}`];
    if(pt) s.push(`padding-${side.toLowerCase()}:${pt}px`);
    const mt=props[`margin${side}`];
    if(mt) s.push(`margin-${side.toLowerCase()}:${mt}px`);
  });
  // borders & radius for any block
  if (props.borderWidth) {
    s.push(`border:${props.borderWidth}px ${props.borderStyle||'solid'} ${props.borderColor||'#000'}`);
  }
  if (props.borderRadius) s.push(`border-radius:${props.borderRadius}px`);
  // background image for container
  if (type==='container' && props.bgImage) {
    s.push(`background-image:url('${props.bgImage}')`);
    if (props.bgRepeat) s.push(`background-repeat:${props.bgRepeat}`);
    if (props.bgSize) s.push(`background-size:${props.bgSize}`);
  }
  // typography extras
  if (props.fontWeight) s.push(`font-weight:${props.fontWeight}`);
  if (props.lineHeight) s.push(`line-height:${props.lineHeight}`);
  if (props.letterSpacing) s.push(`letter-spacing:${props.letterSpacing}`);
  if (props.textDecoration) s.push(`text-decoration:${props.textDecoration}`);
  if (props.maxWidth) s.push(`max-width:${props.maxWidth}${props.maxWidth.toString().endsWith('%')?'':'px'}`);
  return s.join(";");
};

// Recursively convert blocks -> HTML
const blockToHtml = (block: Block, selectedId?: string): string => {
  const { type, props } = block;
  if (type === "container") {
    const cols = props.columns || 1;
    const cells = [];
    for (let i = 0; i < cols; i++) {
      const childBlocks = (block.children ?? []).filter((_, idx) => idx % cols === i);
      const inner = childBlocks.map((child) => blockToHtml(child, selectedId)).join("\n");
      cells.push(`<td>${inner}</td>`);
    }
    const style = styleString(props, type);
    const selectedStyle = block.id === selectedId ? ' outline:2px solid #3b82f6;' : '';
    return `<table data-id="${block.id}" width="100%" style="${style}${selectedStyle}"><tr>${cells.join("")}</tr></table>`;
  }

  const { children, ...rest } = props;
  const style = styleString(props, type);
  if (style) rest.style = style;
  const attrs = Object.entries(rest)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  const selectedStyle = block.id === selectedId ? 'outline:2px solid #3b82f6;' : '';
  const openTag = `<${type} data-id="${block.id}" ${attrs} style="${selectedStyle}${rest.style ?? ''}">`;
  return children == null
    ? openTag.replace('></', '/>')
    : `${openTag}${children}</${type}>`;
};

// ---------- Component ----------
const NestedEmailBuilder: React.FC<EmailBuilderProps> = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [html, setHtml] = useState<string>(() => `<div></div>`);

  const regenerate = (newBlocks: Block[], selId: string | null = selectedId) => {
    const htmlStr = `<div style=\"font-family:Arial,sans-serif;\">${newBlocks
      .map((b) => blockToHtml(b, selId || undefined))
      .join("\n")} </div>`;
    setHtml(htmlStr);
    onChange?.(newBlocks, htmlStr);
  };

  // initial render
  React.useEffect(() => {
    regenerate(blocks, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // regenerate whenever selectedId changes to refresh highlight
  React.useEffect(() => {
    regenerate(blocks, selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const addRootBlock = (type: BlockType) => {
    const updated = [...blocks, createBlock(type)];
    setBlocks(updated);
    regenerate(updated);
  };

  const updateBlock = (id: string, updater: (b: Block) => Block) => {
    const recurse = (arr: Block[]): Block[] =>
      arr.map((b) => (b.id === id ? updater(b) : { ...b, children: b.children ? recurse(b.children) : undefined }));
    const updated = recurse(blocks);
    setBlocks(updated);
    regenerate(updated);
  };

  // ---------- Tree manipulation helpers ----------
  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const mutate = (arr: Block[]): Block[] => {
      const idx = arr.findIndex((b) => b.id === id);
      if (idx !== -1) {
        if (direction === 'up' && idx > 0) {
          const newArr = [...arr];
          [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
          return newArr;
        }
        if (direction === 'down' && idx < arr.length - 1) {
          const newArr = [...arr];
          [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
          return newArr;
        }
      }
      return arr.map((b) => ({ ...b, children: b.children ? mutate(b.children) : b.children }));
    };
    const updated = mutate(blocks);
    setBlocks(updated);
    regenerate(updated);
  };

  const indentBlock = (id: string) => {
    // move into previous sibling if it is a container
    const recurse = (arr: Block[]): Block[] => {
      const idx = arr.findIndex((b) => b.id === id);
      if (idx > 0) {
        const prev = arr[idx - 1];
        if (prev.type === 'container') {
          const updatedPrev = { ...prev, children: [...(prev.children ?? []), arr[idx]] };
          const newArr = [...arr];
          newArr.splice(idx, 1); // remove
          newArr[idx - 1] = updatedPrev;
          return newArr;
        }
      }
      return arr.map((b) => ({ ...b, children: b.children ? recurse(b.children) : b.children }));
    };
    const updated = recurse(blocks);
    setBlocks(updated);
    regenerate(updated);
  };

  const outdentBlock = (id: string) => {
    // move block out to parent level
    const recurse = (arr: Block[], parentArr?: Block[]): Block[] => {
      return arr.flatMap((b, idx) => {
        if (b.id === id && parentArr) {
          // move out: insert after current container
          parentArr.splice(parentArr.indexOf(arr[idx]), 0, b);
          return []; // remove from current level
        }
        if (b.children) {
          b = { ...b, children: recurse(b.children, arr) };
        }
        return [b];
      });
    };
    const updated = recurse(blocks);
    setBlocks(updated);
    regenerate(updated);
  };

// ---------- UI helpers ----------
  const BlockCard: React.FC<{ block: Block }> = ({ block }) => {
    const commonCls = `border rounded p-2 cursor-pointer ${selectedId === block.id ? "ring-2 ring-blue-500" : ""}`;
    return (
      <div className={commonCls} onClick={() => setSelectedId(block.id)}>
        {block.type.toUpperCase()}
        <div className="ml-2 inline-flex gap-1 text-xs">
          <button title="Move Up" onClick={(e)=>{e.stopPropagation();moveBlock(block.id,'up');}} className="px-1 border rounded">↑</button>
          <button title="Move Down" onClick={(e)=>{e.stopPropagation();moveBlock(block.id,'down');}} className="px-1 border rounded">↓</button>
          <button title="Indent" onClick={(e)=>{e.stopPropagation();indentBlock(block.id);}} className="px-1 border rounded">→</button>
          <button title="Outdent" onClick={(e)=>{e.stopPropagation();outdentBlock(block.id);}} className="px-1 border rounded">←</button>
        </div>
        {block.children && block.children.length > 0 && (
          <div className="ml-4 mt-1 space-y-1">
            {block.children.map((c) => (
              <BlockCard key={c.id} block={c} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const selectedBlock = (() => {
    const find = (arr: Block[]): Block | undefined => {
      for (const b of arr) {
        if (b.id === selectedId) return b;
        if (b.children) {
          const f = find(b.children);
          if (f) return f;
        }
      }
    };
    return selectedId ? find(blocks) : undefined;
  })();

  // ---------- JSX ----------
  return (
    <div className="p-6 bg-white flex">
      {/* left column */}
      <div className="w-1/2 pr-6">
        <h2 className="text-xl font-semibold mb-1">Blocks</h2>
        <p className="text-xs text-gray-500 mb-3">Tip: Hold <kbd className="border px-1">Ctrl</kbd>/<kbd className="border px-1">Cmd</kbd> or <kbd className="border px-1">Alt</kbd> while clicking to select a parent container.</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["h1", "p", "img", "a", "container"] as BlockType[]).map((t) => (
            <button key={t} className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => addRootBlock(t)}>
              + {t}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {blocks.map((b) => (
            <BlockCard key={b.id} block={b} />
          ))}
        </div>
      </div>

      {/* preview */}
      <div
        className="w-1/2 border p-4 rounded bg-gray-50 cursor-pointer"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const withContainerMod = e.altKey || e.metaKey || e.ctrlKey;

          // event delegation: climb up to element with data-id
          const target = e.target as HTMLElement;
          const elWithId = target.closest('[data-id]') as HTMLElement | null;
          if (elWithId) {
            e.preventDefault();
            e.stopPropagation();
            const clickedId = elWithId.getAttribute('data-id');
            if (!clickedId) return;

            if (withContainerMod) {
              // find nearest ancestor container for this id
              const findParentContainer = (arr: Block[], target: string, currentContainer: string | null): string | null => {
                for (const b of arr) {
                  if (b.id === target) {
                    return currentContainer;
                  }
                  if (b.children) {
                    const res = findParentContainer(b.children, target, b.type === 'container' ? b.id : currentContainer);
                    if (res !== null) return res;
                  }
                }
                return null;
              };
              const parentContainerId = findParentContainer(blocks, clickedId, null);
              setSelectedId(parentContainerId ?? clickedId);
            } else {
              setSelectedId(clickedId);
            }
          }
        }}
      />

      {/* sidebar */}
      {selectedBlock && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white border-l p-4 overflow-auto relative">
          <button onClick={() => setSelectedId(null)} className="absolute top-2 right-2 text-xl leading-none text-gray-500 hover:text-black" aria-label="Close">×</button>
          <h3 className="text-lg font-semibold mb-3">{selectedBlock.type.toUpperCase()} settings</h3>
          <>
          <>
            {/* spacing controls */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Padding (px)</p>
              <div className="grid grid-cols-2 gap-2">
                {["Top","Right","Bottom","Left"].map(side=> (
                  <input key={side} type="number" placeholder={side}
                    value={selectedBlock.props[`padding${side}`]||''}
                    onChange={(e)=>updateBlock(selectedBlock.id, (b) => ({ ...b, props: { ...b.props, [`padding${side}`]: e.target.value } }))}
                    className="border rounded px-1 py-0.5 text-xs"/>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Margin (px)</p>
              <div className="grid grid-cols-2 gap-2">
                {["Top","Right","Bottom","Left"].map(side=> (
                  <input key={side} type="number" placeholder={side}
                    value={selectedBlock.props[`margin${side}`]||''}
                    onChange={(e)=>updateBlock(selectedBlock.id, (b) => ({ ...b, props: { ...b.props, [`margin${side}`]: e.target.value } }))}
                    className="border rounded px-1 py-0.5 text-xs"/>
                ))}
              </div>
            </div>
          </>
          </>
          {selectedBlock.type === "container" && (
            <>
              <label className="block text-sm font-medium">Columns</label>
              <input
                type="number"
                min={1}
                max={6}
                className="w-full border rounded mb-3 px-2 py-1"
                value={selectedBlock.props.columns}
                onChange={(e) => updateBlock(selectedBlock.id, (b) => ({ ...b, props: { ...b.props, columns: Number(e.target.value) } }))}
              />
              <label className="block text-sm font-medium">Background</label>
              <input
                type="color"
                className="w-full border rounded mb-3 h-10"
                value={selectedBlock.props.bg}
                onChange={(e) => updateBlock(selectedBlock.id, (b) => ({ ...b, props: { ...b.props, bg: e.target.value } }))}
              />
              {(["padding", "margin"] as const).map((k) => (
                <div key={k} className="mb-3">
                  <label className="block text-sm font-medium capitalize">{k}</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                    value={selectedBlock.props[k]}
                    onChange={(e) => updateBlock(selectedBlock.id, (b) => ({ ...b, props: { ...b.props, [k]: e.target.value } }))}
                  />
                </div>
              ))}
              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium">Add Child Element</p>
                {(["h1", "p", "img", "a", "container"] as BlockType[]).map((t) => (
                  <button
                    key={t}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2 mb-2"
                    onClick={() =>
                      updateBlock(selectedBlock.id, (b) => ({
                        ...b,
                        children: [...(b.children ?? []), createBlock(t)],
                      }))
                    }
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </>
          )}
          {/* Element specific controls */}
          {selectedBlock.type === 'img' && (
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium">Image</label>
              <CloudinaryUploadWidget
                buttonText={selectedBlock.props.src ? 'Change Image' : 'Upload Image'}
                initialValue={selectedBlock.props.src}
                resourceType="image"
                onUploadSuccess={({ url }) => updateBlock(selectedBlock.id, (b) => ({ ...b, props: { ...b.props, src: url } }))}
              />
              {/* Cloudinary widget replaces manual URL input */}
              <label className="block text-sm font-medium">Alt text</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={selectedBlock.props.alt||''}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,alt:e.target.value}}))} />
              <label className="block text-sm font-medium">Width</label>
              <input type="number" className="w-full border rounded px-2 py-1" value={selectedBlock.props.width}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,width:e.target.value}}))} />
              <label className="block text-sm font-medium">Height</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={selectedBlock.props.height}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,height:e.target.value}}))} />
            </div>
          )}
          {['h1','p','a'].includes(selectedBlock.type) && (
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium">Text</label>
              <textarea rows={2} className="w-full border rounded px-2 py-1" value={selectedBlock.props.children}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,children:e.target.value}}))} />
              <label className="block text-sm font-medium">Color</label>
              <input type="color" className="w-full border rounded h-10" value={selectedBlock.props.color||'#000000'}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,color:e.target.value}}))} />
              <label className="block text-sm font-medium">Font Size</label>
              <input type="number" className="w-full border rounded px-2 py-1" value={(selectedBlock.props.fontSize||'').replace('px','')}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,fontSize:e.target.value+'px'}}))} />
              <label className="block text-sm font-medium">Align</label>
              <select className="w-full border rounded px-2 py-1" value={selectedBlock.props.textAlign||'left'}
                onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,textAlign:e.target.value}}))} >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              {selectedBlock.type === 'a' && (
                <>
                  <label className="block text-sm font-medium">Href</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={selectedBlock.props.href}
                    onChange={(e)=>updateBlock(selectedBlock.id,b=>({...b,props:{...b.props,href:e.target.value}}))} />
                </>
              )}
            </div>
          )}
          <button
            className="mt-6 w-full bg-blue-600 text-white rounded py-2 text-sm"
            onClick={() => regenerate(blocks, selectedId)}
          >
            Update Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default NestedEmailBuilder;
