import React, { useState, useEffect, useRef } from 'react';
import { getTopicFolder } from '../../utils/topicUtils.js';
import { loadTopic, reorderPages, checkPageDependencies, deletePage } from '../../services/topicMutationService.js';
import {
  loadPage, savePage, reorderBlocks, reorderQuestions, reorderClarifiers,
  deleteBlock, deleteQuestion, deleteClarifier, createPage, flushPendingWrite
} from '../../services/pageMutationService.js';
import { PageDndList } from './Organiser/PageDndList.jsx';
import { PageDetailTabs } from './Organiser/PageDetailTabs.jsx';
import { ContentPreviewPanel } from './Organiser/ContentPreviewPanel.jsx';

// ─── Save state indicator ─────────────────────────────────────────────────────

function SaveIndicator({ state }) {
  if (!state || state === 'idle') return null;
  if (state === 'saving') return (
    <span className="text-xs text-blue-600 flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
      Saving…
    </span>
  );
  if (state === 'saved') return <span className="text-xs text-green-600 font-medium">Saved ✓</span>;
  return <span className="text-xs text-red-600 font-medium">Reverted ✗</span>;
}

// ─── Dependency modal ─────────────────────────────────────────────────────────

function DeletePageModal({ pageId, deps, onConfirm, onCancel }) {
  const hasDeps = deps?.hasDeps;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Delete page?</h2>
        {hasDeps ? (
          <>
            <p className="text-sm text-gray-700">This page is referenced by other pages:</p>
            <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {deps.refs.map((ref, i) => (
                <li key={i} className="bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  <span className="font-mono">{ref.pageId}</span> — <span className="text-gray-500">{ref.field}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600">Clean those references automatically?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => onConfirm({ cleanRefs: false })} className="px-3 py-2 border border-amber-300 bg-amber-50 text-amber-800 rounded text-sm hover:bg-amber-100">Delete only</button>
              <button onClick={() => onConfirm({ cleanRefs: true })} className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete &amp; clean refs</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">This will permanently delete the page and its file.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => onConfirm({ cleanRefs: false })} className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParentOrganiser({ subjects = [], topics = [], subjectId: propSubjectId, topicFolder: propTopicFolder, embedded = false }) {
  const [subjectId, setSubjectId] = useState(propSubjectId || subjects[0]?.id || '');
  const [topicFolder, setTopicFolder] = useState(propTopicFolder || '');
  const [pages, setPages] = useState([]); // topic.json page entries (metadata only)
  const [loadedPage, setLoadedPage] = useState(null); // full page JSON
  const [selectedPageEntry, setSelectedPageEntry] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'reverted'
  const [deleteModal, setDeleteModal] = useState(null); // { pageEntry, deps }
  const [loadError, setLoadError] = useState('');
  const saveStateTimer = useRef(null);

  const subjectTopics = topics.filter(t => t.subjectId === subjectId);

  // Auto-select first topic when subject changes (standalone mode only)
  useEffect(() => {
    if (embedded) return;
    if (subjectTopics.length > 0) {
      const folder = getTopicFolder(subjectTopics[0], subjectId);
      setTopicFolder(folder);
    } else {
      setTopicFolder('');
    }
  }, [subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-load when embedded (topic pre-selected from parent)
  useEffect(() => {
    if (embedded && subjectId && topicFolder) {
      handleLoad();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function showSaveState(state) {
    setSaveState(state);
    if (saveStateTimer.current) clearTimeout(saveStateTimer.current);
    if (state === 'saved') {
      saveStateTimer.current = setTimeout(() => setSaveState('idle'), 2000);
    }
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

  async function handlePageSelect(pageEntry) {
    // Flush any pending write for the previous page
    if (selectedPageEntry) {
      flushPendingWrite(selectedPageEntry.id);
    }
    setSelectedBlockId(null);
    setSelectedPageEntry(pageEntry);
    try {
      const page = await loadPage(subjectId, topicFolder, pageEntry);
      setLoadedPage(page);
    } catch (err) {
      setLoadedPage(null);
      setLoadError(err.message || 'Failed to load page');
    }
  }

  async function handlePageReorder(reordered) {
    setPages(reordered); // optimistic
    showSaveState('saving');
    try {
      await reorderPages(subjectId, topicFolder, reordered);
      showSaveState('saved');
    } catch {
      setPages(pages); // revert
      showSaveState('reverted');
    }
  }

  async function handlePageDeleteRequest(pageEntry) {
    const deps = await checkPageDependencies(subjectId, topicFolder, pageEntry.id);
    setDeleteModal({ pageEntry, deps });
  }

  async function handlePageDeleteConfirm({ cleanRefs }) {
    const { pageEntry } = deleteModal;
    setDeleteModal(null);
    showSaveState('saving');
    try {
      await deletePage(subjectId, topicFolder, pageEntry, { cleanRefs });
      setPages(prev => prev.filter(p => p.id !== pageEntry.id));
      if (selectedPageEntry?.id === pageEntry.id) {
        setSelectedPageEntry(null);
        setLoadedPage(null);
      }
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  async function handleAddPage() {
    const title = window.prompt('New page title:');
    if (!title?.trim()) return;
    showSaveState('saving');
    try {
      const { pageEntry } = await createPage(subjectId, topicFolder, title.trim());
      setPages(prev => [...prev, pageEntry]);
      showSaveState('saved');
    } catch (err) {
      showSaveState('reverted');
      alert(err.message || 'Failed to create page');
    }
  }

  // ─── Block/question/clarifier handlers ──────────────────────────────────────

  function updateLoadedPage(updater) {
    setLoadedPage(prev => prev ? updater(prev) : prev);
  }

  async function handleBlocksReorder(blocks) {
    updateLoadedPage(p => ({ ...p, blocks }));
    showSaveState('saving');
    try {
      await reorderBlocks(subjectId, topicFolder, selectedPageEntry, blocks);
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  async function handleBlockDelete(blockId) {
    showSaveState('saving');
    try {
      const updated = await deleteBlock(subjectId, topicFolder, selectedPageEntry, blockId);
      updateLoadedPage(() => updated);
      if (selectedBlockId === blockId) setSelectedBlockId(null);
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  async function handleQuestionsReorder(questions) {
    updateLoadedPage(p => ({ ...p, questions }));
    showSaveState('saving');
    try {
      await reorderQuestions(subjectId, topicFolder, selectedPageEntry, questions);
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  async function handleQuestionDelete(questionId) {
    showSaveState('saving');
    try {
      const updated = await deleteQuestion(subjectId, topicFolder, selectedPageEntry, questionId);
      updateLoadedPage(() => updated);
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  async function handleClarifiersReorder(clarifiers) {
    updateLoadedPage(p => ({ ...p, clarifiers }));
    showSaveState('saving');
    try {
      await reorderClarifiers(subjectId, topicFolder, selectedPageEntry, clarifiers);
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  async function handleClarifierDelete(clarifierId) {
    showSaveState('saving');
    try {
      const updated = await deleteClarifier(subjectId, topicFolder, selectedPageEntry, clarifierId);
      updateLoadedPage(() => updated);
      showSaveState('saved');
    } catch {
      showSaveState('reverted');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar — hidden in embedded mode */}
      {!embedded && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <h1 className="font-bold text-gray-800 mr-2">Organise</h1>
          <select
            value={subjectId}
            onChange={e => { setSubjectId(e.target.value); setTopicFolder(''); setPages([]); setLoadedPage(null); }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <select
            value={topicFolder}
            onChange={e => setTopicFolder(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Select topic…</option>
            {subjectTopics.map(t => {
              const folder = getTopicFolder(t, subjectId);
              return <option key={t.id} value={folder}>{t.title}</option>;
            })}
          </select>
          <button
            onClick={handleLoad}
            disabled={!topicFolder}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded font-medium hover:bg-indigo-700 disabled:opacity-40"
          >
            Load
          </button>
          <div className="ml-auto">
            <SaveIndicator state={saveState} />
          </div>
        </div>
      )}
      {embedded && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
          <SaveIndicator state={saveState} />
          <button onClick={handleLoad} className="ml-auto text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded">↻ Reload</button>
        </div>
      )}

      {loadError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {loadError}
          <button onClick={() => setLoadError('')} className="ml-2 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel 1: Pages */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2">
            <PageDndList
              pages={pages}
              selectedPageId={selectedPageEntry?.id}
              onSelect={handlePageSelect}
              onReorder={handlePageReorder}
              onDelete={handlePageDeleteRequest}
            />
          </div>
          {pages.length > 0 && (
            <div className="p-2 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleAddPage}
                className="w-full text-xs px-2 py-1.5 border border-dashed border-gray-300 rounded text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
              >
                + Add Page
              </button>
            </div>
          )}
        </div>

        {/* Panel 2: Detail tabs */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden">
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
            <div className="flex items-center justify-center h-full text-sm text-gray-400 p-4 text-center">
              {pages.length === 0 ? 'Load a topic to start organising' : 'Select a page to edit its content'}
            </div>
          )}
        </div>

        {/* Panel 3: Preview */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ContentPreviewPanel
            page={loadedPage}
            selectedBlockId={selectedBlockId}
          />
        </div>
      </div>

      {deleteModal && (
        <DeletePageModal
          pageId={deleteModal.pageEntry.id}
          deps={deleteModal.deps}
          onConfirm={handlePageDeleteConfirm}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
