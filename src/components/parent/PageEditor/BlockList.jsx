import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBlockItem({ id, block, isSelected, onSelect, onDuplicate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-2 mb-2 border rounded cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'bg-white hover:border-gray-400'}`}
      onClick={() => onSelect(id)}
    >
      <div {...attributes} {...listeners} className="cursor-grab mr-2 text-gray-400 px-1 py-2">⠿</div>
      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="text-xs font-bold uppercase mr-2 text-gray-500">{block.type}</span>
        <span className="text-sm text-gray-700">{block.data.title || block.data.text || block.data.latex || '(empty)'}</span>
      </div>
      <div className="flex gap-1 ml-2">
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(id); }} className="p-1 text-gray-500 hover:text-indigo-600">⧉</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="p-1 text-gray-500 hover:text-red-600">🗑</button>
      </div>
    </div>
  );
}

export function BlockList({ blocks, selectedId, onSelect, onReorder, onDuplicate, onDelete }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (!blocks || blocks.length === 0) {
    return <div className="p-4 text-center text-gray-500">No blocks yet. Use toolbar to add one.</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="block-list">
          {blocks.map(block => (
            <SortableBlockItem
              key={block.id}
              id={block.id}
              block={block}
              isSelected={block.id === selectedId}
              onSelect={onSelect}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
