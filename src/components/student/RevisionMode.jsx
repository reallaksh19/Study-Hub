// RevisionMode.jsx — UPGRADED
// Drop-in replacement for src/components/student/RevisionMode.jsx.
// Preserves: buildRevisionSummary, onOpenPage, onBack.

import React from 'react';
import { buildRevisionSummary } from '../../services/revisionService.js';
import { Ico } from '../../lib/Icons.jsx';

export function RevisionMode({ topic, state, onOpenPage, onBack }) {
  const summary = buildRevisionSummary(topic, state);
  const cards = summary.cards || [];

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 sm:px-8 pt-7 pb-12">
        <button onClick={onBack} className="sh-btn sh-btn-ghost text-[13px] pl-0 mb-5">
          <Ico.ArrowLeft width="16" height="16" /> Back to topic
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center border"
            style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)', borderColor: '#E9C77B' }}
          >
            <Ico.Star width="24" height="24" />
          </div>
          <div>
            <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.06em]">
              Revision mode
            </div>
            <h1 className="serif text-3xl sm:text-[34px] leading-[1.05] tracking-tight m-0">
              {topic.title} · revision
            </h1>
          </div>
        </div>

        <p className="text-[14.5px] text-ink-3 leading-relaxed m-0 mb-7">
          Focus on pages where mastery is currently low, or where a wrong quiz answer asked to be saved for revision.
        </p>

        {cards.length === 0 ? (
          <div
            className="rounded-[14px] border p-6 text-center"
            style={{ background: 'var(--color-success-soft)', borderColor: '#95D2B3', color: 'var(--color-success)' }}
          >
            <div className="text-2xl mb-2">🎉</div>
            <p className="font-semibold m-0">Great job — nothing is currently flagged for revision.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {cards.map((card) => {
              const masteryPct = Math.round((card.mastery ?? 0.5) * 100);
              const tone =
                masteryPct > 60 ? 'var(--color-warn)' :
                masteryPct > 40 ? 'var(--color-warn)' : 'var(--color-danger)';
              return (
                <div
                  key={card.id}
                  className="bg-white border border-line-2 rounded-[14px] p-5 grid grid-cols-[1fr_auto] gap-5"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="stat text-[24px] font-semibold" style={{ color: tone }}>{masteryPct}%</span>
                      <span className="text-[11px] text-muted font-semibold">mastery</span>
                    </div>
                    <div className="serif text-[22px] leading-[1.15] mb-1.5">{card.title}</div>
                    <div className="text-[12.5px] text-muted italic mb-2.5">{card.reason}</div>
                    {card.revisionSummary?.length > 0 && (
                      <ul className="pl-5 mt-1 text-[13.5px] leading-snug text-ink-3 list-disc m-0">
                        {card.revisionSummary.map((item, idx) => (
                          <li key={idx} className="mb-0.5">{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col justify-between items-end gap-2.5">
                    <div className="w-[84px] h-1.5 bg-paper rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${masteryPct}%`, background: tone }}
                      />
                    </div>
                    <button
                      onClick={() => onOpenPage(card.id)}
                      className="sh-btn sh-btn-primary text-[12.5px]"
                    >
                      Open page <Ico.Arrow width="13" height="13" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
