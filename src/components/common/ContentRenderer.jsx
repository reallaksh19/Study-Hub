import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function normalizeMathMarkdown(content) {
  if (typeof content !== 'string') return content;
  // Some JSON strings used \frac with a single slash, which becomes a form-feed escape at parse time.
  const repairedLatexCommands = content.replace(/\f/g, '\\f');
  const normalizedDisplayMath = repairedLatexCommands.replace(/\\\[([\s\S]+?)\\\]/g, (_, expression) => `$$${expression}$$`);
  return normalizedDisplayMath.replace(/\\\(([\s\S]+?)\\\)/g, (_, expression) => `$${expression}$`);
}

export function ContentRenderer({ content }) {
  if (!content) return null;
  const normalizedContent = normalizeMathMarkdown(content);

  return (
    <div className="content-renderer">
      <ReactMarkdown
        children={normalizedContent}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      />
    </div>
  );
}
