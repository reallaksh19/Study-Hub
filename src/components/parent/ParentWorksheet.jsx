import React, { useState, useEffect } from 'react';
import { readJSON } from '../../services/parentApiService.js';
import { getInteractiveResult } from '../../services/interactiveResultService.js';

// ─── localStorage helpers ─────────────────────────────────────────────────────

function wsKey(subjectId, topicFolder) {
  return `worksheet_selection_${subjectId}_${topicFolder}`;
}

function loadSelection(subjectId, topicFolder) {
  try {
    return JSON.parse(localStorage.getItem(wsKey(subjectId, topicFolder)) || 'null');
  } catch {
    return null;
  }
}

function saveSelection(subjectId, topicFolder, ids) {
  localStorage.setItem(wsKey(subjectId, topicFolder), JSON.stringify(ids));
}

// ─── Read mastery from StudyContext localStorage ──────────────────────────────

function getPageMastery(pageId) {
  try {
    const raw = localStorage.getItem('study_hub_learning_state');
    if (!raw) return null;
    const state = JSON.parse(raw);
    const mastery = state?.pageProgress?.[pageId]?.mastery;
    return typeof mastery === 'number' ? mastery : null;
  } catch {
    return null;
  }
}

// ─── Per-page score row ───────────────────────────────────────────────────────

function ScoreRow({ page }) {
  const result = getInteractiveResult(page.id);
  const hasScore = result && result.total > 0;
  const mastery = getPageMastery(page.id);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{page.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {page.estimatedMinutes > 0 && (
            <span className="text-xs text-gray-400">{page.estimatedMinutes} min</span>
          )}
          {mastery !== null && (
            <span className={`text-xs font-medium ${mastery >= 0.8 ? 'text-green-600' : mastery >= 0.5 ? 'text-amber-600' : 'text-red-500'}`}>
              Mastery {Math.round(mastery * 100)}%
            </span>
          )}
        </div>
      </div>
      {hasScore ? (
        <div className="text-right flex-shrink-0">
          <div className={`text-sm font-bold ${result.percentage >= 80 ? 'text-green-600' : result.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {result.score}/{result.total} ({result.percentage}%)
          </div>
          <div className="text-xs text-gray-400">
            {new Date(result.completedAt).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <span className="text-xs text-gray-400 flex-shrink-0">Not attempted</span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParentWorksheet({ subjectId, topicFolder, subjectFolder }) {
  const [pages, setPages] = useState([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use real disk folder (may differ from subjectId, e.g. "Grade 4 English" vs "grade4english")
  const diskFolder = subjectFolder || subjectId;

  useEffect(() => {
    async function load() {
      try {
        const topic = await readJSON(`${diskFolder}/${topicFolder}/topic.json`);
        const pageList = topic.pages || [];
        setTopicTitle(topic.title || topicFolder);
        setPages(pageList);

        // Restore saved selection or default to all (and save default so student can see worksheet button)
        const saved = loadSelection(subjectId, topicFolder);
        if (saved && Array.isArray(saved)) {
          setSelected(new Set(saved));
        } else {
          const allIds = pageList.map(p => p.id);
          setSelected(new Set(allIds));
          saveSelection(subjectId, topicFolder, allIds); // persist so TopicHome can detect worksheet
        }
      } catch (err) {
        setError(`Failed to load topic.json for ${subjectId}/${topicFolder}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subjectId, topicFolder]);

  function toggle(pageId) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      saveSelection(subjectId, topicFolder, [...next]);
      return next;
    });
  }

  function selectAll() {
    const all = new Set(pages.map(p => p.id));
    setSelected(all);
    saveSelection(subjectId, topicFolder, [...all]);
  }

  function clearAll() {
    setSelected(new Set());
    saveSelection(subjectId, topicFolder, []);
  }

  const selectedPages = pages.filter(p => selected.has(p.id));
  const attempted = pages.filter(p => {
    const r = getInteractiveResult(p.id);
    return r && r.total > 0;
  });
  const avgScore = attempted.length > 0
    ? Math.round(attempted.reduce((sum, p) => {
        const r = getInteractiveResult(p.id);
        return sum + (r?.percentage || 0);
      }, 0) / attempted.length)
    : null;

  function getPageSlug(pageEntry) {
    if (pageEntry.file?.startsWith('pages/')) {
      return pageEntry.file.slice('pages/'.length).replace('.json', '');
    }
    const id = String(pageEntry.id || '');
    const prefix = `${subjectId}-${topicFolder}-`;
    return id.startsWith(prefix) ? id.slice(prefix.length) : id;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mr-3" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-sm text-gray-400 mb-1">
            <a href={`#/parent/subject/${subjectId}/topic/${topicFolder}`} className="hover:underline">
              ← Back to topic
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Worksheet Planner</h1>
          <p className="text-gray-500 mt-1">{topicTitle}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <a
              href={`#/parent/subject/${subjectId}/topic/${topicFolder}`}
              onClick={() => sessionStorage.setItem('topicEditorInitialTab', 'Import')}
              className="inline-flex items-center gap-1.5 text-xs border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              title="Add pages via paste or ZIP import — they'll appear in this list"
            >
              📥 Import Content
            </a>
            <a
              href="#/parent/import-html"
              className="inline-flex items-center gap-1.5 text-xs border border-gray-200 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              title="Import pages from an HTML source file"
            >
              🌐 HTML Import
            </a>
            <button
              onClick={() => { window.location.reload(); }}
              className="inline-flex items-center gap-1 text-xs border border-gray-200 bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Reload to see newly imported pages"
            >
              ↻ Refresh list
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 After importing, use <strong>↻ Refresh list</strong> — new pages will appear here automatically.
          </p>
        </div>

        {avgScore !== null && (
          <div className="text-right bg-white border rounded-xl px-5 py-3 shadow-sm">
            <div className={`text-2xl font-bold ${avgScore >= 80 ? 'text-green-600' : avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {avgScore}%
            </div>
            <div className="text-xs text-gray-500 mt-0.5">avg score ({attempted.length}/{pages.length} attempted)</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: page selector */}
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Select pages for worksheet</h2>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-indigo-600 hover:underline">All</button>
              <span className="text-gray-300">|</span>
              <button onClick={clearAll} className="text-xs text-gray-500 hover:underline">None</button>
            </div>
          </div>

          {pages.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No pages in this topic yet.</p>
          ) : (
            <div className="space-y-1">
              {pages.map((page, i) => {
                const slug = getPageSlug(page);
                const pageUrl = `#/topic/${subjectId}-${topicFolder}/page/${slug}`;
                const result = getInteractiveResult(page.id);
                const hasScore = result && result.total > 0;

                return (
                  <label
                    key={page.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                      selected.has(page.id)
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-gray-50 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(page.id)}
                      onChange={() => toggle(page.id)}
                      className="mt-0.5 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">
                        {i + 1}. {page.title}
                      </div>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {page.estimatedMinutes > 0 && (
                          <span className="text-xs text-gray-400">{page.estimatedMinutes}min</span>
                        )}
                        {page.difficulty && (
                          <span className={`text-xs px-1.5 rounded ${
                            page.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            page.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>{page.difficulty}</span>
                        )}
                        {hasScore && (
                          <span className={`text-xs font-medium ${result.percentage >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                            {result.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={pageUrl}
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-indigo-500 hover:underline flex-shrink-0 mt-0.5"
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
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                  {selectedPages.reduce((sum, p) => sum + (p.estimatedMinutes || 0), 0) > 0 && (
                    <span className="text-gray-400 ml-1">
                      · ~{selectedPages.reduce((sum, p) => sum + (p.estimatedMinutes || 0), 0)} min
                    </span>
                  )}
                </span>
              </div>

              {/* Quick-open links for each selected page */}
              <div className="space-y-1">
                {selectedPages.map((page, i) => {
                  const slug = getPageSlug(page);
                  return (
                    <a
                      key={page.id}
                      href={`#/topic/${subjectId}-${topicFolder}/page/${slug}`}
                      className="flex items-center gap-2 text-sm text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded"
                    >
                      <span className="text-xs text-gray-400 w-4 text-right">{i + 1}.</span>
                      <span className="truncate">{page.title}</span>
                    </a>
                  );
                })}
              </div>

              <a
                href={`#/topic/${subjectId}-${topicFolder}/worksheet`}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700"
              >
                Start worksheet →
              </a>
            </div>
          )}
        </div>

        {/* Right: scoreboard */}
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Scoreboard</h2>

          {pages.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No pages to show scores for.</p>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {pages.map(page => (
                  <ScoreRow key={page.id} page={page} />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                {attempted.length === 0 ? (
                  <p>No scores yet. Scores appear when the student submits interactive HTML pages.</p>
                ) : (
                  <p>
                    <strong className="text-gray-800">{attempted.length}</strong> of <strong className="text-gray-800">{pages.length}</strong> pages attempted
                    {avgScore !== null && <> · average <strong className={`${avgScore >= 80 ? 'text-green-600' : avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{avgScore}%</strong></>}
                  </p>
                )}
              </div>

              {attempted.length > 0 && (
                <button
                  onClick={() => {
                    if (!window.confirm('Clear all scores for this topic?')) return;
                    try {
                      const store = JSON.parse(localStorage.getItem('study_hub_interactive_results_v1') || '{}');
                      pages.forEach(p => { delete store[p.id]; });
                      localStorage.setItem('study_hub_interactive_results_v1', JSON.stringify(store));
                    } catch {}
                    window.location.reload();
                  }}
                  className="mt-3 text-xs text-gray-400 hover:text-red-500 underline"
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
