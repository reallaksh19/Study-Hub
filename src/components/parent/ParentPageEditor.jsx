import React, { useState, useEffect } from 'react';
import { BlockList } from './PageEditor/BlockList.jsx';
import { BlockEditorPanel } from './PageEditor/BlockEditorPanel.jsx';
import { BlockToolbar } from './PageEditor/BlockToolbar.jsx';
import { generateBlockId } from '../../utils/idFactory.js';
import { readJSON, saveJSON } from '../../services/parentApiService.js';

export function ParentPageEditor({ subjectId, topicFolder, pageSlug, onDirtyChange }) {
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const draftKey = `parent_draft__${subjectId}__${topicFolder}__${pageSlug}`;
  const filePath = `${subjectId}/${topicFolder}/pages/${pageSlug}.json`;

  useEffect(() => {
    async function load() {
      // Check for draft
      const draftStr = localStorage.getItem(draftKey);
      let draftData = null;
      if (draftStr) {
        try { draftData = JSON.parse(draftStr); } catch(e){}
      }

      try {
        const fileData = await readJSON(filePath);
        if (draftData && JSON.stringify(draftData) !== JSON.stringify(fileData.blocks)) {
          if (window.confirm("Restore unsaved draft?")) {
            setBlocks(draftData);
            setHasUnsavedChanges(true);
          } else {
            setBlocks(fileData.blocks || []);
            localStorage.removeItem(draftKey);
          }
        } else {
          setBlocks(fileData.blocks || []);
        }
      } catch (err) {
        // If file doesn't exist, we start empty or with draft
        if (draftData) {
          setBlocks(draftData);
          setHasUnsavedChanges(true);
        }
      }
    }
    load();
  }, [subjectId, topicFolder, pageSlug]);

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

  useEffect(() => {
    return () => {
      if (typeof onDirtyChange === 'function') onDirtyChange(false);
    };
  }, [onDirtyChange]);

  const handleSave = async () => {
    try {
      // We would read the existing page.json to keep other metadata, then overwrite blocks
      // For simplicity here, we assume a basic structure
      let existing = { id: pageSlug, title: pageSlug, blocks: [], clarifiers: [], questions: [] };
      try {
        existing = await readJSON(filePath);
      } catch(e) {}

      existing.blocks = blocks;
      await saveJSON(filePath, existing);
      setHasUnsavedChanges(false);
      localStorage.removeItem(draftKey);
      alert('Saved!');
    } catch (err) {
      alert('Failed to save');
    }
  };

  const handleAddBlock = (type) => {
    const id = generateBlockId(pageSlug, blocks.length + 1);
    const newBlock = { id, type, data: {} };
    const idx = blocks.findIndex(b => b.id === selectedId);
    const newBlocks = [...blocks];
    if (idx >= 0) newBlocks.splice(idx + 1, 0, newBlock);
    else newBlocks.push(newBlock);
    setBlocks(newBlocks);
    setSelectedId(id);
    setHasUnsavedChanges(true);
  };

  const handleBlockChange = (id, newData) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data: newData } : b));
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
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    setHasUnsavedChanges(true);
  };

  const handleDuplicate = (id) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      const newId = generateBlockId(pageSlug, blocks.length + 1);
      const newBlock = { ...block, id: newId, data: JSON.parse(JSON.stringify(block.data)) };
      const idx = blocks.findIndex(b => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(idx + 1, 0, newBlock);
      setBlocks(newBlocks);
      setSelectedId(newId);
      setHasUnsavedChanges(true);
    }
  };

  // Derive page title from slug for breadcrumb
  const pageTitle = pageSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-col h-full">
      {/* ── Breadcrumb + action buttons ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <a href={`#/parent/subject/${subjectId}`} className="hover:text-indigo-600 hover:underline">{subjectId}</a>
          <span>›</span>
          <a href={`#/parent/subject/${subjectId}/topic/${topicFolder}`} className="hover:text-indigo-600 hover:underline">{topicFolder}</a>
          <span>›</span>
          <span className="text-gray-800 font-medium">{pageTitle}</span>
        </div>
        <div className="flex gap-2">
          <a
            href={`#/parent/subject/${subjectId}/topic/${topicFolder}/page/${pageSlug}/questions`}
            className="px-2.5 py-1 text-xs rounded border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            ✎ Questions
          </a>
          <a
            href={`#/parent/subject/${subjectId}/topic/${topicFolder}/page/${pageSlug}/clarifiers`}
            className="px-2.5 py-1 text-xs rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          >
            ✎ Clarifiers
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100% - 37px)' }}>
      <div className="w-1/3 border-r pr-4 flex flex-col h-full">
        <div className="mb-4">
          <BlockToolbar onAddBlock={handleAddBlock} />
        </div>
        <div className="flex-1 overflow-y-auto">
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
      <div className="flex-1 pl-4 flex flex-col h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <div className="text-gray-500 font-bold">
            {hasUnsavedChanges ? <span className="text-amber-500">● Unsaved changes</span> : 'All changes saved'}
          </div>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            💾 Save Page
          </button>
        </div>
        <BlockEditorPanel
          block={blocks.find(b => b.id === selectedId)}
          onChange={handleBlockChange}
        />
      </div>
      </div>
    </div>
  );
}
