// McqQuestion.jsx — UPGRADED
// Drop-in replacement for src/components/questions/McqQuestion.jsx.
// Preserves: integer-or-letter answer handling, post-answer disabled state,
//            correct/incorrect colour states, explanation surface on submit.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function McqQuestion({ question, onAnswer, darkMode }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [status, setStatus] = useState(null); // 'correct' | 'incorrect'

  const handleSubmit = (idx) => {
    setSelectedIdx(idx);

    let correct = false;
    if (typeof question.answer === 'number') {
      correct = idx === question.answer;
    } else if (typeof question.answer === 'string') {
      const charCode = question.answer.toUpperCase().charCodeAt(0) - 65;
      correct = idx === charCode;
    }

    setStatus(correct ? 'correct' : 'incorrect');
    if (onAnswer) onAnswer({ status: correct ? 'correct' : 'incorrect', value: idx });
  };

  return (
    <div className="mcq-question">
      {/* Question prompt */}
      <div className="serif text-[22px] sm:text-[24px] leading-snug tracking-tight mb-1.5">
        <ContentRenderer content={question.prompt} />
      </div>
      <div className="text-[12.5px] text-muted mb-5">Choose one answer.</div>

      <div className="flex flex-col gap-2.5">
        {(question.options || []).map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect =
            (typeof question.answer === 'number' && idx === question.answer) ||
            (typeof question.answer === 'string' && idx === question.answer.toUpperCase().charCodeAt(0) - 65);

          // Visual state: idle | correct | wrong | dimmed (other options after a wrong pick)
          let state = 'idle';
          if (status !== null) {
            if (isSelected && status === 'correct')      state = 'correct';
            else if (isSelected && status === 'incorrect') state = 'wrong';
            else if (!isSelected && isCorrect && status === 'incorrect') state = 'correct'; // reveal
            else state = 'dimmed';
          }

          return (
            <Option
              key={idx}
              letter={String.fromCharCode(65 + idx)}
              state={state}
              disabled={status !== null}
              onClick={() => handleSubmit(idx)}
              isSelected={isSelected}
            >
              <ContentRenderer content={opt} />
            </Option>
          );
        })}
      </div>

      {/* Explanation surface */}
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

function Option({ letter, state, disabled, isSelected, onClick, children }) {
  // states: idle, correct, wrong, dimmed
  const styleMap = {
    idle:   { bg: '#fff', border: 'var(--color-line-2)',  col: 'var(--color-ink)',     chipBg: 'var(--color-paper-2)',    chipCol: 'var(--color-muted)' },
    correct:{ bg: 'var(--color-success-soft)', border: '#95D2B3', col: 'var(--color-ink)', chipBg: 'var(--color-success)', chipCol: '#fff' },
    wrong:  { bg: 'var(--color-danger-soft)',  border: '#F2B3B3', col: 'var(--color-ink)', chipBg: 'var(--color-danger)',  chipCol: '#fff' },
    dimmed: { bg: '#fff', border: 'var(--color-line)',   col: 'var(--color-muted)',   chipBg: 'var(--color-paper-2)',   chipCol: 'var(--color-muted)' },
  };
  const s = styleMap[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left rounded-[13px] px-4 py-3 flex items-center gap-3.5 transition border focus:outline-none focus:ring-2 focus:ring-brand/20"
      style={{
        background: s.bg,
        borderColor: s.border,
        color: s.col,
        opacity: state === 'dimmed' ? 0.65 : 1,
        cursor: disabled ? 'default' : 'pointer',
        borderWidth: (state === 'correct' || state === 'wrong') ? 2 : 1,
      }}
    >
      <span
        className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0 text-[13px] font-bold transition"
        style={{ background: s.chipBg, color: s.chipCol }}
      >
        {letter}
      </span>
      <span className="flex-1 text-[15px] leading-snug font-medium">{children}</span>
      {state === 'correct' && <Ico.Check width="18" height="18" style={{ color: 'var(--color-success)' }} />}
      {state === 'wrong'   && <Ico.Close width="18" height="18" style={{ color: 'var(--color-danger)' }} />}
    </button>
  );
}
