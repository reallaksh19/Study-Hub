import React, { useState, useEffect } from 'react';
import { checkBackendStatus, saveJSON, createDirectory } from '../../services/parentApiService.js';

function getSubjectCardIcon(subject) {
  const normalizedTitle = String(subject?.title || '').toLowerCase();
  const normalizedId = String(subject?.id || '').toLowerCase();

  if (normalizedTitle === 'physics' || normalizedId === 'physics') return '\u269B\uFE0F';
  if (normalizedTitle === 'mathematics' || normalizedId === 'mathematics') return '\u2797';
  if (normalizedTitle === 'chemistry' || normalizedId === 'chemistry') return '\uD83E\uDDEA';
  return '\uD83D\uDCDA';
}

export function ParentDashboard({ subjects = [], topics = [] }) {
  const [backendOk, setBackendOk] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkBackendStatus().then((ok) => setBackendOk(ok));
  }, []);

  const handleAddSubject = async () => {
    const title = window.prompt('Enter new Subject title (e.g., Biology):');
    if (!title) return;

    const folder = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!folder) return;

    const newSubject = {
      id: folder,
      title,
      icon: 'BookOpen',
      color: '#10b981',
      order: subjects.length + 1
    };

    try {
      await createDirectory(folder);
      await saveJSON(`${folder}/subject.json`, newSubject);
      window.location.reload();
    } catch (err) {
      alert('Failed to create subject: Backend might be unavailable.');
    }
  };

  return (
    <div>
      {!backendOk && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center shadow-sm">
          <span className="text-2xl mr-3">{'\uD83D\uDD0C'}</span>
          <div>
            <p className="font-bold text-lg">Backend server not running</p>
            <p>Changes cannot be saved to disk. Start the server with <code className="bg-red-200 px-1 rounded">node server.js</code></p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Subjects Dashboard</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search subjects or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-indigo-500"
          />
          <button onClick={handleAddSubject} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-bold shadow-sm transition-colors flex items-center">
            <span className="mr-2">+</span> Add Subject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {subjects
          .filter((subject) => (
            subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topics.some((topic) => topic.subjectId === subject.id && topic.title?.toLowerCase().includes(searchQuery.toLowerCase()))
          ))
          .map((subject) => {
            const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
            const pageCount = subjectTopics.reduce((acc, topic) => acc + (topic.pages?.length || 0), 0);

            // Worksheet: count topics that have a saved selection
            const worksheetCount = subjectTopics.filter((topic) => {
              const folder = topic.folder || topic.id.replace(`${topic.subjectId}-`, '');
              return !!localStorage.getItem(`worksheet_selection_${topic.subjectId}_${folder}`);
            }).length;

            // Count by question mode across all pages
            const countByMode = (mode) => subjectTopics.reduce((acc, topic) => {
              return acc + (topic._fullPages || []).reduce((a, pageRef) => {
                const page = pageRef._fullData || pageRef;
                return a + (page?.questions || []).filter((q) => q.mode === mode || (mode === 'exam_drill' && q.examOnly)).length;
              }, 0);
            }, 0);

            const drillCount = countByMode('exam_drill');
            const practiceCount = countByMode('practice');

            return (
              <div key={subject.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-sm mr-4" style={{ backgroundColor: subject.color || '#4f46e5' }}>
                    {getSubjectCardIcon(subject)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{subject.title}</h3>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Topics</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{subjectTopics.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Pages</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{pageCount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">&#x1F4CB; Worksheets set</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">{worksheetCount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">&#x1F4A1; Practice Qs</span>
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">{practiceCount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-6">
                  <span className="font-medium">&#x1F3AF; Exam drill Qs</span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">{drillCount}</span>
                </div>
                <a href={`#/parent/subject/${subject.id}`} className="block w-full text-center bg-indigo-50 text-indigo-700 font-bold py-2 rounded hover:bg-indigo-100 transition-colors">
                  {'Manage content \u2192'}
                </a>
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-2">Content Operations</h3>
          <p className="text-gray-500 text-sm mb-4">Import content by pasting text, uploading a ZIP pack, or importing an HTML file. Export your current topics and pages as a ZIP.</p>
          <a
            href="#/parent/import"
            className="inline-flex items-center gap-2 border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded hover:bg-indigo-100 transition-colors"
          >
            Import / Export &rarr;
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-2">📊 Scoreboard</h3>
          <p className="text-gray-500 text-sm mb-4">View worksheet scores, exam drill results, and mastery progress across all topics.</p>
          <a
            href="#/parent/scoreboard"
            className="inline-flex items-center gap-2 border border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 rounded hover:bg-emerald-100 transition-colors"
          >
            View Scoreboard &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
