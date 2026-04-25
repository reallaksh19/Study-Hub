import React, { useState, useMemo } from 'react';
import { getInteractiveResult } from '../../services/interactiveResultService.js';
import { getExamResult } from '../student/ExamMode.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageMastery(pageId) {
  try {
    const raw = localStorage.getItem('study_hub_learning_state');
    if (!raw) return null;
    const state = JSON.parse(raw);
    const mastery = state?.pageProgress?.[pageId]?.mastery;
    return typeof mastery === 'number' ? mastery : null;
  } catch { return null; }
}

function pctColor(pct) {
  if (pct == null) return 'text-gray-400';
  if (pct >= 80) return 'text-green-600';
  if (pct >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function PctBadge({ pct, label }) {
  if (pct == null) return <span className="text-xs text-gray-400">{label ?? 'Not attempted'}</span>;
  return (
    <span className={`text-sm font-bold ${pctColor(pct)}`}>
      {pct}%
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParentScoreboard({ subjects = [], topics = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'worksheet' | 'exam'
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  // Build flat list: per topic → worksheet scores + exam drill score
  const rows = useMemo(() => {
    return topics
      .filter((t) => selectedSubjectId === 'all' || t.subjectId === selectedSubjectId)
      .map((topic) => {
        const topicFolder = topic.folder || topic.id.replace(`${topic.subjectId}-`, '');
        const pages = topic.pages || [];

        // Worksheet (interactive HTML) scores
        const attempted = pages.filter((p) => {
          const r = getInteractiveResult(p.id);
          return r && r.total > 0;
        });
        const wsAvg = attempted.length > 0
          ? Math.round(attempted.reduce((sum, p) => {
              const r = getInteractiveResult(p.id);
              return sum + (r?.percentage || 0);
            }, 0) / attempted.length)
          : null;

        // Exam drill score
        const examResult = getExamResult(topic.id);

        // Mastery (average across pages)
        const masteries = pages.map((p) => getPageMastery(p.id)).filter((m) => m !== null);
        const avgMastery = masteries.length > 0
          ? Math.round((masteries.reduce((a, b) => a + b, 0) / masteries.length) * 100)
          : null;

        // Exam drill question count
        const drillCount = (topic._fullPages || []).reduce((acc, pageRef) => {
          const page = pageRef._fullData || pageRef;
          return acc + (page?.questions || []).filter((q) => q.mode === 'exam_drill' || q.examOnly).length;
        }, 0);

        return {
          topic,
          topicFolder,
          pages,
          attempted: attempted.length,
          wsAvg,
          examResult,
          avgMastery,
          drillCount,
          subjectTitle: subjects.find((s) => s.id === topic.subjectId)?.title || topic.subjectId,
        };
      })
      .filter((row) => {
        if (filter === 'worksheet') return row.wsAvg !== null;
        if (filter === 'exam') return row.examResult !== null;
        return true;
      });
  }, [topics, subjects, selectedSubjectId, filter]);

  const totalWsAttempted = rows.filter((r) => r.wsAvg !== null).length;
  const totalExamAttempted = rows.filter((r) => r.examResult !== null).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scoreboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalWsAttempted} topic{totalWsAttempted !== 1 ? 's' : ''} with worksheet scores ·{' '}
            {totalExamAttempted} with exam drill scores
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 border rounded-lg overflow-hidden text-sm">
          {[['all', 'All topics'], ['worksheet', 'Worksheet only'], ['exam', 'Exam Drill only']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${filter === v ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium">No scores yet</p>
          <p className="text-sm mt-1">Scores appear after students attempt worksheet pages or complete an exam drill.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left px-4 py-3">Topic</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-center px-4 py-3">Pages</th>
                <th className="text-center px-4 py-3">📋 Worksheet</th>
                <th className="text-center px-4 py-3">🎯 Exam Drill</th>
                <th className="text-center px-4 py-3">🧠 Mastery</th>
                <th className="text-center px-4 py-3">Drill Qs</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(({ topic, topicFolder, pages, attempted, wsAvg, examResult, avgMastery, drillCount, subjectTitle }) => (
                <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{topic.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{subjectTitle}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {attempted}/{pages.length}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {wsAvg !== null ? (
                      <div>
                        <span className={`font-bold ${pctColor(wsAvg)}`}>{wsAvg}%</span>
                        <div className="text-xs text-gray-400 mt-0.5">{attempted} attempted</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {examResult ? (
                      <div>
                        <span className={`font-bold ${pctColor(examResult.percentage)}`}>{examResult.percentage}%</span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {examResult.score}/{examResult.total} · {new Date(examResult.completedAt).toLocaleDateString()}
                        </div>
                        {examResult.history && examResult.history.length > 1 && (
                          <div className="text-xs text-indigo-500 mt-0.5">{examResult.history.length} attempts</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {avgMastery !== null ? (
                      <span className={`font-bold ${pctColor(avgMastery)}`}>{avgMastery}%</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {drillCount > 0 ? (
                      <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">{drillCount}</span>
                    ) : (
                      <span className="text-xs text-gray-300">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`#/parent/subject/${topic.subjectId}/topic/${topicFolder}/worksheet`}
                      className="text-xs text-indigo-500 hover:underline whitespace-nowrap"
                    >
                      Details →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-400 flex flex-wrap gap-4">
        <span>📋 Worksheet = avg score across interactive HTML pages</span>
        <span>🎯 Exam Drill = score from closed-book exam</span>
        <span>🧠 Mastery = avg from study context (question outcomes)</span>
        <span>Drill Qs = questions tagged for exam drill</span>
      </div>
    </div>
  );
}
