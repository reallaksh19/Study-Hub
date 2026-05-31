// ParentHtmlImporter.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentHtmlImporter.jsx.
// Preserves: analyseHtmlSource (debounced), saveHtmlImport,
// auto subject→topic seeding, title override, canonical vs interactive badge,
// live preview iframe, post-import worksheet planner link.

import React, { useEffect, useMemo, useState } from 'react';
import { analyseHtmlSource, saveHtmlImport } from '../../services/htmlImportService.js';
import { Ico } from '../../lib/Icons.jsx';

export function ParentHtmlImporter({ subjects = [], topics = [] }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topicFolder, setTopicFolder] = useState('');
  const [htmlSource, setHtmlSource] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [analysis, setAnalysis] = useState(() => analyseHtmlSource(''));
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  const subjectTopics = useMemo(() => topics.filter((t) => t.subjectId === subjectId), [topics, subjectId]);
  const selectedTopic = useMemo(
    () => subjectTopics.find((t) => t.folder === topicFolder || t.id === topicFolder),
    [subjectTopics, topicFolder]
  );

  useEffect(() => {
    if (!topicFolder && subjectTopics.length > 0) {
      setTopicFolder(subjectTopics[0].folder || subjectTopics[0].id);
    }
  }, [subjectTopics, topicFolder]);

  useEffect(() => {
    const t = setTimeout(() => {
      const result = analyseHtmlSource(htmlSource);
      setAnalysis(result);
      if (!titleOverride.trim()) setTitleOverride(result.title || '');
    }, 250);
    return () => clearTimeout(t);
  }, [htmlSource]); // eslint-disable-line

  const handleImport = async () => {
    if (!selectedTopic) {
      setStatus({ kind: 'error', message: 'Select a subject and topic first.' });
      return;
    }
    try {
      setStatus({ kind: 'saving', message: 'Saving HTML page into the selected topic…' });
      const result = await saveHtmlImport({
        htmlSource, analysis, selectedTopic,
        subjectId, topicFolder: selectedTopic.folder || topicFolder,
        titleOverride,
      });
      setStatus({
        kind: 'saved',
        message: `Imported "${result.title}" as ${result.mode === 'canonical' ? 'canonical page data' : 'interactive static HTML'}.`,
      });
    } catch (err) {
      setStatus({ kind: 'error', message: err.message || 'Failed to import HTML.' });
    }
  };

  const isCanonical = analysis.mode === 'canonical';
  const badgeBg  = isCanonical ? 'var(--color-success-soft)' : 'var(--color-warn-soft)';
  const badgeBr  = isCanonical ? '#95D2B3' : '#EBD79A';
  const badgeCol = isCanonical ? 'var(--color-success)' : '#7A4A09';

  return (
    <div className="max-w-[1200px]">
      <div className="mb-5">
        <h1 className="serif text-[30px] m-0 tracking-tight leading-[1.05]">HTML source importer</h1>
        <p className="text-[13.5px] text-ink-3 m-0 mt-1.5">
          Paste a webpage's source and import it as an interactive page inside a topic.
        </p>
      </div>

      {/* How it works */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 rounded-[14px] p-4"
        style={{ background: 'var(--color-brand-soft)', border: '1px solid #D6D9FF' }}
      >
        {[
          ['1', 'Paste the full HTML source into the box'],
          ['2', 'Pick subject, topic & page title'],
          ['3', 'Click Import — page is saved into the topic'],
          ['4', 'Open Worksheet Planner to add it for the student'],
        ].map(([n, text]) => (
          <div key={n} className="flex items-start gap-2.5">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full text-white text-[12px] font-bold flex items-center justify-center"
              style={{ background: 'var(--color-brand)' }}
            >
              {n}
            </span>
            <span className="text-[12.5px] leading-snug" style={{ color: 'var(--color-brand-ink)' }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-5">
        {/* Form */}
        <div className="sh-card p-5 space-y-4">
          {/* Step 1 */}
          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">
              <span className="mono text-muted">Step 1 ·</span> Paste full HTML source
            </label>
            <p className="text-[11.5px] text-muted m-0 mb-2">
              Open the HTML file in a text editor, select all (Ctrl+A), copy, paste here.
            </p>
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              placeholder="Paste entire HTML code here…"
              className="w-full min-h-[280px] mono text-[12px] rounded-[12px] border border-line-2 px-3 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <div className="mt-1 text-[11.5px] text-muted">
              {htmlSource.length.toLocaleString()} characters
            </div>
          </div>

          {/* Detection badge */}
          <div
            className="rounded-[12px] border px-3.5 py-3"
            style={{ background: badgeBg, borderColor: badgeBr, color: badgeCol }}
          >
            <div className="font-semibold text-[13px]">
              {isCanonical ? '✓ Canonical page detected' : 'Will import as interactive HTML page'}
            </div>
            <div className="text-[11.5px] mt-1 opacity-80">
              {isCanonical
                ? `Blocks: ${analysis.summary.blocks} · Questions: ${analysis.summary.questions} · Clarifiers: ${analysis.summary.clarifiers}`
                : 'Students will interact with the page directly (clicks, quizzes, buttons all work).'}
            </div>
            {analysis.issues?.length > 0 && (
              <ul className="m-0 mt-2 pl-4 text-[11px] list-disc">
                {analysis.issues.map((issue, i) => <li key={i}>{issue}</li>)}
              </ul>
            )}
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-ink-2 mb-1">
                <span className="mono text-muted">Step 2 ·</span> Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => { setSubjectId(e.target.value); setTopicFolder(''); }}
                className="w-full rounded-[9px] border border-line-2 px-3 py-2 text-[13px] outline-none"
              >
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-ink-2 mb-1">Topic</label>
              <select
                value={topicFolder}
                onChange={(e) => setTopicFolder(e.target.value)}
                className="w-full rounded-[9px] border border-line-2 px-3 py-2 text-[13px] outline-none"
              >
                {subjectTopics.map((t) => (
                  <option key={t.id} value={t.folder || t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-2 mb-1">Page title</label>
            <input
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
              placeholder="Auto-detected from <title> tag"
              className="w-full rounded-[9px] border border-line-2 px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </div>

          {/* Step 3 */}
          <button
            onClick={handleImport}
            disabled={!selectedTopic || !htmlSource.trim() || status.kind === 'saving'}
            className="w-full sh-btn sh-btn-primary justify-center text-[14px] disabled:opacity-50"
            style={{ padding: '12px 16px' }}
          >
            {status.kind === 'saving' ? 'Importing…' : (
              <>
                <span className="mono text-[11px] opacity-70 mr-1">Step 3</span>
                Import into topic
                <Ico.Arrow width="14" height="14" />
              </>
            )}
          </button>

          {status.kind !== 'idle' && (
            <div
              className="rounded-[10px] px-3 py-2.5 text-[13px] border"
              style={
                status.kind === 'saved'
                  ? { background: 'var(--color-success-soft)', borderColor: '#95D2B3', color: 'var(--color-success)' }
                  : status.kind === 'error'
                  ? { background: 'var(--color-danger-soft)', borderColor: '#F2B3B3', color: 'var(--color-danger)' }
                  : { background: 'var(--color-brand-soft)', borderColor: '#D6D9FF', color: 'var(--color-brand-ink)' }
              }
            >
              {status.message}
            </div>
          )}

          {status.kind === 'saved' && selectedTopic && (
            <div className="space-y-2 pt-1">
              <div
                className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-medium"
                style={{ background: 'var(--color-success-soft)', border: '1px solid #95D2B3', color: 'var(--color-success)' }}
              >
                <Ico.Check width="14" height="14" /> Page imported successfully.
              </div>
              <div className="text-[10.5px] font-bold text-muted uppercase tracking-[0.05em]">
                Step 4 — Add to worksheet
              </div>
              <a
                href={`#/parent/subject/${subjectId}/topic/${selectedTopic.folder || topicFolder}/worksheet`}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px] no-underline transition"
                style={{ background: 'var(--color-ink)', color: '#fff', border: '1px solid var(--color-ink)' }}
              >
                <span className="text-xl">📋</span>
                <div className="flex-1 text-[13px] font-semibold">
                  Open worksheet planner
                  <div className="text-[11px] font-normal opacity-75 mt-0.5">
                    Tick the new page to add it to the student worksheet.
                  </div>
                </div>
                <Ico.Arrow width="16" height="16" />
              </a>
              <a
                href={`#/parent/subject/${subjectId}/topic/${selectedTopic.folder || topicFolder}`}
                className="flex items-center gap-2 w-full sh-btn sh-btn-secondary text-[12.5px] no-underline justify-start"
              >
                📄 View topic pages
              </a>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="sh-card overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="font-semibold text-[15px] text-ink m-0">Live preview</h2>
            <p className="text-[12px] text-muted m-0 mt-0.5">HTML rendered exactly as it will be embedded.</p>
          </div>
          <div className="p-4">
            {htmlSource.trim() ? (
              <iframe
                title="HTML import preview"
                srcDoc={analysis.previewHtml}
                className="w-full min-h-[720px] rounded-[12px] border border-line"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              />
            ) : (
              <div
                className="min-h-[720px] rounded-[12px] border-2 border-dashed flex items-center justify-center text-muted text-[13.5px]"
                style={{ borderColor: 'var(--color-line-2)' }}
              >
                Paste HTML source to preview it here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
