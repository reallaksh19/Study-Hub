import React from 'react';

export function BlockToolbar({ onAddBlock }) {
  const groups = [
    {
      label: 'Text',
      types: [
        { type: 'heading', label: 'Heading' },
        { type: 'paragraph', label: 'Paragraph' },
        { type: 'bullets', label: 'Bullets' },
        { type: 'divider', label: 'Divider' }
      ]
    },
    {
      label: 'Math & Science',
      types: [
        { type: 'equation', label: 'Equation' },
        { type: 'mermaid', label: 'Mermaid Diagram' }
      ]
    },
    {
      label: 'Media',
      types: [
        { type: 'image', label: 'Image' },
        { type: 'video_embed', label: 'Video Embed' },
        { type: 'svg', label: 'SVG' },
        { type: 'pdf_embed', label: 'PDF Embed' },
        { type: 'image_link', label: 'Image Link' }
      ]
    },
    {
      label: 'Structure',
      types: [
        { type: 'worked_solution', label: 'Worked Solution' },
        { type: 'example', label: 'Example' },
        { type: 'table', label: 'Table' },
        { type: 'link_card', label: 'Link Card' }
      ]
    },
    {
      label: 'Callouts',
      types: [
        { type: 'callout', label: 'Callout (Blue)' },
        { type: 'warning', label: 'Warning (Amber)' },
        { type: 'tip', label: 'Tip (Green)' },
        { type: 'misconception', label: 'Misconception (Red)' }
      ]
    }
  ];

  return (
    <div className="block-toolbar relative">
      <select
        className="w-full p-2 border rounded bg-indigo-50 text-indigo-700 font-bold appearance-none cursor-pointer"
        onChange={(e) => {
          if (e.target.value) {
            onAddBlock(e.target.value);
            e.target.value = '';
          }
        }}
        value=""
      >
        <option value="" disabled>+ Add Block</option>
        {groups.map((group, idx) => (
          <optgroup key={idx} label={group.label}>
            {group.types.map(b => (
              <option key={b.type} value={b.type}>{b.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
