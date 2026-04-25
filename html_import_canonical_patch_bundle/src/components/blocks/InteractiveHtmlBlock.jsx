import React, { useEffect, useRef, useState } from 'react';
import { saveInteractiveResult, getInteractiveResult } from '../../services/interactiveResultService.js';

export function InteractiveHtmlBlock({ assetPath, mode = 'iframe', trackResults = true, pageId, topicId }) {
  const iframeRef = useRef(null);
  const [result, setResult] = useState(() => (pageId ? getInteractiveResult(pageId) : null));

  useEffect(() => {
    if (!trackResults) return undefined;

    function handleMessage(event) {
      const data = event?.data;
      if (!data || data.type !== 'studyhub:quiz_result') return;
      const payload = data.payload || {};
      if (pageId && payload.pageId && payload.pageId !== pageId) return;
      const saved = saveInteractiveResult({
        ...payload,
        pageId: payload.pageId || pageId,
        topicId: payload.topicId || topicId
      });
      setResult(saved);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [trackResults, pageId, topicId]);

  if (!assetPath) {
    return <div className="border border-amber-200 bg-amber-50 text-amber-900 rounded-lg p-4">Interactive HTML asset path is missing.</div>;
  }

  return (
    <div className="mb-6">
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <iframe
          ref={iframeRef}
          src={assetPath}
          title={pageId || 'Interactive HTML'}
          className="w-full min-h-[720px] border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>
      {trackResults && (
        <div className="mt-3 text-sm text-gray-600 rounded-lg border bg-gray-50 p-3">
          {result ? (
            <span>
              Last attempt: <strong>{result.score} / {result.total}</strong> ({result.percentage}%)
            </span>
          ) : (
            <span>No result captured yet. Interactive HTML can post results using <code>studyhub:quiz_result</code>.</span>
          )}
        </div>
      )}
    </div>
  );
}
