// ParentWorksheet.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentWorksheet.jsx.
// Preserves: localStorage worksheet_selection_<subject>_<topic>, default-all save,
// getInteractiveResult per page, avg score summary, attempt count, clear-scores,
// quick-open links, "Start worksheet" link, Import shortcuts via topicEditorInitialTab.

import React, { useState, useEffect } from 'react';
import { readJSON } from '../../services/parentApiService.js';
import { getInteractiveResult } from '../../services/interactiveResultService.js';
import { Ico } from '../../lib/Icons.jsx';
import { useConfirm, useToast } from '../../lib/Toast.jsx';

function wsKey(subjectId, topicFolder) {
  return `worksheet_selection_${subjectId}_${topicFolder}`;
}
function loadSelection(subjectId, topicFolder) {
  try { return JSON.parse(localStorage.getItem(wsKey(subjectId, topicFolder)) || 'null'); }
  catch { return null; }
}
function saveSelection(subjectId, topicFolder, ids) {
  localStorage.setItem(wsKey(subjectId, topicFolder), JSON.stringify(ids));
}

function getPageMastery(pageId) {
  try {
    const raw = localStorage.getItem('study_hub_learning_state');
    if (!raw) return null;
    const state = JSON.parse(raw);
    const m = state?.pageProgress?.[pageId]?.mastery;
    return typeof m === 'number' ? m : null;
  } catch { return null; }
}

function toneFor(pct) {
  if (pct == null) return 'var(--color-muted)';
  if (pct >= 80) return 'var(--color-success)';
  if (pct >= 50) return 'var(--color-warn)';
  return 'var(--color-danger)';
}

function ScoreRow({ page }) {
  const result = getInteractiveResult(page.id);
  const hasScore = result && result.total > 0;
  const mastery = getPageMastery(page.id);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-ink truncate">{page.title}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {page.estimatedMinutes > 0 && (
            <span className="text-[11px] text-muted">{page.estimatedMinutes} min</span>
          )}
          {mastery !== null && (
            <span className="text-[11px] font-semibold" style={{ color: toneFor(mastery * 100) }}>
              Mastery {Math.round(mastery * 100)}%
            </span>
          )}
        </div>
      </div>
      {hasScore ? (
        <div className="text-right flex-shrink-0">
          <div className="text-[13px] font-bold stat" style={{ color: toneFor(result.percentage) }}>
            {result.score}/{result.total} <span className="font-medium opacity-80">({result.percentage}%)</span>
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {new Date(result.completedAt).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <span className="text-[11px] text-muted italic">Not attempted</span>
      )}
    </div>
  );
}

export function ParentWorksheet({ subjectId, topicFolder, subjectFolder }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [pages, setPages] = useState([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const diskFolder = subjectFolder || subjectId;

  useEffect(() => {
    (async () => {
      try {
        const topic = await readJSON(`${diskFolder}/${topicFolder}/topic.json`);
        const pageList = topic.pages || [];
        setTopicTitle(topic.title || topicFolder);
        setPages(pageList);

        const saved = loadSelection(subjectId, topicFolder);
        if (saved && Array.isArray(saved)) {
          setSelected(new Set(saved));
        } else {
          const allIds = pageList.map((p) => p.id);
          setSelected(new Set(allIds));
          saveSelection(subjectId, topicFolder, allIds);
        }
      } catch (err) {
        setError(`Failed to load topic.json for ${subjectId}/${topicFolder}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId, topicFolder]); // eslint-disable-line

  const toggle = (pageId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId); else next.add(pageId);
      saveSelection(subjectId, topicFolder, [...next]);
      return next;
    });
  };
  const selectAll = () => {
    const all = new Set(pages.map((p) => p.id));
    setSelected(all);
    saveSelection(subjectId, topicFolder, [...all]);
  };
  const clearAll = () => {
    setSelected(new Set());
    saveSelection(subjectId, topicFolder, []);
  };

  const selectedPages = pages.filter((p) => selected.has(p.id));
  const attempted = pages.filter((p) => {
    const r = getInteractiveResult(p.id);
    return r && r.total > 0;
  });
  const avgScore = attempted.length > 0
    ? Math.round(
        attempted.reduce((sum, p) => sum + (getInteractiveResult(p.id)?.percentage || 0), 0) /
          attempted.length
      )
    : null;
  const totalMinutes = selectedPages.reduce((sum, p) => sum + (p.estimatedMinutes || 0), 0);

  const getPageSlug = (entry) => {
    if (entry.file?.startsWith('pages/')) return entry.file.slice('pages/'.length).replace('.json', '');
    const id = String(entry.id || '');
    const prefix = `${subjectId}-${topicFolder}-`;
    return id.startsWith(prefix) ? id.slice(prefix.length) : id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted gap-3">
        <div
          className="w-7 h-7 rounded-full border-[3px] animate-spin"
          style={{ borderColor: 'var(--color-line-2)', borderTopColor: 'var(--color-brand)' }}
        />
        <span className="text-[13.5px]">Loading worksheet…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-5 rounded-[12px] text-[13.5px]"
        style={{ background: 'var(--color-danger-soft)', border: '1px solid #F2B3B3', color: 'var(--color-danger)' }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <a
            href={`#/parent/subject/${subjectId}/topic/${topicFolder}`}
            className="text-[13px] text-muted no-underline hover:text-ink inline-flex items-center gap-1 mb-1.5"
          >
            <Ico.ArrowLeft width="13" height="13" /> Back to topic
          </a>
          <h1 className="serif text-[30px] tracking-tight m-0 leading-[1.1]">Worksheet planner</h1>
          <p className="text-[13.5px] text-ink-3 m-0 mt-1">{topicTitle}</p>

          <div className="flex gap-2 mt-3.5 flex-wrap">
            <a
              href={`#/parent/subject/${subjectId}/topic/${topicFolder}`}
              onClick={() => sessionStorage.setItem('topicEditorInitialTab', 'Import')}
              className="sh-btn sh-btn-secondary text-[12px] no-underline"
              style={{ padding: '6px 11px', background: 'var(--color-brand-soft)', borderColor: '#D6D9FF', color: 'var(--color-brand-ink)' }}
              title="Add pages via paste or ZIP import"
            >
              <Ico.Upload width="13" height="13" /> Import content
            </a>
            <a
              href="#/parent/import-html"
              className="sh-btn sh-btn-secondary text-[12px] no-underline"
              style={{ padding: '6px 11px' }}
              title="Import pages from an HTML source file"
            >
              🌐 HTML import
            </a>
            <button
              onClick={() => window.location.reload()}
              className="sh-btn sh-btn-secondary text-[12px]"
              style={{ padding: '6px 11px' }}
              title="Reload to see newly imported pages"
            >
              ↻ Refresh
            </button>
          </div>
          <p className="text-[11.5px] text-muted mt-2 m-0">
            💡 After importing, tap <strong>Refresh</strong> — new pages will appear here automatically.
          </p>
        </div>

        {avgScore !== null && (
          <div className="bg-white border border-line-2 rounded-[14px] px-5 py-3 text-right">
            <div className="stat text-[28px] font-semibold leading-none" style={{ color: toneFor(avgScore) }}>
              {avgScore}%
            </div>
            <div className="text-[11px] text-muted mt-1.5">
              avg score · {attempted.length}/{pages.length} attempted
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Selector */}
        <div className="sh-card p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-semibold text-ink text-[15px] m-0">Select pages for worksheet</h2>
            <div className="flex gap-2 text-[12px]">
              <button onClick={selectAll}  className="text-brand font-semibold hover:underline">All</button>
              <span className="text-muted-2">|</span>
              <button onClick={clearAll}   className="text-muted hover:underline">None</button>
            </div>
          </div>

          {pages.length === 0 ? (
            <p className="text-[13px] text-muted py-6 text-center m-0">No pages in this topic yet.</p>
          ) : (
            <div className="space-y-1">
              {pages.map((page, i) => {
                const slug = getPageSlug(page);
                const pageUrl = `#/topic/${subjectId}-${topicFolder}/page/${slug}`;
                const result = getInteractiveResult(page.id);
                const hasScore = result && result.total > 0;
                const on = selected.has(page.id);
                return (
                  <label
                    key={page.id}
                    className="flex items-start gap-3 p-3 rounded-[10px] cursor-pointer border transition"
                    style={{
                      background: on ? 'var(--color-brand-soft)' : 'var(--color-paper-2)',
                      borderColor: on ? '#D6D9FF' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(page.id)}
                      className="mt-0.5 accent-brand"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-ink truncate">
                        {i + 1}. {page.title}
                      </div>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {page.estimatedMinutes > 0 && (
                          <span className="text-[11px] text-muted">{page.estimatedMinutes} min</span>
                        )}
                        {page.difficulty && (
                          <span
                            className="text-[10.5px] px-1.5 py-px rounded font-semibold"
                            style={
                              page.difficulty === 'easy'
                                ? { background: 'var(--color-success-soft)', color: 'var(--color-success)' }
                                : page.difficulty === 'hard'
                                ? { background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }
                                : { background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }
                            }
                          >
                            {page.difficulty}
                          </span>
                        )}
                        {hasScore && (
                          <span className="text-[11px] font-semibold" style={{ color: toneFor(result.percentage) }}>
                            {result.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={pageUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-brand hover:underline flex-shrink-0 mt-0.5 no-underline"
                      title="Open page"
                    >
                      Open →
                    </a>
                  </label>
                );
              })}
            </div>
          )}

          {selectedPages.length > 0 && (
            <div className="mt-5 pt-4 border-t border-line">
              <div className="flex items-center justify-between mb-3 text-[13px] text-ink-2 font-medium">
                <span>
                  {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                  {totalMinutes > 0 && (
                    <span className="text-muted ml-1">· ~{totalMinutes} min</span>
                  )}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {selectedPages.map((page, i) => {
                  const slug = getPageSlug(page);
                  return (
                    <a
                      key={page.id}
                      href={`#/topic/${subjectId}-${topicFolder}/page/${slug}`}
                      className="flex items-center gap-2 text-[13px] text-brand-ink hover:bg-brand-soft px-2 py-1.5 rounded no-underline"
                    >
                      <span className="text-[11px] text-muted w-4 text-right">{i + 1}.</span>
                      <span className="truncate">{page.title}</span>
                    </a>
                  );
                })}
              </div>
              <a
                href={`#/topic/${subjectId}-${topicFolder}/worksheet`}
                className="w-full sh-btn sh-btn-primary text-[13px] justify-center no-underline"
              >
                Start worksheet <Ico.Arrow width="14" height="14" />
              </a>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="sh-card p-5">
          <h2 className="font-semibold text-ink text-[15px] mb-3.5 m-0">Scoreboard</h2>
          {pages.length === 0 ? (
            <p className="text-[13px] text-muted py-6 text-center m-0">No pages to show scores for.</p>
          ) : (
            <>
              <div className="divide-y divide-line">
                {pages.map((page) => <ScoreRow key={page.id} page={page} />)}
              </div>
              <div className="mt-4 pt-4 border-t border-line text-[13px] text-ink-3">
                {attempted.length === 0 ? (
                  <p className="m-0">No scores yet. Scores appear when the student submits interactive HTML pages.</p>
                ) : (
                  <p className="m-0">
                    <strong className="text-ink">{attempted.length}</strong> of <strong className="text-ink">{pages.length}</strong> attempted
                    {avgScore !== null && (
                      <>
                        {' · average '}
                        <strong style={{ color: toneFor(avgScore) }}>{avgScore}%</strong>
                      </>
                    )}
                  </p>
                )}
              </div>
              {attempted.length > 0 && (
                <button
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Clear worksheet scores?',
                      body: 'This removes local worksheet scores for every page in this topic.',
                      confirmLabel: 'Clear scores',
                      variant: 'danger',
                    });
                    if (!ok) return;
                    try {
                      const store = JSON.parse(localStorage.getItem('study_hub_interactive_results_v1') || '{}');
                      pages.forEach((p) => { delete store[p.id]; });
                      localStorage.setItem('study_hub_interactive_results_v1', JSON.stringify(store));
                    } catch {}
                    toast.show('Worksheet scores cleared.', { variant: 'success' });
                    window.location.reload();
                  }}
                  className="mt-3 text-[11.5px] text-muted hover:text-danger underline"
                >
                  Clear all scores
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
