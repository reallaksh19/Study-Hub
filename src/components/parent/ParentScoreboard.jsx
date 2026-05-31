// ParentScoreboard.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentScoreboard.jsx.
// Preserves: subject + view filter, getInteractiveResult, getPageMastery from
// learning_state, getExamResult, totals, links to topic worksheet planner.

import React, { useState, useMemo } from 'react';
import { getInteractiveResult } from '../../services/interactiveResultService.js';
import { getExamResult } from '../student/ExamMode.jsx';
import { Ico } from '../../lib/Icons.jsx';

function getPageMastery(pageId) {
  try {
    const raw = localStorage.getItem('study_hub_learning_state');
    if (!raw) return null;
    const state = JSON.parse(raw);
    const mastery = state?.pageProgress?.[pageId]?.mastery;
    return typeof mastery === 'number' ? mastery : null;
  } catch { return null; }
}

function toneFor(pct) {
  if (pct == null) return 'var(--color-muted-2)';
  if (pct >= 80) return 'var(--color-success)';
  if (pct >= 50) return 'var(--color-warn)';
  return 'var(--color-danger)';
}

export function ParentScoreboard({ subjects = [], topics = [] }) {
  const [filter, setFilter] = useState('all');                 // 'all' | 'worksheet' | 'exam'
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  const rows = useMemo(() => {
    return topics
      .filter((t) => selectedSubjectId === 'all' || t.subjectId === selectedSubjectId)
      .map((topic) => {
        const topicFolder = topic.folder || topic.id.replace(`${topic.subjectId}-`, '');
        const pages = topic.pages || [];

        const attempted = pages.filter((p) => {
          const r = getInteractiveResult(p.id);
          return r && r.total > 0;
        });
        const wsAvg = attempted.length > 0
          ? Math.round(
              attempted.reduce((sum, p) => sum + (getInteractiveResult(p.id)?.percentage || 0), 0) /
                attempted.length
            )
          : null;

        const examResult = getExamResult(topic.id);

        const masteries = pages.map((p) => getPageMastery(p.id)).filter((m) => m !== null);
        const avgMastery = masteries.length > 0
          ? Math.round((masteries.reduce((a, b) => a + b, 0) / masteries.length) * 100)
          : null;

        const drillCount = (topic._fullPages || []).reduce((acc, pageRef) => {
          const page = pageRef._fullData || pageRef;
          return acc + (page?.questions || []).filter((q) => q.mode === 'exam_drill' || q.examOnly).length;
        }, 0);

        return {
          topic, topicFolder, pages,
          attempted: attempted.length,
          wsAvg, examResult, avgMastery, drillCount,
          subjectTitle: subjects.find((s) => s.id === topic.subjectId)?.title || topic.subjectId,
        };
      })
      .filter((row) => {
        if (filter === 'worksheet') return row.wsAvg !== null;
        if (filter === 'exam') return row.examResult !== null;
        return true;
      });
  }, [topics, subjects, selectedSubjectId, filter]);

  const totalWs = rows.filter((r) => r.wsAvg !== null).length;
  const totalExam = rows.filter((r) => r.examResult !== null).length;
  const avgMastery = (() => {
    const m = rows.map((r) => r.avgMastery).filter((x) => x !== null);
    if (m.length === 0) return null;
    return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
  })();

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.05em] mb-1.5">
            How your child is doing
          </div>
          <h1 className="serif text-[34px] tracking-tight m-0 leading-[1.05]">Scoreboard</h1>
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          {[['all', 'All views'], ['worksheet', 'Worksheet'], ['exam', 'Exam drill']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className="rounded-[8px] text-[12.5px] font-semibold px-3 py-1.5 border transition"
              style={
                filter === v
                  ? { background: 'var(--color-ink)', color: '#fff', borderColor: 'var(--color-ink)' }
                  : { background: '#fff', color: 'var(--color-ink-2)', borderColor: 'var(--color-line-2)' }
              }
            >
              {label}
            </button>
          ))}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-white border border-line-2 rounded-[8px] px-3 py-1.5 text-[12.5px] text-ink-2 font-semibold outline-none"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <BigKpi label="Avg mastery" value={avgMastery != null ? `${avgMastery}%` : '—'} tone="success" />
        <BigKpi label="Topics w/ worksheet" value={totalWs} />
        <BigKpi label="Topics w/ exam" value={totalExam} />
        <BigKpi label="Topics covered" value={rows.length} />
      </div>

      {rows.length === 0 ? (
        <div className="sh-card p-10 text-center text-muted">
          <div className="text-3xl mb-2">📊</div>
          <p className="font-medium m-0">No scores yet</p>
          <p className="text-[13px] mt-1 m-0">
            Scores appear after the student attempts worksheet pages or completes an exam drill.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-line-2 rounded-[14px] overflow-hidden">
          <div
            className="grid items-center px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-bold text-muted border-b border-line bg-paper-2"
            style={{ gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr 1.1fr 80px' }}
          >
            <span>Topic</span>
            <span>Pages</span>
            <span>Worksheet</span>
            <span>Exam drill</span>
            <span>Mastery</span>
            <span></span>
          </div>
          {rows.map(({ topic, topicFolder, pages, attempted, wsAvg, examResult, avgMastery: am, drillCount, subjectTitle }) => (
            <div
              key={topic.id}
              className="grid items-center px-4 py-3.5 border-b border-line last:border-0 hover:bg-paper-2 transition"
              style={{ gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr 1.1fr 80px' }}
            >
              <div>
                <div className="text-[14.5px] font-semibold text-ink">{topic.title}</div>
                <div className="text-[11.5px] text-muted mt-0.5">{subjectTitle}</div>
              </div>
              <div className="text-[13px] text-ink-2">
                {attempted}/{pages.length}
              </div>
              <PctCell pct={wsAvg} sub={wsAvg != null ? `${attempted} attempted` : ''} />
              <PctCell
                pct={examResult?.percentage ?? null}
                sub={examResult
                  ? `${examResult.score}/${examResult.total} · ${new Date(examResult.completedAt).toLocaleDateString()}`
                  : ''}
              />
              <PctCell pct={am} bar />
              <a
                href={`#/parent/subject/${topic.subjectId}/topic/${topicFolder}/worksheet`}
                className="sh-btn sh-btn-secondary text-[12px] no-underline"
                style={{ padding: '6px 10px', justifySelf: 'end' }}
              >
                <Ico.Arrow width="12" height="12" />
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-[11.5px] text-muted">
        Mastery rolls up from per-page progress. Worksheet & exam scores stay local on this device.
      </div>
    </div>
  );
}

function BigKpi({ label, value, tone }) {
  const col = tone === 'success' ? 'var(--color-success)' : tone === 'accent' ? 'var(--color-accent)' : 'var(--color-ink)';
  return (
    <div className="bg-white border border-line-2 rounded-[14px] px-4 py-3.5">
      <div className="text-[11.5px] text-muted font-semibold uppercase tracking-[0.05em] mb-1.5">{label}</div>
      <div className="stat text-[28px] font-semibold leading-none" style={{ color: col }}>{value}</div>
    </div>
  );
}

function PctCell({ pct, sub, bar }) {
  if (pct == null) return <span className="text-[12px] text-muted-2 italic">Not attempted</span>;
  const col = toneFor(pct);
  return (
    <div className="flex items-center gap-2">
      <div>
        <span className="stat text-[14.5px] font-semibold" style={{ color: col }}>{pct}%</span>
        {sub && <div className="text-[11px] text-muted mt-0.5">{sub}</div>}
      </div>
      {bar && (
        <div className="ml-auto w-[60px] h-1.5 bg-paper rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col }} />
        </div>
      )}
    </div>
  );
}
