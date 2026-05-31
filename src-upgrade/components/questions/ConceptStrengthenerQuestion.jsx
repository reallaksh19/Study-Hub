// ConceptStrengthenerQuestion.jsx — UPGRADED
// Preserves: externalLink open + 'explored' status + xpReward.

import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function ConceptStrengthenerQuestion({ question, onAnswer }) {
  const [explored, setExplored] = useState(false);

  const handleExplore = () => {
    if (question.externalLink) {
      window.open(question.externalLink, '_blank', 'noopener,noreferrer');
    }
    if (!explored) {
      setExplored(true);
      if (onAnswer) onAnswer({ status: 'explored', xpReward: question.xpReward || 5 });
    }
  };

  return (
    <div
      className="rounded-[14px] border p-6"
      style={{ background: 'var(--color-violet-soft)', borderColor: '#D7C3F5' }}
    >
      <div
        className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-3 flex items-center gap-2"
        style={{ color: 'var(--color-violet)' }}
      >
        <Ico.Sparkle width="13" height="13" />
        Concept strengthener
        {question.xpReward > 0 && <span className="ml-auto">+{question.xpReward} XP</span>}
      </div>

      {question.embedContent && (
        <div className="mb-4 p-4 bg-white border border-line rounded-[12px] text-[14px] text-ink-2 leading-relaxed">
          <ContentRenderer content={question.embedContent} />
        </div>
      )}

      <div className="serif text-[20px] leading-snug tracking-tight mb-5">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleExplore}
          className="sh-btn text-[13px]"
          style={{ background: 'var(--color-violet)', color: '#fff' }}
        >
          <Ico.Sparkle width="14" height="14" /> Explore further
          <Ico.Arrow width="14" height="14" />
        </button>
        {explored && (
          <span
            className="text-[12.5px] font-semibold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)', border: '1px solid #95D2B3' }}
          >
            <Ico.Check width="13" height="13" /> Explored
          </span>
        )}
      </div>
    </div>
  );
}
