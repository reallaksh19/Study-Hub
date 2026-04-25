import React from 'react';
import { buildRevisionSummary } from '../../services/revisionService.js';

export function RevisionMode({ topic, state, onOpenPage, onBack }) {
  const summary = buildRevisionSummary(topic, state);
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4">
        <button onClick={onBack} className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          ← Back
        </button>
      </div>
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">Revision mode</div>
        <h1 className="text-3xl font-bold">{topic.title} revision</h1>
        <p className="text-gray-600 mt-2">Focus on the pages where mastery is currently low or where quiz errors asked for revision.</p>
      </div>
      <div className="grid gap-4">
        {summary.cards.length === 0 && (
          <div className="border rounded-xl p-6 bg-green-50 text-green-800">Great job — nothing is currently flagged for revision in this topic.</div>
        )}
        {summary.cards.map((card) => (
          <div key={card.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-lg">{card.title}</div>
                <div className="text-sm text-gray-500 mt-1">Mastery {(card.mastery * 100).toFixed(0)}% · {card.reason}</div>
                {card.revisionSummary?.length > 0 && (
                  <ul className="list-disc pl-5 mt-3 text-sm text-gray-700 space-y-1">
                    {card.revisionSummary.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                )}
              </div>
              <button onClick={() => onOpenPage(card.id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Open page</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
