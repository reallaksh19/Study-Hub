import React, { useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePage({ page, selected, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const DIFF_COLORS = { easy: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };
  const diffCls = DIFF_COLORS[page.difficulty] || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`flex items-start gap-2 p-3 mb-1 rounded border cursor-pointer transition-colors ${selected ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
    >
      <span
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5 select-none"
      >
        &#8942;&#8942;
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{page.title || page.id}</div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {page.estimatedMinutes > 0 && (
            <span className="text-xs text-gray-400">{page.estimatedMinutes}min</span>
          )}
          {page.difficulty && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${diffCls}`}>{page.difficulty}</span>
          )}
          {Array.isArray(page.conceptTags) && page.conceptTags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(page); }}
        className="flex-shrink-0 text-gray-300 hover:text-red-500 text-sm px-1"
        title="Delete page"
      >
        &times;
      </button>
    </div>
  );
}

export function PageDndList({ pages = [], selectedPageId, onSelect, onReorder, onDelete, saveState }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIdx = pages.findIndex(p => p.id === active.id);
    const newIdx = pages.findIndex(p => p.id === over.id);
    onReorder(arrayMove(pages, oldIdx, newIdx));
  }

  const SAVE_STATE_UI = {
    saving: <span className="text-xs text-blue-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />Saving…</span>,
    saved: <span className="text-xs text-green-600">Saved ✓</span>,
    reverted: <span className="text-xs text-red-600">Reverted ✗</span>
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 pb-2 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pages ({pages.length})</span>
        {saveState && SAVE_STATE_UI[saveState]}
      </div>

      <div className="flex-1 overflow-y-auto">
        {pages.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No pages yet</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {pages.map(page => (
                <SortablePage
                  key={page.id}
                  page={page}
                  selected={page.id === selectedPageId}
                  onClick={() => onSelect(page)}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
