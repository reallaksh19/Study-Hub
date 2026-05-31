// FillInBlankQuestion.jsx — UPGRADED
// Preserves: normalize/lowercase comparison, array-of-answers support, Enter-to-submit, explanation.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

function normalize(input) {
  return String(input || '').trim().toLowerCase();
}

export function FillInBlankQuestion({ question, onAnswer }) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    const expected = question.answer;
    const ok = Array.isArray(expected)
      ? expected.map(normalize).includes(normalize(value))
      : normalize(expected) === normalize(value);
    setIsCorrect(ok);
    setSubmitted(true);
    onAnswer?.({ status: ok ? 'correct' : 'incorrect', value });
  };

  return (
    <div className="fill-question">
      <div className="serif text-[22px] sm:text-[24px] leading-snug tracking-tight mb-4">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="flex flex-col gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && value.trim() && !submitted) handleSubmit(); }}
          disabled={submitted}
          placeholder="Type your answer"
          className="px-3.5 py-3 rounded-[10px] text-[16px] font-semibold outline-none transition"
          style={{
            border: `${submitted ? 2 : 1}px solid ${
              submitted ? (isCorrect ? '#95D2B3' : '#F2B3B3') : 'var(--color-line-2)'
            }`,
            background: submitted
              ? isCorrect ? 'var(--color-success-soft)' : 'var(--color-danger-soft)'
              : '#fff',
            color: 'var(--color-ink)',
          }}
        />
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!value.trim()} className="sh-btn sh-btn-primary text-[13px] self-start disabled:opacity-40">
            Submit
          </button>
        ) : (
          <div
            className="p-4 rounded-[12px] border"
            style={{
              background: isCorrect ? 'var(--color-success-soft)' : 'var(--color-paper-2)',
              borderColor: isCorrect ? '#95D2B3' : 'var(--color-line)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <Ico.Check width="16" height="16" style={{ color: 'var(--color-success)' }} />
              ) : (
                <Ico.Close width="16" height="16" style={{ color: 'var(--color-danger)' }} />
              )}
              <span
                className="text-[11px] font-bold uppercase tracking-[0.05em]"
                style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {isCorrect ? 'Correct' : 'Expected'}
              </span>
            </div>
            <div className="text-[14px] font-semibold mb-1">
              {Array.isArray(question.answer) ? question.answer.join(' / ') : String(question.answer ?? '')}
            </div>
            {question.explanation && (
              <div className="text-[13px] text-ink-3 leading-relaxed mt-2">
                <ContentRenderer content={question.explanation} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
