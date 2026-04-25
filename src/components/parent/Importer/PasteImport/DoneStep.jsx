import React from 'react';

const MODE_CONFIG = {
  worksheet: {
    banner: { emoji: '✅', bg: 'bg-green-50 border-green-200', titleColor: 'text-green-800', subColor: 'text-green-600', title: 'Import complete!' },
    primary: { emoji: '📋', href: 'worksheet', label: 'Set up Worksheet', desc: 'Choose which imported pages appear in the student guided worksheet.', border: 'border-2 border-indigo-400', bg: 'bg-indigo-50 hover:bg-indigo-100', textColor: 'text-indigo-800' },
    secondary: { emoji: '🎯', href: 'topic', label: 'Tag Exam Drill Questions', desc: 'Open topic → Pages → Questions to mark individual questions for Exam Drill.', border: 'border border-gray-200', bg: 'bg-white hover:bg-gray-50', textColor: 'text-gray-700' },
  },
  practice: {
    banner: { emoji: '💡', bg: 'bg-amber-50 border-amber-200', titleColor: 'text-amber-800', subColor: 'text-amber-600', title: 'Practice Questions imported!' },
    primary: { emoji: '💡', href: 'topic', label: 'Review Practice Questions', desc: 'Open the topic, go to a page → Questions to check hints and question wording.', border: 'border-2 border-amber-400', bg: 'bg-amber-50 hover:bg-amber-100', textColor: 'text-amber-800' },
    secondary: { emoji: '📋', href: 'worksheet', label: 'Set up Worksheet', desc: 'Select which pages appear in the student guided worksheet.', border: 'border border-gray-200', bg: 'bg-white hover:bg-gray-50', textColor: 'text-gray-700' },
  },
  exam_drill: {
    banner: { emoji: '🎯', bg: 'bg-purple-50 border-purple-200', titleColor: 'text-purple-800', subColor: 'text-purple-600', title: 'Exam Drill import complete!' },
    primary: { emoji: '🎯', href: 'topic', label: 'Review Exam Drill Questions', desc: 'Open the topic, go to a page → Questions to verify tags and edit prompts.', border: 'border-2 border-purple-400', bg: 'bg-purple-50 hover:bg-purple-100', textColor: 'text-purple-800' },
    secondary: { emoji: '📋', href: 'worksheet', label: 'Worksheet Planner', desc: 'Select which pages to include in the student guided worksheet.', border: 'border border-gray-200', bg: 'bg-white hover:bg-gray-50', textColor: 'text-gray-700' },
  },
};

export function DoneStep({ result, subjectId, topicFolder, importMode = 'worksheet', onStartOver }) {
  const topicBase = `#/parent/subject/${subjectId}/topic/${topicFolder}`;
  const worksheetPath = `${topicBase}/worksheet`;
  const cfg = MODE_CONFIG[importMode] || MODE_CONFIG.worksheet;
  const { banner, primary, secondary } = cfg;

  const hrefFor = (key) => key === 'worksheet' ? worksheetPath : topicBase;

  return (
    <div className="py-8 max-w-2xl mx-auto">
      {/* Success banner */}
      <div className={`flex items-center gap-4 rounded-2xl px-6 py-5 mb-8 border ${banner.bg}`}>
        <div className="text-4xl flex-shrink-0">{banner.emoji}</div>
        <div>
          <h2 className={`text-lg font-bold ${banner.titleColor}`}>{banner.title}</h2>
          <p className={`text-sm mt-0.5 ${banner.subColor}`}>
            {result.pagesAdded} page{result.pagesAdded !== 1 ? 's' : ''} added
            {result.pagesOverwritten > 0 ? `, ${result.pagesOverwritten} overwritten` : ''}
            {importMode === 'practice' ? ' — questions have hint helpers.' : importMode === 'exam_drill' ? ' — all questions tagged for Exam Drill.' : '.'}
          </p>
        </div>
      </div>

      {/* Next step cards */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">What do you want to do next?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">

        {/* Primary action */}
        <a href={hrefFor(primary.href)} className={`flex items-start gap-3 p-4 rounded-xl ${primary.border} ${primary.bg} transition-colors`}>
          <span className="text-2xl flex-shrink-0">{primary.emoji}</span>
          <div>
            <div className={`font-semibold text-sm ${primary.textColor}`}>{primary.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{primary.desc}</div>
          </div>
        </a>

        {/* Secondary action */}
        <a href={hrefFor(secondary.href)} className={`flex items-start gap-3 p-4 rounded-xl ${secondary.border} ${secondary.bg} transition-colors`}>
          <span className="text-2xl flex-shrink-0">{secondary.emoji}</span>
          <div>
            <div className={`font-semibold text-sm ${secondary.textColor}`}>{secondary.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{secondary.desc}</div>
          </div>
        </a>

        {/* View pages */}
        <a href={topicBase} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <span className="text-2xl flex-shrink-0">📄</span>
          <div>
            <div className="font-semibold text-gray-700 text-sm">View Imported Pages</div>
            <div className="text-xs text-gray-500 mt-0.5">Browse and edit the newly imported pages in the topic editor.</div>
          </div>
        </a>

        {/* Import more */}
        <button onClick={onStartOver} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left w-full">
          <span className="text-2xl flex-shrink-0">📥</span>
          <div>
            <div className="font-semibold text-gray-700 text-sm">Import More Content</div>
            <div className="text-xs text-gray-500 mt-0.5">Start another import into this or a different topic.</div>
          </div>
        </button>
      </div>
    </div>
  );
}
