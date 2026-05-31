// ShortAnswerQuestion.jsx — UPGRADED
// Preserves: submit → status 'submitted', self-mark buttons, model-answer HTML.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function ShortAnswerQuestion({ question, onAnswer }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selfMark, setSelfMark] = useState(null); // 'got_it' | 'practice'

  const handleSubmit = () => {
    setSubmitted(true);
    if (onAnswer) onAnswer({ status: 'submitted', answer });
  };

  const handleSelfMark = (kind) => {
    setSelfMark(kind);
    if (onAnswer) {
      onAnswer({ status: kind === 'got_it' ? 'correct' : 'incorrect', answer, selfMark: kind });
    }
  };

  return (
    <div className="short-question">
      <div className="serif text-[22px] sm:text-[24px] leading-snug tracking-tight mb-4">
        <ContentRenderer content={question.prompt} />
      </div>

      {!submitted ? (
        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            className="w-full min-h-[110px] p-3.5 rounded-[10px] text-[14px] font-sans outline-none mb-3 transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            style={{ border: '1px solid var(--color-line-2)', background: '#fff', resize: 'vertical' }}
          />
          <button onClick={handleSubmit} disabled={!answer.trim()} className="sh-btn sh-btn-primary text-[13px] disabled:opacity-40">
            Submit
          </button>
        </div>
      ) : (
        <div className="mt-4 p-5 rounded-[14px] border border-line-2 bg-paper-2">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted mb-2">
            Your answer
          </div>
          <div className="text-[14px] text-ink-2 mb-4 whitespace-pre-wrap">{answer}</div>

          {question.modelAnswer && (
            <>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted mb-2">
                Model answer
              </div>
              <div
                className="text-[14px] text-ink-2 leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: question.modelAnswer }}
              />
            </>
          )}

          {selfMark === null ? (
            <>
              <div className="text-[12px] text-muted mb-2">How did you do?</div>
              <div className="flex gap-2.5 flex-wrap">
                <button
                  onClick={() => handleSelfMark('got_it')}
                  className="sh-btn text-[13px]"
                  style={{ background: 'var(--color-success)', color: '#fff' }}
                >
                  <Ico.Check width="14" height="14" /> Got it
                </button>
                <button
                  onClick={() => handleSelfMark('practice')}
                  className="sh-btn sh-btn-secondary text-[13px]"
                  style={{ borderColor: '#F2B3B3', color: 'var(--color-danger)' }}
                >
                  <Ico.Close width="14" height="14" /> Need more practice
                </button>
              </div>
            </>
          ) : (
            <div
              className="text-[13px] font-semibold inline-flex items-center gap-2 px-3 py-2 rounded-md"
              style={{
                background: selfMark === 'got_it' ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
                color: selfMark === 'got_it' ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {selfMark === 'got_it'
                ? <><Ico.Check width="14" height="14" /> Marked: Got it</>
                : <><Ico.Close width="14" height="14" /> Marked: Needs more practice</>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
