import React, { useEffect, useMemo, useState } from 'react';
import { analyseHtmlSource, saveHtmlImport } from '../../services/htmlImportService.js';

export function ParentHtmlImporter({ subjects = [], topics = [] }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topicFolder, setTopicFolder] = useState('');
  const [htmlSource, setHtmlSource] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [analysis, setAnalysis] = useState(() => analyseHtmlSource(''));
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  const subjectTopics = useMemo(() => topics.filter(topic => topic.subjectId === subjectId), [topics, subjectId]);
  const selectedTopic = useMemo(() => subjectTopics.find(topic => topic.folder === topicFolder || topic.id === topicFolder), [subjectTopics, topicFolder]);

  useEffect(() => {
    if (!topicFolder && subjectTopics.length > 0) {
      setTopicFolder(subjectTopics[0].folder || subjectTopics[0].id);
    }
  }, [subjectTopics, topicFolder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = analyseHtmlSource(htmlSource);
      setAnalysis(result);
      if (!titleOverride.trim()) {
        setTitleOverride(result.title || '');
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [htmlSource]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleImport() {
    if (!selectedTopic) {
      setStatus({ kind: 'error', message: 'Select a subject and topic first.' });
      return;
    }
    try {
      setStatus({ kind: 'saving', message: 'Saving HTML page into the selected topic…' });
      const result = await saveHtmlImport({
        htmlSource,
        analysis,
        selectedTopic,
        subjectId,
        topicFolder: selectedTopic.folder || topicFolder,
        titleOverride
      });
      setStatus({
        kind: 'saved',
        message: `Imported "${result.title}" as ${result.mode === 'canonical' ? 'canonical page data' : 'interactive static HTML'}.`
      });
    } catch (error) {
      setStatus({ kind: 'error', message: error.message || 'Failed to import HTML.' });
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">HTML Source Importer</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Import a webpage or HTML file as an interactive page inside a topic.
        </p>
      </div>

      {/* ── How it works ── */}
      <div className="flex gap-3 mb-6 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4">
        {[
          { n: '1', text: 'Paste the full HTML source into the box below' },
          { n: '2', text: 'Set the subject, topic & page title' },
          { n: '3', text: 'Click Import — page is saved into the topic' },
          { n: '4', text: 'Click "Set up Worksheet" to add it to the student worksheet' },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-start gap-2 flex-1 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{n}</span>
            <span className="text-sm text-indigo-800 leading-snug">{text}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[480px,1fr] gap-6">
        <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-4">

          {/* HTML paste — first, most important */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Step 1 — Paste full HTML source
            </label>
            <p className="text-xs text-gray-400 mb-2">Open the HTML file in a text editor, select all (Ctrl+A), copy (Ctrl+C), paste here.</p>
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              className="w-full min-h-[280px] font-mono text-xs rounded-xl border border-gray-300 px-3 py-3"
              placeholder="Paste entire HTML code here..."
            />
            <div className="mt-1 text-xs text-gray-500">{htmlSource.length.toLocaleString()} characters</div>
          </div>

          {/* Detection badge */}
          <div className={`rounded-xl border p-3 ${
            analysis.mode === 'canonical'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="font-semibold text-sm">
              {analysis.mode === 'canonical' ? '✓ Canonical page detected' : 'Will import as interactive HTML page'}
            </div>
            <div className="text-xs mt-1 opacity-70">
              {analysis.mode === 'canonical'
                ? `Blocks: ${analysis.summary.blocks} · Questions: ${analysis.summary.questions} · Clarifiers: ${analysis.summary.clarifiers}`
                : 'Students will interact with the page directly (clicks, quizzes, buttons all work)'}
            </div>
          </div>

          {/* Subject + Topic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Step 2 — Subject</label>
              <select
                value={subjectId}
                onChange={(e) => { setSubjectId(e.target.value); setTopicFolder(''); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Topic</label>
              <select
                value={topicFolder}
                onChange={(e) => setTopicFolder(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {subjectTopics.map(topic => (
                  <option key={topic.id} value={topic.folder || topic.id}>{topic.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Page title</label>
            <input
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Auto-detected from HTML title tag"
            />
          </div>

          <div className={`rounded-xl border p-4 ${
            analysis.mode === 'canonical'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="font-semibold text-sm">
              {analysis.mode === 'canonical'
                ? '✓ Canonical page detected'
                : 'No canonical payload — will import as static HTML'}
            </div>
            <div className="text-xs mt-2 space-y-0.5 opacity-80">
              <div>Blocks: {analysis.summary.blocks} · Questions: {analysis.summary.questions} · Clarifiers: {analysis.summary.clarifiers}</div>
            </div>
            {analysis.issues.length > 0 && (
              <ul className="mt-2 list-disc pl-4 text-xs">
                {analysis.issues.map((issue, index) => <li key={index}>{issue}</li>)}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedTopic || !htmlSource.trim() || status.kind === 'saving'}
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {status.kind === 'saving' ? 'Importing…' : 'Step 3 — Import into topic →'}
          </button>

          {status.kind !== 'idle' && (
            <div className={`rounded-xl border p-3 text-sm ${
              status.kind === 'saved' ? 'bg-green-50 border-green-200 text-green-900' :
              status.kind === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {status.message}
            </div>
          )}

          {status.kind === 'saved' && selectedTopic && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800 text-sm font-medium mb-3">
                <span>&#x2705;</span> Page imported successfully!
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Step 4 — Add to Worksheet</div>
              <a
                href={`#/parent/subject/${subjectId}/topic/${selectedTopic.folder || topicFolder}/worksheet`}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-indigo-500 bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                <span className="text-xl">&#x1F4CB;</span>
                <div>
                  <div>Open Worksheet Planner</div>
                  <div className="text-xs font-normal opacity-80">Tick the checkbox next to this page to add it to the student worksheet</div>
                </div>
                <span className="ml-auto text-lg">&#x2192;</span>
              </a>
              <a
                href={`#/parent/subject/${subjectId}/topic/${selectedTopic.folder || topicFolder}`}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                <span>&#x1F4C4;</span> View topic pages
              </a>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-lg text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-500">HTML rendered exactly as it will be embedded.</p>
          </div>
          <div className="p-4">
            {htmlSource.trim() ? (
              <iframe
                title="HTML import preview"
                srcDoc={analysis.previewHtml}
                className="w-full min-h-[760px] rounded-xl border"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              />
            ) : (
              <div className="min-h-[760px] rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                Paste HTML source to preview it here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
