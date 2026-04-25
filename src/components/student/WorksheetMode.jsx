import React, { useState, useMemo, useEffect } from 'react';
import { StudyGuide } from '../StudyGuide/index.jsx';
import { InteractiveHtmlBlock } from '../blocks/InteractiveHtmlBlock.jsx';

// True when every block on the page is interactive_html (no text content alongside)
function isInteractivePage(page) {
  const blocks = page?.blocks || [];
  return blocks.length > 0 && blocks.every((b) => b.type === 'interactive_html');
}

function getTopicFolder(topic) {
  if (typeof topic.folder === 'string' && topic.folder.length > 0) return topic.folder;
  const id = String(topic.id || '');
  const prefix = `${topic.subjectId}-`;
  return id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

function loadWorksheetSelection(subjectId, topicFolder) {
  try {
    const raw = localStorage.getItem(`worksheet_selection_${subjectId}_${topicFolder}`);
    const ids = JSON.parse(raw || 'null');
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

// ─── Completion screen ────────────────────────────────────────────────────────

function CompletionScreen({ pages, onRestart, onBack }) {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Worksheet complete!</h1>
        <p className="text-gray-500">{pages.length} page{pages.length !== 1 ? 's' : ''} covered</p>
      </div>

      <div className="bg-white border rounded-xl divide-y divide-gray-100 mb-6 shadow-sm">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-green-600 text-lg flex-shrink-0">✓</span>
            <span className="text-sm font-medium text-gray-800">{page.title}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
          Restart worksheet
        </button>
        <button
          onClick={onBack}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
        >
          Back to topic
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorksheetMode({ topic, subject, state, onBack, onMarkRead, onPageOpen, onTagPage, onUntagPage }) {
  const subjectId = topic.subjectId;
  const topicFolder = getTopicFolder(topic);

  // Live-fetched pages — used when DataContext hasn't reloaded after a recent import
  const [liveFetchedPages, setLiveFetchedPages] = useState(null); // null = not yet tried

  // Build ordered page list from topic._fullPages filtered by saved selection
  const worksheetPages = useMemo(() => {
    const selectedIds = loadWorksheetSelection(subjectId, topicFolder);
    const source = liveFetchedPages ?? (topic._fullPages || []).map((p) => p._fullData).filter(Boolean);

    if (!selectedIds) return source; // no selection → all pages

    return selectedIds
      .map((id) => source.find((p) => p?.id === id) || null)
      .filter(Boolean);
  }, [topic._fullPages, subjectId, topicFolder, liveFetchedPages]);

  // If DataContext has no pages but topic.json says there are some, fetch them fresh
  useEffect(() => {
    const contextEmpty = (topic._fullPages || []).length === 0;
    const topicHasPages = (topic.pages || []).length > 0;
    if (!contextEmpty || !topicHasPages) return;

    const subjectFolder = topic._subjectFolder || subjectId;
    Promise.all(
      (topic.pages || []).map(async (entry) => {
        try {
          const res = await fetch(`/api/json?path=${encodeURIComponent(`${subjectFolder}/${topicFolder}/${entry.file}`)}`);
          if (!res.ok) return null;
          return await res.json();
        } catch { return null; }
      })
    ).then((results) => setLiveFetchedPages(results.filter(Boolean)));
  }, [topic.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentPage = worksheetPages[currentIndex];
  const progress = worksheetPages.length > 0
    ? Math.round(((currentIndex + 1) / worksheetPages.length) * 100)
    : 0;

  // ── Loading (fetching fresh after stale DataContext) ─────────────────────
  if (worksheetPages.length === 0 && liveFetchedPages === null && (topic.pages || []).length > 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 flex flex-col items-center gap-4 pt-24">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading worksheet pages…</p>
      </div>
    );
  }

  // ── No pages ──────────────────────────────────────────────────────────────
  if (worksheetPages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-center">
          <p className="font-semibold text-lg mb-2">No pages selected</p>
          <p className="text-sm">Use the Worksheet Planner in the parent portal to select which pages appear here.</p>
        </div>
      </div>
    );
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (completed) {
    return (
      <CompletionScreen
        pages={worksheetPages}
        onRestart={() => { setCurrentIndex(0); setCompleted(false); }}
        onBack={onBack}
      />
    );
  }

  // ── Page navigation ───────────────────────────────────────────────────────
  const goNext = () => {
    if (onMarkRead) onMarkRead(currentPage.id);
    if (currentIndex < worksheetPages.length - 1) {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCompleted(true);
    }
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const interactive = isInteractivePage(currentPage);

  return (
    <div className={interactive ? 'flex flex-col' : ''} style={interactive ? { height: '100vh', overflow: 'hidden' } : {}}>
      {/* ── Sticky progress header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div className="px-4 py-2 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-800 flex-shrink-0 font-medium whitespace-nowrap"
          >
            ← Topic
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-0.5">
              <span className="truncate font-medium">{topic.title} · {currentPage.title}</span>
              <span className="flex-shrink-0 ml-2">Page {currentIndex + 1} of {worksheetPages.length}</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      {interactive ? (
        // Full-width flex-fill iframe — takes all space between top bar and bottom nav
        <div className="flex-1 min-h-0 w-full">
          {(currentPage.blocks || []).map((block) => {
            const d = block.data || {};
            return (
              <iframe
                key={block.id}
                src={d.assetPath}
                title={currentPage.title}
                className="w-full h-full border-0 block"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              />
            );
          })}
        </div>
      ) : (
        <StudyGuide
          subject={subject}
          topic={topic}
          page={currentPage}
          studyState={state}
          onBack={currentIndex > 0 ? goPrev : onBack}
          onTagPage={onTagPage}
          onUntagPage={onUntagPage}
          onMarkRead={onMarkRead}
          onPageOpen={onPageOpen}
          settings={{ geminiApiKey: localStorage.getItem('geminiApiKey') || '' }}
          onPageChange={(targetId) => {
            if (targetId === 'home') { onBack(); return; }
            const idx = worksheetPages.findIndex((p) => p.id === targetId);
            if (idx !== -1) setCurrentIndex(idx);
          }}
        />
      )}

      {/* ── Bottom nav ── */}
      <div className={`border-t border-gray-200 bg-white z-20 flex-shrink-0 ${interactive ? '' : 'sticky bottom-0'}`}>
        <div className="px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous page
          </button>

          <div className="flex gap-1">
            {worksheetPages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-indigo-600' : i < currentIndex ? 'bg-indigo-300' : 'bg-gray-300'}`}
                title={`Page ${i + 1}`}
              />
            ))}
          </div>

          {currentIndex < worksheetPages.length - 1 ? (
            <button
              onClick={goNext}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              ✓ Done — Next page →
            </button>
          ) : (
            <button
              onClick={goNext}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              Complete worksheet ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
