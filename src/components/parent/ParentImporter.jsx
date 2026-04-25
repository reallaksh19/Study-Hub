import React, { useState } from 'react';
import { PasteImportWizard } from './Importer/PasteImport/PasteImportWizard.jsx';
import { ZipPackPanel } from './Importer/ZipPackPanel.jsx';
import { ParentHtmlImporter } from './ParentHtmlImporter.jsx';

const TABS = [
  { id: 'paste', label: '&#x1F4DD; Paste Content', desc: 'Auto-parse text into pages, questions & blocks' },
  { id: 'html',  label: '&#x1F310; HTML Source',   desc: 'Import a webpage or HTML file by pasting its source' },
  { id: 'zip',   label: '&#x1F4E6; ZIP Pack',       desc: 'Import or export a full topic ZIP pack' },
];

export function ParentImporter({ subjects = [], topics = [] }) {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash;
    if (hash.includes('zip')) return 'zip';
    if (hash.includes('html')) return 'html';
    return 'paste';
  });

  const active = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Content</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choose how you want to bring content into Study Hub.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            dangerouslySetInnerHTML={{ __html: tab.label }}
          />
        ))}
      </div>

      {/* Active tab description */}
      <p className="text-xs text-gray-400 mb-5 -mt-3">{active.desc}</p>

      <div>
        {activeTab === 'paste' && (
          <PasteImportWizard subjects={subjects} topics={topics} />
        )}
        {activeTab === 'html' && (
          <ParentHtmlImporter subjects={subjects} topics={topics} />
        )}
        {activeTab === 'zip' && (
          <ZipPackPanel subjects={subjects} topics={topics} />
        )}
      </div>
    </div>
  );
}
