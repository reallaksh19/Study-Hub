import React, { useState } from 'react';
import { ParentPinLock } from './components/parent/ParentPinLock.jsx';
import { ParentLayout } from './components/parent/ParentLayout.jsx';
import { ParentDashboard } from './components/parent/ParentDashboard.jsx';
import { ParentSubjectView } from './components/parent/ParentSubjectView.jsx';
import { ParentTopicEditor } from './components/parent/ParentTopicEditor.jsx';
import { ParentPageEditor } from './components/parent/ParentPageEditor.jsx';
import { ParentQuestionsEditor } from './components/parent/QuestionEditor/ParentQuestionsEditor.jsx';
import { ParentClarifiersEditor } from './components/parent/ClarifierEditor/ParentClarifiersEditor.jsx';
import { ParentHtmlImporter } from './components/parent/ParentHtmlImporter.jsx';

import { useData } from './contexts/DataContext.jsx';
import { useStudy } from './contexts/StudyContext.jsx';
import { StudyGuide } from './components/StudyGuide/index.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { TopicHome } from './components/student/TopicHome.jsx';
import { RevisionMode } from './components/student/RevisionMode.jsx';
import { ExamMode } from './components/student/ExamMode.jsx';

function resolvePage(topic, pageId) {
  const fromFull = topic._fullPages?.find((p) => p.id === pageId || p._fullData?.id === pageId);
  if (fromFull?._fullData) return fromFull._fullData;
  return null;
}

export default function App() {
  const [parentUnlocked, setParentUnlocked] = useState(
    sessionStorage.getItem('parent_unlocked') === 'true'
  );

  const { subjects, topics, loadingState } = useData();
  const { state: studyState, markPageRead, recordPageOpen, getResumePageId } = useStudy();

  const [route, setRoute] = useState(window.location.hash || '#/');

  React.useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isAppRoute = route.startsWith('#/parent') || route.startsWith('#/student') || route.startsWith('#/topic');

  if (isAppRoute && loadingState === 'loading') {
    return <div>Loading data...</div>;
  }

  // --- PARENT ROUTES ---
  if (route.startsWith('#/parent')) {
    if (!parentUnlocked) {
      return <ParentPinLock onUnlocked={() => setParentUnlocked(true)} />;
    }

    const parts = route.replace('#/parent', '').split('/').filter(Boolean);
    let Content = null;

    if (parts.length === 0) {
      Content = <ParentDashboard subjects={subjects} topics={topics} />;
    } else if (parts[0] === 'import-html') {
      Content = <ParentHtmlImporter subjects={subjects} topics={topics} />;
    } else if (parts[0] === 'subject' && parts[1]) {
      const subjectId = parts[1];
      const subject = subjects.find(s => s.id === subjectId);
      const subjectTopics = topics.filter(t => t.subjectId === subjectId);

      if (parts.length === 2) {
        Content = <ParentSubjectView subject={subject} topics={subjectTopics} />;
      } else if (parts[2] === 'topic' && parts[3]) {
        const topicFolder = parts[3];

        if (parts.length === 4) {
          Content = <ParentTopicEditor subjectId={subjectId} topicFolder={topicFolder} />;
        } else if (parts[4] === 'page' && parts[5]) {
          const pageSlug = parts[5];

          if (parts.length === 6) {
            Content = <ParentPageEditor subjectId={subjectId} topicFolder={topicFolder} pageSlug={pageSlug} />;
          } else if (parts[6] === 'questions') {
            const topic = topics.find(t => t.subjectId === subjectId && t.folder === topicFolder);
            const page = topic?._fullPages?.find(p => p.id === pageSlug || p.file?.includes(pageSlug))?._fullData;

            if (page) {
                Content = <ParentQuestionsEditor
                    pageSlug={pageSlug}
                    initialQuestions={page.questions || []}
                    pageBlocks={page.blocks || []}
                    pageClarifiers={page.clarifiers || []}
                    onSave={async (newQuestions) => {
                        const { saveJSON } = await import('./services/parentApiService.js');
                        const updatedPage = { ...page, questions: newQuestions };
                        await saveJSON(`${subjectId}/${topicFolder}/pages/${pageSlug}.json`, updatedPage);
                        alert('Questions saved!');
                    }}
                />;
            } else {
                Content = <div>Loading page data or page not found... (Refresh or navigate from Topic Editor)</div>;
            }
          }
        } else if (parts[4] === 'clarifiers') {
          const topic = topics.find(t => t.subjectId === subjectId && t.folder === topicFolder);

          if (topic) {
              Content = <ParentClarifiersEditor
                  subjectId={subjectId}
                  topicFolder={topicFolder}
                  topicPages={topic._fullPages || []}
              />;
          } else {
              Content = <div>Loading topic data...</div>;
          }
        }
      }
    }

    return <ParentLayout>{Content || <div>Route not found</div>}</ParentLayout>;
  }

  // --- STUDENT ROUTES ---
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
      return <RevisionMode topic={topic} state={studyState} onOpenPage={(pageId) => { window.location.hash = `#/topic/${topic.id}/page/${pageId}`; }} />;
    }

    if (parts.length >= 2 && parts[1] === 'exam') {
      const filterTag = parts[2];
      return <ExamMode topic={topic} filterTag={filterTag} onOpenPage={(pageId) => { window.location.hash = `#/topic/${topic.id}/page/${pageId}`; }} />;
    }

    return (
      <TopicHome
        subject={subject}
        topic={topic}
        state={studyState}
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
      />
    );
  }

  if (route === '#/student') {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
            return (
              <div key={subject.id} className="border p-6 rounded-xl shadow-sm hover:shadow-md bg-white">
                <h2 className="text-xl font-bold mb-2">{subject.title}</h2>
                <div className="space-y-3 mt-4">
                  {subjectTopics.map((topic) => (
                    <a key={topic.id} href={`#/topic/${topic.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
                      <div className="font-semibold text-blue-700">{topic.title}</div>
                      <div className="text-sm text-gray-500">{topic.pages?.length || 0} pages</div>
                    </a>
                  ))}
                  {subjectTopics.length === 0 && <div className="text-sm text-gray-500">No topics yet.</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 pt-4 border-t">
          <a href="#/parent" className="text-gray-500 hover:text-gray-800">Parent Access</a>
          <a href="#/" className="ml-4 text-gray-500 hover:text-gray-800">Back Home</a>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
