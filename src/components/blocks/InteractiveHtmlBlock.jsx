import React, { useEffect, useMemo, useRef, useState } from 'react';
import { saveInteractiveResult, getInteractiveResult } from '../../services/interactiveResultService.js';
import { deriveAllowedOrigins, isAllowedOrigin } from '../../integration/activityBridge/originPolicy.js';
import { isKaniActivityMessage, parseKaniActivityMessage } from '../../integration/activityBridge/messageValidator.js';

export function InteractiveHtmlBlock({ assetPath, mode = 'iframe', trackResults = true, pageId, topicId }) {
  const iframeRef = useRef(null);
  const [result, setResult] = useState(() => (pageId ? getInteractiveResult(pageId) : null));
  const allowedOrigins = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return deriveAllowedOrigins({ assetUrl: assetPath, currentOrigin: window.location.origin });
  }, [assetPath]);

  useEffect(() => {
    if (!trackResults) return undefined;

    function saveResult(payload) {
      if (pageId && payload.pageId && payload.pageId !== pageId) return;
      const saved = saveInteractiveResult({
        ...payload,
        pageId: payload.pageId || pageId,
        topicId: payload.topicId || topicId
      });
      setResult(saved);
    }

    function handleMessage(event) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isAllowedOrigin(event.origin, allowedOrigins)) return;
      const data = event?.data;
      if (!data) return;

      // Backward-compatible migration path for existing embedded Study-Hub interactives.
      if (data.type === 'studyhub:quiz_result') {
        saveResult(data.payload || {});
        return;
      }

      // Kani-wide activity contract. Only validated completion messages are persisted here.
      if (!isKaniActivityMessage(data)) return;
      const message = parseKaniActivityMessage(data);
      if (message.type !== 'kani.activity.completed') return;
      const payload = message.payload;
      saveResult({
        activityId: message.activityId,
        studentId: payload.studentId,
        attemptId: payload.attemptId,
        score: payload.correct ?? payload.score ?? 0,
        rawScore: payload.score,
        total: payload.total ?? 0,
        correctCount: payload.correct ?? 0,
        wrongCount: Math.max(0, (payload.total ?? 0) - (payload.correct ?? 0)),
        percentage: typeof payload.accuracy === 'number' ? Math.round(payload.accuracy * 100) : undefined,
        completedAt: payload.completedAt,
        contractVersion: message.schemaVersion
      });
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [trackResults, pageId, topicId, allowedOrigins]);

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
            <span>No result captured yet. Interactive content can report via <code>kani.activity.completed</code> (legacy <code>studyhub:quiz_result</code> is still accepted).</span>
          )}
        </div>
      )}
    </div>
  );
}
