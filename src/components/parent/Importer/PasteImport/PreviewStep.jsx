import React, { useState } from 'react';

const CONFIDENCE_COLOR = (c) =>
  c >= 0.8 ? 'text-green-600' : c >= 0.6 ? 'text-amber-500' : 'text-red-500';

const ACTION_BADGE = {
  create: { label: 'Create', cls: 'bg-green-100 text-green-700' },
  overwrite: { label: 'Overwrite', cls: 'bg-amber-100 text-amber-700' },
  'create-copy': { label: 'Copy', cls: 'bg-blue-100 text-blue-700' },
  skip: { label: 'Skip', cls: 'bg-gray-100 text-gray-500' }
};

const BLOCK_TYPES = [
  'heading', 'paragraph', 'bullets', 'equation', 'table', 'worked_solution',
  'example', 'callout', 'tip', 'warning', 'misconception', 'divider',
  'image', 'image_link', 'link_card', 'svg', 'pdf_embed', 'mermaid', 'video_embed'
];

function blockPreviewText(block) {
  const d = block.data || {};
  const raw =
    d.text || d.title || (d.items && d.items.join(', ')) || d.latex || d.steps?.[0] || d.body || '';
  return String(raw).slice(0, 60) + (raw.length > 60 ? '…' : '');
}

function BlocksTab({ blocks, onDelete, onTypeChange }) {
  if (!blocks.length) return <p className="text-sm text-gray-400 py-4 text-center">No blocks</p>;
  return (
    <div className="space-y-1">
      {blocks.map((block, i) => (
        <div key={block.id || i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
          <select
            value={block.type}
            onChange={(e) => onTypeChange(i, e.target.value)}
            className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white focus:outline-none w-28 flex-shrink-0"
          >
            {BLOCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="flex-1 text-gray-600 font-mono text-xs truncate">{blockPreviewText(block)}</span>
          {block.sourceConfidence != null && (
            <span className={`text-xs font-mono flex-shrink-0 ${CONFIDENCE_COLOR(block.sourceConfidence)}`}>
              {Math.round(block.sourceConfidence * 100)}%
            </span>
          )}
          <button onClick={() => onDelete(i)} className="text-red-400 hover:text-red-600 flex-shrink-0 text-xs px-1">&#10005;</button>
        </div>
      ))}
    </div>
  );
}

function QuestionsTab({ questions, onDelete }) {
  if (!questions.length) return <p className="text-sm text-gray-400 py-4 text-center">No questions</p>;
  return (
    <div className="space-y-1">
      {questions.map((q, i) => (
        <div key={q.id || i} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{q.type}</span>
          <span className="flex-1 text-gray-700 text-xs line-clamp-2">{q.prompt}</span>
          <button onClick={() => onDelete(i)} className="text-red-400 hover:text-red-600 flex-shrink-0 text-xs px-1">&#10005;</button>
        </div>
      ))}
    </div>
  );
}

function ClarifiersTab({ clarifiers, onDelete }) {
  if (!clarifiers.length) return <p className="text-sm text-gray-400 py-4 text-center">No clarifiers</p>;
  return (
    <div className="space-y-1">
      {clarifiers.map((c, i) => (
        <div key={c.id || i} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{c.type}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-700 truncate">{c.title}</div>
            <div className="text-xs text-gray-500 truncate">{c.body}</div>
          </div>
          <button onClick={() => onDelete(i)} className="text-red-400 hover:text-red-600 flex-shrink-0 text-xs px-1">&#10005;</button>
        </div>
      ))}
    </div>
  );
}

export function PreviewStep({ savePlan, onDone, onBack, onManualEdit }) {
  const [draftPlan, setDraftPlan] = useState(() => savePlan.map((entry) => ({ ...entry, parsedPage: { ...entry.parsedPage } })));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('blocks');

  const selected = draftPlan[selectedIdx];

  const updatePage = (idx, updater) => {
    setDraftPlan((prev) => prev.map((p, i) => i === idx ? { ...p, parsedPage: updater(p.parsedPage) } : p));
    onManualEdit?.();
  };

  const updateTitle = (idx, title) => {
    setDraftPlan((prev) => prev.map((p, i) => i === idx ? { ...p, parsedPage: { ...p.parsedPage, title } } : p));
    onManualEdit?.();
  };

  const deleteBlock = (blockIdx) => {
    updatePage(selectedIdx, (pg) => ({ ...pg, blocks: pg.blocks.filter((_, i) => i !== blockIdx) }));
  };

  const changeBlockType = (blockIdx, newType) => {
    updatePage(selectedIdx, (pg) => ({
      ...pg,
      blocks: pg.blocks.map((b, i) => i === blockIdx ? { ...b, type: newType } : b)
    }));
  };

  const deleteQuestion = (qIdx) => {
    updatePage(selectedIdx, (pg) => ({ ...pg, questions: pg.questions.filter((_, i) => i !== qIdx) }));
  };

  const deleteClarifier = (cIdx) => {
    updatePage(selectedIdx, (pg) => ({ ...pg, clarifiers: pg.clarifiers.filter((_, i) => i !== cIdx) }));
  };

  const activePages = draftPlan.filter((p) => p.action !== 'skip');

  return (
    <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: 480 }}>
      {/* Page list sidebar */}
      <div className="w-52 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
          Pages ({draftPlan.length})
        </div>
        {draftPlan.map((entry, i) => {
          const badge = ACTION_BADGE[entry.action] || ACTION_BADGE.create;
          const conf = entry.parsedPage.sourceConfidence;
          return (
            <button
              key={i}
              onClick={() => { setSelectedIdx(i); setActiveTab('blocks'); }}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 ${selectedIdx === i ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {conf != null && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${conf >= 0.8 ? 'bg-green-500' : conf >= 0.6 ? 'bg-amber-400' : 'bg-red-400'}`} />}
                <span className="text-xs font-medium text-gray-800 truncate flex-1">{entry.parsedPage.title || `Page ${i + 1}`}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badge.cls}`}>{badge.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Title editor */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
              <input
                type="text"
                value={selected.parsedPage.title}
                onChange={(e) => updateTitle(selectedIdx, e.target.value)}
                className="flex-1 text-base font-semibold border-0 border-b-2 border-gray-200 focus:outline-none focus:border-indigo-400 pb-0.5"
              />
              <div className="flex gap-2 text-xs text-gray-500 flex-shrink-0">
                <span>{selected.parsedPage.blocks?.length || 0}b</span>
                <span>{selected.parsedPage.questions?.length || 0}q</span>
                <span>{selected.parsedPage.clarifiers?.length || 0}c</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              {['blocks', 'questions', 'clarifiers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 p-3 overflow-y-auto">
              {activeTab === 'blocks' && (
                <BlocksTab
                  blocks={selected.parsedPage.blocks || []}
                  onDelete={deleteBlock}
                  onTypeChange={changeBlockType}
                />
              )}
              {activeTab === 'questions' && (
                <QuestionsTab
                  questions={selected.parsedPage.questions || []}
                  onDelete={deleteQuestion}
                />
              )}
              {activeTab === 'clarifiers' && (
                <ClarifiersTab
                  clarifiers={selected.parsedPage.clarifiers || []}
                  onDelete={deleteClarifier}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a page
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex justify-between items-center">
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
            &larr; Back
          </button>
          <button
            onClick={() => onDone(draftPlan)}
            disabled={activePages.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40"
          >
            Commit {activePages.length} page{activePages.length !== 1 ? 's' : ''} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
