import React, { useState } from 'react';
import { ClarifierForm } from './ClarifierForm.jsx';
import { generateClarifierId } from '../../../utils/idFactory.js';
import { saveJSON } from '../../../services/parentApiService.js';
import { useToast } from '../../../lib/Toast.jsx';

export function ParentClarifiersEditor({ subjectId, topicFolder, topicPages = [], initialPageId = null, onDirtyChange }) {
  const toast = useToast();
  const [selectedPageId, setSelectedPageId] = useState(initialPageId || topicPages[0]?.id || null);
  const [selectedId, setSelectedId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const pageObj = topicPages.find((p) => p.id === selectedPageId);
  const pageSlug = pageObj?.file?.split('/').pop()?.replace('.json', '') || selectedPageId;
  const initialClarifiers = pageObj?._fullData?.clarifiers || [];
  const [clarifiers, setClarifiers] = useState(initialClarifiers);

  React.useEffect(() => {
    setClarifiers(initialClarifiers);
    setSelectedId(null);
    setHasUnsavedChanges(false);
  }, [selectedPageId, pageObj?.id]);

  React.useEffect(() => {
    if (typeof onDirtyChange === 'function') onDirtyChange(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  React.useEffect(() => {
    return () => {
      if (typeof onDirtyChange === 'function') onDirtyChange(false);
    };
  }, [onDirtyChange]);

  const saveClarifiers = async (updatedClarifiers) => {
    if (!pageObj) return;
    const updatedPage = { ...pageObj._fullData, clarifiers: updatedClarifiers };
    await saveJSON(`${subjectId}/${topicFolder}/pages/${pageSlug}.json`, updatedPage);
    setHasUnsavedChanges(false);
    toast.show('Clarifiers saved.', { variant: 'success' });
  };

  const handleAdd = () => {
    const newId = generateClarifierId(pageSlug, clarifiers.length + 1);
    const newClarifier = { id: newId, type: 'tip', title: 'New Tip', body: '' };
    setClarifiers([...clarifiers, newClarifier]);
    setSelectedId(newId);
    setHasUnsavedChanges(true);
  };

  const handleChange = (id, newClarifier) => {
    setClarifiers(clarifiers.map((c) => (c.id === id ? newClarifier : c)));
    setHasUnsavedChanges(true);
  };

  const handleSaveWithFallbackAlert = () => {
    saveClarifiers(clarifiers).catch(() => toast.show('Failed to save clarifiers.', { variant: 'error' }));
  };

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-gray-50">
        <button onClick={() => window.history.back()} className="text-sm text-indigo-600 hover:underline">← Back to page</button>
        <span className="text-xs text-gray-500">Clarifiers editor</span>
      </div>
      <div className="p-4 border-b bg-gray-50 flex items-center">
        <label className="font-bold mr-4">Select Page:</label>
        <select
          className="border rounded p-2"
          value={selectedPageId || ''}
          onChange={(e) => setSelectedPageId(e.target.value)}
        >
          {topicPages.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <button onClick={handleSaveWithFallbackAlert} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded font-bold">
          Save
        </button>
      </div>
      <div className="flex h-[calc(100vh-180px)] border rounded bg-white overflow-hidden">
        <div className="w-1/3 border-r pr-4 flex flex-col p-4">
          <button onClick={handleAdd} className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold p-2 rounded mb-4">
            + Add Clarifier
          </button>
          <div className="flex-1 overflow-y-auto">
            {clarifiers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`p-3 mb-2 border rounded cursor-pointer ${c.id === selectedId ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <div className="text-xs text-gray-500 font-bold uppercase">{c.type}</div>
                <div className="text-sm font-bold">{c.title || '(Untitled)'}</div>
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
              Save Clarifiers
            </button>
          </div>
          <ClarifierForm
            clarifier={clarifiers.find((c) => c.id === selectedId)}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
