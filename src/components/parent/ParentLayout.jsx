// ParentLayout.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentLayout.jsx.
// Preserves: routes, back-navigation logic, unsaved-changes banner, content
// tree (subjects → topics → pages), open-tag count, "Back to student app".

import React from 'react';
import { getTopicFolder } from '../../utils/topicUtils.js';
import { Ico } from '../../lib/Icons.jsx';

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
  hasUnsavedChanges = false,
}) {
  const handleBackNavigation = () => {
    const hash = window.location.hash || '#/parent';
    const path = hash.replace('#/parent', '').replace(/^\/+/, '');
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 2) {
      window.location.hash = '#/parent';
      return;
    }
    const lastKey = parts[parts.length - 2];
    const knownPairs = new Set(['subject', 'topic', 'page']);
    const trimCount = knownPairs.has(lastKey) ? 2 : 1;
    const parentParts = parts.slice(0, parts.length - trimCount);
    window.location.hash = parentParts.length > 0 ? `#/parent/${parentParts.join('/')}` : '#/parent';
  };

  const parentParts = route.replace('#/parent', '').split('/').filter(Boolean);
  const selectedSubjectId = parentParts[0] === 'subject' ? parentParts[1] : null;
  const selectedTopicFolder = parentParts[2] === 'topic' ? parentParts[3] : null;
  const openTagCount = (Array.isArray(studentTags) ? studentTags : []).filter((t) => t.status !== 'closed').length;

  return (
    <div className="flex h-screen bg-paper">
      {/* Sidebar */}
      <aside className="w-[268px] bg-ink text-white flex flex-col border-r border-[#0B0D1E]">
        {/* Brand */}
        <div className="px-4 pt-5 pb-3 flex items-center gap-2.5">
          <span className="sh-mark" style={{ background: '#fff', color: 'var(--color-ink)', width: 30, height: 30 }}>S</span>
          <div>
            <div className="text-[14px] font-bold tracking-tight">StudyHub</div>
            <div className="text-[11px] text-white/45">Parent · Grade 8</div>
          </div>
        </div>

        {/* Unsaved banner */}
        {hasUnsavedChanges && (
          <div
            className="mx-3.5 mb-3 px-2.5 py-2 rounded-lg text-[11.5px] flex items-center gap-2"
            style={{ background: '#3D2A05', border: '1px solid #6B4E12', color: '#F2D78A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F2D78A' }} />
            Unsaved changes
          </div>
        )}

        <nav className="flex-1 overflow-auto px-3.5 py-1">
          {/* Primary nav */}
          <div className="flex flex-col gap-0.5">
            <NavItem href="#/parent"          icon={<Ico.Compass width="16" height="16" />} label="Dashboard"
              active={isRouteActive(route, '#/parent') && parentParts.length === 0} />
            <NavItem href="#/parent/subjects" icon={<Ico.Layers width="16" height="16" />} label="Subjects"
              active={isRouteActive(route, '#/parent/subjects')} />
            <NavItem href="#/parent/import"   icon={<Ico.Upload width="16" height="16" />} label="Import Content"
              active={isRouteActive(route, '#/parent/import')} />
            <NavItem href="#/parent/organise" icon={<Ico.Folder width="16" height="16" />} label="Organise"
              subtitle="Reorder across topics"
              active={isRouteActive(route, '#/parent/organise')} />
            <NavItem href="#/parent/import-html" icon={<Ico.Book width="16" height="16" />} label="HTML Import"
              active={isRouteActive(route, '#/parent/import-html')} />
            <NavItem href="#/parent/scoreboard" icon={<Ico.Chart width="16" height="16" />} label="Scoreboard"
              active={isRouteActive(route, '#/parent/scoreboard')} />
            <NavItem href="#/parent/tags"     icon={<Ico.Tag width="16" height="16" />} label="Tagged Pages"
              badge={openTagCount}
              active={isRouteActive(route, '#/parent/tags')} />
            <NavItem href="#/parent/settings" icon={<Ico.Settings width="16" height="16" />} label="Settings"
              active={isRouteActive(route, '#/parent/settings')} />
          </div>

          {/* Content tree */}
          <div className="mt-5 mb-2 px-1 flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-white/45">Content Tree</span>
          </div>

          <div className="flex flex-col gap-px">
            {subjects.map((subject) => {
              const subjectPath = `#/parent/subject/${subject.id}`;
              const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
              const subjectExpanded = selectedSubjectId === subject.id;
              const isActive = isRouteActive(route, subjectPath);

              return (
                <div key={subject.id}>
                  <TreeRow depth={0} href={subjectPath} label={subject.title} count={subjectTopics.length}
                    expanded={subjectExpanded} active={isActive} />
                  {subjectExpanded && (
                    <div className="ml-4 border-l border-white/8 pl-2 py-px">
                      {subjectTopics.map((topic) => {
                        const topicFolder = getTopicFolder(topic, subject.id);
                        const topicPath = `#/parent/subject/${subject.id}/topic/${topicFolder}`;
                        const topicExpanded = selectedTopicFolder === topicFolder;
                        const pageMetaList = Array.isArray(topic.pages) ? topic.pages : [];
                        const topicActive = isRouteActive(route, topicPath);

                        return (
                          <div key={topic.id}>
                            <TreeRow depth={1} href={topicPath} label={topic.title || topicFolder}
                              count={pageMetaList.length} active={topicActive} />
                            {topicExpanded && pageMetaList.length > 0 && (
                              <div className="ml-3 border-l border-white/8 pl-1.5">
                                {pageMetaList.map((pageMeta) => {
                                  const pageSlug = getPageSlug(pageMeta, topic.id);
                                  const pagePath = `${topicPath}/page/${pageSlug}`;
                                  return (
                                    <TreeRow
                                      key={pageMeta.id || pageSlug}
                                      depth={2}
                                      href={pagePath}
                                      label={pageMeta.title || pageSlug}
                                      active={isRouteActive(route, pagePath)}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {subjectTopics.length === 0 && (
                        <div className="text-[11px] text-white/40 px-2 py-1">No topics</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-3.5 border-t border-white/8">
          <a href="/"
            className="w-full px-3 py-2.5 bg-white/[.06] hover:bg-white/[.1] text-white text-[12.5px] font-semibold rounded-lg border border-white/10 flex items-center justify-center gap-2 no-underline transition">
            <Ico.Eye width="14" height="14" />
            Back to Student App
          </a>
        </div>
      </aside>

      {/* Main pane */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="px-8 pt-5 flex items-center justify-between gap-3">
          <button
            onClick={handleBackNavigation}
            className="sh-btn sh-btn-secondary text-[13px]"
          >
            <Ico.ArrowLeft width="15" height="15" /> Back
          </button>
          <button
            type="button"
            aria-label="Open quick find"
            title="Open quick find"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="sh-btn sh-btn-secondary text-[13px]"
          >
            <Ico.Search width="15" height="15" />
          </button>
        </div>
        <div className="px-8 pt-4 pb-10 flex-1">{children}</div>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, badge, active, subtitle }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-[9px] no-underline transition"
      style={{
        padding: subtitle ? '9px 12px' : '8px 12px',
        color: active ? '#fff' : 'rgba(255,255,255,.7)',
        background: active ? 'rgba(255,255,255,.07)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,.08)' : '1px solid transparent',
        fontWeight: active ? 600 : 500,
        fontSize: 13,
      }}
    >
      <span style={{ color: active ? '#fff' : 'rgba(255,255,255,.5)', display: 'flex' }}>{icon}</span>
      <span className="flex flex-col leading-tight">
        {label}
        {subtitle && <span className="text-[11px] text-white/40 font-normal mt-0.5">{subtitle}</span>}
      </span>
      {badge != null && badge !== 0 && (
        <span
          className="ml-auto text-[11px] font-semibold text-white px-1.5 py-0.5 rounded-full"
          style={{ background: active ? 'var(--color-brand)' : 'rgba(255,255,255,.1)' }}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

function TreeRow({ depth = 0, href, label, count, active, expanded }) {
  return (
    <a
      href={href}
      className="no-underline flex items-center gap-2 rounded-[7px] transition"
      style={{
        padding: '6px 10px',
        paddingLeft: 10 + depth * 6,
        color: active ? '#fff' : 'rgba(255,255,255,.65)',
        background: active ? 'rgba(255,255,255,.08)' : 'transparent',
        fontWeight: active ? 600 : 500,
        fontSize: depth === 0 ? 13 : 12.5,
      }}
    >
      {depth === 0 && (
        <span className="w-2.5 text-white/40">{expanded ? '▾' : '▸'}</span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {count != null && (
        <span className="text-[10.5px] text-white/45">{count}</span>
      )}
    </a>
  );
}
