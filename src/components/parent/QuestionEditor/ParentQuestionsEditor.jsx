import React, { useState } from 'react';
import { QuestionForm } from './QuestionForm.jsx';
import { generateQuestionId } from '../../../utils/idFactory.js';
import { useToast } from '../../../lib/Toast.jsx';

export function ParentQuestionsEditor({
  pageSlug,
  initialQuestions = [],
  pageBlocks = [],
  pageClarifiers = [],
  onSave,
  onDirtyChange
}) {
  const toast = useToast();
  const [questions, setQuestions] = useState(initialQuestions);
  const [selectedId, setSelectedId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  React.useEffect(() => {
    if (typeof onDirtyChange === 'function') onDirtyChange(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  React.useEffect(() => {
    return () => {
      if (typeof onDirtyChange === 'function') onDirtyChange(false);
    };
  }, [onDirtyChange]);

  const handleAddQuestion = () => {
    const newId = generateQuestionId(pageSlug, questions.length + 1);
    const newQ = { id: newId, type: 'mcq', prompt: '' };
    setQuestions([...questions, newQ]);
    setSelectedId(newId);
    setHasUnsavedChanges(true);
  };

  const handleChange = (id, newQuestion) => {
    setQuestions(questions.map((q) => (q.id === id ? newQuestion : q)));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    await onSave(questions);
    setHasUnsavedChanges(false);
  };

  const handleSaveWithFallbackAlert = () => {
    handleSave()
      .then(() => toast.show('Questions saved.', { variant: 'success' }))
      .catch(() => toast.show('Failed to save questions.', { variant: 'error' }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-gray-50 flex-shrink-0">
        <button onClick={() => window.history.back()} className="text-sm text-indigo-600 hover:underline">← Back to page</button>
        <span className="text-xs text-gray-500 ml-2">Questions editor — {pageSlug}</span>
      </div>
    <div className="flex flex-1 overflow-hidden border rounded bg-white">
      <div className="w-1/3 border-r pr-4 flex flex-col p-4">
        <button onClick={handleAddQuestion} className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold p-2 rounded mb-4">
          + Add Question
        </button>
        <button onClick={handleSaveWithFallbackAlert} className="w-full bg-blue-600 text-white font-bold p-2 rounded mb-4">
          Save
        </button>
        <div className="flex-1 overflow-y-auto">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedId(q.id)}
              className={`p-3 mb-2 border rounded cursor-pointer ${q.id === selectedId ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
            >
              <div className="text-xs text-gray-500 font-bold uppercase">{q.type}</div>
              <div className="text-sm truncate">{q.prompt || '(Empty prompt)'}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-semibold text-gray-500">
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </div>
          <button onClick={handleSaveWithFallbackAlert} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Save Questions
          </button>
        </div>
        <QuestionForm
          question={questions.find((q) => q.id === selectedId)}
          pageBlocks={pageBlocks}
          pageClarifiers={pageClarifiers}
          onChange={handleChange}
        />
      </div>
    </div>
    </div>
  );
}
