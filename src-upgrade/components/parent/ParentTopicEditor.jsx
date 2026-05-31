// ParentTopicEditor.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentTopicEditor.jsx.
// Preserves: 4 tabs (Pages / Organise / Worksheet / Import), deep-link tab via
// sessionStorage 'topicEditorInitialTab', topic.json read/save, validateTopic,
// add page → saveJSON, delete topic 2-step, examDurationMinutes onBlur save.

import React, { useState, useEffect } from 'react';
import { ParentPageEditor } from './ParentPageEditor.jsx';
import { ParentWorksheet } from './ParentWorksheet.jsx';
import { ParentOrganiser } from './ParentOrganiser.jsx';
import { PasteImportWizard } from './Importer/PasteImport/PasteImportWizard.jsx';
import { validateTopic } from '../../content/contentPackSchema.js';
import { readJSON, saveJSON } from '../../services/parentApiService.js';
import { slugify } from '../../utils/slugify.js';
import { Ico } from '../../lib/Icons.jsx';

function titleFromFolder(folder) {
  return String(folder || '').split('-').filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function buildDefaultTopic(subjectId, topicFolder) {
  return {
    id: `${subjectId}-${topicFolder}`,
    subjectId,
    title: titleFromFolder(topicFolder) || 'Untitled Topic',
    difficulty: 'medium',
    estimatedMinutes: 0,
    pages: [],
  };
}

function normalizeTopicData(raw, subjectId, topicFolder) {
  const base = buildDefaultTopic(subjectId, topicFolder);
  return {
    ...base,
    ...raw,
    id: String(raw?.id || base.id),
    subjectId: String(raw?.subjectId || base.subjectId),
    title: String(raw?.title || base.title),
    pages: Array.isArray(raw?.pages) ? raw.pages : [],
  };
}

const TABS = [
  { id: 'Pages',     emoji: '📝', label: 'Pages' },
  { id: 'Organise',  emoji: '🗂', label: 'Organise' },
  { id: 'Worksheet', emoji: '📋', label: 'Worksheet' },
  { id: 'Import',    emoji: '📥', label: 'Import' },
];

export function ParentTopicEditor({ subjectId, topicFolder, subjects = [], topics = [], onDirtyChange }) {
  const [topicData, setTopicData] = useState(buildDefaultTopic(subjectId, topicFolder));
  const [activePageSlug, setActivePageSlug] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const hint = sessionStorage.getItem('topicEditorInitialTab');
    if (hint && TABS.some((t) => t.id === hint)) {
      sessionStorage.removeItem('topicEditorInitialTab');
      return hint;
    }
    return 'Pages';
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const topicFilePath = `${subjectId}/${topicFolder}/topic.json`;
  const subjectTitle = subjects.find((s) => s.id === subjectId)?.title || subjectId;

  const resolvePageSlugFromId = (pageId) => {
    const meta = (topicData.pages || []).find((p) => p.id === pageId);
    if (typeof meta?.file === 'string' && meta.file.startsWith('pages/')) {
      return meta.file.replace(/^pages\//, '').replace(/\.json$/, '');
    }
    return String(pageId || '').split('-').pop();
  };

  useEffect(() => {
    (async () => {
      try {
        const fileData = await readJSON(topicFilePath);
        const normalized = normalizeTopicData(fileData, subjectId, topicFolder);
        setTopicData(normalized);
        setActivePageSlug(normalized.pages[0]?.id || null);
      } catch {
        setTopicData(buildDefaultTopic(subjectId, topicFolder));
        setActivePageSlug(null);
      }
    })();
  }, [subjectId, topicFolder, topicFilePath]);

  useEffect(() => {
    const validation = validateTopic(topicData);
    setValidationErrors(validation.success ? [] : [validation.error]);
  }, [topicData]);

  const saveTopicMeta = async (updated) => {
    setSavingMeta(true);
    try { await saveJSON(topicFilePath, updated); }
    catch (err) { alert('Failed to save topic: ' + err.message); }
    finally { setSavingMeta(false); }
  };

  const handleAddPage = async () => {
    const title = window.prompt('Enter new page title:');
    if (!title) return;
    const slug = slugify(title);
    const meta = {
      id: `${subjectId}-${topicFolder}-${slug}`,
      file: `pages/${slug}.json`,
      title,
      order: (topicData.pages?.length || 0) + 1,
      estimatedMinutes: 10,
    };
    const newTopic = { ...topicData, pages: [...(topicData.pages || []), meta] };
    const blank = { id: meta.id, topicId: newTopic.id, title, blocks: [], clarifiers: [], questions: [] };
    try {
      await saveJSON(`${subjectId}/${topicFolder}/pages/${slug}.json`, blank);
      await saveJSON(topicFilePath, newTopic);
      setTopicData(newTopic);
      setActivePageSlug(meta.id);
      window.location.hash = `#/parent/subject/${subjectId}/topic/${topicFolder}/page/${slug}`;
    } catch {
      alert('Failed to add page');
    }
  };

  const handlePageSelect = (pageId) => {
    const slug = resolvePageSlugFromId(pageId);
    window.location.hash = `#/parent/subject/${subjectId}/topic/${topicFolder}/page/${slug}`;
  };

  const handleDeleteTopic = async () => {
    if (!window.confirm(`Delete topic "${topicData.title}" and ALL its pages?\n\nThis cannot be undone.`)) return;
    const typed = window.prompt(`To confirm, type the topic name exactly:\n\n"${topicData.title}"`);
    if (typed !== topicData.title) { if (typed !== null) alert('Name did not match. Deletion cancelled.'); return; }
    try {
      const { deleteDirectory } = await import('../../services/parentApiService.js');
      await deleteDirectory(`${subjectId}/${topicFolder}`);
      window.location.hash = `#/parent/subject/${subjectId}`;
      window.location.reload();
    } catch (err) {
      alert('Failed to delete topic: ' + err.message);
    }
  };

  const handleExamDurationBlur = async (e) => {
    const val = parseInt(e.target.value, 10);
    const updated = { ...topicData, examDurationMinutes: isNaN(val) || val < 0 ? 0 : val };
    setTopicData(updated);
    await saveTopicMeta(updated);
  };

  return (
    <div className="flex flex-col h-full bg-paper">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-muted px-5 pt-3.5 pb-1.5">
        <a href={`#/parent/subject/${subjectId}`} className="hover:text-ink no-underline">{subjectTitle}</a>
        <span className="opacity-50">›</span>
        <span className="text-ink-2 font-semibold">{topicData.title}</span>
        {savingMeta && (
          <span className="ml-2 text-[11.5px] inline-flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Saving…
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-line px-5 bg-white">
        {TABS.map((tab) => {
          const on = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 transition -mb-px text-[13.5px]"
              style={{
                borderBottom: `2px solid ${on ? 'var(--color-ink)' : 'transparent'}`,
                color: on ? 'var(--color-ink)' : 'var(--color-muted)',
                fontWeight: on ? 600 : 500,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span className="mr-1.5">{tab.emoji}</span>{tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'Pages' && (
          <div className="flex h-full">
            {/* Pages list */}
            <aside className="w-60 flex-shrink-0 border-r border-line bg-paper-2 flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {(topicData.pages || []).map((meta) => {
                  const isActive = meta.id === activePageSlug;
                  return (
                    <div
                      key={meta.id}
                      onClick={() => handlePageSelect(meta.id)}
                      className="px-3 py-2.5 rounded-[10px] cursor-pointer transition border"
                      style={{
                        background: isActive ? 'var(--color-ink)' : '#fff',
                        color: isActive ? '#fff' : 'var(--color-ink-2)',
                        borderColor: isActive ? 'var(--color-ink)' : 'var(--color-line-2)',
                      }}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[13px] font-semibold truncate flex-1">{meta.title}</span>
                        <span
                          className="text-[10.5px] flex-shrink-0"
                          style={{ color: isActive ? 'rgba(255,255,255,.6)' : 'var(--color-muted)' }}
                        >
                          {meta.estimatedMinutes}m
                        </span>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={handleAddPage}
                  className="w-full mt-2 px-3 py-2.5 text-[12.5px] font-medium rounded-[10px] border-2 border-dashed text-muted hover:text-ink hover:border-line-2 transition"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <Ico.Plus width="13" height="13" className="inline mr-1" /> Add page
                </button>
              </div>
            </aside>

            {/* Page editor */}
            <div className="flex-1 overflow-y-auto bg-paper">
              {activePageSlug ? (
                <ParentPageEditor
                  subjectId={subjectId}
                  topicFolder={topicFolder}
                  pageSlug={resolvePageSlugFromId(activePageSlug)}
                  onDirtyChange={onDirtyChange}
                />
              ) : (
                <div className="text-center text-muted mt-24 px-6">
                  <p className="m-0 text-[15px]">Select a page or create a new one to start.</p>
                </div>
              )}
            </div>

            {/* Right info panel */}
            <aside className="w-60 flex-shrink-0 border-l border-line bg-paper-2 p-4 overflow-y-auto">
              <div className="mb-3 pb-3 border-b border-line text-[12px]">
                {validationErrors.length === 0 ? (
                  <span className="font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
                    <Ico.Check width="13" height="13" /> Valid
                  </span>
                ) : (
                  <span className="font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--color-warn)' }}>
                    <Ico.Close width="13" height="13" /> {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {validationErrors.map((err, i) => (
                <div
                  key={i}
                  className="text-[11.5px] mb-2 p-2 rounded-[8px]"
                  style={{
                    background: 'var(--color-danger-soft)',
                    border: '1px solid #F2B3B3',
                    color: 'var(--color-danger)',
                  }}
                >
                  {err}
                </div>
              ))}

              <div className="space-y-3 text-[12px] text-ink-3">
                <Row label="Title" value={topicData.title} />
                <Row label="Difficulty" value={topicData.difficulty} />
                <Row label="Est. time" value={`${topicData.estimatedMinutes}m`} />

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-muted mb-1.5">
                    Exam duration (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    defaultValue={topicData.examDurationMinutes || ''}
                    placeholder="0 = untimed"
                    onBlur={handleExamDurationBlur}
                    className="w-full px-2.5 py-1.5 border border-line-2 rounded-[7px] text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                  <p className="text-[10.5px] text-muted mt-1 m-0">
                    Sets timer in student Exam Drill.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line">
                <button
                  onClick={handleDeleteTopic}
                  className="w-full text-[12px] font-semibold py-1.5 rounded-[8px] border transition"
                  style={{
                    color: 'var(--color-danger)',
                    background: '#fff',
                    borderColor: '#F2B3B3',
                  }}
                >
                  <Ico.Close width="12" height="12" className="inline mr-1" /> Delete topic
                </button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'Organise' && (
          <ParentOrganiser
            subjects={subjects}
            topics={topics}
            subjectId={subjectId}
            topicFolder={topicFolder}
            embedded
          />
        )}

        {activeTab === 'Worksheet' && (
          <div className="h-full overflow-y-auto p-5">
            <ParentWorksheet subjectId={subjectId} topicFolder={topicFolder} />
          </div>
        )}

        {activeTab === 'Import' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="flex gap-3 mb-5 flex-wrap">
              <ImportHint
                tone="brand"
                title="📚 Study Pages → Worksheet"
                desc='Choose "Study Pages" mode — after import, open Worksheet tab to select pages.'
              />
              <ImportHint
                tone="violet"
                title="🎯 Exam Drill Questions"
                desc='Choose "Exam Drill Questions" mode — questions get tagged for closed-book drill automatically.'
              />
            </div>
            <PasteImportWizard
              subjects={subjects}
              topics={topics}
              defaultSubjectId={subjectId}
              defaultTopicFolder={topicFolder}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.05em] font-semibold text-muted">{label}</div>
      <div className="text-[12.5px] text-ink-2 font-medium">{value}</div>
    </div>
  );
}

function ImportHint({ tone, title, desc }) {
  const map = {
    brand:  ['var(--color-brand-soft)',  '#D6D9FF', 'var(--color-brand-ink)'],
    violet: ['var(--color-violet-soft)', '#D7C3F5', 'var(--color-violet)'],
  };
  const [bg, br, col] = map[tone];
  return (
    <div className="flex-1 min-w-[220px] rounded-[12px] px-4 py-3" style={{ background: bg, border: `1px solid ${br}` }}>
      <div className="text-[13px] font-bold mb-0.5" style={{ color: col }}>{title}</div>
      <div className="text-[11.5px] leading-relaxed" style={{ color: col, opacity: 0.85 }}>{desc}</div>
    </div>
  );
}
