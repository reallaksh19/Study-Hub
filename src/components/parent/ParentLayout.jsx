import React from 'react';
import { getTopicFolder } from '../../utils/topicUtils.js';

function getPageSlug(pageMeta, topicId) {
  const filePath = String(pageMeta?.file || '');
  if (filePath.startsWith('pages/') && filePath.endsWith('.json')) {
    return filePath.slice('pages/'.length, -'.json'.length);
  }

  const pageId = String(pageMeta?.id || '');
  if (topicId && pageId.startsWith(`${topicId}-`)) return pageId.slice(topicId.length + 1);
  return pageId;
}

function isRouteActive(route, target) {
  return route === target || route.startsWith(`${target}/`);
}

export function ParentLayout({
  children,
  subjects = [],
  topics = [],
  studentTags = [],
  route = '#/parent',
  hasUnsavedChanges = false
}) {
  const handleBackNavigation = () => {
    // Parse current route and navigate to logical parent — avoids history looping
    const hash = window.location.hash || '#/parent';
    const path = hash.replace('#/parent', '').replace(/^\/+/, '');
    const parts = path.split('/').filter(Boolean);

    // Build the parent path by removing the last meaningful segment
    // e.g. subject/X/topic/Y/page/Z/clarifiers → subject/X/topic/Y/page/Z
    // e.g. subject/X/topic/Y/page/Z             → subject/X/topic/Y
    // e.g. subject/X/topic/Y                    → subject/X
    // e.g. subject/X                            → (root)
    if (parts.length <= 2) {
      window.location.hash = '#/parent';
      return;
    }

    // Remove last pair of segments (e.g. page/slug, topic/folder, clarifiers)
    const lastKey = parts[parts.length - 2];
    const knownPairs = new Set(['subject', 'topic', 'page']);
    let trimCount = knownPairs.has(lastKey) ? 2 : 1;
    const parentParts = parts.slice(0, parts.length - trimCount);
    window.location.hash = parentParts.length > 0 ? `#/parent/${parentParts.join('/')}` : '#/parent';
  };

  const parentParts = route.replace('#/parent', '').split('/').filter(Boolean);
  const selectedSubjectId = parentParts[0] === 'subject' ? parentParts[1] : null;
  const selectedTopicFolder = parentParts[2] === 'topic' ? parentParts[3] : null;
  const openTagCount = (Array.isArray(studentTags) ? studentTags : []).filter((tag) => tag.status !== 'closed').length;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-indigo-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-indigo-700">
          Parent Dashboard
        </div>

        {hasUnsavedChanges && (
          <div className="mx-4 mt-3 px-3 py-2 rounded border border-amber-300 bg-amber-100 text-amber-900 text-xs font-semibold">
            Unsaved changes
          </div>
        )}

        <nav className="flex-1 p-4 overflow-y-auto">
          <button
            onClick={handleBackNavigation}
            className="w-full text-left px-2 py-2 mb-3 rounded border border-indigo-500 bg-indigo-700 hover:bg-indigo-600 transition-colors"
          >
            {'\u2190 Back'}
          </button>

          <div className="space-y-1 mb-4">
            <a
              href="#/parent"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent') && parentParts.length === 0 ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              Dashboard
            </a>
            <a
              href="#/parent/subjects"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent/subjects') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              Subjects
            </a>
            <a
              href="#/parent/import"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent/import') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              Import Content
            </a>
            <a
              href="#/parent/organise"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent/organise') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              <div>Organise</div>
              <div className="text-xs text-indigo-300 mt-0.5">Reorder across topics</div>
            </a>
            <a
              href="#/parent/import-html"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent/import-html') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              HTML Import
            </a>
            <a
              href="#/parent/scoreboard"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent/scoreboard') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              📊 Scoreboard
            </a>
            <a
              href="#/parent/tags"
              className={`flex items-center justify-between p-2 rounded transition-colors ${isRouteActive(route, '#/parent/tags') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              <span>Tagged Pages</span>
              <span className="text-xs font-bold bg-indigo-600 px-2 py-0.5 rounded">
                {openTagCount}
              </span>
            </a>
            <a
              href="#/parent/settings"
              className={`block p-2 rounded transition-colors ${isRouteActive(route, '#/parent/settings') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              Settings
            </a>
          </div>

          <div className="pt-3 border-t border-indigo-700">
            <div className="px-2 pb-2 text-xs uppercase tracking-wide text-indigo-200">Content Tree</div>
            <div className="space-y-1">
              {subjects.map((subject) => {
                const subjectPath = `#/parent/subject/${subject.id}`;
                const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
                const subjectExpanded = selectedSubjectId === subject.id;

                return (
                  <div key={subject.id} className="rounded">
                    <a
                      href={subjectPath}
                      className={`block p-2 rounded transition-colors ${isRouteActive(route, subjectPath) ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                    >
                      {subject.title}
                    </a>

                    {subjectExpanded && (
                      <div className="ml-3 mt-1 border-l border-indigo-600 pl-3 space-y-1">
                        {subjectTopics.map((topic) => {
                          const topicFolder = getTopicFolder(topic, subject.id);
                          const topicPath = `#/parent/subject/${subject.id}/topic/${topicFolder}`;
                          const topicExpanded = selectedTopicFolder === topicFolder;
                          const pageMetaList = Array.isArray(topic.pages) ? topic.pages : [];

                          return (
                            <div key={topic.id}>
                              <a
                                href={topicPath}
                                className={`block p-1.5 rounded text-sm transition-colors ${isRouteActive(route, topicPath) ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                              >
                                {topic.title || topicFolder}
                              </a>

                              {topicExpanded && pageMetaList.length > 0 && (
                                <div className="ml-3 mt-1 border-l border-indigo-600 pl-2 space-y-1">
                                  {pageMetaList.map((pageMeta) => {
                                    const pageSlug = getPageSlug(pageMeta, topic.id);
                                    const pagePath = `${topicPath}/page/${pageSlug}`;
                                    return (
                                      <a
                                        key={pageMeta.id || pageSlug}
                                        href={pagePath}
                                        className={`block p-1 rounded text-xs transition-colors ${isRouteActive(route, pagePath) ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                                      >
                                        {pageMeta.title || pageSlug}
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {subjectTopics.length === 0 && (
                          <div className="text-xs text-indigo-200 px-2 py-1">No topics</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <a href="/" className="block p-2 text-center border border-indigo-400 rounded hover:bg-indigo-700">
            Back to Student App
          </a>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-6">
          <button
            onClick={handleBackNavigation}
            className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {'\u2190 Back'}
          </button>
        </div>
        <div className="p-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
