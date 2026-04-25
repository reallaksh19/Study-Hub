import React, { useState } from 'react';
import { BlockDndList } from './BlockDndList.jsx';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Generic sortable row ─────────────────────────────────────────────────────

function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 p-2 mb-1 bg-white border border-gray-200 rounded">
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5">
        &#8942;&#8942;
      </span>
      {children}
    </div>
  );
}

function SimpleDndList({ items, idKey, onReorder, renderItem, emptyLabel }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((it) => it[idKey] === active.id);
    const newIdx = items.findIndex((it) => it[idKey] === over.id);
    onReorder(arrayMove(items, oldIdx, newIdx));
  };

  if (!items.length) return <p className="text-sm text-gray-400 py-6 text-center">{emptyLabel}</p>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((it) => it[idKey])} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableRow key={item[idKey]} id={item[idKey]}>
            {renderItem(item)}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  );
}

// ─── Unified item tab (used for both questions and clarifiers) ────────────────

function ItemTab({ items, idKey, emptyLabel, onReorder, renderItem, onDelete, editLink }) {
  return (
    <div>
      <SimpleDndList
        items={items}
        idKey={idKey}
        onReorder={onReorder}
        emptyLabel={emptyLabel}
        renderItem={(item) => (
          <>
            {renderItem(item)}
            <button
              onClick={() => onDelete(item[idKey])}
              className="text-gray-300 hover:text-red-500 text-sm flex-shrink-0"
              title="Delete"
            >
              &times;
            </button>
          </>
        )}
      />
      {editLink && (
        <a href={editLink} className="mt-3 text-xs text-indigo-600 hover:underline block text-right">
          Edit in full editor &rarr;
        </a>
      )}
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function PageDetailTabs({
  page, pageEntry, subjectId, topicFolder,
  selectedBlockId, onBlockSelect,
  onBlocksReorder, onBlockDelete,
  onQuestionsReorder, onQuestionDelete,
  onClarifiersReorder, onClarifierDelete
}) {
  const [activeTab, setActiveTab] = useState('blocks');

  const pageSlug = pageEntry?.file?.replace('pages/', '').replace('.json', '') || '';
  const basePath = `#/parent/subject/${subjectId}/topic/${topicFolder}/page/${pageSlug}`;

  const tabs = [
    { id: 'blocks', label: `Blocks (${page.blocks?.length || 0})` },
    { id: 'questions', label: `Questions (${page.questions?.length || 0})` },
    { id: 'clarifiers', label: `Clarifiers (${page.clarifiers?.length || 0})` }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'blocks' && (
          <BlockDndList
            blocks={page.blocks || []}
            selectedBlockId={selectedBlockId}
            onSelect={onBlockSelect}
            onReorder={onBlocksReorder}
            onDelete={onBlockDelete}
          />
        )}
        {activeTab === 'questions' && (
          <ItemTab
            items={page.questions || []}
            idKey="id"
            emptyLabel="No questions"
            onReorder={onQuestionsReorder}
            onDelete={onQuestionDelete}
            editLink={`${basePath}/questions`}
            renderItem={(q) => (
              <>
                <span className="text-xs font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded flex-shrink-0">{q.type}</span>
                <span className="flex-1 text-xs text-gray-700 line-clamp-2">{q.prompt}</span>
              </>
            )}
          />
        )}
        {activeTab === 'clarifiers' && (
          <ItemTab
            items={page.clarifiers || []}
            idKey="id"
            emptyLabel="No clarifiers"
            onReorder={onClarifiersReorder}
            onDelete={onClarifierDelete}
            editLink={`${basePath}/clarifiers`}
            renderItem={(c) => (
              <>
                <span className="text-xs font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">{c.type}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">{c.title}</div>
                  <div className="text-xs text-gray-500 truncate">{c.body}</div>
                </div>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}
