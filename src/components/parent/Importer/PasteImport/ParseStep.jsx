import React, { useEffect, useRef } from 'react';
import { parseContentToPages } from '../../../../services/contentParserService.js';

const CONFIDENCE_COLOR = (c) =>
  c >= 0.8 ? 'bg-green-500' : c >= 0.6 ? 'bg-amber-400' : 'bg-red-400';

function ConfidenceDot({ value }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${CONFIDENCE_COLOR(value ?? 0)}`} title={`Confidence: ${Math.round((value ?? 0) * 100)}%`} />
  );
}

export function ParseStep({ rawText, preferAI, importMode = 'worksheet', onDone, onBack }) {
  const [status, setStatus] = React.useState('parsing'); // 'parsing' | 'done' | 'error'
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let aborted = false;

    const apiKey = preferAI ? (localStorage.getItem('geminiApiKey') || '') : '';
    parseContentToPages(rawText, apiKey, { importMode })
      .then((res) => { if (!aborted) { setResult(res); setStatus('done'); } })
      .catch((err) => { if (!aborted) { setError(err.message); setStatus('error'); } });

    return () => { aborted = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'parsing') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Parsing content…</p>
        <p className="text-xs text-gray-400">{preferAI && localStorage.getItem('geminiApiKey') ? 'Using Gemini AI' : 'Using rule-based parser'}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="font-semibold text-red-700">Parse failed</p>
          <p className="text-sm text-red-600 mt-1 font-mono">{error}</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
          &larr; Back
        </button>
      </div>
    );
  }

  const { pages, issues, mode } = result;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-gray-800 font-semibold">
            Found {pages.length} page{pages.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {mode === 'ai' ? 'AI (Gemini)' : 'Rule-based'} parser &mdash; review and edit below
          </p>
        </div>
        {issues.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
            {issues.length} warning{issues.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {issues.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-amber-700 font-medium">Show parse warnings</summary>
          <ul className="mt-2 space-y-1 text-amber-600 pl-4 list-disc">
            {issues.map((iss, i) => (
              <li key={i}>{iss.message || String(iss)}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {pages.map((page, i) => (
          <div key={i} className="border border-gray-200 rounded p-3 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <ConfidenceDot value={page.sourceConfidence} />
              <span className="font-medium text-sm text-gray-800">{page.title || `Page ${i + 1}`}</span>
              <span className="ml-auto text-xs text-gray-400">{page.pagePurpose || 'lesson'}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{page.blocks?.length || 0}b</span>
              {page.questions?.length > 0 && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{page.questions.length}q</span>}
              {page.clarifiers?.length > 0 && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{page.clarifiers.length}c</span>}
              {page.estimatedMinutes > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{page.estimatedMinutes}min</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-between pt-2 border-t border-gray-100">
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
          &larr; Back
        </button>
        <button
          onClick={() => onDone(result)}
          className="px-6 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700"
        >
          Check for conflicts &rarr;
        </button>
      </div>
    </div>
  );
}
