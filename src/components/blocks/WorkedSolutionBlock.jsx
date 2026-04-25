import React, { useState } from 'react';

export function WorkedSolutionBlock({ title, steps, answer }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="worked-solution-block border rounded p-4">
      <div
        className="cursor-pointer font-bold flex justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title || 'Worked Example'}</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div className="mt-4">
          <ol className="list-decimal pl-5">
            {steps.map((step, idx) => (
              <li key={idx} className="mb-2">
                {/* Normally ContentRenderer handles markdown+KaTeX */}
                <div dangerouslySetInnerHTML={{ __html: step }} />
              </li>
            ))}
          </ol>
          {answer && (
            <div className="mt-4 p-2 bg-green-50 border-green-200 border rounded font-bold">
              Answer: <span dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
