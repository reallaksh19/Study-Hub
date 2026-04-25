import React from 'react';
import { calculateTopicStats, getNextRecommendedPage, getResumePageId, isPageUnlocked } from '../../services/learningProgressService.js';

export function TopicHome({ subject, topic, state, onOpenPage, onOpenRevision, onOpenExam, onOpenWorksheet, onBack }) {
  const pages = topic.pages || [];
  const stats = calculateTopicStats(topic, state);
  const recommended = getNextRecommendedPage(topic, state);
  const resumePageId = getResumePageId(topic, state);
  const resumePage = pages.find((page) => page.id === resumePageId) || recommended || pages[0];
  const taggedPageIds = new Set((state.studentTags || []).filter((tag) => tag.status !== 'closed').map((tag) => tag.pageId));

  // Show Worksheet button only when parent has saved a selection
  const topicFolderKey = topic.folder || topic.id.replace(`${topic.subjectId}-`, '');
  const hasWorksheet = !!localStorage.getItem(`worksheet_selection_${topic.subjectId}_${topicFolderKey}`);

  return (
    <div className="topic-home max-w-5xl mx-auto p-6">
      <div className="mb-4">
        <button onClick={onBack} className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          ← Back
        </button>
      </div>
      <div className="mb-8 border rounded-2xl bg-white overflow-hidden shadow-sm">
        {topic.coverAssetPath && (
          <div className="h-52 bg-gray-100 overflow-hidden">
            <img src={topic.coverAssetPath} alt={topic.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="text-gray-500 text-sm mb-2">{subject.title}</div>
          <h1 className="text-3xl font-bold mb-3">{topic.title}</h1>
          {topic.description && <p className="text-gray-700 mb-3">{topic.description}</p>}
          {topic.helperText && <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">{topic.helperText}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="px-3 py-1 rounded-full bg-gray-100">{stats.totalPages} pages</span>
            <span className="px-3 py-1 rounded-full bg-gray-100">Completion {stats.completionPct}%</span>
            <span className="px-3 py-1 rounded-full bg-gray-100">Mastery {(stats.averageMastery * 100).toFixed(0)}%</span>
            <span className="px-3 py-1 rounded-full bg-gray-100">Revision queue {stats.revisionNeededCount}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {resumePage && (
              <button onClick={() => onOpenPage(resumePage.id)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                {stats.readPages > 0 ? `Resume ${resumePage.title} →` : `Start ${resumePage.title} →`}
              </button>
            )}
            <button onClick={() => onOpenPage(pages[0]?.id)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Start from beginning
            </button>
            <button onClick={onOpenRevision} className="px-6 py-2 border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-50">
              Revise weak pages
            </button>
            <button onClick={onOpenExam} className="px-6 py-2 border border-purple-300 text-purple-800 rounded-lg hover:bg-purple-50">
              Exam drill
            </button>
            {hasWorksheet && (
              <button onClick={onOpenWorksheet} className="px-6 py-2 border border-teal-300 text-teal-800 rounded-lg hover:bg-teal-50">
                📋 Worksheet
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {pages.map((page) => {
          const progress = state.pageProgress?.[page.id] || {};
          const unlocked = isPageUnlocked(page, state);
          const isRecommended = recommended?.id === page.id;
          const statusLabel = progress.read
            ? 'Read'
            : unlocked
              ? isRecommended ? 'Recommended next' : 'Ready'
              : 'Locked';

          return (
            <button
              key={page.id}
              disabled={!unlocked}
              onClick={() => unlocked && onOpenPage(page.id)}
              className={`w-full text-left border rounded-xl p-4 transition ${unlocked ? 'bg-white hover:shadow-sm' : 'bg-gray-50 opacity-70 cursor-not-allowed'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${progress.read ? 'text-green-700' : unlocked ? 'text-blue-700' : 'text-amber-700'}`}>{statusLabel}</span>
                    {!unlocked && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">Prerequisite required</span>}
                    {progress.needsRevision && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">Needs revision</span>}
                    {taggedPageIds.has(page.id) && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Tagged for parent</span>}
                  </div>
                  <div className="font-semibold text-lg">{page.title}</div>
                  <div className="text-sm text-gray-500 mt-1">~{page.estimatedMinutes || 5} min · mastery {((progress.mastery ?? 0.5) * 100).toFixed(0)}%</div>
                </div>
                <div className="text-2xl">{progress.read ? '✅' : unlocked ? '▶' : '🔒'}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
