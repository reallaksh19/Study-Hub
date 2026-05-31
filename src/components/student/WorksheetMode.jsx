// WorksheetMode.jsx — UPGRADED
// Drop-in replacement for src/components/student/WorksheetMode.jsx.
// Preserves: localStorage selection load, live-fetch fallback for stale DataContext,
//            interactive_html full-bleed iframe path, regular StudyGuide path,
//            sticky top/bottom nav, dot indicator, completion screen.

import React, { useState, useMemo, useEffect } from 'react';
import { StudyGuide } from '../StudyGuide/index.jsx';
import { Ico } from '../../lib/Icons.jsx';

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

function CompletionScreen({ pages, onRestart, onBack }) {
  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-10">
        <div className="text-center mb-7">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="serif text-3xl m-0">Worksheet complete</h1>
          <p className="text-muted m-0 mt-1">
            {pages.length} page{pages.length !== 1 ? 's' : ''} covered
          </p>
        </div>

        <div className="bg-white border border-line-2 rounded-[14px] divide-y divide-line mb-5">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-success flex-shrink-0">
                <Ico.Check width="18" height="18" />
              </span>
              <span className="text-[13.5px] font-medium text-ink">{page.title}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={onRestart} className="sh-btn sh-btn-secondary">Restart worksheet</button>
          <button onClick={onBack} className="sh-btn sh-btn-primary">Back to topic</button>
        </div>
      </div>
    </div>
  );
}

export function WorksheetMode({ topic, subject, state, onBack, onMarkRead, onPageOpen, onTagPage, onUntagPage }) {
  const subjectId = topic.subjectId;
  const topicFolder = getTopicFolder(topic);

  const [liveFetchedPages, setLiveFetchedPages] = useState(null);

  const worksheetPages = useMemo(() => {
    const selectedIds = loadWorksheetSelection(subjectId, topicFolder);
    const source = liveFetchedPages ?? (topic._fullPages || []).map((p) => p._fullData).filter(Boolean);
    if (!selectedIds) return source;
    return selectedIds.map((id) => source.find((p) => p?.id === id) || null).filter(Boolean);
  }, [topic._fullPages, subjectId, topicFolder, liveFetchedPages]);

  useEffect(() => {
    const contextEmpty = (topic._fullPages || []).length === 0;
    const topicHasPages = (topic.pages || []).length > 0;
    if (!contextEmpty || !topicHasPages) return;

    const subjectFolder = topic._subjectFolder || subjectId;
    Promise.all(
      (topic.pages || []).map(async (entry) => {
        try {
          const res = await fetch(
            `/api/json?path=${encodeURIComponent(`${subjectFolder}/${topicFolder}/${entry.file}`)}`
          );
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

  // ── Loading ─────────────────────────────────────────────────────
  if (worksheetPages.length === 0 && liveFetchedPages === null && (topic.pages || []).length > 0) {
    return (
      <div className="bg-paper min-h-screen flex flex-col items-center pt-24 gap-4 px-6">
        <div
          className="w-9 h-9 rounded-full border-[3px] animate-spin"
          style={{ borderColor: 'var(--color-line-2)', borderTopColor: 'var(--color-brand)' }}
        />
        <p className="text-muted text-[13.5px]">Loading worksheet pages…</p>
      </div>
    );
  }

  // ── No pages ────────────────────────────────────────────────────
  if (worksheetPages.length === 0) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-8">
          <button onClick={onBack} className="sh-btn sh-btn-ghost text-[13px] pl-0 mb-5">
            <Ico.ArrowLeft width="16" height="16" /> Back
          </button>
          <div
            className="rounded-[14px] border p-6 text-center"
            style={{ background: 'var(--color-warn-soft)', borderColor: '#EBD79A', color: '#7A4A09' }}
          >
            <p className="font-semibold text-lg m-0 mb-2">No pages selected</p>
            <p className="text-[13.5px] m-0">
              Use the Worksheet Planner in the parent portal to select which pages appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <CompletionScreen
        pages={worksheetPages}
        onRestart={() => { setCurrentIndex(0); setCompleted(false); }}
        onBack={onBack}
      />
    );
  }

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
    <div
      className={interactive ? 'flex flex-col bg-paper' : 'bg-paper'}
      style={interactive ? { height: '100vh', overflow: 'hidden' } : {}}
    >
      {/* Sticky top */}
      <div className="bg-white border-b border-line sticky top-0 z-20 flex-shrink-0">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={onBack} className="sh-btn sh-btn-ghost text-[12.5px] pl-0 whitespace-nowrap">
            <Ico.ArrowLeft width="14" height="14" /> Topic
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[12px] text-muted mb-1">
              <span className="truncate font-medium text-ink-2">
                {topic.title} · {currentPage.title}
              </span>
              <span className="flex-shrink-0 ml-2">
                Page {currentIndex + 1} of {worksheetPages.length}
              </span>
            </div>
            <div className="h-1 bg-paper-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span
            className="sh-chip flex-shrink-0"
            style={{ background: 'var(--color-accent-soft)', borderColor: '#EAC7A4', color: 'var(--color-accent)' }}
          >
            📋 Worksheet
          </span>
        </div>
      </div>

      {/* Page content */}
      {interactive ? (
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

      {/* Sticky bottom */}
      <div className={`border-t border-line bg-white z-20 flex-shrink-0 ${interactive ? '' : 'sticky bottom-0'}`}>
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <button onClick={goPrev} disabled={currentIndex === 0} className="sh-btn sh-btn-secondary text-[12.5px] disabled:opacity-40">
            <Ico.ArrowLeft width="13" height="13" /> Previous
          </button>

          <div className="flex gap-1.5">
            {worksheetPages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                title={`Page ${i + 1}`}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  background:
                    i === currentIndex ? 'var(--color-brand)' :
                    i < currentIndex  ? 'var(--color-brand-2)' : 'var(--color-line-2)',
                }}
              />
            ))}
          </div>

          {currentIndex < worksheetPages.length - 1 ? (
            <button onClick={goNext} className="sh-btn sh-btn-primary text-[12.5px]">
              <Ico.Check width="13" height="13" /> Done · Next
            </button>
          ) : (
            <button onClick={goNext} className="sh-btn text-[12.5px]" style={{ background: 'var(--color-success)', color: '#fff' }}>
              Complete <Ico.Check width="13" height="13" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
