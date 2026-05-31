// MatchFollowingQuestion.jsx — UPGRADED
// Preserves: pairs map, correctPairs scoring, all-answered gating, status emission.

import React, { useMemo, useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function MatchFollowingQuestion({ question, onAnswer }) {
  const [pairs, setPairs] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const leftItems = question.leftItems || [];
  const rightItems = question.rightItems || [];
  const rightLookup = useMemo(() => Object.fromEntries(rightItems.map((it) => [it.id, it])), [rightItems]);

  const correctPairs = question.correctPairs || [];
  const correctMap = useMemo(() => Object.fromEntries(correctPairs.map(([l, r]) => [l, r])), [correctPairs]);

  const correctCount = correctPairs.filter(([leftId, rightId]) => pairs[leftId] === rightId).length;
  const allAnswered = leftItems.every((it) => !!pairs[it.id]);
  const total = correctPairs.length || leftItems.length;

  const handleSubmit = () => {
    const isPerfect = total > 0 && correctCount === total;
    setSubmitted(true);
    onAnswer?.({ status: isPerfect ? 'correct' : 'incorrect', value: pairs });
  };

  return (
    <div className="match-question">
      <div className="serif text-[22px] sm:text-[24px] leading-snug tracking-tight mb-5">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="grid gap-2.5">
        {leftItems.map((item) => {
          const choice = pairs[item.id];
          const expectedRight = correctMap[item.id];
          const isCorrect = submitted && choice && choice === expectedRight;
          const isWrong   = submitted && choice && choice !== expectedRight;
          return (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 items-center rounded-[12px] px-3.5 py-3 border"
              style={{
                background: isCorrect ? 'var(--color-success-soft)' : isWrong ? 'var(--color-danger-soft)' : '#fff',
                borderColor: isCorrect ? '#95D2B3' : isWrong ? '#F2B3B3' : 'var(--color-line-2)',
              }}
            >
              <div className="text-[14px] text-ink leading-snug">
                <ContentRenderer content={item.text} />
              </div>
              <div className="flex items-center gap-2">
                <select
                  disabled={submitted}
                  value={choice || ''}
                  onChange={(e) => setPairs((p) => ({ ...p, [item.id]: e.target.value }))}
                  className="flex-1 rounded-[9px] px-3 py-2 text-[13.5px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  style={{
                    background: submitted ? 'transparent' : 'var(--color-paper-2)',
                    border: '1px solid var(--color-line-2)',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">Select match</option>
                  {rightItems.map((ri) => (
                    <option key={ri.id} value={ri.id}>{ri.text}</option>
                  ))}
                </select>
                {isCorrect && <Ico.Check width="18" height="18" style={{ color: 'var(--color-success)' }} />}
                {isWrong   && <Ico.Close width="18" height="18" style={{ color: 'var(--color-danger)' }} />}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-4 sh-btn sh-btn-primary text-[13px] disabled:opacity-40"
        >
          Submit
        </button>
      ) : (
        <div
          className="mt-4 p-4 rounded-[12px] border"
          style={{
            background: correctCount === total ? 'var(--color-success-soft)' : 'var(--color-warn-soft)',
            borderColor: correctCount === total ? '#95D2B3' : '#EBD79A',
            color: correctCount === total ? 'var(--color-success)' : '#7A4A09',
          }}
        >
          <div className="text-[14px] font-bold mb-2">
            You matched {correctCount} of {total} correctly.
          </div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-1.5 opacity-80">
            Correct pairs
          </div>
          <ul className="m-0 pl-5 text-[13px] leading-snug" style={{ color: 'var(--color-ink-2)' }}>
            {correctPairs.map(([leftId, rightId]) => (
              <li key={`${leftId}-${rightId}`}>
                <b>{leftItems.find((it) => it.id === leftId)?.text}</b> → {rightLookup[rightId]?.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
