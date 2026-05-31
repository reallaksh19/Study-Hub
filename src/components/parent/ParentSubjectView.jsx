// ParentSubjectView.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentSubjectView.jsx.
// Preserves: 3-step delete confirm flow, add-topic via createDirectory + saveJSON,
//            topic row → editor + worksheet planner links.

import React from 'react';
import { slugify } from '../../utils/slugify.js';
import { createDirectory, saveJSON, deleteDirectory } from '../../services/parentApiService.js';
import { Ico } from '../../lib/Icons.jsx';
import { useConfirm, useToast } from '../../lib/Toast.jsx';

const SUBJECT_PALETTE = {
  physics:     { accent: 'var(--color-brand)',   glyph: '⚛' },
  mathematics: { accent: 'var(--color-accent)',  glyph: '∑' },
  chemistry:   { accent: 'var(--color-violet)',  glyph: '⚗' },
  biology:     { accent: 'var(--color-success)', glyph: '🌱' },
};
function subjectStyle(subject) {
  const key = String(subject?.id || '').toLowerCase();
  return (
    SUBJECT_PALETTE[key] || {
      accent: subject?.color || 'var(--color-ink)',
      glyph: (subject?.title || 'S').slice(0, 1).toUpperCase(),
    }
  );
}

export function ParentSubjectView({ subject, topics }) {
  const confirm = useConfirm();
  const toast = useToast();
  if (!subject) return <div className="text-muted">Subject not found</div>;
  const style = subjectStyle(subject);

  const handleDeleteSubject = async () => {
    const ok = await confirm({
      title: `Delete subject "${subject.title}"?`,
      body: 'This permanently deletes every topic and page in this subject. This cannot be undone.',
      confirmLabel: 'Delete subject',
      variant: 'danger',
      typeToConfirm: subject.title,
    });
    if (!ok) return;
    try {
      await deleteDirectory(subject.id);
      window.location.hash = '#/parent';
      window.location.reload();
    } catch (err) {
      toast.show(`Failed to delete subject: ${err.message}`, { variant: 'error' });
    }
  };

  const handleAddTopic = async () => {
    const title = window.prompt('Enter new topic title:');
    if (!title) return;
    const folder = slugify(title);
    const newTopic = {
      id: `${subject.id}-${folder}`,
      subjectId: subject.id,
      title,
      difficulty: 'medium',
      estimatedMinutes: 30,
      pages: [],
    };
    try {
      const subjectFolder = subject.id;
      await createDirectory(`${subjectFolder}/${folder}/pages`);
      await createDirectory(`${subjectFolder}/${folder}/assets`);
      await saveJSON(`${subjectFolder}/${folder}/topic.json`, newTopic);
      window.location.hash = `#/parent/subject/${subject.id}/topic/${folder}`;
    } catch {
      toast.show('Failed to create topic. Backend might be unavailable.', { variant: 'error' });
    }
  };

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center gap-1.5 text-[13px] text-muted mb-3">
        <a href="#/parent" className="hover:text-ink no-underline">Subjects</a>
        <span className="opacity-50">/</span>
        <span className="text-ink-2 font-semibold">{subject.title}</span>
      </div>

      {/* Hero */}
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div
              className="w-10 h-10 rounded-[10px] text-white flex items-center justify-center text-[22px]"
              style={{ background: style.accent, fontFamily: 'var(--font-display)' }}
            >
              {style.glyph}
            </div>
            <h1 className="serif text-[34px] m-0 leading-[1.05] tracking-tight">{subject.title}</h1>
          </div>
          <div className="text-[13.5px] text-ink-3">
            {topics.length} topic{topics.length !== 1 ? 's' : ''} ·{' '}
            {topics.reduce((acc, t) => acc + (t.pages?.length || 0), 0)} pages
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="sh-btn sh-btn-secondary">
            <Ico.Settings width="15" height="15" /> Subject settings
          </button>
          <button onClick={handleAddTopic} className="sh-btn sh-btn-primary">
            <Ico.Plus width="15" height="15" /> Add topic
          </button>
        </div>
      </div>

      {/* Topic list */}
      <div className="grid gap-2.5 mb-8">
        {topics.map((topic) => {
          const folder = topic.folder || topic.id.replace(`${subject.id}-`, '');
          return (
            <div
              key={topic.id}
              className="bg-white border border-line-2 rounded-[14px] px-4 py-3.5 flex items-center gap-3.5"
              style={{ borderLeft: `3px solid ${style.accent}` }}
            >
              <span
                className="w-9 h-9 rounded-[9px] flex items-center justify-center border border-line bg-paper-2 flex-shrink-0"
                style={{ color: style.accent }}
              >
                <Ico.Layers width="18" height="18" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="serif text-[18px] leading-tight">{topic.title}</div>
                <div className="text-[12.5px] text-muted mt-0.5">
                  {topic.pages?.length || 0} pages · {topic.difficulty || 'Medium'}
                </div>
              </div>
              <a
                href={`#/parent/subject/${subject.id}/topic/${folder}`}
                className="sh-btn sh-btn-secondary text-[12.5px] no-underline"
                style={{ padding: '7px 12px' }}
              >
                Edit <Ico.Arrow width="13" height="13" />
              </a>
              <a
                href={`#/parent/subject/${subject.id}/topic/${folder}/worksheet`}
                className="sh-btn sh-btn-secondary text-[12.5px] no-underline"
                style={{
                  padding: '7px 12px',
                  background: 'var(--color-brand-soft)',
                  borderColor: '#D6D9FF',
                  color: 'var(--color-brand-ink)',
                }}
              >
                <Ico.Bookmark width="13" height="13" /> Worksheet
              </a>
            </div>
          );
        })}
        {topics.length === 0 && (
          <div className="sh-card p-8 text-center text-muted">No topics yet. Click "Add topic" to start.</div>
        )}
      </div>

      {/* Danger zone */}
      <div
        className="rounded-[14px] px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: '#fff', border: '1px dashed #F2B3B3' }}
      >
        <div>
          <div
            className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1"
            style={{ color: 'var(--color-danger)' }}
          >
            Danger zone
          </div>
          <div className="text-[13.5px] text-ink-3">
            Delete this entire subject (every topic and page). 3-step confirm.
          </div>
        </div>
        <button
          onClick={handleDeleteSubject}
          className="sh-btn"
          style={{ background: '#fff', color: 'var(--color-danger)', border: '1px solid #F2B3B3' }}
        >
          Delete subject…
        </button>
      </div>
    </div>
  );
}
