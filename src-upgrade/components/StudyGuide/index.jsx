// StudyGuide/index.jsx — UPGRADED
// Drop-in replacement for src/components/StudyGuide/index.jsx.
// Preserves: IntersectionObserver mark-read, prev/next navigation, tag/untag for parent,
//            sidebar TOC, RightSidebar (clarifiers + related + AI), MobileHelpDrawer.

import React, { useEffect, useRef } from 'react';
import { RightSidebar } from './RightSidebar.jsx';
import { BlockRenderer } from '../blocks/BlockRenderer.jsx';
import { QuizSection } from '../QuizSection/index.jsx';
import { MobileHelpDrawer } from '../student/MobileHelpDrawer.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function StudyGuide({
  subject, topic, page, studyState, onMarkRead, onPageOpen, onPageChange,
  settings, onBack, onTagPage, onUntagPage,
}) {
  const lastBlockRef = useRef(null);
  const sidebarSettings = settings || { geminiApiKey: localStorage.getItem('geminiApiKey') || '' };

  useEffect(() => {
    if (!lastBlockRef.current || !page) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onMarkRead(page.id); },
      { threshold: 0.5 }
    );
    observer.observe(lastBlockRef.current);
    return () => observer.disconnect();
  }, [page, onMarkRead]);

  if (!page) return <div className="p-8 text-muted">Page not found</div>;

  const handleNavigate = (pageId) => {
    onPageOpen?.(pageId);
    onPageChange(pageId);
  };

  const clarifiers = page.clarifiers || [];
  const relatedPages = (page.relatedPageIds || [])
    .map((id) => {
      const linked = (topic?.pages || []).find((p) => p.id === id);
      return linked ? { id: linked.id, title: linked.title } : null;
    })
    .filter(Boolean);

  const currentIndex = topic.pages.findIndex((c) => c.id === page.id);
  const prevPage = currentIndex > 0 ? topic.pages[currentIndex - 1] : null;
  const nextPage = currentIndex < topic.pages.length - 1 ? topic.pages[currentIndex + 1] : null;

  const studentTags = Array.isArray(studyState?.studentTags) ? studyState.studentTags : [];
  const currentPageTag = studentTags.find((t) => t.pageId === page.id && t.status !== 'closed');

  const handleTagAction = () => {
    if (currentPageTag) {
      onUntagPage?.({ pageId: page.id });
      return;
    }
    const noteInput = window.prompt('Add a note for parent (optional):', 'Please review this page with me.');
    if (noteInput === null) return;
    onTagPage?.({ pageId: page.id, pageTitle: page.title, note: noteInput });
  };

  // Reading progress as scroll % – pure visual flourish, no state coupling
  const totalPages = topic.pages.length;
  const pagePct = totalPages ? Math.round(((currentIndex + 1) / totalPages) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      {/* Left: TOC */}
      <aside className="w-[244px] bg-paper-2 border-r border-line flex flex-col px-4 py-4 flex-shrink-0">
        <button onClick={onBack} className="sh-btn sh-btn-ghost text-[12.5px] px-2 py-1.5 self-start mb-4">
          <Ico.ArrowLeft width="14" height="14" /> Back to topic
        </button>

        <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em] mb-1">
          {subject?.title || 'Subject'} · {topic.title}
        </div>
        <h2 className="serif text-[20px] m-0 mb-3.5 leading-tight">Topic outline</h2>

        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {topic.pages.map((candidate, i) => {
            const isRead = Boolean(studyState?.pageProgress?.[candidate.id]?.read);
            const isCurrent = candidate.id === page.id;
            return (
              <a
                key={candidate.id}
                onClick={() => handleNavigate(candidate.id)}
                className="flex gap-2.5 items-center rounded-[8px] cursor-pointer text-[13px] transition no-underline"
                style={{
                  padding: '8px 10px',
                  background: isCurrent ? 'var(--color-ink)' : 'transparent',
                  color: isCurrent ? '#fff' : 'var(--color-ink-2)',
                  fontWeight: isCurrent ? 600 : 500,
                }}
              >
                <span
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 text-[11px]"
                  style={{
                    background: isRead ? 'var(--color-success)' : isCurrent ? 'rgba(255,255,255,.16)' : 'var(--color-paper)',
                    color: isRead ? '#fff' : isCurrent ? '#fff' : 'var(--color-muted)',
                    border: isRead || isCurrent ? 'none' : '1px solid var(--color-line)',
                  }}
                >
                  {isRead ? <Ico.Check width="11" height="11" /> : i + 1}
                </span>
                <span className="flex-1 leading-snug">{candidate.title}</span>
              </a>
            );
          })}
        </div>

        <div className="mt-auto pt-3">
          <div className="px-3 py-3 bg-white border border-line rounded-[10px]">
            <div className="text-[11px] text-muted uppercase tracking-[0.04em] font-semibold">This page</div>
            <div className="text-[13px] font-semibold mt-0.5 mb-1.5">
              ~{page.estimatedMinutes || 5} min read
            </div>
            <div className="h-1 bg-paper rounded-full">
              <div className="h-full bg-brand rounded-full" style={{ width: `${pagePct}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Center: reading */}
      <main className="flex-1 overflow-y-auto">
        <article className="max-w-[720px] mx-auto px-8 sm:px-10 pt-8 pb-16">
          <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.06em] mb-2">
            Page {currentIndex + 1} of {totalPages} · Lesson
          </div>
          <h1 className="serif text-4xl sm:text-[46px] leading-[1.05] tracking-tight m-0 mb-3.5">
            {page.title}
          </h1>

          <div className="flex gap-2.5 flex-wrap items-center mb-6">
            <span className="text-[13px] text-muted">
              ~{page.estimatedMinutes || 5} min read
            </span>
            <span className="flex-1" />
            <button
              onClick={handleTagAction}
              className="sh-btn sh-btn-secondary text-[12.5px] px-3 py-1.5"
              style={
                currentPageTag
                  ? { borderColor: '#E9C77B', color: 'var(--color-warn)', background: '#FFFBED' }
                  : undefined
              }
            >
              <Ico.Tag width="13" height="13" />
              {currentPageTag ? 'Untag for parent' : 'Tag for parent'}
            </button>
          </div>

          {currentPageTag?.note && (
            <div className="mb-6 text-[13px] text-ink-3 bg-paper-2 border border-line rounded-[10px] p-3">
              <b className="text-ink-2">Note:</b> {currentPageTag.note}
            </div>
          )}

          {/* Blocks */}
          <div className="study-blocks mb-12">
            {(page.blocks || []).map((block, idx) => {
              const isLast = idx === page.blocks.length - 1;
              return (
                <div key={block.id} ref={isLast ? lastBlockRef : null}>
                  <BlockRenderer block={block} />
                </div>
              );
            })}
          </div>

          {/* Quiz */}
          {page.questions && page.questions.length > 0 && (
            <QuizSection
              topic={topic}
              page={page}
              questions={page.questions}
              pageBlocks={page.blocks}
              clarifiers={page.clarifiers}
              onComplete={() => onMarkRead(page.id)}
            />
          )}

          {/* Page nav */}
          <div className="mt-12 pt-4 border-t border-line flex items-center justify-between gap-4">
            {prevPage ? (
              <button
                onClick={() => handleNavigate(prevPage.id)}
                className="sh-btn sh-btn-ghost text-[13px]"
              >
                <Ico.ArrowLeft width="14" height="14" />
                <span className="hidden sm:inline">Previous · {prevPage.title}</span>
                <span className="sm:hidden">Previous</span>
              </button>
            ) : (
              <span />
            )}
            {nextPage ? (
              <button
                onClick={() => handleNavigate(nextPage.id)}
                className="sh-btn sh-btn-primary text-[13px]"
              >
                <span className="hidden sm:inline">Next · {nextPage.title}</span>
                <span className="sm:hidden">Next</span>
                <Ico.Arrow width="14" height="14" />
              </button>
            ) : (
              <span />
            )}
          </div>
        </article>
      </main>

      {/* Right: clarifiers + AI + related */}
      <aside className="hidden lg:block w-[300px] bg-paper-2 border-l border-line p-5 overflow-y-auto flex-shrink-0">
        <RightSidebar
          clarifiers={clarifiers}
          relatedPages={relatedPages}
          pageBlocks={page.blocks}
          pageTitle={page.title}
          settings={sidebarSettings}
        />
      </aside>

      {/* Mobile drawer (unchanged) */}
      <MobileHelpDrawer
        clarifiers={clarifiers}
        relatedPages={relatedPages}
        pageBlocks={page.blocks}
        pageTitle={page.title}
        settings={sidebarSettings}
      />
    </div>
  );
}
