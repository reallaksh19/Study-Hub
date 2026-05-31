// SupportMaterialCard.jsx — UPGRADED
// Drop-in replacement for src/components/questions/SupportMaterialCard.jsx.
// Preserves: hint, clarifiers (5 types), supportBlocks via BlockRenderer,
//            supportPages list, supportResources list, retry / save / next actions.

import React from 'react';
import { HintCard } from './HintCard.jsx';
import { BlockRenderer } from '../blocks/BlockRenderer.jsx';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

const CLARIFIER_STYLES = {
  tip:            { bg: 'var(--color-brand-soft)',  border: '#D6D9FF', col: 'var(--color-brand)',   emoji: '💡', label: 'Tip' },
  warning:        { bg: 'var(--color-warn-soft)',   border: '#EBD79A', col: 'var(--color-warn)',    emoji: '⚠️', label: 'Warning' },
  key_fact:       { bg: '#F0EFEC',                  border: 'var(--color-line-2)', col: 'var(--color-ink)', emoji: '📌', label: 'Key fact' },
  common_mistake: { bg: 'var(--color-danger-soft)', border: '#F2B3B3', col: 'var(--color-danger)',  emoji: '❌', label: 'Common mistake' },
  did_you_know:   { bg: 'var(--color-success-soft)',border: '#95D2B3', col: 'var(--color-success)', emoji: '🌟', label: 'Did you know' },
};

function clarifierStyle(type) {
  return CLARIFIER_STYLES[type] || { bg: 'var(--color-paper-2)', border: 'var(--color-line)', col: 'var(--color-ink-2)', emoji: 'ℹ️', label: 'Note' };
}

export function SupportMaterialCard({
  hint,
  clarifiers = [],
  supportBlocks = [],
  supportPages = [],
  supportResources = [],
  retryAllowed,
  onRetry,
  onNext,
  onSaveForRevision,
}) {
  return (
    <div className="mt-4 pt-4 border-t border-line">
      <div className="bg-paper-2 border border-line-2 rounded-[14px] p-5">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span
            className="w-8 h-8 rounded-[9px] flex items-center justify-center border"
            style={{ background: '#fff', borderColor: 'var(--color-line)', color: 'var(--color-accent)' }}
          >
            <Ico.Compass width="16" height="16" />
          </span>
          <div>
            <div className="text-[13px] font-bold">Let's clear this up before moving on</div>
            <div className="text-[12px] text-muted mt-0.5">
              {[hint, ...clarifiers, ...supportBlocks, supportPages.length && 'pages', supportResources.length && 'links']
                .filter(Boolean).length} thing
              {clarifiers.length + supportBlocks.length + (hint ? 1 : 0) + (supportPages.length ? 1 : 0) + (supportResources.length ? 1 : 0) !== 1 ? 's' : ''} will help
            </div>
          </div>
        </div>

        {hint && <HintCard text={hint} />}

        {clarifiers.map((c) => {
          const s = clarifierStyle(c.type);
          return (
            <div
              key={c.id}
              className="rounded-[12px] border px-3.5 py-3 mb-2.5"
              style={{ background: s.bg, borderColor: s.border }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{s.emoji}</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.05em]"
                  style={{ color: s.col }}
                >
                  {s.label}
                </span>
              </div>
              <div className="text-[13.5px] font-semibold text-ink mb-1">{c.title}</div>
              <div className="text-[13px] text-ink-2 leading-relaxed">
                <ContentRenderer content={c.body} />
              </div>
            </div>
          );
        })}

        {supportBlocks.map((block) => (
          <div key={block.id} className="mb-3 bg-white border border-line rounded-[12px] p-4">
            <BlockRenderer block={block} />
          </div>
        ))}

        {supportPages.length > 0 && (
          <div className="mb-3 bg-white border border-line rounded-[12px] p-3.5">
            <div
              className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-2"
              style={{ color: 'var(--color-accent)' }}
            >
              Pages to revisit
            </div>
            <div className="flex flex-col gap-1.5">
              {supportPages.map((page) => (
                <a
                  key={page.id}
                  href={`#/topic/${page.topicId}/page/${page.id}`}
                  className="text-[13.5px] font-semibold flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-paper-2 transition no-underline"
                  style={{ color: 'var(--color-brand-ink)' }}
                >
                  {page.title}
                  <Ico.Arrow width="13" height="13" style={{ color: 'var(--color-muted)' }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {supportResources.length > 0 && (
          <div className="mb-3 bg-white border border-line rounded-[12px] p-3.5">
            <div
              className="text-[10.5px] font-bold uppercase tracking-[0.05em] mb-2"
              style={{ color: 'var(--color-brand-ink)' }}
            >
              Helpful resources
            </div>
            <div className="flex flex-col gap-2">
              {supportResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-2.5 py-2 rounded-md hover:bg-paper-2 transition no-underline"
                >
                  <div className="text-[13.5px] font-semibold" style={{ color: 'var(--color-brand)' }}>
                    {resource.title} ↗
                  </div>
                  {resource.whyThisHelps && (
                    <div className="text-[11.5px] text-muted mt-0.5">{resource.whyThisHelps}</div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap pt-3 mt-3 border-t border-line">
          {retryAllowed && (
            <button onClick={onRetry} className="sh-btn sh-btn-primary text-[13px]">
              Try again
            </button>
          )}
          <button onClick={onSaveForRevision} className="sh-btn sh-btn-secondary text-[13px]">
            <Ico.Bookmark width="14" height="14" /> Save for revision
          </button>
          <button onClick={onNext} className="sh-btn sh-btn-secondary text-[13px] ml-auto">
            Move on <Ico.Arrow width="14" height="14" />
          </button>
        </div>
      </div>
    </div>
  );
}
