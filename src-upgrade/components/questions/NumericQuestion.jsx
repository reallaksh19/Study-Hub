// NumericQuestion.jsx — UPGRADED
// Preserves: parseFloat answer + tolerance comparison, onAnswer status.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function NumericQuestion({ question, onAnswer }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    const correct = Math.abs(numValue - question.answer) <= (question.tolerance || 0);
    setStatus(correct ? 'correct' : 'incorrect');
    if (onAnswer) onAnswer({ status: correct ? 'correct' : 'incorrect', value: numValue });
  };

  const inputBorder =
    status === 'correct' ? '#95D2B3' :
    status === 'incorrect' ? '#F2B3B3' : 'var(--color-line-2)';
  const inputBg =
    status === 'correct' ? 'var(--color-success-soft)' :
    status === 'incorrect' ? 'var(--color-danger-soft)' : '#fff';

  return (
    <div className="numeric-question">
      <div className="serif text-[22px] sm:text-[24px] leading-snug tracking-tight mb-4">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && status === null && value !== '') handleSubmit(); }}
          disabled={status !== null}
          placeholder="Your answer"
          className="px-3.5 py-3 w-40 rounded-[10px] text-[17px] font-semibold outline-none transition stat"
          style={{
            border: `${status === null ? 1 : 2}px solid ${inputBorder}`,
            background: inputBg,
            color: 'var(--color-ink)',
          }}
        />
        {question.unit && <span className="text-[14px] text-muted font-medium">{question.unit}</span>}
        {question.tolerance > 0 && status === null && (
          <span className="text-[11.5px] text-muted ml-auto">Accept within ±{question.tolerance}</span>
        )}
      </div>

      {status === null ? (
        <button onClick={handleSubmit} disabled={value === ''} className="sh-btn sh-btn-primary text-[13px] disabled:opacity-40">
          Submit answer
        </button>
      ) : (
        <FeedbackPanel status={status} explanation={question.explanation} />
      )}
    </div>
  );
}

function FeedbackPanel({ status, explanation }) {
  const ok = status === 'correct';
  return (
    <div
      className="mt-4 p-4 rounded-[12px] text-[13.5px] leading-relaxed border flex gap-3"
      style={{
        background: ok ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
        borderColor: ok ? '#95D2B3' : '#F2B3B3',
        color: ok ? 'var(--color-success)' : 'var(--color-danger)',
      }}
    >
      <span className="flex-shrink-0 mt-0.5">
        {ok ? <Ico.Check width="18" height="18" /> : <Ico.Close width="18" height="18" />}
      </span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.05em] mb-1 opacity-80">
          {ok ? 'Correct' : 'Not quite'}
        </div>
        {explanation && (
          <div style={{ color: 'var(--color-ink-2)' }}>
            <ContentRenderer content={explanation} />
          </div>
        )}
      </div>
    </div>
  );
}
