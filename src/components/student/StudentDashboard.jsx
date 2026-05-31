import React, { useMemo } from 'react';
import { calculateTopicStats } from '../../services/learningProgressService.js';
import { Ico } from '../../lib/Icons.jsx';

const SUBJECT_STYLE = {
  biology: { accent: 'var(--color-success)', glyph: 'B' },
  physics: { accent: 'var(--color-brand)', glyph: 'P' },
  chemistry: { accent: 'var(--color-violet)', glyph: 'C' },
  mathematics: { accent: 'var(--color-accent)', glyph: 'M' },
  english: { accent: 'var(--color-teal)', glyph: 'E' },
  grade4english: { accent: 'var(--color-teal)', glyph: 'G' },
};

function subjectStyle(subject) {
  const key = String(subject?.id || subject?.title || '').toLowerCase();
  return SUBJECT_STYLE[key] || {
    accent: subject?.color || 'var(--color-ink)',
    glyph: String(subject?.title || 'S').slice(0, 1).toUpperCase(),
  };
}

function getSubjectMetrics(subject, topics, state) {
  const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
  const pageCount = subjectTopics.reduce((total, topic) => total + (topic.pages?.length || 0), 0);
  const stats = subjectTopics.map((topic) => calculateTopicStats(topic, state));
  const readPages = stats.reduce((total, stat) => total + stat.readPages, 0);
  const completionPct = pageCount
    ? Math.round((readPages / pageCount) * 100)
    : 0;
  const averageMastery = stats.length
    ? Math.round((stats.reduce((total, stat) => total + stat.averageMastery, 0) / stats.length) * 100)
    : 0;

  return {
    subjectTopics,
    pageCount,
    readPages,
    completionPct,
    averageMastery,
  };
}

export function StudentDashboard({ subjects = [], topics = [], state = {}, onBack }) {
  const subjectRows = useMemo(
    () =>
      subjects.map((subject) => ({
        subject,
        state,
        style: subjectStyle(subject),
        ...getSubjectMetrics(subject, topics, state),
      })),
    [subjects, topics, state]
  );

  const totalTopics = topics.length;
  const totalPages = topics.reduce((total, topic) => total + (topic.pages?.length || 0), 0);
  const readPages = subjectRows.reduce((total, row) => total + row.readPages, 0);
  const nextTopic = topics.find((topic) => {
    const stats = calculateTopicStats(topic, state);
    return (topic.pages?.length || 0) > 0 && stats.completionPct < 100;
  }) || topics.find((topic) => (topic.pages?.length || 0) > 0);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-paper-2">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
          <button onClick={onBack} className="sh-btn sh-btn-ghost text-[13px] pl-0">
            <Ico.ArrowLeft width="16" height="16" /> Back
          </button>
          <span className="ml-auto sh-logo text-[15px]">
            <span className="sh-mark">S</span>
            StudyHub
          </span>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-5 sm:px-8 py-7 sm:py-9">
        <section className="sh-card overflow-hidden mb-7 grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="p-6 sm:p-8">
            <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.06em] mb-2">
              Student app
            </div>
            <h1 className="serif text-[42px] sm:text-[54px] leading-[1.02] tracking-tight m-0">
              Choose your study path.
            </h1>
            <p className="text-[15px] text-ink-3 leading-relaxed mt-3 mb-6 max-w-[560px]">
              Open a topic, continue a page, or jump into revision when a subject needs another pass.
            </p>
            {nextTopic && (
              <a href={`#/topic/${nextTopic.id}`} className="sh-btn sh-btn-primary no-underline">
                Continue {nextTopic.title}
                <Ico.Arrow width="15" height="15" />
              </a>
            )}
          </div>

          <div className="bg-paper-2 border-t lg:border-t-0 lg:border-l border-line p-6 sm:p-8">
            <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em] mb-3">
              Your library
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <HeroStat label="Subjects" value={subjects.length} />
              <HeroStat label="Topics" value={totalTopics} tone="brand" />
              <HeroStat label="Pages read" value={`${readPages}/${totalPages}`} tone="success" />
            </div>
          </div>
        </section>

        <div className="flex items-baseline justify-between gap-4 mb-3.5">
          <h2 className="serif text-[24px] tracking-tight m-0">Subjects</h2>
          <span className="text-[12.5px] text-muted">{totalTopics} topic{totalTopics !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {subjectRows.map((row) => (
            <SubjectCard key={row.subject.id} row={row} />
          ))}
        </div>
      </main>
    </div>
  );
}

function HeroStat({ label, value, tone }) {
  const color =
    tone === 'success' ? 'var(--color-success)' :
    tone === 'brand' ? 'var(--color-brand)' :
    'var(--color-ink)';

  return (
    <div className="bg-white border border-line rounded-[12px] px-3 py-3">
      <div className="stat text-[24px] font-semibold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] text-muted font-semibold mt-1.5">{label}</div>
    </div>
  );
}

function SubjectCard({ row }) {
  const { subject, subjectTopics, pageCount, completionPct, averageMastery, style } = row;

  return (
    <section className="sh-card overflow-hidden">
      <div className="h-[3px]" style={{ background: style.accent }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-[42px] h-[42px] rounded-[11px] text-white flex items-center justify-center text-[21px] serif"
            style={{ background: style.accent }}
          >
            {style.glyph}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="serif text-[25px] leading-tight tracking-tight m-0 truncate">{subject.title}</h3>
            <div className="text-[12.5px] text-muted mt-0.5">
              {subjectTopics.length} topic{subjectTopics.length !== 1 ? 's' : ''} &middot; {pageCount} page{pageCount !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <MiniStat label="Done" value={`${completionPct}%`} color={style.accent} />
            <MiniStat label="Mastery" value={`${averageMastery}%`} color="var(--color-success)" />
          </div>
        </div>

        <div className="h-1.5 bg-paper rounded-full overflow-hidden mb-3.5">
          <div className="h-full rounded-full" style={{ width: `${completionPct}%`, background: style.accent }} />
        </div>

        {subjectTopics.length > 0 ? (
          <div className="border-t border-line">
            {subjectTopics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} state={row.state} accent={style.accent} />
            ))}
          </div>
        ) : (
          <div className="border-t border-line pt-4 text-[13.5px] text-muted">
            No topics yet.
          </div>
        )}
      </div>
    </section>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="bg-paper-2 border border-line rounded-[10px] px-2.5 py-2 min-w-[76px]">
      <div className="stat text-[17px] font-semibold leading-none" style={{ color }}>{value}</div>
      <div className="text-[10.5px] text-muted font-semibold mt-1">{label}</div>
    </div>
  );
}

function TopicRow({ topic, state, accent }) {
  const stats = calculateTopicStats(topic, state);

  return (
    <a
      href={`#/topic/${topic.id}`}
      className="no-underline flex items-center gap-3 py-3.5 border-b border-line last:border-b-0 group"
    >
      <span
        className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--color-paper-2)', color: accent }}
      >
        <Ico.Book width="16" height="16" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink group-hover:text-brand truncate">
          {topic.title}
        </span>
        <span className="block text-[12.5px] text-muted mt-0.5">
          {topic.pages?.length || 0} pages &middot; {stats.completionPct}% complete
        </span>
      </span>
      <span className="sh-chip text-[11.5px] hidden sm:inline-flex">
        Open
        <Ico.Arrow width="12" height="12" />
      </span>
    </a>
  );
}
