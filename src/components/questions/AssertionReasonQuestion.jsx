// AssertionReasonQuestion.jsx — UPGRADED
// Preserves: 4 OPTIONS map, answerPattern match, radio selection, explanation surface.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

const OPTIONS = [
  { id: 'both_true_reason_explains_assertion', label: 'Both A and R are true, and R correctly explains A.' },
  { id: 'both_true_reason_not_explain',         label: 'Both A and R are true, but R does not explain A.' },
  { id: 'assertion_true_reason_false',          label: 'A is true, but R is false.' },
  { id: 'assertion_false_reason_true',          label: 'A is false, but R is true.' },
];

export function AssertionReasonQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const isCorrect = selected === question.answerPattern;
    setSubmitted(true);
    onAnswer?.({ status: isCorrect ? 'correct' : 'incorrect', value: selected });
  };

  return (
    <div className="ar-question">
      {/* Assertion + Reason cards */}
      <div className="grid gap-2.5 mb-5">
        <div className="rounded-[12px] border border-line bg-paper-2 px-4 py-3">
          <div
            className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-1.5"
            style={{ color: 'var(--color-accent)' }}
          >
            Assertion (A)
          </div>
          <div className="text-[14.5px] leading-snug text-ink">
            <ContentRenderer content={question.assertion} />
          </div>
        </div>
        <div className="rounded-[12px] border border-line bg-paper-2 px-4 py-3">
          <div
            className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-1.5"
            style={{ color: 'var(--color-accent)' }}
          >
            Reason (R)
          </div>
          <div className="text-[14.5px] leading-snug text-ink">
            <ContentRenderer content={question.reason} />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        {OPTIONS.map((option, idx) => {
          const isSel = selected === option.id;
          const isCorrect = submitted && option.id === question.answerPattern;
          const isWrong   = submitted && isSel && option.id !== question.answerPattern;
          const dim       = submitted && !isSel && !isCorrect;
          return (
            <label
              key={option.id}
              className="flex items-start gap-3 rounded-[12px] px-4 py-3 cursor-pointer border transition"
              style={{
                background: isCorrect ? 'var(--color-success-soft)' :
                            isWrong   ? 'var(--color-danger-soft)' : '#fff',
                borderColor: isCorrect ? '#95D2B3' :
                             isWrong   ? '#F2B3B3' : 'var(--color-line-2)',
                opacity: dim ? 0.5 : 1,
                cursor: submitted ? 'default' : 'pointer',
              }}
            >
              <span
                className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-shrink-0 text-[12px] font-bold mt-px"
                style={{
                  background: isCorrect ? 'var(--color-success)' :
                              isWrong   ? 'var(--color-danger)'  : 'var(--color-paper-2)',
                  color: isCorrect || isWrong ? '#fff' : 'var(--color-muted)',
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <input
                type="radio"
                name={question.id}
                value={option.id}
                disabled={submitted}
                checked={isSel}
                onChange={() => setSelected(option.id)}
                className="sr-only"
              />
              <span className="text-[14px] leading-snug text-ink-2 flex-1">{option.label}</span>
              {isCorrect && <Ico.Check width="16" height="16" style={{ color: 'var(--color-success)' }} />}
              {isWrong   && <Ico.Close width="16" height="16" style={{ color: 'var(--color-danger)' }} />}
            </label>
          );
        })}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} disabled={!selected} className="mt-4 sh-btn sh-btn-primary text-[13px] disabled:opacity-40">
          Submit
        </button>
      ) : (
        question.explanation && (
          <div
            className="mt-4 p-4 rounded-[12px] border flex gap-3 text-[13.5px] leading-relaxed"
            style={{
              background: selected === question.answerPattern ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
              borderColor: selected === question.answerPattern ? '#95D2B3' : '#F2B3B3',
              color: selected === question.answerPattern ? 'var(--color-success)' : 'var(--color-danger)',
            }}
          >
            <span className="flex-shrink-0 mt-0.5">
              {selected === question.answerPattern
                ? <Ico.Check width="18" height="18" />
                : <Ico.Close width="18" height="18" />}
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.05em] mb-1 opacity-80">
                {selected === question.answerPattern ? 'Correct' : 'Not quite'}
              </div>
              <div style={{ color: 'var(--color-ink-2)' }}>
                <ContentRenderer content={question.explanation} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
