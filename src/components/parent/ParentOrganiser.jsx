// ParentOrganiser.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentOrganiser.jsx.
// Preserves: standalone + embedded modes, loadTopic / loadPage flow,
// reorder/delete handlers for pages, blocks, questions, clarifiers,
// save state indicator, delete-page modal with dependency cleanup option.

import React, { useState, useEffect, useRef } from 'react';
import { getTopicFolder } from '../../utils/topicUtils.js';
import {
  loadTopic, reorderPages, checkPageDependencies, deletePage,
} from '../../services/topicMutationService.js';
import {
  loadPage, reorderBlocks, reorderQuestions, reorderClarifiers,
  deleteBlock, deleteQuestion, deleteClarifier, createPage, flushPendingWrite,
} from '../../services/pageMutationService.js';
import { PageDndList } from './Organiser/PageDndList.jsx';
import { PageDetailTabs } from './Organiser/PageDetailTabs.jsx';
import { ContentPreviewPanel } from './Organiser/ContentPreviewPanel.jsx';
import { Ico } from '../../lib/Icons.jsx';
import { useToast } from '../../lib/Toast.jsx';

// ─── Save indicator ──────────────────────────────────────────────────────────

function SaveIndicator({ state }) {
  if (!state || state === 'idle') return null;
  if (state === 'saving') {
    return (
      <span className="text-[11.5px] inline-flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Saving…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="text-[11.5px] font-semibold inline-flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
        <Ico.Check width="12" height="12" /> Saved
      </span>
    );
  }
  return (
    <span className="text-[11.5px] font-semibold inline-flex items-center gap-1" style={{ color: 'var(--color-danger)' }}>
      <Ico.Close width="12" height="12" /> Reverted
    </span>
  );
}

// ─── Delete-page modal ───────────────────────────────────────────────────────

function DeletePageModal({ deps, onConfirm, onCancel }) {
  const hasDeps = deps?.hasDeps;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(22,24,43,.45)' }}>
      <div className="bg-white rounded-[16px] shadow-[0_18px_48px_rgba(22,24,43,.18)] max-w-md w-full p-6 space-y-4">
        <h2 className="serif text-[20px] m-0 leading-tight">Delete page?</h2>
        {hasDeps ? (
          <>
            <p className="text-[13.5px] text-ink-2 m-0">This page is referenced by other pages:</p>
            <ul className="text-[11.5px] space-y-1 max-h-32 overflow-y-auto m-0 pl-0 list-none">
              {deps.refs.map((ref, i) => (
                <li
                  key={i}
                  className="rounded-[7px] px-2 py-1"
                  style={{ background: 'var(--color-warn-soft)', border: '1px solid #EBD79A', color: '#7A4A09' }}
                >
                  <span className="mono">{ref.pageId}</span> — <span className="opacity-70">{ref.field}</span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-3 m-0">Clean those references automatically?</p>
            <div className="flex gap-2.5 justify-end flex-wrap">
              <button onClick={onCancel} className="sh-btn sh-btn-secondary text-[12.5px]">Cancel</button>
              <button
                onClick={() => onConfirm({ cleanRefs: false })}
                className="sh-btn text-[12.5px]"
                style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)', border: '1px solid #EBD79A' }}
              >
                Delete only
              </button>
              <button
                onClick={() => onConfirm({ cleanRefs: true })}
                className="sh-btn text-[12.5px]"
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                Delete &amp; clean refs
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[13.5px] text-ink-3 m-0">
              This will permanently delete the page and its file.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={onCancel} className="sh-btn sh-btn-secondary text-[12.5px]">Cancel</button>
              <button
                onClick={() => onConfirm({ cleanRefs: false })}
                className="sh-btn text-[12.5px]"
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function ParentOrganiser({
  subjects = [], topics = [], subjectId: propSubjectId, topicFolder: propTopicFolder, embedded = false,
}) {
  const toast = useToast();
  const [subjectId, setSubjectId] = useState(propSubjectId || subjects[0]?.id || '');
  const [topicFolder, setTopicFolder] = useState(propTopicFolder || '');
  const [pages, setPages] = useState([]);
  const [loadedPage, setLoadedPage] = useState(null);
  const [selectedPageEntry, setSelectedPageEntry] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [deleteModal, setDeleteModal] = useState(null);
  const [loadError, setLoadError] = useState('');
  const saveStateTimer = useRef(null);

  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);

  useEffect(() => {
    if (embedded) return;
    if (subjectTopics.length > 0) {
      setTopicFolder(getTopicFolder(subjectTopics[0], subjectId));
    } else {
      setTopicFolder('');
    }
  }, [subjectId]); // eslint-disable-line

  useEffect(() => {
    if (embedded && subjectId && topicFolder) handleLoad();
  }, []); // eslint-disable-line

  function showSaveState(state) {
    setSaveState(state);
    if (saveStateTimer.current) clearTimeout(saveStateTimer.current);
    if (state === 'saved') saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2000);
  }

  async function handleLoad() {
    if (!topicFolder) return;
    setLoadError('');
    try {
      const topic = await loadTopic(subjectId, topicFolder);
      setPages(topic.pages || []);
      setLoadedPage(null);
      setSelectedPageEntry(null);
      setSelectedBlockId(null);
    } catch (err) {
      setLoadError(err.message || 'Failed to load topic');
    }
  }

  async function handlePageSelect(entry) {
    if (selectedPageEntry) flushPendingWrite(selectedPageEntry.id);
    setSelectedBlockId(null);
    setSelectedPageEntry(entry);
    try {
      setLoadedPage(await loadPage(subjectId, topicFolder, entry));
    } catch (err) {
      setLoadedPage(null);
      setLoadError(err.message || 'Failed to load page');
    }
  }

  async function handlePageReorder(reordered) {
    setPages(reordered);
    showSaveState('saving');
    try { await reorderPages(subjectId, topicFolder, reordered); showSaveState('saved'); }
    catch { setPages(pages); showSaveState('reverted'); }
  }

  async function handlePageDeleteRequest(entry) {
    const deps = await checkPageDependencies(subjectId, topicFolder, entry.id);
    setDeleteModal({ pageEntry: entry, deps });
  }

  async function handlePageDeleteConfirm({ cleanRefs }) {
    const { pageEntry } = deleteModal;
    setDeleteModal(null);
    showSaveState('saving');
    try {
      await deletePage(subjectId, topicFolder, pageEntry, { cleanRefs });
      setPages((prev) => prev.filter((p) => p.id !== pageEntry.id));
      if (selectedPageEntry?.id === pageEntry.id) {
        setSelectedPageEntry(null);
        setLoadedPage(null);
      }
      showSaveState('saved');
    } catch { showSaveState('reverted'); }
  }

  async function handleAddPage() {
    const title = window.prompt('New page title:');
    if (!title?.trim()) return;
    showSaveState('saving');
    try {
      const { pageEntry } = await createPage(subjectId, topicFolder, title.trim());
      setPages((prev) => [...prev, pageEntry]);
      showSaveState('saved');
    } catch (err) {
      showSaveState('reverted');
      toast.show(err.message || 'Failed to create page.', { variant: 'error' });
    }
  }

  const updateLoadedPage = (updater) => setLoadedPage((p) => (p ? updater(p) : p));

  async function handleBlocksReorder(blocks)        { updateLoadedPage((p) => ({ ...p, blocks })); showSaveState('saving'); try { await reorderBlocks(subjectId, topicFolder, selectedPageEntry, blocks); showSaveState('saved'); } catch { showSaveState('reverted'); } }
  async function handleBlockDelete(blockId)         { showSaveState('saving'); try { const u = await deleteBlock(subjectId, topicFolder, selectedPageEntry, blockId); updateLoadedPage(() => u); if (selectedBlockId === blockId) setSelectedBlockId(null); showSaveState('saved'); } catch { showSaveState('reverted'); } }
  async function handleQuestionsReorder(qs)         { updateLoadedPage((p) => ({ ...p, questions: qs })); showSaveState('saving'); try { await reorderQuestions(subjectId, topicFolder, selectedPageEntry, qs); showSaveState('saved'); } catch { showSaveState('reverted'); } }
  async function handleQuestionDelete(qid)          { showSaveState('saving'); try { const u = await deleteQuestion(subjectId, topicFolder, selectedPageEntry, qid); updateLoadedPage(() => u); showSaveState('saved'); } catch { showSaveState('reverted'); } }
  async function handleClarifiersReorder(cs)        { updateLoadedPage((p) => ({ ...p, clarifiers: cs })); showSaveState('saving'); try { await reorderClarifiers(subjectId, topicFolder, selectedPageEntry, cs); showSaveState('saved'); } catch { showSaveState('reverted'); } }
  async function handleClarifierDelete(cid)         { showSaveState('saving'); try { const u = await deleteClarifier(subjectId, topicFolder, selectedPageEntry, cid); updateLoadedPage(() => u); showSaveState('saved'); } catch { showSaveState('reverted'); } }

  return (
    <div className="flex flex-col h-full bg-paper">
      {/* Top bar */}
      {!embedded ? (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-line bg-white flex-shrink-0 flex-wrap">
          <h1 className="serif text-[20px] m-0 mr-1">Organise</h1>
          <select
            value={subjectId}
            onChange={(e) => { setSubjectId(e.target.value); setTopicFolder(''); setPages([]); setLoadedPage(null); }}
            className="px-2.5 py-1.5 text-[13px] border border-line-2 rounded-[8px] bg-white outline-none"
          >
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <select
            value={topicFolder}
            onChange={(e) => setTopicFolder(e.target.value)}
            className="px-2.5 py-1.5 text-[13px] border border-line-2 rounded-[8px] bg-white outline-none"
          >
            <option value="">Select topic…</option>
            {subjectTopics.map((t) => {
              const folder = getTopicFolder(t, subjectId);
              return <option key={t.id} value={folder}>{t.title}</option>;
            })}
          </select>
          <button onClick={handleLoad} disabled={!topicFolder} className="sh-btn sh-btn-primary text-[12.5px] disabled:opacity-40">
            Load
          </button>
          <div className="ml-auto"><SaveIndicator state={saveState} /></div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3.5 py-2 border-b border-line bg-white flex-shrink-0">
          <SaveIndicator state={saveState} />
          <button
            onClick={handleLoad}
            className="ml-auto text-[11.5px] text-muted hover:text-ink border border-line-2 px-2 py-1 rounded-[7px]"
          >
            ↻ Reload
          </button>
        </div>
      )}

      {loadError && (
        <div
          className="mx-5 mt-3 px-3.5 py-2.5 rounded-[10px] text-[13px] flex items-center justify-between gap-3"
          style={{ background: 'var(--color-danger-soft)', border: '1px solid #F2B3B3', color: 'var(--color-danger)' }}
        >
          <span>{loadError}</span>
          <button onClick={() => setLoadError('')} className="text-danger hover:opacity-70">
            <Ico.Close width="14" height="14" />
          </button>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 flex-shrink-0 border-r border-line bg-paper-2 flex flex-col">
          <div className="flex-1 overflow-y-auto p-2.5">
            <PageDndList
              pages={pages}
              selectedPageId={selectedPageEntry?.id}
              onSelect={handlePageSelect}
              onReorder={handlePageReorder}
              onDelete={handlePageDeleteRequest}
            />
          </div>
          {pages.length > 0 && (
            <div className="p-2.5 border-t border-line">
              <button
                onClick={handleAddPage}
                className="w-full px-3 py-2 text-[12px] font-medium rounded-[8px] border-2 border-dashed text-muted hover:text-ink hover:border-line-2 transition"
                style={{ borderColor: 'var(--color-line)' }}
              >
                + Add page
              </button>
            </div>
          )}
        </aside>

        <div className="w-72 flex-shrink-0 border-r border-line bg-white overflow-hidden">
          {loadedPage && selectedPageEntry ? (
            <PageDetailTabs
              page={loadedPage}
              pageEntry={selectedPageEntry}
              subjectId={subjectId}
              topicFolder={topicFolder}
              selectedBlockId={selectedBlockId}
              onBlockSelect={setSelectedBlockId}
              onBlocksReorder={handleBlocksReorder}
              onBlockDelete={handleBlockDelete}
              onQuestionsReorder={handleQuestionsReorder}
              onQuestionDelete={handleQuestionDelete}
              onClarifiersReorder={handleClarifiersReorder}
              onClarifierDelete={handleClarifierDelete}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[13px] text-muted p-6 text-center">
              {pages.length === 0
                ? 'Load a topic to start organising.'
                : 'Select a page to edit its content.'}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden bg-paper">
          <ContentPreviewPanel page={loadedPage} selectedBlockId={selectedBlockId} />
        </div>
      </div>

      {deleteModal && (
        <DeletePageModal
          deps={deleteModal.deps}
          onConfirm={handlePageDeleteConfirm}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
