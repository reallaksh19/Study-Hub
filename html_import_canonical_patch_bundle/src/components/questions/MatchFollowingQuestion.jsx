import React, { useMemo, useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

export function MatchFollowingQuestion({ question, onAnswer }) {
  const [pairs, setPairs] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const leftItems = question.leftItems || [];
  const rightItems = question.rightItems || [];
  const rightLookup = useMemo(() => Object.fromEntries(rightItems.map(item => [item.id, item])), [rightItems]);

  const correctCount = (question.correctPairs || []).filter(([leftId, rightId]) => pairs[leftId] === rightId).length;
  const allAnswered = leftItems.every(item => !!pairs[item.id]);

  function handleSubmit() {
    const total = (question.correctPairs || []).length || leftItems.length;
    const isPerfect = total > 0 && correctCount === total;
    setSubmitted(true);
    onAnswer?.({ status: isPerfect ? 'correct' : 'incorrect', value: pairs });
  }

  return (
    <div className="mb-4">
      <div className="font-bold text-lg mb-4">
        <ContentRenderer content={question.prompt} />
      </div>
      <div className="space-y-3">
        {leftItems.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr,220px] gap-3 items-center border rounded-lg p-3">
            <div><ContentRenderer content={item.text} /></div>
            <select
              disabled={submitted}
              value={pairs[item.id] || ''}
              onChange={(e) => setPairs(prev => ({ ...prev, [item.id]: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">Select match</option>
              {rightItems.map((rightItem) => (
                <option key={rightItem.id} value={rightItem.id}>{rightItem.text}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          Submit
        </button>
      ) : (
        <div className={`mt-4 p-4 rounded-lg border ${correctCount === (question.correctPairs || []).length ? 'bg-green-50 border-green-200 text-green-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <div className="font-semibold">You matched {correctCount} out of {(question.correctPairs || []).length} correctly.</div>
          <ul className="mt-2 space-y-1 text-sm">
            {(question.correctPairs || []).map(([leftId, rightId]) => (
              <li key={`${leftId}-${rightId}`}>
                <strong>{leftItems.find(item => item.id === leftId)?.text} → </strong>
                {rightLookup[rightId]?.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
