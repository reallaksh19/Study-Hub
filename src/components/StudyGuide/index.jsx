import React, { useEffect, useRef } from 'react';
import { RightSidebar } from './RightSidebar.jsx';
import { BlockRenderer } from '../blocks/BlockRenderer.jsx';
import { QuizSection } from '../QuizSection/index.jsx';
import { MobileHelpDrawer } from '../student/MobileHelpDrawer.jsx';

export function StudyGuide({ subject, topic, page, studyState, onMarkRead, onPageOpen, onPageChange, settings, onBack, onTagPage, onUntagPage }) {
  const lastBlockRef = useRef(null);
  const sidebarSettings = settings || { geminiApiKey: localStorage.getItem('geminiApiKey') || '' };

  useEffect(() => {
    if (!lastBlockRef.current || !page) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onMarkRead(page.id);
      }
    }, { threshold: 0.5 });

    observer.observe(lastBlockRef.current);
    return () => observer.disconnect();
  }, [page, onMarkRead]);

  if (!page) return <div>Page not found</div>;

  const handleNavigate = (pageId) => {
    onPageOpen?.(pageId);
    onPageChange(pageId);
  };

  const clarifiers = page.clarifiers || [];
  const relatedPages = (page.relatedPageIds || []).map((id) => {
    const linkedPage = (topic?.pages || []).find((candidate) => candidate.id === id);
    return linkedPage ? { id: linkedPage.id, title: linkedPage.title } : null;
  }).filter(Boolean);

  const currentIndex = topic.pages.findIndex((candidate) => candidate.id === page.id);
  const prevPage = currentIndex > 0 ? topic.pages[currentIndex - 1] : null;
  const nextPage = currentIndex < topic.pages.length - 1 ? topic.pages[currentIndex + 1] : null;
  const studentTags = Array.isArray(studyState?.studentTags) ? studyState.studentTags : [];
  const currentPageTag = studentTags.find((tag) => tag.pageId === page.id && tag.status !== 'closed');

  const handleTagAction = () => {
    if (currentPageTag) {
      onUntagPage?.({ pageId: page.id });
      return;
    }

    const noteInput = window.prompt('Add a note for parent (optional):', 'Please review this page with me.');
    if (noteInput === null) return;
    onTagPage?.({
      pageId: page.id,
      pageTitle: page.title,
      note: noteInput
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
        <button
          onClick={onBack}
          className="w-full text-left mb-3 inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <h2 className="font-bold text-lg mb-4">{topic.title}</h2>
        <div className="space-y-2">
          {topic.pages.map((candidatePage) => {
            const isRead = Boolean(studyState?.pageProgress?.[candidatePage.id]?.read);
            const isCurrent = candidatePage.id === page.id;
            return (
              <div
                key={candidatePage.id}
                onClick={() => handleNavigate(candidatePage.id)}
                className={`p-2 rounded cursor-pointer text-sm ${isCurrent ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-200'}`}
              >
                {isRead ? '[x]' : (isCurrent ? '>' : 'o')} {candidatePage.title}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-4xl font-bold mb-2">{page.title}</h1>
            <div className="text-gray-500 text-sm mb-3">~{page.estimatedMinutes || 5} min read</div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleTagAction}
                className={`px-3 py-1.5 rounded border text-sm font-semibold ${currentPageTag ? 'border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {currentPageTag ? 'Untag for parent' : 'Tag for parent'}
              </button>
              {currentPageTag && (
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                  Tagged for parent
                </span>
              )}
            </div>
            {currentPageTag?.note && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 border rounded p-2">
                Note: {currentPageTag.note}
              </div>
            )}
          </div>

          <div className="blocks mb-12">
            {(page.blocks || []).map((block, idx) => {
              const isLast = idx === page.blocks.length - 1;
              return (
                <div key={block.id} ref={isLast ? lastBlockRef : null}>
                  <BlockRenderer block={block} />
                </div>
              );
            })}
          </div>

          {(page.questions && page.questions.length > 0) && (
            <QuizSection
              topic={topic}
              page={page}
              questions={page.questions}
              pageBlocks={page.blocks}
              clarifiers={page.clarifiers}
              onComplete={() => onMarkRead(page.id)}
            />
          )}

          <div className="mt-12 flex justify-between pt-4 border-t">
            {prevPage ? (
              <button onClick={() => handleNavigate(prevPage.id)} className="text-blue-600 hover:underline">
                {'<-'} {prevPage.title}
              </button>
            ) : <span />}
            {nextPage ? (
              <button onClick={() => handleNavigate(nextPage.id)} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
                Next: {nextPage.title} {'->'}
              </button>
            ) : <span />}
          </div>
        </div>
      </div>

      <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto hidden lg:block">
        <RightSidebar
          clarifiers={clarifiers}
          relatedPages={relatedPages}
          pageBlocks={page.blocks}
          pageTitle={page.title}
          settings={sidebarSettings}
        />
      </div>

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
