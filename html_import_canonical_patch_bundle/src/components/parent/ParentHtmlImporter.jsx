import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyseHtmlSource, saveHtmlImport } from '../../services/htmlImportService.js';

export function ParentHtmlImporter({ subjects = [], topics = [] }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topicFolder, setTopicFolder] = useState('');
  const [htmlSource, setHtmlSource] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [analysis, setAnalysis] = useState(() => analyseHtmlSource(''));
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const [showHelp, setShowHelp] = useState(false);
  const [helpContent, setHelpContent] = useState('Loading canonical content layer…');

  const subjectTopics = useMemo(() => topics.filter(topic => topic.subjectId === subjectId), [topics, subjectId]);
  const selectedTopic = useMemo(() => subjectTopics.find(topic => topic.folder === topicFolder || topic.id === topicFolder), [subjectTopics, topicFolder]);

  useEffect(() => {
    if (!topicFolder && subjectTopics.length > 0) {
      setTopicFolder(subjectTopics[0].folder || subjectTopics[0].id);
    }
  }, [subjectTopics, topicFolder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalysis(analyseHtmlSource(htmlSource));
      if (!titleOverride.trim()) {
        setTitleOverride(analyseHtmlSource(htmlSource).title || '');
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [htmlSource]);

  async function openHelp() {
    setShowHelp(true);
    if (helpContent !== 'Loading canonical content layer…' && helpContent !== 'Unable to load canonical layer help.') return;
    try {
      const response = await fetch('/CANONICAL_CONTENT_LAYER.md');
      const text = await response.text();
      setHelpContent(text);
    } catch {
      setHelpContent('Unable to load canonical layer help.');
    }
  }

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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HTML Source Importer</h1>
          <p className="text-gray-600 mt-2">
            Paste complete HTML source. Study Hub will try to detect a canonical payload and segregate it into page data. If not found, it will import the page as static interactive HTML.
          </p>
        </div>
        <button
          type="button"
          onClick={openHelp}
          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
          title="Open CANONICAL_CONTENT_LAYER help"
        >
          <span className="text-lg">❔</span>
          <span className="font-medium">Canonical help</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
        <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicFolder('');
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
            <select
              value={topicFolder}
              onChange={(e) => setTopicFolder(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {subjectTopics.map(topic => (
                <option key={topic.id} value={topic.folder || topic.id}>{topic.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Page title</label>
            <input
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Imported HTML Page"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Paste full HTML source</label>
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              className="w-full min-h-[420px] font-mono text-xs rounded-xl border border-gray-300 px-3 py-3"
              placeholder="Paste entire HTML code here..."
            />
            <div className="mt-2 text-xs text-gray-500">{htmlSource.length} characters</div>
          </div>

          <div className={`rounded-xl border p-4 ${
            analysis.mode === 'canonical'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="font-semibold">
              {analysis.mode === 'canonical'
                ? 'Canonical page detected'
                : 'No canonical payload found — will import as static interactive HTML'}
            </div>
            <div className="text-sm mt-2 space-y-1">
              <div>Blocks: {analysis.summary.blocks}</div>
              <div>Questions: {analysis.summary.questions}</div>
              <div>Clarifiers: {analysis.summary.clarifiers}</div>
              <div>Attachments: {analysis.summary.attachments}</div>
              <div>Resources: {analysis.summary.resources}</div>
            </div>
            {analysis.issues.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-sm">
                {analysis.issues.map((issue, index) => <li key={index}>{issue}</li>)}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedTopic || !htmlSource.trim()}
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import into topic
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
            <a
              href={`#/parent/subject/${subjectId}/topic/${selectedTopic.folder || topicFolder}`}
              className="inline-block text-indigo-700 hover:underline text-sm"
            >
              Go to topic editor →
            </a>
          )}
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-gray-900">Preview</h2>
              <p className="text-sm text-gray-500">This shows the HTML exactly as it will be embedded.</p>
            </div>
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

      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">CANONICAL_CONTENT_LAYER</h2>
              <button onClick={() => setShowHelp(false)} className="px-3 py-1 rounded border hover:bg-gray-50">Close</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)] prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{helpContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
