// ParentDashboard.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentDashboard.jsx.
// Preserves: backend status banner, search filter, "Add Subject" prompt → createDirectory + saveJSON,
//            subject cards w/ topics/pages/worksheets/practice/drill counts, bottom action cards.

import React, { useState, useEffect, useMemo } from 'react';
import { checkBackendStatus, saveJSON, createDirectory } from '../../services/parentApiService.js';
import { Ico } from '../../lib/Icons.jsx';
import { useToast } from '../../lib/Toast.jsx';

const SUBJECT_PALETTE = {
  physics:     { accent: 'var(--color-brand)',   glyph: '⚛' },
  mathematics: { accent: 'var(--color-accent)',  glyph: '∑' },
  chemistry:   { accent: 'var(--color-violet)',  glyph: '⚗' },
  biology:     { accent: 'var(--color-success)', glyph: '🌱' },
};
function subjectStyle(subject) {
  const key = String(subject?.id || subject?.title || '').toLowerCase();
  return (
    SUBJECT_PALETTE[key] || {
      accent: subject?.color || 'var(--color-ink)',
      glyph: (subject?.title || 'S').slice(0, 1).toUpperCase(),
    }
  );
}

export function ParentDashboard({ subjects = [], topics = [] }) {
  const toast = useToast();
  const [backendOk, setBackendOk] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkBackendStatus().then((ok) => setBackendOk(ok));
  }, []);

  const handleAddSubject = async () => {
    const title = window.prompt('Enter new Subject title (e.g., Biology):');
    if (!title) return;
    const folder = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!folder) return;
    const newSubject = {
      id: folder,
      title,
      icon: 'BookOpen',
      color: '#10b981',
      order: subjects.length + 1,
    };
    try {
      await createDirectory(folder);
      await saveJSON(`${folder}/subject.json`, newSubject);
      window.location.reload();
    } catch {
      toast.show('Failed to create subject. Backend might be unavailable.', {
        variant: 'error',
        action: { label: 'Retry', onClick: handleAddSubject },
      });
    }
  };

  // KPIs derived from props
  const totals = useMemo(() => {
    const allFullPages = topics.flatMap((t) => t._fullPages || []);
    const totalPages = topics.reduce((acc, t) => acc + (t.pages?.length || 0), 0);
    const countByMode = (mode) =>
      allFullPages.reduce(
        (acc, ref) =>
          acc +
          ((ref._fullData || ref)?.questions || []).filter(
            (q) => q.mode === mode || (mode === 'exam_drill' && q.examOnly)
          ).length,
        0
      );
    return {
      subjects: subjects.length,
      topics: topics.length,
      pages: totalPages,
      practice: countByMode('practice'),
      drill: countByMode('exam_drill'),
    };
  }, [subjects, topics]);

  const filtered = subjects.filter(
    (subject) =>
      subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topics.some(
        (topic) =>
          topic.subjectId === subject.id && topic.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="max-w-[1200px]">
      {!backendOk && (
        <div className="bg-danger-soft border border-[#F2B3B3] text-danger px-4 py-3 mb-6 rounded-[12px] flex items-center gap-3">
          <Ico.Close width="18" height="18" />
          <div>
            <div className="font-bold text-[14px]">Backend server not running</div>
            <div className="text-[13px]">
              Changes cannot be saved to disk. Start it with{' '}
              <code className="mono px-1.5 py-px rounded bg-white border border-[#E8C4C4]">node server.js</code>
            </div>
          </div>
        </div>
      )}

      {/* Greeting + KPIs */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[12.5px] text-muted font-semibold uppercase tracking-[0.05em] mb-1.5">
            Subjects dashboard
          </div>
          <h1 className="serif text-[38px] leading-[1.05] tracking-tight m-0">Manage content</h1>
          <p className="text-[14px] text-ink-3 mt-1.5">
            Author lessons, questions and clarifiers. Search across everything you've made.
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <KpiPill label="Subjects" value={totals.subjects} />
          <KpiPill label="Topics" value={totals.topics} />
          <KpiPill label="Pages" value={totals.pages} />
          <KpiPill label="Practice Qs" value={totals.practice} tone="warn" />
          <KpiPill label="Drill Qs" value={totals.drill} tone="violet" />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-[420px]">
          <Ico.Search
            width="15"
            height="15"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search subjects or topics…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-line-2 rounded-[10px] text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>
        <a href="#/parent/import" className="sh-btn sh-btn-secondary">
          <Ico.Upload width="15" height="15" /> Import
        </a>
        <button onClick={handleAddSubject} className="sh-btn sh-btn-primary">
          <Ico.Plus width="15" height="15" /> Add subject
        </button>
      </div>

      {/* Subject cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filtered.map((subject) => {
          const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
          const pageCount = subjectTopics.reduce((acc, t) => acc + (t.pages?.length || 0), 0);

          const worksheetCount = subjectTopics.filter((t) => {
            const folder = t.folder || t.id.replace(`${t.subjectId}-`, '');
            return !!localStorage.getItem(`worksheet_selection_${t.subjectId}_${folder}`);
          }).length;

          const countByMode = (mode) =>
            subjectTopics.reduce(
              (acc, t) =>
                acc +
                (t._fullPages || []).reduce(
                  (a, ref) =>
                    a +
                    ((ref._fullData || ref)?.questions || []).filter(
                      (q) => q.mode === mode || (mode === 'exam_drill' && q.examOnly)
                    ).length,
                  0
                ),
              0
            );
          const drillCount = countByMode('exam_drill');
          const practiceCount = countByMode('practice');

          return (
            <SubjectCard
              key={subject.id}
              subject={subject}
              topicsCount={subjectTopics.length}
              pageCount={pageCount}
              worksheetCount={worksheetCount}
              practiceCount={practiceCount}
              drillCount={drillCount}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full sh-card p-8 text-center text-muted">
            No subjects match "{searchQuery}".
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickCard
          href="#/parent/import"
          title="Content operations"
          desc="Import by pasting, uploading a ZIP, or importing HTML. Export your topics & pages."
          cta="Import / export"
          icon={<Ico.Upload width="18" height="18" />}
          tone="ink"
        />
        <QuickCard
          href="#/parent/scoreboard"
          title="Scoreboard"
          desc="Worksheet scores, exam drill results and mastery progress across every topic."
          cta="Open scoreboard"
          icon={<Ico.Chart width="18" height="18" />}
          tone="success"
        />
      </div>
    </div>
  );
}

function KpiPill({ label, value, tone }) {
  const toneBg =
    tone === 'success' ? 'var(--color-success-soft)' :
    tone === 'warn'    ? 'var(--color-warn-soft)'    :
    tone === 'violet'  ? 'var(--color-violet-soft)'  : '#fff';
  return (
    <div className="bg-white border border-line-2 rounded-[12px] px-3.5 py-2.5 flex flex-col min-w-[96px]">
      <span className="text-[11px] text-muted font-semibold uppercase tracking-[0.05em]">{label}</span>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="stat text-[22px] font-semibold">{value}</span>
        {tone && <span className="w-1.5 h-1.5 rounded-full" style={{ background: toneBg }} />}
      </div>
    </div>
  );
}

function SubjectCard({ subject, topicsCount, pageCount, worksheetCount, practiceCount, drillCount }) {
  const { accent, glyph } = subjectStyle(subject);

  // Heuristic mastery for the bar — derived from total questions vs pages.
  // Real mastery comes from learningProgressService elsewhere; this is just a quick visual.
  const mastery = pageCount ? Math.min(95, 40 + Math.round((practiceCount + drillCount) / Math.max(1, pageCount)) * 8) : 60;

  return (
    <div className="sh-card p-5 relative overflow-hidden hover:shadow-md transition">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent, opacity: 0.85 }} />
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-[42px] h-[42px] rounded-[11px] text-white flex items-center justify-center text-[22px]"
          style={{ background: accent, fontFamily: 'var(--font-display)' }}
        >
          {glyph}
        </div>
        <div className="flex-1 min-w-0">
          <div className="serif text-[22px] leading-none tracking-tight truncate">{subject.title}</div>
          <div className="text-[12px] text-muted mt-1">{topicsCount} topics · {pageCount} pages</div>
        </div>
      </div>

      {/* Mastery bar */}
      <div className="mb-3.5">
        <div className="flex justify-between text-[11.5px] text-muted font-semibold mb-1.5">
          <span>Coverage</span>
          <span className="text-ink-2">{mastery}%</span>
        </div>
        <div className="h-1.5 bg-paper rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${mastery}%`, background: accent }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <MiniStat label="Worksheets" value={worksheetCount} tone="primary" />
        <MiniStat label="Practice"   value={practiceCount}  tone="warn" />
        <MiniStat label="Drill"      value={drillCount}     tone="violet" />
      </div>

      <a
        href={`#/parent/subject/${subject.id}`}
        className="w-full sh-btn sh-btn-primary justify-center no-underline text-[13px]"
      >
        Manage content <Ico.Arrow width="14" height="14" />
      </a>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const map = {
    primary: ['var(--color-brand-soft)',  'var(--color-brand)'],
    warn:    ['var(--color-warn-soft)',   'var(--color-warn)'],
    violet:  ['var(--color-violet-soft)', 'var(--color-violet)'],
  };
  const [bg, col] = map[tone] || map.primary;
  return (
    <div className="rounded-[10px] px-2.5 py-2" style={{ background: bg }}>
      <div className="stat text-[18px] font-semibold leading-none" style={{ color: col }}>{value}</div>
      <div className="text-[10.5px] font-semibold mt-1" style={{ color: col, opacity: 0.85 }}>{label}</div>
    </div>
  );
}

function QuickCard({ href, title, desc, cta, icon, tone }) {
  const isDark = tone === 'ink';
  return (
    <a
      href={href}
      className="no-underline rounded-[20px] p-5 flex flex-col gap-3 border transition hover:brightness-105"
      style={{
        background: isDark ? 'var(--color-ink)' : '#fff',
        color: isDark ? '#fff' : 'var(--color-ink)',
        borderColor: isDark ? 'var(--color-ink-2)' : 'var(--color-line-2)',
      }}
    >
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center border"
        style={{
          background: isDark ? 'rgba(255,255,255,.07)' : 'var(--color-paper-2)',
          borderColor: isDark ? 'rgba(255,255,255,.08)' : 'var(--color-line)',
          color: tone === 'success' ? 'var(--color-success)' : isDark ? '#fff' : 'var(--color-ink)',
        }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-[15px] m-0">{title}</h3>
      <p
        className="text-[13px] leading-relaxed m-0 flex-1"
        style={{ color: isDark ? 'rgba(255,255,255,.6)' : 'var(--color-ink-3)' }}
      >
        {desc}
      </p>
      <span
        className="text-[13px] font-semibold inline-flex items-center gap-1.5"
        style={{ color: isDark ? '#fff' : 'var(--color-brand)' }}
      >
        {cta} <Ico.Arrow width="14" height="14" />
      </span>
    </a>
  );
}
