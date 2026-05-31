// HintCard.jsx — UPGRADED
// Drop-in replacement for src/components/questions/HintCard.jsx.

import React from 'react';

export function HintCard({ text }) {
  if (!text) return null;
  return (
    <div
      className="rounded-[12px] border px-4 py-3 mb-3 flex items-start gap-3 text-[13.5px] leading-relaxed"
      style={{
        background: 'var(--color-warn-soft)',
        borderColor: '#EBD79A',
        color: '#5C3705',
      }}
    >
      <span className="flex-shrink-0 text-base leading-none mt-0.5">💡</span>
      <div>
        <div
          className="text-[11px] font-bold uppercase tracking-[0.05em] mb-1"
          style={{ color: '#5C3705' }}
        >
          Hint
        </div>
        <div
          style={{ color: 'var(--color-ink-2)' }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </div>
  );
}
