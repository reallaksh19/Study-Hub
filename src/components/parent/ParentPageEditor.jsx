// ParentPageEditor.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentPageEditor.jsx.
// Preserves: draft load/save (localStorage parent_draft__…), readJSON/saveJSON,
//            block add/reorder/duplicate/delete, dirty-change reporting,
//            BlockList + BlockEditorPanel + BlockToolbar untouched.

import React, { useState, useEffect } from 'react';
import { BlockList } from './PageEditor/BlockList.jsx';
import { BlockEditorPanel } from './PageEditor/BlockEditorPanel.jsx';
import { BlockToolbar } from './PageEditor/BlockToolbar.jsx';
import { generateBlockId } from '../../utils/idFactory.js';
import { readJSON, saveJSON } from '../../services/parentApiService.js';
import { Ico } from '../../lib/Icons.jsx';
import { useConfirm, useToast } from '../../lib/Toast.jsx';

export function ParentPageEditor({ subjectId, topicFolder, pageSlug, onDirtyChange }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const draftKey = `parent_draft__${subjectId}__${topicFolder}__${pageSlug}`;
  const filePath = `${subjectId}/${topicFolder}/pages/${pageSlug}.json`;

  useEffect(() => {
    async function load() {
      const draftStr = localStorage.getItem(draftKey);
      let draftData = null;
      if (draftStr) {
        try { draftData = JSON.parse(draftStr); } catch {}
      }
      try {
        const fileData = await readJSON(filePath);
        if (draftData && JSON.stringify(draftData) !== JSON.stringify(fileData.blocks)) {
          const restoreDraft = await confirm({
            title: 'Restore unsaved draft?',
            body: 'A local draft exists for this page. Restore it instead of the saved version?',
            confirmLabel: 'Restore draft',
          });
          if (restoreDraft) {
            setBlocks(draftData);
            setHasUnsavedChanges(true);
          } else {
            setBlocks(fileData.blocks || []);
            localStorage.removeItem(draftKey);
          }
        } else {
          setBlocks(fileData.blocks || []);
        }
      } catch {
        if (draftData) {
          setBlocks(draftData);
          setHasUnsavedChanges(true);
        }
      }
    }
    load();
  }, [subjectId, topicFolder, pageSlug, filePath, draftKey, confirm]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setInterval(() => {
        localStorage.setItem(draftKey, JSON.stringify(blocks));
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [blocks, hasUnsavedChanges, draftKey]);

  useEffect(() => {
    if (typeof onDirtyChange === 'function') onDirtyChange(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const handleSave = async () => {
    try {
      let existing = { id: pageSlug, title: pageSlug, blocks: [], clarifiers: [], questions: [] };
      try { existing = await readJSON(filePath); } catch {}
      existing.blocks = blocks;
      await saveJSON(filePath, existing);
      setHasUnsavedChanges(false);
      localStorage.removeItem(draftKey);
      toast.show('Page saved.', { variant: 'success' });
    } catch {
      toast.show('Failed to save page.', { variant: 'error' });
    }
  };

  const handleAddBlock = (type) => {
    const id = generateBlockId(pageSlug, blocks.length + 1);
    const newBlock = { id, type, data: {} };
    const idx = blocks.findIndex((b) => b.id === selectedId);
    const newBlocks = [...blocks];
    if (idx >= 0) newBlocks.splice(idx + 1, 0, newBlock);
    else newBlocks.push(newBlock);
    setBlocks(newBlocks);
    setSelectedId(id);
    setHasUnsavedChanges(true);
  };

  const handleBlockChange = (id, newData) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, data: newData } : b)));
    setHasUnsavedChanges(true);
  };

  const handleReorder = (oldIndex, newIndex) => {
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(oldIndex, 1);
    newBlocks.splice(newIndex, 0, moved);
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleDelete = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    setHasUnsavedChanges(true);
  };

  const handleDuplicate = (id) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const newId = generateBlockId(pageSlug, blocks.length + 1);
    const newBlock = { ...block, id: newId, data: JSON.parse(JSON.stringify(block.data)) };
    const idx = blocks.findIndex((b) => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedId(newId);
    setHasUnsavedChanges(true);
  };

  const pageTitle = pageSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-col h-full bg-paper">
      {/* Toolbar header */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-line bg-paper-2 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-muted">
          <a href={`#/parent/subject/${subjectId}`} className="hover:text-ink no-underline">{subjectId}</a>
          <span className="opacity-50">›</span>
          <a
            href={`#/parent/subject/${subjectId}/topic/${topicFolder}`}
            className="hover:text-ink no-underline"
          >
            {topicFolder}
          </a>
          <span className="opacity-50">›</span>
          <span className="text-ink-2 font-semibold">{pageTitle}</span>
        </div>

        {hasUnsavedChanges && (
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded ml-2"
            style={{ background: 'var(--color-warn-soft)', color: '#7A4A09', border: '1px solid #EBD79A' }}
          >
            Draft · unsaved
          </span>
        )}

        <div className="ml-auto flex gap-2">
          <a
            href={`#/parent/subject/${subjectId}/topic/${topicFolder}/page/${pageSlug}/questions`}
            className="sh-btn sh-btn-secondary text-[12.5px] no-underline"
            style={{ padding: '6px 11px', background: 'var(--color-violet-soft)', borderColor: '#D7C3F5', color: 'var(--color-violet)' }}
          >
            ✎ Questions
          </a>
          <a
            href={`#/parent/subject/${subjectId}/topic/${topicFolder}/page/${pageSlug}/clarifiers`}
            className="sh-btn sh-btn-secondary text-[12.5px] no-underline"
            style={{ padding: '6px 11px', background: 'var(--color-success-soft)', borderColor: '#95D2B3', color: 'var(--color-success)' }}
          >
            ✎ Clarifiers
          </a>
          <button onClick={handleSave} className="sh-btn sh-btn-primary text-[12.5px]" style={{ padding: '6px 12px' }}>
            <Ico.Check width="14" height="14" /> Save page
          </button>
        </div>
      </div>

      {/* Two-pane editor */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100% - 49px)' }}>
        <div className="w-1/3 border-r border-line flex flex-col h-full bg-paper-2">
          <div className="px-4 pt-4 pb-3 border-b border-line">
            <BlockToolbar onAddBlock={handleAddBlock} />
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <BlockList
              blocks={blocks}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onReorder={handleReorder}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-paper">
          <div className="flex justify-between items-center px-6 py-3 border-b border-line bg-white flex-shrink-0">
            <div className="text-[12.5px] font-semibold" style={{ color: hasUnsavedChanges ? 'var(--color-warn)' : 'var(--color-muted)' }}>
              {hasUnsavedChanges ? '● Unsaved changes' : 'All changes saved'}
            </div>
            <div className="text-[11.5px] text-muted">
              Auto-draft every 30s · {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="p-6">
            <BlockEditorPanel
              block={blocks.find((b) => b.id === selectedId)}
              onChange={handleBlockChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
