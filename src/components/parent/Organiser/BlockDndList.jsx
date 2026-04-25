import React from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function blockPreview(block) {
  const d = block.data || {};
  const raw = d.text || d.title || (d.items && d.items.join(', ')) || d.latex || d.steps?.[0] || d.body || '';
  return String(raw).slice(0, 60) + (raw.length > 60 ? '…' : '');
}

function SortableBlockRow({ block, isSelected, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick(block)}
      className={`flex items-center gap-2 p-2 mb-1 border rounded cursor-pointer transition-colors ${isSelected ? 'border-indigo-400 bg-indigo-50' : 'bg-white hover:border-gray-300'}`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 px-0.5 hover:text-gray-500 flex-shrink-0">
        &#8942;&#8942;
      </span>
      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex-shrink-0 w-24 truncate">
        {block.type}
      </span>
      <span className="flex-1 text-xs text-gray-600 truncate">{blockPreview(block)}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="text-gray-300 hover:text-red-500 flex-shrink-0 px-1 text-sm leading-none"
        title="Delete block"
      >
        &times;
      </button>
    </div>
  );
}

export function BlockDndList({ blocks, selectedBlockId, onSelect, onReorder, onDelete }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    onReorder(arrayMove(blocks, oldIdx, newIdx));
  };

  if (!blocks.length) {
    return <p className="text-sm text-gray-400 py-6 text-center">No blocks</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((block) => (
          <SortableBlockRow
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onClick={onSelect}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
