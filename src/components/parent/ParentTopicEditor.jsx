import React, { useState, useEffect } from 'react';
import { ParentPageEditor } from './ParentPageEditor.jsx';
import { ParentWorksheet } from './ParentWorksheet.jsx';
import { ParentOrganiser } from './ParentOrganiser.jsx';
import { PasteImportWizard } from './Importer/PasteImport/PasteImportWizard.jsx';
import { validateTopic } from '../../content/contentPackSchema.js';
import { readJSON, saveJSON } from '../../services/parentApiService.js';
import { slugify } from '../../utils/slugify.js';

function titleFromFolder(folder) {
  return String(folder || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildDefaultTopic(subjectId, topicFolder) {
  const fallbackTitle = titleFromFolder(topicFolder) || 'Untitled Topic';
  return {
    id: `${subjectId}-${topicFolder}`,
    subjectId,
    title: fallbackTitle,
    difficulty: 'medium',
    estimatedMinutes: 0,
    pages: []
  };
}

function normalizeTopicData(rawTopicData, subjectId, topicFolder) {
  const base = buildDefaultTopic(subjectId, topicFolder);
  const pages = Array.isArray(rawTopicData?.pages) ? rawTopicData.pages : [];
  return {
    ...base,
    ...rawTopicData,
    id: String(rawTopicData?.id || base.id),
    subjectId: String(rawTopicData?.subjectId || base.subjectId),
    title: String(rawTopicData?.title || base.title),
    pages
  };
}

const TABS = ['Pages', 'Organise', 'Worksheet', 'Import'];

export function ParentTopicEditor({ subjectId, topicFolder, subjects = [], topics = [], onDirtyChange }) {
  const [topicData, setTopicData] = useState(buildDefaultTopic(subjectId, topicFolder));
  const [activePageSlug, setActivePageSlug] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    // Support deep-link from Worksheet "Import Content" button
    const hint = sessionStorage.getItem('topicEditorInitialTab');
    if (hint && TABS.includes(hint)) {
      sessionStorage.removeItem('topicEditorInitialTab');
      return hint;
    }
    return 'Pages';
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const topicFilePath = `${subjectId}/${topicFolder}/topic.json`;
  const subjectTitle = subjects.find((s) => s.id === subjectId)?.title || subjectId;

  const resolvePageSlugFromId = (pageId) => {
    const pageMeta = (topicData.pages || []).find((page) => page.id === pageId);
    if (typeof pageMeta?.file === 'string' && pageMeta.file.startsWith('pages/')) {
      return pageMeta.file.replace(/^pages\//, '').replace(/\.json$/, '');
    }
    return String(pageId || '').split('-').pop();
  };

  useEffect(() => {
    async function load() {
      try {
        const fileData = await readJSON(topicFilePath);
        const normalizedTopic = normalizeTopicData(fileData, subjectId, topicFolder);
        setTopicData(normalizedTopic);
        if (normalizedTopic.pages.length > 0) {
          setActivePageSlug(normalizedTopic.pages[0].id);
        } else {
          setActivePageSlug(null);
        }
      } catch (err) {
        const fallbackTopic = buildDefaultTopic(subjectId, topicFolder);
        setTopicData(fallbackTopic);
        setActivePageSlug(null);
      }
    }
    load();
  }, [subjectId, topicFolder, topicFilePath]);

  useEffect(() => {
    const validation = validateTopic(topicData);
    setValidationErrors(validation.success ? [] : [validation.error]);
  }, [topicData]);

  const saveTopicMeta = async (updatedData) => {
    setSavingMeta(true);
    try {
      await saveJSON(topicFilePath, updatedData);
    } catch (err) {
      alert('Failed to save topic: ' + err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleAddPage = async () => {
    const title = window.prompt('Enter new page title:');
    if (!title) return;

    const slug = slugify(title);
    const newPageMeta = {
      id: `${subjectId}-${topicFolder}-${slug}`,
      file: `pages/${slug}.json`,
      title,
      order: (topicData.pages?.length || 0) + 1,
      estimatedMinutes: 10
    };

    const newTopicData = { ...topicData, pages: [...(topicData.pages || []), newPageMeta] };
    const blankPage = {
      id: newPageMeta.id,
      topicId: newTopicData.id,
      title,
      blocks: [],
      clarifiers: [],
      questions: []
    };

    try {
      await saveJSON(`${subjectId}/${topicFolder}/pages/${slug}.json`, blankPage);
      await saveJSON(topicFilePath, newTopicData);
      setTopicData(newTopicData);
      setActivePageSlug(newPageMeta.id);
      window.location.hash = `#/parent/subject/${subjectId}/topic/${topicFolder}/page/${slug}`;
    } catch (err) {
      alert('Failed to add page');
    }
  };

  const handlePageSelect = (pageId) => {
    const pageSlug = resolvePageSlugFromId(pageId);
    window.location.hash = `#/parent/subject/${subjectId}/topic/${topicFolder}/page/${pageSlug}`;
  };

  const handleDeleteTopic = async () => {
    // Step 1 — intent confirmation
    if (!window.confirm(`Delete topic "${topicData.title}" and ALL its pages?\n\nThis cannot be undone.`)) return;

    // Step 2 — type the topic name
    const typed = window.prompt(`To confirm, type the topic name exactly:\n\n"${topicData.title}"`);
    if (typed !== topicData.title) {
      if (typed !== null) alert('Name did not match. Deletion cancelled.');
      return;
    }

    try {
      const { deleteDirectory } = await import('../../services/parentApiService.js');
      await deleteDirectory(`${subjectId}/${topicFolder}`);
      window.location.hash = `#/parent/subject/${subjectId}`;
      window.location.reload();
    } catch (err) {
      alert('Failed to delete topic: ' + err.message);
    }
  };

  const handleExamDurationBlur = async (e) => {
    const val = parseInt(e.target.value, 10);
    const updated = { ...topicData, examDurationMinutes: isNaN(val) || val < 0 ? 0 : val };
    setTopicData(updated);
    await saveTopicMeta(updated);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-gray-500 px-4 pt-3 pb-1">
        <a href={`#/parent/subject/${subjectId}`} className="hover:text-indigo-600 hover:underline">
          {subjectTitle}
        </a>
        <span>›</span>
        <span className="text-gray-800 font-medium">{topicData.title}</span>
        {savingMeta && <span className="ml-2 text-xs text-blue-500">Saving…</span>}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-0 border-b border-gray-200 px-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'Worksheet' ? '📋 Worksheet' : tab === 'Organise' ? '🗂 Organise' : tab === 'Import' ? '📥 Import' : tab}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">

        {/* Pages tab */}
        {activeTab === 'Pages' && (
          <div className="flex h-full">
            {/* Page list */}
            <div className="w-56 flex-shrink-0 border-r flex flex-col p-4 bg-gray-50">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {(topicData.pages || []).map((pageMeta) => (
                  <div
                    key={pageMeta.id}
                    className={`p-2 cursor-pointer border rounded ${pageMeta.id === activePageSlug ? 'bg-indigo-100 border-indigo-400 font-bold' : 'bg-white hover:border-indigo-200'}`}
                    onClick={() => handlePageSelect(pageMeta.id)}
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-sm truncate">{pageMeta.title}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0">{pageMeta.estimatedMinutes}m</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddPage}
                  className="w-full mt-2 p-2 bg-white border border-dashed border-gray-400 rounded text-gray-600 hover:text-indigo-600 hover:border-indigo-400 transition-colors text-sm"
                >
                  + Add Page
                </button>
              </div>
            </div>

            {/* Page editor */}
            <div className="flex-1 overflow-y-auto bg-white">
              {activePageSlug ? (
                <ParentPageEditor
                  subjectId={subjectId}
                  topicFolder={topicFolder}
                  pageSlug={resolvePageSlugFromId(activePageSlug)}
                  onDirtyChange={onDirtyChange}
                />
              ) : (
                <div className="text-center text-gray-500 mt-20">Select a page or create a new one</div>
              )}
            </div>

            {/* Right info panel */}
            <div className="w-52 flex-shrink-0 border-l bg-gray-50 p-4 overflow-y-auto">
              <div className="mb-3 pb-2 border-b text-xs">
                {validationErrors.length === 0 ? (
                  <span className="text-green-600 font-semibold">✓ Valid</span>
                ) : (
                  <span className="text-amber-600 font-semibold">{validationErrors.length} error(s)</span>
                )}
              </div>
              {validationErrors.map((err, i) => (
                <div key={i} className="text-red-500 text-xs mb-2 p-2 bg-red-50 border border-red-200 rounded">{err}</div>
              ))}

              <div className="space-y-3 text-xs text-gray-600">
                <div><strong>Title:</strong> {topicData.title}</div>
                <div><strong>Difficulty:</strong> {topicData.difficulty}</div>
                <div><strong>Est. Time:</strong> {topicData.estimatedMinutes}m</div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Exam duration (min)</label>
                  <input
                    type="number"
                    min="0"
                    defaultValue={topicData.examDurationMinutes || ''}
                    placeholder="0 = untimed"
                    onBlur={handleExamDurationBlur}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                  <p className="text-gray-400 mt-0.5">Sets timer in student Exam Drill</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                <button
                  onClick={handleDeleteTopic}
                  className="w-full text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded px-2 py-1.5"
                >
                  🗑 Delete topic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organise tab */}
        {activeTab === 'Organise' && (
          <ParentOrganiser
            subjects={subjects}
            topics={topics}
            subjectId={subjectId}
            topicFolder={topicFolder}
            embedded
          />
        )}

        {/* Worksheet tab */}
        {activeTab === 'Worksheet' && (
          <div className="h-full overflow-y-auto p-4">
            <ParentWorksheet subjectId={subjectId} topicFolder={topicFolder} />
          </div>
        )}

        {/* Import tab */}
        {activeTab === 'Import' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="flex-1 min-w-[200px] rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
                <div className="text-sm font-semibold text-indigo-800 mb-0.5">📚 Study Pages → Worksheet</div>
                <div className="text-xs text-indigo-600">Choose "Study Pages" mode — after import, click <strong>Set up Worksheet</strong> to select pages for the student.</div>
              </div>
              <div className="flex-1 min-w-[200px] rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
                <div className="text-sm font-semibold text-purple-800 mb-0.5">🎯 Exam Drill Questions</div>
                <div className="text-xs text-purple-600">Choose "Exam Drill Questions" mode — all questions will be tagged for closed-book drill automatically.</div>
              </div>
            </div>
            <PasteImportWizard
              subjects={subjects}
              topics={topics}
              defaultSubjectId={subjectId}
              defaultTopicFolder={topicFolder}
            />
          </div>
        )}
      </div>
    </div>
  );
}
