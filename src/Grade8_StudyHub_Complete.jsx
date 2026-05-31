import React, { useState } from 'react';
import { ParentPinLock } from './components/parent/ParentPinLock.jsx';
import { ParentLayout } from './components/parent/ParentLayout.jsx';
import { ParentDashboard } from './components/parent/ParentDashboard.jsx';
import { ParentSettings } from './components/parent/ParentSettings.jsx';
import { ParentSubjectView } from './components/parent/ParentSubjectView.jsx';
import { ParentTopicEditor } from './components/parent/ParentTopicEditor.jsx';
import { ParentPageEditor } from './components/parent/ParentPageEditor.jsx';
import { ParentQuestionsEditor } from './components/parent/QuestionEditor/ParentQuestionsEditor.jsx';
import { ParentClarifiersEditor } from './components/parent/ClarifierEditor/ParentClarifiersEditor.jsx';
import { ParentTaggedPages } from './components/parent/ParentTaggedPages.jsx';
import { ParentImporter } from './components/parent/ParentImporter.jsx';
import { ParentOrganiser } from './components/parent/ParentOrganiser.jsx';
import { ParentHtmlImporter } from './components/parent/ParentHtmlImporter.jsx';
import { ParentWorksheet } from './components/parent/ParentWorksheet.jsx';
import { ParentScoreboard } from './components/parent/ParentScoreboard.jsx';
import { WorksheetMode } from './components/student/WorksheetMode.jsx';

import { useData } from './contexts/DataContext.jsx';
import { useStudy } from './contexts/StudyContext.jsx';
import { StudyGuide } from './components/StudyGuide/index.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { StudentDashboard } from './components/student/StudentDashboard.jsx';
import { TopicHome } from './components/student/TopicHome.jsx';
import { RevisionMode } from './components/student/RevisionMode.jsx';
import { ExamMode } from './components/student/ExamMode.jsx';
import { SubjectGridSkeleton, TopicHomeSkeleton } from './lib/Skeletons.jsx';
import { useConfirm } from './lib/Toast.jsx';

function resolvePage(topic, pageId) {
  const fromFull = topic._fullPages?.find((p) => p.id === pageId || p._fullData?.id === pageId);
  if (fromFull?._fullData) return fromFull._fullData;
  return null;
}

function resolveTopicFolder(topic, subjectId) {
  if (typeof topic?.folder === 'string' && topic.folder.length > 0) return topic.folder;
  const topicId = String(topic?.id || '');
  const prefix = `${subjectId}-`;
  if (topicId.startsWith(prefix)) return topicId.slice(prefix.length);
  return topicId;
}

export default function App() {
  const confirm = useConfirm();
  const [parentUnlocked, setParentUnlocked] = useState(
    sessionStorage.getItem('parent_unlocked') === 'true'
  );

  const { subjects, topics, loadingState } = useData();
  const { state: studyState, markPageRead, recordPageOpen, addStudentTag, removeStudentTag, resolveStudentTag } = useStudy();

  const [route, setRoute] = useState(window.location.hash || '#/');
  const [parentHasUnsavedChanges, setParentHasUnsavedChanges] = useState(false);
  const parentHasUnsavedChangesRef = React.useRef(parentHasUnsavedChanges);
  const lastRouteRef = React.useRef(window.location.hash || '#/');
  const suppressGuardRef = React.useRef(false);

  React.useEffect(() => {
    parentHasUnsavedChangesRef.current = parentHasUnsavedChanges;
  }, [parentHasUnsavedChanges]);

  const onParentDirtyChange = React.useCallback((isDirty) => {
    setParentHasUnsavedChanges(Boolean(isDirty));
  }, []);

  React.useEffect(() => {
    const handleHashChange = async () => {
      const nextRoute = window.location.hash || '#/';
      const previousRoute = lastRouteRef.current;
      if (suppressGuardRef.current) {
        lastRouteRef.current = nextRoute;
        setRoute(nextRoute);
        return;
      }

      const involvesParentRoute = previousRoute.startsWith('#/parent') || nextRoute.startsWith('#/parent');
      const shouldConfirm = involvesParentRoute && parentHasUnsavedChangesRef.current && nextRoute !== previousRoute;
      if (shouldConfirm) {
        const shouldLeave = await confirm({
          title: 'Leave with unsaved changes?',
          body: 'Your current parent edits have not been saved yet.',
          confirmLabel: 'Leave page',
          variant: 'danger',
        });
        if (!shouldLeave) {
          suppressGuardRef.current = true;
          window.location.hash = previousRoute;
          window.setTimeout(() => {
            suppressGuardRef.current = false;
          }, 0);
          return;
        }

        parentHasUnsavedChangesRef.current = false;
        setParentHasUnsavedChanges(false);
      }

      lastRouteRef.current = nextRoute;
      setRoute(nextRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [confirm]);

  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!parentHasUnsavedChangesRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const isAppRoute = route.startsWith('#/parent') || route.startsWith('#/student') || route.startsWith('#/topic');
  if (isAppRoute && loadingState === 'loading') {
    if (route.startsWith('#/topic')) return <TopicHomeSkeleton />;
    return (
      <div className="min-h-screen bg-paper p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="serif text-[34px] leading-tight mb-6">Loading StudyHub</div>
          <SubjectGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (route.startsWith('#/parent')) {
    if (!parentUnlocked) {
      return <ParentPinLock onUnlocked={() => setParentUnlocked(true)} />;
    }

    const parts = route.replace('#/parent', '').split('/').filter(Boolean);
    let Content = null;

    if (parts.length === 0 || parts[0] === 'subjects') {
      Content = <ParentDashboard subjects={subjects} topics={topics} />;
    } else if (parts[0] === 'import') {
      Content = <ParentImporter subjects={subjects} topics={topics} onDirtyChange={onParentDirtyChange} />;
    } else if (parts[0] === 'organise') {
      Content = <ParentOrganiser subjects={subjects} topics={topics} />;
    } else if (parts[0] === 'import-html') {
      Content = <ParentHtmlImporter subjects={subjects} topics={topics} />;
    } else if (parts[0] === 'scoreboard') {
      Content = <ParentScoreboard subjects={subjects} topics={topics} />;
    } else if (parts[0] === 'tags') {
      Content = (
        <ParentTaggedPages
          subjects={subjects}
          topics={topics}
          studentTags={studyState.studentTags || []}
          onResolveTag={({ tagId, resolutionNote }) => resolveStudentTag({ tagId, resolutionNote })}
        />
      );
    } else if (parts[0] === 'settings') {
      Content = <ParentSettings />;
    } else if (parts[0] === 'subject' && parts[1]) {
      const subjectId = parts[1];
      const subject = subjects.find((s) => s.id === subjectId);
      const subjectTopics = topics.filter((t) => t.subjectId === subjectId);

      if (parts.length === 2) {
        Content = <ParentSubjectView subject={subject} topics={subjectTopics} />;
      } else if (parts[2] === 'topic' && parts[3]) {
        const topicFolder = parts[3];

        if (parts.length === 4) {
          Content = <ParentTopicEditor subjectId={subjectId} topicFolder={topicFolder} subjects={subjects} topics={topics} onDirtyChange={onParentDirtyChange} />;
        } else if (parts[4] === 'worksheet') {
          const wsTopic = topics.find((t) => t.subjectId === subjectId && resolveTopicFolder(t, subjectId) === topicFolder);
          const wsSubjectFolder = wsTopic?._subjectFolder || subjectId;
          Content = <ParentWorksheet subjectId={subjectId} topicFolder={topicFolder} subjectFolder={wsSubjectFolder} />;
        } else if (parts[4] === 'page' && parts[5]) {
          const pageSlug = parts[5];

          if (parts.length === 6) {
            Content = <ParentPageEditor subjectId={subjectId} topicFolder={topicFolder} pageSlug={pageSlug} onDirtyChange={onParentDirtyChange} />;
          } else if (parts[6] === 'questions') {
            const topic = topics.find((t) => t.subjectId === subjectId && resolveTopicFolder(t, subjectId) === topicFolder);
            const page = topic?._fullPages?.find((p) => p.id === pageSlug || p.file?.includes(pageSlug))?._fullData;

            if (page) {
              Content = (
                <ParentQuestionsEditor
                  pageSlug={pageSlug}
                  initialQuestions={page.questions || []}
                  pageBlocks={page.blocks || []}
                  pageClarifiers={page.clarifiers || []}
                  onDirtyChange={onParentDirtyChange}
                  onSave={async (newQuestions) => {
                    const { saveJSON } = await import('./services/parentApiService.js');
                    const updatedPage = { ...page, questions: newQuestions };
                    await saveJSON(`${subjectId}/${topicFolder}/pages/${pageSlug}.json`, updatedPage);
                  }}
                />
              );
            } else {
              Content = <div>Loading page data or page not found... (Refresh or navigate from Topic Editor)</div>;
            }
          } else if (parts[6] === 'clarifiers') {
            const topic = topics.find((t) => t.subjectId === subjectId && resolveTopicFolder(t, subjectId) === topicFolder);
            const page = topic?._fullPages?.find((p) => p.id === pageSlug || p.file?.includes(pageSlug));

            if (topic) {
              Content = (
                <ParentClarifiersEditor
                  subjectId={subjectId}
                  topicFolder={topicFolder}
                  topicPages={topic._fullPages || []}
                  initialPageId={page?.id || null}
                  onDirtyChange={onParentDirtyChange}
                />
              );
            } else {
              Content = <div>Loading topic data... (Refresh or navigate from Topic Editor)</div>;
            }
          }
        }
      }
    }

    return (
      <ParentLayout
        subjects={subjects}
        topics={topics}
        studentTags={studyState.studentTags || []}
        route={route}
        hasUnsavedChanges={parentHasUnsavedChanges}
      >
        {Content || <div>Route not found</div>}
      </ParentLayout>
    );
  }

  if (route.startsWith('#/topic/')) {
    const parts = route.replace('#/topic/', '').split('/').filter(Boolean);
    const topicId = parts[0];
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return <div>Topic not found</div>;
    const subject = subjects.find((s) => s.id === topic.subjectId) || { title: topic.subjectId };

    if (parts.length >= 3 && parts[1] === 'page') {
      const pageId = parts.slice(2).join('/');
      const page = resolvePage(topic, pageId);
      if (!page) return <div>Page not found</div>;
      return (
        <StudyGuide
          subject={subject}
          topic={topic}
          page={page}
          studyState={studyState}
          onBack={() => {
            window.location.hash = `#/topic/${topic.id}`;
          }}
          onTagPage={({ pageId, pageTitle, note }) => addStudentTag({ topicId: topic.id, pageId, pageTitle, note })}
          onUntagPage={({ pageId }) => removeStudentTag({ pageId })}
          onMarkRead={(pageIdToMark) => markPageRead(topic.id, pageIdToMark)}
          onPageOpen={(pageIdToOpen) => recordPageOpen(topic.id, pageIdToOpen)}
          settings={{ geminiApiKey: localStorage.getItem('geminiApiKey') || '' }}
          onPageChange={(targetId) => {
            if (targetId === 'home') {
              window.location.hash = `#/topic/${topic.id}`;
            } else {
              window.location.hash = `#/topic/${topic.id}/page/${targetId}`;
            }
          }}
        />
      );
    }

    if (parts.length === 2 && parts[1] === 'revision') {
      return (
        <RevisionMode
          topic={topic}
          state={studyState}
          onBack={() => {
            window.location.hash = `#/topic/${topic.id}`;
          }}
          onOpenPage={(pageId) => { window.location.hash = `#/topic/${topic.id}/page/${pageId}`; }}
        />
      );
    }

    if (parts.length === 2 && parts[1] === 'worksheet') {
      return (
        <WorksheetMode
          topic={topic}
          subject={subject}
          state={studyState}
          onBack={() => { window.location.hash = `#/topic/${topic.id}`; }}
          onMarkRead={(pageId) => markPageRead(topic.id, pageId)}
          onPageOpen={(pageId) => recordPageOpen(topic.id, pageId)}
          onTagPage={({ pageId, pageTitle, note }) => addStudentTag({ topicId: topic.id, pageId, pageTitle, note })}
          onUntagPage={({ pageId }) => removeStudentTag({ pageId })}
        />
      );
    }

    if (parts.length >= 2 && parts[1] === 'exam') {
      const filterTag = parts[2];
      return (
        <ExamMode
          topic={topic}
          filterTag={filterTag}
          examDurationMinutes={topic.examDurationMinutes || 0}
          onBack={() => {
            window.location.hash = `#/topic/${topic.id}`;
          }}
        />
      );
    }

    return (
      <TopicHome
        subject={subject}
        topic={topic}
        state={studyState}
        onBack={() => {
          window.location.hash = '#/student';
        }}
        onOpenPage={(pageId) => {
          recordPageOpen(topic.id, pageId);
          window.location.hash = `#/topic/${topic.id}/page/${pageId}`;
        }}
        onOpenRevision={() => {
          window.location.hash = `#/topic/${topic.id}/revision`;
        }}
        onOpenExam={() => {
          window.location.hash = `#/topic/${topic.id}/exam`;
        }}
        onOpenWorksheet={() => {
          window.location.hash = `#/topic/${topic.id}/worksheet`;
        }}
      />
    );
  }

  if (route === '#/student') {
    return (
      <StudentDashboard
        subjects={subjects}
        topics={topics}
        state={studyState}
        onBack={() => { window.location.hash = '#/'; }}
      />
    );
  }

  return <LandingPage />;
}
