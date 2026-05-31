// ParentImporter.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentImporter.jsx.
// Preserves: 3-tab shell (paste / html / zip), default tab from hash,
// renders existing PasteImportWizard / ParentHtmlImporter / ZipPackPanel unchanged.

import React, { useState } from 'react';
import { PasteImportWizard } from './Importer/PasteImport/PasteImportWizard.jsx';
import { ZipPackPanel } from './Importer/ZipPackPanel.jsx';
import { ParentHtmlImporter } from './ParentHtmlImporter.jsx';

const TABS = [
  { id: 'paste', emoji: '📝', label: 'Paste content', desc: 'Auto-parse text into pages, questions & blocks' },
  { id: 'html',  emoji: '🌐', label: 'HTML source',   desc: 'Import a webpage or HTML file by pasting its source' },
  { id: 'zip',   emoji: '📦', label: 'ZIP pack',      desc: 'Import or export a full topic ZIP pack' },
];

export function ParentImporter({ subjects = [], topics = [] }) {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash;
    if (hash.includes('zip')) return 'zip';
    if (hash.includes('html')) return 'html';
    return 'paste';
  });
  const active = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="max-w-[1100px]">
      <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.05em] mb-1.5">
        Bring content into Study Hub
      </div>
      <h1 className="serif text-[34px] tracking-tight m-0 leading-[1.05] mb-6">Import content</h1>

      {/* Tab bar */}
      <div className="flex border-b border-line gap-0 mb-1 overflow-x-auto">
        {TABS.map((tab) => {
          const on = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 sm:px-5 py-3 transition flex flex-col items-start gap-0.5 -mb-px whitespace-nowrap"
              style={{
                borderBottom: `2px solid ${on ? 'var(--color-ink)' : 'transparent'}`,
                color: on ? 'var(--color-ink)' : 'var(--color-muted)',
                fontWeight: on ? 600 : 500,
                fontSize: 13.5,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span>{tab.emoji} {tab.label}</span>
              <span className="text-[11px] font-medium text-muted">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {activeTab === 'paste' && <PasteImportWizard subjects={subjects} topics={topics} />}
        {activeTab === 'html'  && <ParentHtmlImporter subjects={subjects} topics={topics} />}
        {activeTab === 'zip'   && <ZipPackPanel subjects={subjects} topics={topics} />}
      </div>
    </div>
  );
}
