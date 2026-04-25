import React from 'react';

export function HintCard({ text }) {
  if (!text) return null;
  return (
    <div className="hint-card bg-blue-50 border border-blue-200 p-3 rounded mb-3 flex items-start">
      <span className="mr-2 mt-0.5">💡</span>
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}
