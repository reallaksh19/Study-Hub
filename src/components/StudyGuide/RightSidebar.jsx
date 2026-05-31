// RightSidebar.jsx — UPGRADED
// Drop-in replacement for src/components/StudyGuide/RightSidebar.jsx.
// Preserves: clarifier styles (5 types), relatedPages via LinkCardBlock,
//            Gemini callGemini paths for "summarise" and "explain differently",
//            loading/error/dismiss states.

import React, { useState } from 'react';
import { LinkCardBlock } from '../blocks/LinkCardBlock.jsx';
import { callGemini } from '../../services/geminiService.js';
import { Ico } from '../../lib/Icons.jsx';
import { useToast } from '../../lib/Toast.jsx';

const CLARIFIER_STYLES = {
  tip:            { bg: 'var(--color-brand-soft)',  border: '#D6D9FF', col: 'var(--color-brand)',   emoji: '💡', label: 'Tip' },
  warning:        { bg: 'var(--color-warn-soft)',   border: '#EBD79A', col: 'var(--color-warn)',    emoji: '⚠️', label: 'Warning' },
  key_fact:       { bg: '#F0EFEC',                  border: 'var(--color-line-2)', col: 'var(--color-ink)', emoji: '📌', label: 'Key fact' },
  common_mistake: { bg: 'var(--color-danger-soft)', border: '#F2B3B3', col: 'var(--color-danger)',  emoji: '❌', label: 'Common mistake' },
  did_you_know:   { bg: 'var(--color-success-soft)',border: '#95D2B3', col: 'var(--color-success)', emoji: '🌟', label: 'Did you know' },
};

export function RightSidebar({ clarifiers = [], relatedPages = [], settings = {}, pageBlocks = [], pageTitle = '' }) {
  const toast = useToast();
  const [aiSummary, setAiSummary] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const getPageText = () =>
    pageBlocks
      .filter((b) => b.type === 'paragraph' || b.type === 'heading')
      .map((b) => b.data.text || '')
      .join(' ')
      .slice(0, 1500);

  const handleSummarise = async () => {
    setLoadingAi(true);
    try {
      if (settings.geminiApiKey === 'mock-key' || !settings.geminiApiKey) {
        setTimeout(() => {
          setAiSummary(
            'Here is a 3-line recap of the page content: This page explains the concept clearly. It shows how it applies in real life. It also points out common mistakes.'
          );
          setLoadingAi(false);
        }, 1000);
        return;
      }
      const prompt = `Summarise this page for a student in 3 bullet points. Page title: "${pageTitle}". Content: ${getPageText()}`;
      const response = await callGemini(prompt, settings.geminiApiKey);
      setAiSummary(response);
    } catch {
      toast.show('AI unavailable. Check your API key.', { variant: 'error' });
    }
    setLoadingAi(false);
  };

  const handleExplain = async () => {
    setLoadingAi(true);
    try {
      if (settings.geminiApiKey === 'mock-key' || !settings.geminiApiKey) {
        setTimeout(() => {
          setAiExplanation(
            'Think of it like baking a cake. You need the right ingredients (components) in the right amounts (magnitudes) to get the final result (resultant vector).'
          );
          setLoadingAi(false);
        }, 1000);
        return;
      }
      const prompt = `Explain "${pageTitle}" using a real-world analogy for a student. Content context: ${getPageText()}`;
      const response = await callGemini(prompt, settings.geminiApiKey);
      setAiExplanation(response);
    } catch {
      toast.show('AI unavailable. Check your API key.', { variant: 'error' });
    }
    setLoadingAi(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* AI Assist — first, only if key is present */}
      {settings.geminiApiKey && pageBlocks.length > 0 && (
        <div className="bg-ink text-white border border-ink-2 rounded-[14px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-[8px] flex items-center justify-center bg-white/10">
              <Ico.Sparkle width="14" height="14" />
            </span>
            <span className="text-[13px] font-bold">Ask the AI tutor</span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSummarise}
              disabled={loadingAi}
              className="text-left px-3 py-2 rounded-[8px] text-[12.5px] font-semibold bg-white/[.07] hover:bg-white/10 border border-white/10 transition disabled:opacity-50"
            >
              ✨ Summarise this page
            </button>
            <button
              onClick={handleExplain}
              disabled={loadingAi}
              className="text-left px-3 py-2 rounded-[8px] text-[12.5px] font-semibold bg-white/[.07] hover:bg-white/10 border border-white/10 transition disabled:opacity-50"
            >
              ✨ Explain differently
            </button>
          </div>
          {loadingAi && (
            <div className="mt-3 text-[12px] text-white/70 animate-pulse">Thinking…</div>
          )}
          {aiSummary && (
            <div className="mt-3 p-3 bg-white text-ink rounded-[10px] relative">
              <button
                onClick={() => setAiSummary(null)}
                className="absolute top-1.5 right-2 text-muted hover:text-ink"
              >
                <Ico.Close width="14" height="14" />
              </button>
              <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-muted mb-1">Summary</div>
              <p className="text-[13px] whitespace-pre-wrap m-0">{aiSummary}</p>
            </div>
          )}
          {aiExplanation && (
            <div className="mt-3 p-3 bg-white text-ink rounded-[10px] relative">
              <button
                onClick={() => setAiExplanation(null)}
                className="absolute top-1.5 right-2 text-muted hover:text-ink"
              >
                <Ico.Close width="14" height="14" />
              </button>
              <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-muted mb-1">
                Different explanation
              </div>
              <p className="text-[13px] whitespace-pre-wrap m-0">{aiExplanation}</p>
            </div>
          )}
        </div>
      )}

      {clarifiers.length > 0 && (
        <div>
          <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em] mb-2.5 flex justify-between">
            <span>Concept tips · {clarifiers.length}</span>
          </div>
          {clarifiers.map((c) => {
            const s = CLARIFIER_STYLES[c.type] || CLARIFIER_STYLES.tip;
            return (
              <div
                key={c.id}
                className="rounded-[11px] border px-3.5 py-3 mb-2"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{s.emoji}</span>
                  <span
                    className="text-[10.5px] font-bold uppercase tracking-[0.05em]"
                    style={{ color: s.col }}
                  >
                    {s.label}
                  </span>
                </div>
                <div className="text-[13.5px] font-semibold text-ink">{c.title}</div>
                <div
                  className="text-[12.5px] text-ink-3 leading-relaxed mt-1"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </div>
            );
          })}
        </div>
      )}

      {relatedPages.length > 0 && (
        <div>
          <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em] mb-2.5">
            Related pages
          </div>
          <div className="flex flex-col gap-1.5">
            {relatedPages.map((page) => (
              <div key={page.id}>
                <LinkCardBlock
                  title={page.title}
                  url={`#/topic/${page.id.split('-').slice(0, 2).join('-')}/page/${page.id}`}
                  linkType="page"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
