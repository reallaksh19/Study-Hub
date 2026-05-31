// TopicHome.jsx — UPGRADED
// Drop-in replacement for src/components/student/TopicHome.jsx.
// Preserves: props (subject, topic, state, onOpenPage, onOpenRevision, onOpenExam, onOpenWorksheet, onBack),
//            calculateTopicStats / getNextRecommendedPage / getResumePageId / isPageUnlocked,
//            "Resume", "Start from beginning", "Revise weak pages", "Exam drill", "Worksheet" buttons (worksheet conditional),
//            tagged-page indicator from studentTags, locked / needs revision / recommended states.

import React from 'react';
import {
  calculateTopicStats,
  getNextRecommendedPage,
  getResumePageId,
  isPageUnlocked,
} from '../../services/learningProgressService.js';
import { Ico } from '../../lib/Icons.jsx';

export function TopicHome({ subject, topic, state, onOpenPage, onOpenRevision, onOpenExam, onOpenWorksheet, onBack }) {
  const pages = topic.pages || [];
  const stats = calculateTopicStats(topic, state);
  const recommended = getNextRecommendedPage(topic, state);
  const resumePageId = getResumePageId(topic, state);
  const resumePage = pages.find((p) => p.id === resumePageId) || recommended || pages[0];
  const taggedPageIds = new Set(
    (state.studentTags || []).filter((t) => t.status !== 'closed').map((t) => t.pageId)
  );

  const topicFolderKey = topic.folder || topic.id.replace(`${topic.subjectId}-`, '');
  const hasWorksheet = !!localStorage.getItem(`worksheet_selection_${topic.subjectId}_${topicFolderKey}`);

  return (
    <div className="bg-paper min-h-screen">
      {/* Top bar */}
      <header className="flex items-center px-6 sm:px-8 py-4 border-b border-line bg-paper-2">
        <button onClick={onBack} className="sh-btn sh-btn-ghost text-[13px] pl-0">
          <Ico.ArrowLeft width="16" height="16" /> {subject.title}
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="sh-chip">
            <Ico.Bolt width="12" height="12" style={{ color: 'var(--color-warn)' }} />
            Topic {stats.completionPct}% complete
          </span>
        </div>
      </header>

      <div className="px-6 sm:px-8 pt-6 pb-12 max-w-[1080px] mx-auto">
        {/* Topic hero */}
        <div className="sh-card overflow-hidden mb-6 grid lg:grid-cols-[1.3fr_1fr]">
          <div className="p-7 sm:p-8">
            <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.06em] mb-2">
              {subject.title} · Topic
            </div>
            <h1 className="serif text-4xl sm:text-5xl leading-[1.02] tracking-tight m-0 mb-3">
              {topic.title}
            </h1>

            {topic.description && (
              <p className="text-[15px] text-ink-3 leading-relaxed m-0 mb-4 max-w-[520px]">
                {topic.description}
              </p>
            )}

            {topic.helperText && (
              <div className="px-3.5 py-3 bg-brand-soft border border-[#D6D9FF] text-brand-ink rounded-[12px] text-[13.5px] leading-relaxed mb-6 flex items-start gap-2.5">
                <Ico.Hint width="18" height="18" style={{ color: 'var(--color-brand)' }} className="flex-shrink-0 mt-0.5" />
                <span>{topic.helperText}</span>
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-wrap gap-2.5">
              {resumePage && (
                <button
                  onClick={() => onOpenPage(resumePage.id)}
                  className="sh-btn sh-btn-primary"
                >
                  {stats.readPages > 0 ? `Resume · ${resumePage.title}` : `Start · ${resumePage.title}`}
                  <Ico.Arrow width="15" height="15" />
                </button>
              )}
              <button onClick={() => onOpenPage(pages[0]?.id)} className="sh-btn sh-btn-secondary">
                Start from beginning
              </button>
              <button
                onClick={onOpenRevision}
                className="sh-btn sh-btn-secondary"
                style={{ borderColor: '#E9C77B', color: 'var(--color-warn)', background: '#FFFBED' }}
              >
                <Ico.Star width="14" height="14" /> Revise weak pages
                {stats.revisionNeededCount > 0 && (
                  <span className="ml-1 text-[11px] font-bold">· {stats.revisionNeededCount}</span>
                )}
              </button>
              <button
                onClick={onOpenExam}
                className="sh-btn sh-btn-secondary"
                style={{ borderColor: '#D7C3F5', color: 'var(--color-violet)', background: '#FAF6FF' }}
              >
                <Ico.Bolt width="14" height="14" /> Exam drill
              </button>
              {hasWorksheet && (
                <button
                  onClick={onOpenWorksheet}
                  className="sh-btn sh-btn-secondary"
                  style={{ borderColor: '#A9D4CE', color: 'var(--color-teal)', background: '#EFF9F7' }}
                >
                  <Ico.Bookmark width="14" height="14" /> Worksheet
                </button>
              )}
            </div>
          </div>

          {/* Progress panel */}
          <div className="bg-paper-2 border-l border-line p-7 sm:p-8 flex flex-col">
            <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em] mb-3.5">
              Your progress
            </div>

            <ProgressRing pct={stats.completionPct} mastery={stats.averageMastery} />

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <ProgStat label="Pages read"     value={`${stats.readPages} / ${stats.totalPages}`} />
              <ProgStat label="Mastery"        value={`${(stats.averageMastery * 100).toFixed(0)}%`} />
              <ProgStat label="Revision queue" value={stats.revisionNeededCount} tone={stats.revisionNeededCount > 0 ? 'warn' : undefined} />
              <ProgStat label="Pages tagged"   value={taggedPageIds.size} tone={taggedPageIds.size > 0 ? 'accent' : undefined} />
            </div>
          </div>
        </div>

        {/* Page list */}
        <div className="flex items-baseline justify-between mb-3.5">
          <h2 className="serif text-[22px] m-0 tracking-tight">Pages</h2>
          <span className="text-[12.5px] text-muted">{pages.length} total</span>
        </div>

        <div className="grid gap-2">
          {pages.map((page, idx) => {
            const progress = state.pageProgress?.[page.id] || {};
            const unlocked = isPageUnlocked(page, state);
            const isRecommended = recommended?.id === page.id;
            return (
              <PageRow
                key={page.id}
                idx={idx}
                page={page}
                progress={progress}
                unlocked={unlocked}
                recommended={isRecommended}
                tagged={taggedPageIds.has(page.id)}
                onClick={() => unlocked && onOpenPage(page.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ pct, mastery }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3.5">
      <svg width="98" height="98" viewBox="0 0 98 98">
        <circle cx="49" cy="49" r={r} fill="none" stroke="var(--color-line-2)" strokeWidth="9" />
        <circle
          cx="49" cy="49" r={r} fill="none" stroke="var(--color-brand)" strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          transform="rotate(-90 49 49)"
        />
        <text x="49" y="55" textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--color-ink)"
          fontFamily="var(--font-sans)">{pct}%</text>
      </svg>
      <div>
        <div className="serif text-[20px] leading-tight">
          {pct === 0 ? 'Just getting started' : pct === 100 ? 'All done — nice.' : 'Keep going'}
        </div>
        <div className="text-[12.5px] text-muted mt-1">
          Avg mastery {(mastery * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

function ProgStat({ label, value, tone }) {
  const col =
    tone === 'warn'   ? 'var(--color-warn)'   :
    tone === 'accent' ? 'var(--color-accent)' : 'var(--color-ink)';
  return (
    <div className="bg-white border border-line rounded-[10px] px-3 py-2.5">
      <div className="stat text-[18px] font-semibold" style={{ color: col }}>{value}</div>
      <div className="text-[11px] text-muted font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function PageRow({ idx, page, progress, unlocked, recommended, tagged, onClick }) {
  const status = progress.read
    ? 'read'
    : !unlocked
      ? 'locked'
      : recommended
        ? 'recommended'
        : 'ready';

  const meta = {
    read:        { label: 'Read',        col: 'var(--color-success)', bg: 'var(--color-success-soft)', ico: <Ico.Check width="16" height="16" /> },
    recommended: { label: 'Recommended', col: 'var(--color-brand)',   bg: 'var(--color-brand-soft)',   ico: <Ico.Star  width="16" height="16" /> },
    ready:       { label: 'Ready',       col: 'var(--color-ink-2)',   bg: 'var(--color-paper-2)',     ico: <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-ink-2)' }} /> },
    locked:      { label: 'Locked',      col: 'var(--color-muted)',   bg: 'var(--color-paper-2)',     ico: <Ico.Lock width="14" height="14" /> },
  }[status];

  const mastery = Math.round((progress.mastery ?? 0.5) * 100);
  const barColor =
    mastery > 70 ? 'var(--color-success)' :
    mastery > 40 ? 'var(--color-warn)'    : 'var(--color-danger)';

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className="text-left rounded-[14px] bg-white border border-line-2 px-4 py-3.5 flex items-center gap-3.5 transition hover:shadow-sm disabled:cursor-not-allowed"
      style={{
        borderLeft: recommended ? '3px solid var(--color-brand)' : '1px solid var(--color-line-2)',
        opacity: !unlocked ? 0.65 : 1,
      }}
    >
      <span className="mono text-[12px] text-muted w-6 text-right">
        {String(idx + 1).padStart(2, '0')}
      </span>
      <span
        className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: meta.bg, color: meta.col }}
      >
        {meta.ico}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.04em]"
            style={{ color: meta.col }}
          >
            {meta.label}
          </span>
          {progress.needsRevision && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-danger-soft text-danger">
              Needs revision
            </span>
          )}
          {tagged && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-accent-soft text-accent">
              Tagged for parent
            </span>
          )}
          {!unlocked && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-warn-soft text-warn">
              Prerequisite required
            </span>
          )}
        </div>
        <div className="text-[15px] font-semibold mt-1 truncate" style={{ color: !unlocked ? 'var(--color-muted)' : 'var(--color-ink)' }}>
          {page.title}
        </div>
        <div className="text-[11.5px] text-muted mt-1">
          ~{page.estimatedMinutes || 5} min · mastery {mastery}%
        </div>
      </div>
      <div className="hidden sm:block w-[100px] h-1.5 bg-paper rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${mastery}%`, background: barColor }} />
      </div>
      <span
        className="text-[12.5px] font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border"
        style={{
          background: recommended ? 'var(--color-ink)' : 'var(--color-paper-2)',
          color: recommended ? '#fff' : 'var(--color-ink-2)',
          borderColor: recommended ? 'var(--color-ink)' : 'var(--color-line-2)',
        }}
      >
        {status === 'read' ? 'Revisit' : status === 'locked' ? 'Locked' : 'Open'}
        {unlocked && <Ico.Arrow width="13" height="13" />}
      </span>
    </button>
  );
}
