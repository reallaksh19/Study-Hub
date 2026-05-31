// ParentTaggedPages.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentTaggedPages.jsx.
// Preserves: tag resolution drafts state, status filter, open-vs-closed counts,
//            onResolveTag(tagId, resolutionNote), parentPageLink, prettyDate, sort.

import React, { useMemo, useState } from 'react';
import { Ico } from '../../lib/Icons.jsx';

function resolveTopicFolder(topic) {
  if (typeof topic?.folder === 'string' && topic.folder.length > 0) return topic.folder;
  const topicId = String(topic?.id || '');
  const topicSubjectId = String(topic?.subjectId || '');
  const prefix = `${topicSubjectId}-`;
  if (topicId.startsWith(prefix)) return topicId.slice(prefix.length);
  return topicId;
}

function resolvePageSlug(pageMeta, fallbackPageId) {
  const filePath = String(pageMeta?.file || '');
  if (filePath.startsWith('pages/') && filePath.endsWith('.json')) {
    return filePath.slice('pages/'.length, -'.json'.length);
  }
  const pageId = String(fallbackPageId || pageMeta?.id || '');
  const pieces = pageId.split('-');
  return pieces[pieces.length - 1] || pageId;
}

function prettyDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

export function ParentTaggedPages({ subjects = [], topics = [], studentTags = [], onResolveTag }) {
  const [resolutionDrafts, setResolutionDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  const resolvedTags = useMemo(() => {
    const tags = Array.isArray(studentTags) ? studentTags : [];
    return tags
      .map((tag) => {
        const topic = topics.find((t) => t.id === tag.topicId);
        const subject = subjects.find((s) => s.id === topic?.subjectId);
        const pageMeta = topic?.pages?.find((p) => p.id === tag.pageId);
        const topicFolder = resolveTopicFolder(topic);
        const pageSlug = resolvePageSlug(pageMeta, tag.pageId);
        const parentPageLink = topic && subject
          ? `#/parent/subject/${subject.id}/topic/${topicFolder}/page/${pageSlug}`
          : null;
        return {
          ...tag,
          topicTitle: topic?.title || tag.topicId || 'Unknown topic',
          subjectTitle: subject?.title || topic?.subjectId || 'Unknown subject',
          parentPageLink,
        };
      })
      .sort((a, b) => {
        const aOpen = a.status === 'open' ? 0 : 1;
        const bOpen = b.status === 'open' ? 0 : 1;
        if (aOpen !== bOpen) return aOpen - bOpen;
        return String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''));
      });
  }, [studentTags, topics, subjects]);

  const filteredTags = resolvedTags.filter((tag) => statusFilter === 'all' || tag.status === statusFilter);
  const openCount = resolvedTags.filter((t) => t.status === 'open').length;
  const closedCount = resolvedTags.filter((t) => t.status === 'closed').length;

  const handleResolveTag = (tag) => {
    const note = String(resolutionDrafts[tag.id] || '').trim();
    if (!note) { alert('Add a resolution note before closing the tag.'); return; }
    onResolveTag?.({ tagId: tag.id, resolutionNote: note });
    setResolutionDrafts((prev) => {
      const next = { ...prev };
      delete next[tag.id];
      return next;
    });
  };

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.05em] mb-1.5">
            Pages your kid wants help with
          </div>
          <h1 className="serif text-[34px] tracking-tight m-0 leading-[1.05]">Tagged pages</h1>
          <p className="text-[13.5px] text-ink-3 m-0 mt-1.5">
            Add resolution notes and close each tag after review.
          </p>
        </div>
        <div className="flex gap-1.5">
          <FilterChip label="All" count={resolvedTags.length} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          <FilterChip label="Open" count={openCount} active={statusFilter === 'open'} onClick={() => setStatusFilter('open')} />
          <FilterChip label="Resolved" count={closedCount} active={statusFilter === 'closed'} onClick={() => setStatusFilter('closed')} />
        </div>
      </div>

      {filteredTags.length === 0 ? (
        <div className="sh-card p-8 text-center text-muted">No tagged pages for this filter.</div>
      ) : (
        <div className="grid gap-2.5">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white border border-line-2 rounded-[14px] px-5 py-4"
              style={{
                borderLeft: tag.status === 'open' ? '3px solid var(--color-accent)' : '3px solid var(--color-success)',
                opacity: tag.status === 'closed' ? 0.85 : 1,
              }}
            >
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span
                  className="text-[10.5px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded"
                  style={
                    tag.status === 'open'
                      ? { background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }
                      : { background: 'var(--color-success-soft)', color: 'var(--color-success)' }
                  }
                >
                  {tag.status === 'open' ? 'Open' : 'Resolved'}
                </span>
                <span className="text-[12px] text-muted">{tag.subjectTitle} · {tag.topicTitle}</span>
                <span className="ml-auto text-[11.5px] text-muted-2">{prettyDate(tag.updatedAt || tag.createdAt)}</span>
              </div>

              <div className="serif text-[20px] leading-tight mb-2">{tag.pageTitle || tag.pageId}</div>

              {tag.note && (
                <div
                  className="text-[13.5px] text-ink-3 leading-relaxed mb-2.5 px-3 py-2.5 rounded-[9px] italic"
                  style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
                >
                  "{tag.note}"
                </div>
              )}

              <div className="text-[11.5px] text-muted flex flex-wrap gap-x-5 gap-y-1 mb-2.5">
                <span>Created: {prettyDate(tag.createdAt)}</span>
                <span>Updated: {prettyDate(tag.updatedAt)}</span>
                {tag.resolvedAt && <span>Resolved: {prettyDate(tag.resolvedAt)}</span>}
              </div>

              {tag.status === 'closed' && tag.resolutionNote && (
                <div
                  className="text-[13px] mb-2.5 px-3 py-2.5 rounded-[9px]"
                  style={{ background: 'var(--color-success-soft)', border: '1px solid #95D2B3', color: 'var(--color-success)' }}
                >
                  <b>Resolution:</b> {tag.resolutionNote}
                </div>
              )}

              {tag.status !== 'closed' && (
                <div className="pt-3 border-t border-line">
                  <textarea
                    value={resolutionDrafts[tag.id] || ''}
                    onChange={(e) =>
                      setResolutionDrafts((prev) => ({ ...prev, [tag.id]: e.target.value }))
                    }
                    placeholder="What did you do to resolve this?"
                    className="w-full border border-line-2 rounded-[9px] p-2.5 text-[13px] font-sans outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {tag.parentPageLink && (
                      <a
                        href={tag.parentPageLink}
                        className="sh-btn sh-btn-secondary text-[12.5px] no-underline"
                      >
                        <Ico.Eye width="13" height="13" /> Open page
                      </a>
                    )}
                    <button onClick={() => handleResolveTag(tag)} className="sh-btn sh-btn-primary text-[12.5px] ml-auto">
                      <Ico.Check width="13" height="13" /> Mark resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[8px] text-[12.5px] font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 border transition"
      style={{
        background: active ? 'var(--color-ink)' : '#fff',
        color: active ? '#fff' : 'var(--color-ink-2)',
        borderColor: active ? 'var(--color-ink)' : 'var(--color-line-2)',
      }}
    >
      {label}
      <span
        className="text-[10.5px] px-1.5 py-0.5 rounded font-bold"
        style={{
          background: active ? 'rgba(255,255,255,.18)' : 'var(--color-paper)',
          color: active ? '#fff' : 'var(--color-muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}
