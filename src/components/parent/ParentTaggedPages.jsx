import React, { useMemo, useState } from 'react';

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
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export function ParentTaggedPages({
  subjects = [],
  topics = [],
  studentTags = [],
  onResolveTag
}) {
  const [resolutionDrafts, setResolutionDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  const resolvedTags = useMemo(() => {
    const tags = Array.isArray(studentTags) ? studentTags : [];
    return tags.map((tag) => {
      const topic = topics.find((candidate) => candidate.id === tag.topicId);
      const subject = subjects.find((candidate) => candidate.id === topic?.subjectId);
      const pageMeta = topic?.pages?.find((candidate) => candidate.id === tag.pageId);
      const topicFolder = resolveTopicFolder(topic);
      const pageSlug = resolvePageSlug(pageMeta, tag.pageId);
      const parentPageLink = topic && subject
        ? `#/parent/subject/${subject.id}/topic/${topicFolder}/page/${pageSlug}`
        : null;

      return {
        ...tag,
        topicTitle: topic?.title || tag.topicId || 'Unknown topic',
        subjectTitle: subject?.title || topic?.subjectId || 'Unknown subject',
        parentPageLink
      };
    }).sort((a, b) => {
      const statusScoreA = a.status === 'open' ? 0 : 1;
      const statusScoreB = b.status === 'open' ? 0 : 1;
      if (statusScoreA !== statusScoreB) return statusScoreA - statusScoreB;
      return String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''));
    });
  }, [studentTags, topics, subjects]);

  const filteredTags = resolvedTags.filter((tag) => {
    if (statusFilter === 'all') return true;
    return tag.status === statusFilter;
  });

  const handleResolveTag = (tag) => {
    const resolutionNote = String(resolutionDrafts[tag.id] || '').trim();
    if (resolutionNote.length === 0) {
      alert('Add a resolution note before closing the tag.');
      return;
    }

    onResolveTag?.({ tagId: tag.id, resolutionNote });
    setResolutionDrafts((previous) => {
      const next = { ...previous };
      delete next[tag.id];
      return next;
    });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tagged Pages</h1>
        <p className="text-gray-600 mt-1">Student-tagged pages across all subjects and topics. Add resolution notes and close each tag after review.</p>
      </div>

      <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded border text-sm font-semibold ${statusFilter === 'all' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          All ({resolvedTags.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3 py-1.5 rounded border text-sm font-semibold ${statusFilter === 'open' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          Open ({resolvedTags.filter((tag) => tag.status === 'open').length})
        </button>
        <button
          onClick={() => setStatusFilter('closed')}
          className={`px-3 py-1.5 rounded border text-sm font-semibold ${statusFilter === 'closed' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          Closed ({resolvedTags.filter((tag) => tag.status === 'closed').length})
        </button>
      </div>

      {filteredTags.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          No tagged pages found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTags.map((tag) => (
            <div key={tag.id} className="bg-white border rounded-xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-bold text-gray-800">{tag.pageTitle || tag.pageId}</div>
                  <div className="text-sm text-gray-600">{tag.subjectTitle} · {tag.topicTitle}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${tag.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {tag.status === 'closed' ? 'Closed' : 'Open'}
                </div>
              </div>

              {tag.note && (
                <div className="text-sm bg-amber-50 border border-amber-200 rounded p-3 text-amber-900">
                  Student note: {tag.note}
                </div>
              )}

              <div className="text-xs text-gray-500 flex flex-wrap gap-x-5 gap-y-1">
                <span>Created: {prettyDate(tag.createdAt)}</span>
                <span>Updated: {prettyDate(tag.updatedAt)}</span>
                {tag.resolvedAt && <span>Resolved: {prettyDate(tag.resolvedAt)}</span>}
              </div>

              {tag.parentPageLink && (
                <div>
                  <a href={tag.parentPageLink} className="text-sm text-indigo-700 hover:underline font-semibold">
                    Open page in parent editor
                  </a>
                </div>
              )}

              {tag.status !== 'closed' && (
                <div className="pt-2 border-t space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Resolution note</label>
                  <textarea
                    value={resolutionDrafts[tag.id] || ''}
                    onChange={(event) => setResolutionDrafts((previous) => ({ ...previous, [tag.id]: event.target.value }))}
                    placeholder="Write what action you took to resolve this tag..."
                    className="w-full border border-gray-300 rounded p-2 min-h-24"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleResolveTag(tag)}
                      className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      Add resolution and close
                    </button>
                  </div>
                </div>
              )}

              {tag.status === 'closed' && (
                <div className="text-sm bg-green-50 border border-green-200 rounded p-3 text-green-900">
                  Resolution: {tag.resolutionNote || 'No resolution note'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
