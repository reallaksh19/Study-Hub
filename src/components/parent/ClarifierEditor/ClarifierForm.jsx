import React from 'react';

export function ClarifierForm({ clarifier, onChange }) {
  if (!clarifier) return <div>Select a clarifier to edit</div>;

  const handleChange = (field, value) => {
    onChange(clarifier.id, { ...clarifier, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg border-b pb-2">Clarifier Editor</h3>

      <div>
        <label className="block text-sm font-bold mb-1">Type</label>
        <select className="w-full border p-2 rounded" value={clarifier.type || 'tip'} onChange={e => handleChange('type', e.target.value)}>
          <option value="tip">Tip</option>
          <option value="warning">Warning</option>
          <option value="key_fact">Key Fact</option>
          <option value="common_mistake">Common Mistake</option>
          <option value="did_you_know">Did You Know?</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Title</label>
        <input type="text" className="w-full border p-2 rounded" value={clarifier.title || ''} onChange={e => handleChange('title', e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Body (Markdown + KaTeX supported)</label>
        <textarea className="w-full border p-2 rounded h-32" value={clarifier.body || ''} onChange={e => handleChange('body', e.target.value)} />
      </div>

      {/* Live Preview could go here */}
    </div>
  );
}
