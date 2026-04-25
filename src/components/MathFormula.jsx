import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function MathFormula({ latex, displayMode = false }) {
  if (!latex) return null;

  try {
    const rendered = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });

    if (displayMode) {
      return (
        <div
          className="overflow-x-auto my-2"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      );
    }
    return (
      <span dangerouslySetInnerHTML={{ __html: rendered }} />
    );
  } catch (error) {
    console.error("KaTeX render error:", error);
    return <code className="text-red-600 px-1">{latex}</code>;
  }
}
