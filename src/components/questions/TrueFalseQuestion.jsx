// TrueFalseQuestion.jsx — UPGRADED
// Preserves: boolean OR string answer support, onAnswer status, explanation.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function TrueFalseQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);

  const handleSubmit = (ans) => {
    setSelected(ans);
    let correct = false;
    if (typeof question.answer === 'boolean') correct = ans === question.answer;
    else correct = String(ans).toLowerCase() === String(question.answer).toLowerCase();

    setStatus(correct ? 'correct' : 'incorrect');
    if (onAnswer) onAnswer({ status: correct ? 'correct' : 'incorrect', value: ans });
  };

  return (
    <div className="tf-question">
      <div className="serif text-[22px] sm:text-[24px] leading-snug tracking-tight mb-5">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((val) => {
          const isSel = selected === val;
          let s = 'idle';
          if (status !== null) {
            const expectsBool = typeof question.answer === 'boolean';
            const isCorrect = expectsBool
              ? val === question.answer
              : String(val).toLowerCase() === String(question.answer).toLowerCase();
            if (isSel && status === 'correct')   s = 'correct';
            else if (isSel && status === 'incorrect') s = 'wrong';
            else if (!isSel && isCorrect && status === 'incorrect') s = 'correct';
            else s = 'dimmed';
          }
          return (
            <TFTile
              key={String(val)}
              label={val ? 'True' : 'False'}
              state={s}
              disabled={status !== null}
              onClick={() => handleSubmit(val)}
            />
          );
        })}
      </div>

      {status !== null && question.explanation && (
        <div
          className="mt-4 p-4 rounded-[12px] text-[13.5px] leading-relaxed border flex gap-3"
          style={{
            background: status === 'correct' ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
            borderColor: status === 'correct' ? '#95D2B3' : '#F2B3B3',
            color: status === 'correct' ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          <span className="flex-shrink-0 mt-0.5">
            {status === 'correct' ? <Ico.Check width="18" height="18" /> : <Ico.Close width="18" height="18" />}
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.05em] mb-1 opacity-80">
              {status === 'correct' ? 'Correct' : 'Not quite'}
            </div>
            <div style={{ color: 'var(--color-ink-2)' }}>
              <ContentRenderer content={question.explanation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TFTile({ label, state, disabled, onClick }) {
  const map = {
    idle:    { bg: '#fff',                       border: 'var(--color-line-2)',  col: 'var(--color-ink)'     },
    correct: { bg: 'var(--color-success-soft)',  border: '#95D2B3',              col: 'var(--color-success)' },
    wrong:   { bg: 'var(--color-danger-soft)',   border: '#F2B3B3',              col: 'var(--color-danger)'  },
    dimmed:  { bg: '#fff',                       border: 'var(--color-line)',    col: 'var(--color-muted)'   },
  };
  const s = map[state];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="py-5 rounded-[13px] text-[18px] font-bold border-2 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand/20"
      style={{
        background: s.bg,
        borderColor: s.border,
        color: s.col,
        opacity: state === 'dimmed' ? 0.65 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {label}
      {state === 'correct' && <Ico.Check width="20" height="20" />}
      {state === 'wrong'   && <Ico.Close width="20" height="20" />}
    </button>
  );
}
