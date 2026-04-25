import React from 'react';
import { BlockRenderer } from '../../blocks/BlockRenderer.jsx';
import { sanitizeSvg } from '../../../utils/svgSanitizer.js';

export function BlockEditorPanel({ block, onChange }) {
  if (!block) return <div className="p-8 text-center text-gray-500">Select a block to edit</div>;

  const handleChange = (field, value) => {
    onChange(block.id, { ...block.data, [field]: value });
  };

  const handleSvgPaste = (val) => {
    const safeSvg = sanitizeSvg(val);
    handleChange('inlineSvg', safeSvg);
  };

  return (
    <div className="block-editor-panel">
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-lg capitalize">{block.type} Editor</h3>
      </div>

      <div className="mb-6 space-y-4">
        {block.type === 'heading' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Text</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.text || ''} onChange={e => handleChange('text', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Level</label>
              <select className="border p-2 rounded" value={block.data.level || 2} onChange={e => handleChange('level', parseInt(e.target.value))}>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
              </select>
            </div>
          </>
        )}

        {block.type === 'paragraph' && (
          <div>
            <label className="block text-sm font-bold mb-1">Text (Markdown + KaTeX supported)</label>
            <textarea className="w-full border p-2 rounded h-32" value={block.data.text || ''} onChange={e => handleChange('text', e.target.value)} />
          </div>
        )}

        {block.type === 'equation' && (
          <div>
            <label className="block text-sm font-bold mb-1">LaTeX</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {['α', 'β', 'θ', '√', '∑', '½', '→', '×'].map(sym => (
                <button key={sym} className="border px-2 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded" onClick={() => handleChange('latex', (block.data.latex || '') + sym)}>{sym}</button>
              ))}
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
              {[
                { label: 'Fraction', tex: '\\frac{num}{den}' },
                { label: 'Subscript', tex: 'A_x' },
                { label: 'Superscript', tex: 'x^2' },
                { label: 'Vector Arrow', tex: '\\vec{v}' },
                { label: 'Cosine', tex: '\\cos\\theta' },
                { label: 'Sine', tex: '\\sin\\theta' }
              ].map(tpl => (
                <button key={tpl.label} className="border px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded" onClick={() => handleChange('latex', (block.data.latex || '') + tpl.tex)}>{tpl.label}</button>
              ))}
            </div>
            <textarea className="w-full border p-2 rounded h-24 font-mono text-lg" value={block.data.latex || ''} onChange={e => handleChange('latex', e.target.value)} />
            <label className="flex items-center mt-2">
              <input type="checkbox" checked={block.data.displayMode !== false} onChange={e => handleChange('displayMode', e.target.checked)} className="mr-2" />
              Display Mode (Block)
            </label>
          </div>
        )}

        {block.type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Image URL / Path</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.src || ''} onChange={e => handleChange('src', e.target.value)} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Alt Text</label>
                <input type="text" className="w-full border p-2 rounded" value={block.data.alt || ''} onChange={e => handleChange('alt', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Caption</label>
                <input type="text" className="w-full border p-2 rounded" value={block.data.caption || ''} onChange={e => handleChange('caption', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {block.type === 'svg' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Inline SVG</label>
              <textarea className="w-full border p-2 rounded h-32" value={block.data.inlineSvg || ''} onChange={e => handleSvgPaste(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Caption</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.caption || ''} onChange={e => handleChange('caption', e.target.value)} />
            </div>
          </>
        )}

        {block.type === 'worked_solution' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.title || 'Worked Example'} onChange={e => handleChange('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Steps</label>
              {(block.data.steps || []).map((s, i) => (
                <div key={i} className="flex mb-2">
                  <textarea className="w-full border p-2 rounded mr-2 h-16" value={s} onChange={e => {
                    const newSteps = [...block.data.steps];
                    newSteps[i] = e.target.value;
                    handleChange('steps', newSteps);
                  }} />
                  <button onClick={() => handleChange('steps', block.data.steps.filter((_, idx) => idx !== i))} className="text-red-500 font-bold p-2">✕</button>
                </div>
              ))}
              <button onClick={() => handleChange('steps', [...(block.data.steps || []), ''])} className="text-blue-500 font-bold">+ Add Step</button>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Answer</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.answer || ''} onChange={e => handleChange('answer', e.target.value)} />
            </div>
          </>
        )}

        {block.type === 'bullets' && (
          <div>
            <label className="block text-sm font-bold mb-1">Items (One per line)</label>
            <textarea className="w-full border p-2 rounded h-32" value={(block.data.items || []).join('\n')} onChange={e => handleChange('items', e.target.value.split('\n'))} />
          </div>
        )}

        {block.type === 'example' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.title || 'Example'} onChange={e => handleChange('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Scenario</label>
              <textarea className="w-full border p-2 rounded h-20" value={block.data.scenario || ''} onChange={e => handleChange('scenario', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Solution</label>
              <textarea className="w-full border p-2 rounded h-20" value={block.data.solution || ''} onChange={e => handleChange('solution', e.target.value)} />
            </div>
          </>
        )}

        {['callout', 'warning', 'tip', 'misconception'].includes(block.type) && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.title || ''} onChange={e => handleChange('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Body</label>
              <textarea className="w-full border p-2 rounded h-24" value={block.data.body || ''} onChange={e => handleChange('body', e.target.value)} />
            </div>
          </>
        )}

        {block.type === 'table' && (
          <div>
            <label className="block text-sm font-bold mb-1">Table Data</label>
            <p className="text-sm text-gray-500 mb-2">Rows × Cols editor placeholder (implement simple text matrix builder)</p>
            <textarea className="w-full border p-2 rounded h-24 font-mono text-sm" placeholder="Cell1,Cell2\nCell3,Cell4" value={(block.data.rows || []).map(r => r.join(',')).join('\n')} onChange={e => {
                const rows = e.target.value.split('\n').map(r => r.split(','));
                handleChange('rows', rows);
            }} />
          </div>
        )}

        {block.type === 'link_card' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.title || ''} onChange={e => handleChange('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.description || ''} onChange={e => handleChange('description', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">URL</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.url || ''} onChange={e => handleChange('url', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Type</label>
              <select className="w-full border p-2 rounded" value={block.data.linkType || 'external'} onChange={e => handleChange('linkType', e.target.value)}>
                <option value="external">External Link</option>
                <option value="page">Internal Page</option>
                <option value="pdf">PDF Document</option>
              </select>
            </div>
          </>
        )}

        {block.type === 'pdf_embed' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">PDF URL</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.src || ''} onChange={e => handleChange('src', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.title || ''} onChange={e => handleChange('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Height (px)</label>
              <input type="number" className="w-full border p-2 rounded" value={block.data.height || 600} onChange={e => handleChange('height', parseInt(e.target.value))} />
            </div>
          </>
        )}

        {block.type === 'image_link' && (
          <>
            <div>
              <label className="block text-sm font-bold mb-1">Image URL</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.src || ''} onChange={e => handleChange('src', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Destination URL</label>
              <input type="text" className="w-full border p-2 rounded" value={block.data.href || ''} onChange={e => handleChange('href', e.target.value)} />
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Alt Text</label>
                <input type="text" className="w-full border p-2 rounded" value={block.data.alt || ''} onChange={e => handleChange('alt', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Caption</label>
                <input type="text" className="w-full border p-2 rounded" value={block.data.caption || ''} onChange={e => handleChange('caption', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {block.type === 'divider' && (
          <div className="text-gray-500 italic p-4 bg-gray-50 border rounded">
            This renders as a horizontal rule separating content.
          </div>
        )}
      </div>

      <div className="mt-8 border-t pt-4">
        <h4 className="font-bold text-gray-500 text-sm mb-2 uppercase">Live Preview</h4>
        <div className="p-4 bg-white border rounded shadow-sm min-h-[100px]">
          <BlockRenderer block={block} />
        </div>
      </div>
    </div>
  );
}
