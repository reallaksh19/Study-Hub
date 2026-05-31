import React from 'react';

const MAX_CHARS = 100000;
const WARN_CHARS = 50000;

const MODES = [
  {
    id: 'worksheet',
    icon: '📚', // 📚
    label: 'Study Pages',
    badge: 'Worksheet',
    badgeBg: 'bg-indigo-600',
    activeBorder: 'border-b-2 border-indigo-500',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-700',
    desc: 'Creates pages with blocks, clarifiers, and study questions. Use for the Worksheet Planner.',
    bannerBg: null,
    parseLabel: '📚 Parse content →',
    parseBg: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    id: 'practice',
    icon: '💡', // 💡
    label: 'Practice Questions',
    badge: 'Practice',
    badgeBg: 'bg-amber-500',
    activeBorder: 'border-b-2 border-amber-500',
    activeBg: 'bg-amber-50',
    activeText: 'text-amber-700',
    desc: 'Questions with hints shown on demand. Open-book, no timer — great for self-check and homework.',
    bannerBg: 'bg-amber-50 border-amber-200 text-amber-800',
    bannerIcon: '💡',
    bannerText: 'Practice mode active. All parsed questions will have a hint button students can click for help. No timer or lockdown.',
    parseLabel: '💡 Parse for Practice →',
    parseBg: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    id: 'exam_drill',
    icon: '🎯', // 🎯
    label: 'Exam Drill',
    badge: 'Exam Drill',
    badgeBg: 'bg-purple-600',
    activeBorder: 'border-b-2 border-purple-500',
    activeBg: 'bg-purple-50',
    activeText: 'text-purple-700',
    desc: 'All questions tagged for closed-book Exam Drill. No hints, optional timer — perfect for past-paper questions.',
    bannerBg: 'bg-purple-50 border-purple-200 text-purple-800',
    bannerIcon: '🎯',
    bannerText: 'Exam Drill mode active. Every question will be tagged mode: "exam_drill" automatically. No hints shown to students.',
    parseLabel: '🎯 Parse for Exam Drill →',
    parseBg: 'bg-purple-600 hover:bg-purple-700',
  },
];

export function InputStep({ subjects, topics, state, setState, onNext }) {
  const { subjectId, topicFolder, rawText, preferAI, extractToLibrary, importMode = 'worksheet' } = state;
  const hasApiKey = !!localStorage.getItem('geminiApiKey');

  const activeMode = MODES.find((m) => m.id === importMode) || MODES[0];

  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);

  const handleSubjectChange = (e) => {
    setState((s) => ({ ...s, subjectId: e.target.value, topicFolder: '' }));
  };

  const handleTopicChange = (e) => {
    const selected = subjectTopics.find((t) => {
      const folder = t.folder || (t.id.includes('-') ? t.id.split('-').slice(1).join('-') : t.id);
      return folder === e.target.value;
    });
    setState((s) => ({ ...s, topicFolder: e.target.value, topicTitle: selected?.title || '' }));
  };

  const setMode = (id) => setState((s) => ({ ...s, importMode: id }));

  const canParse = subjectId && topicFolder && rawText.trim().length > 0 && rawText.length <= MAX_CHARS;

  return (
    <div className="space-y-5">

      {/* ── Import mode switcher ── */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
          What are you importing?
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {MODES.map((m) => {
            const active = importMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex items-start gap-3 p-4 text-left transition-colors ${active ? `${m.activeBg} ${m.activeBorder}` : 'hover:bg-gray-50'}`}
              >
                <span className="text-2xl mt-0.5 flex-shrink-0">{m.icon}</span>
                <div className="min-w-0">
                  <div className={`font-semibold text-sm ${active ? m.activeText : 'text-gray-700'} flex items-center gap-1.5 flex-wrap`}>
                    {m.label}
                    {active && (
                      <span className={`text-xs ${m.badgeBg} text-white px-2 py-0.5 rounded-full`}>selected</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-snug">{m.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode banner */}
      {activeMode.bannerBg && (
        <div className={`flex items-start gap-3 px-4 py-3 border rounded-lg text-sm ${activeMode.bannerBg}`}>
          <span className="text-lg flex-shrink-0">{activeMode.bannerIcon}</span>
          <div>
            <strong>{activeMode.label} mode active.</strong>{' '}
            {activeMode.bannerText}
          </div>
        </div>
      )}

      {/* Subject + Topic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={handleSubjectChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <select
            value={topicFolder}
            onChange={handleTopicChange}
            disabled={!subjectId}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:bg-gray-50"
          >
            <option value="">Select topic...</option>
            {subjectTopics.map((t) => {
              const folder = t.folder || (t.id.includes('-') ? t.id.split('-').slice(1).join('-') : t.id);
              return <option key={t.id} value={folder}>{t.title}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Content textarea */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <span className={`text-xs ${rawText.length > WARN_CHARS ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            {rawText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          </span>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setState((s) => ({ ...s, rawText: e.target.value }))}
          placeholder={
            importMode === 'practice'
              ? 'Paste questions here — include hints/explanations after each question for the hint button...'
              : importMode === 'exam_drill'
              ? 'Paste exam questions here — answers and explanations will be used for auto-marking...'
              : 'Paste topic content here — notes, worksheets, comprehension passages, questions...'
          }
          rows={12}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 resize-y"
        />
        {rawText.length > WARN_CHARS && rawText.length <= MAX_CHARS && (
          <p className="text-xs text-amber-600 mt-1">Large content — parsing may take longer.</p>
        )}
        {rawText.length > MAX_CHARS && (
          <p className="text-xs text-red-600 font-semibold mt-1">Content too large. Please split into smaller sections (max 100,000 characters).</p>
        )}
      </div>

      {/* Options row */}
      <div className="flex gap-6 flex-wrap">
        <label className={`flex items-center gap-2 cursor-pointer ${!hasApiKey ? 'opacity-40' : ''}`}>
          <input
            type="checkbox"
            checked={preferAI && hasApiKey}
            onChange={(e) => setState((s) => ({ ...s, preferAI: e.target.checked }))}
            disabled={!hasApiKey}
            className="rounded"
          />
          <span className="text-sm text-gray-700">
            Use AI (Gemini)
            {!hasApiKey && <span className="text-gray-400 ml-1">— add key in Settings</span>}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={extractToLibrary}
            onChange={(e) => setState((s) => ({ ...s, extractToLibrary: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Extract to question library <span className="text-gray-400">(Phase 1.5)</span></span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canParse}
          className={`px-6 py-2.5 text-white rounded-lg font-semibold text-sm disabled:opacity-40 transition-colors ${activeMode.parseBg}`}
        >
          {activeMode.parseLabel}
        </button>
      </div>
    </div>
  );
}
