import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { ContentPackSchema } from '../../../content/contentPackSchema.js';
import { exportPack } from '../../../services/contentExportService.js';
import { createDirectory, saveJSON } from '../../../services/parentApiService.js';
import { getTopicFolder } from '../../../utils/topicUtils.js';

// ─── Agent Instructions Modal ─────────────────────────────────────────────────

const AGENT_TABS = ['Structure', 'Topic & Page', 'Blocks', 'Questions', 'Clarifiers', 'Example'];

// Plain-text content for each tab (copied when user clicks "Copy tab")
const TAB_TEXT = {
  'Structure': `ZIP Pack — Structure

The ZIP must contain exactly one file at the root named content-pack.json.

{
  "version": 1,
  "topics": [ TopicObject, ... ],
  "pages": {
    "{pageId}": PageObject,
    ...
  }
}

Rules:
- version: must be 1
- topics: array of TopicObject (see Topic & Page tab)
- pages: object keyed by pageId → PageObject
- IDs use only lowercase letters, numbers, and hyphens
- subjectId must match an existing subject folder (e.g. physics, mathematics)`,

  'Topic & Page': `ZIP Pack — Topic & Page Objects

Topic Object:
{
  "id": "{subjectId}-{topicSlug}",
  "subjectId": "{subjectId}",
  "title": "Human readable title",
  "folder": "{topicSlug}",
  "difficulty": "easy | medium | hard",
  "estimatedMinutes": 30,
  "pages": [
    {
      "id": "{subjectId}-{topicSlug}-{pageSlug}",
      "file": "pages/{pageSlug}.json",
      "title": "Page title",
      "order": 1,
      "estimatedMinutes": 10,
      "difficulty": "easy | medium | hard"
    }
  ]
}

Page Object (in "pages" dictionary):
{
  "id": "{subjectId}-{topicSlug}-{pageSlug}",
  "topicId": "{subjectId}-{topicSlug}",
  "title": "Page title",
  "blocks": [ BlockObject, ... ],
  "clarifiers": [ ClarifierObject, ... ],
  "questions": [ QuestionObject, ... ],
  "attachments": [],
  "difficulty": "easy | medium | hard",
  "estimatedMinutes": 10,
  "conceptTags": ["tag1", "tag2"]
}

ID rule: {subjectId}-{topicSlug}-{pageSlug} — three segments joined by hyphens. Slugs are lowercase, hyphens only, no spaces.`,

  'Blocks': `ZIP Pack — Block Types

Each block: { "type": "...", "data": { ... } }

Block types and required data fields:
- heading       → text (string), level (2–4)
- paragraph     → text
- bullets       → items (string[])
- equation      → latex (string), displayMode (bool)
- table         → rows (string[][], first row = header)
- worked_solution → title, steps (string[]), answer
- example       → title, scenario, solution
- callout / tip / warning / misconception → title, body
- divider       → (no data needed)
- image         → src (relative path), alt, caption (optional)
- interactive_html → assetPath (web path to .html file)

Example blocks array:
"blocks": [
  { "type": "heading", "data": { "text": "Introduction", "level": 2 } },
  { "type": "paragraph", "data": { "text": "Newton's first law states..." } },
  { "type": "equation", "data": { "latex": "F = ma", "displayMode": true } },
  { "type": "bullets", "data": { "items": ["Point A", "Point B"] } }
]`,

  'Questions': `ZIP Pack — Question Types & Exam Drill Flag

Supported types: mcq, multi_select, true_false, short_answer, numeric, fill_in_blank, match_following, assertion_reason, sequence_order, long_answer

EXAM DRILL FLAG:
Add "mode": "exam_drill" to any question to include it in the student's Exam Drill view.
Questions without this flag appear only in the page study view.

Examples:

// MCQ — appears in Exam Drill
{
  "type": "mcq",
  "mode": "exam_drill",
  "prompt": "What is Newton's 2nd law?",
  "options": ["F=mv", "F=ma", "F=m/a", "F=v/t"],
  "answer": 1,
  "explanation": "Force equals mass times acceleration.",
  "conceptTags": ["newton", "dynamics"]
}

// Short answer — study view only (no mode flag)
{
  "type": "short_answer",
  "prompt": "Define inertia in your own words.",
  "modelAnswer": "Tendency of an object to resist change in motion."
}

// Numeric — in Exam Drill
{
  "type": "numeric",
  "mode": "exam_drill",
  "prompt": "A 5kg object accelerates at 3 m/s². Find the force.",
  "answer": 15,
  "tolerance": 0.5,
  "unit": "N"
}

// True/False — in Exam Drill
{
  "type": "true_false",
  "mode": "exam_drill",
  "prompt": "Mass and weight are the same quantity.",
  "answer": false,
  "explanation": "Mass is scalar; weight is the gravitational force on mass."
}

WORKSHEET USE:
No special flag needed. All pages appear in the Worksheet Planner where the parent selects which pages to include.
Set estimatedMinutes on each page so the planner shows total time.`,

  'Clarifiers': `ZIP Pack — Clarifier Types

Clarifiers are contextual notes shown alongside the page.

{
  "type": "tip | warning | key_fact | common_mistake | did_you_know",
  "title": "Short label",
  "body": "Detailed explanation shown to the student."
}

Types:
- tip            → Helpful hints, study strategies, mnemonic devices
- warning        → Common pitfalls or tricky edge cases
- key_fact       → Core definition or formula the student must know
- common_mistake → Errors students typically make, with correction
- did_you_know   → Interesting context, real-world application`,

  'Example': `ZIP Pack — Minimal Valid content-pack.json

{
  "version": 1,
  "topics": [
    {
      "id": "physics-gravity",
      "subjectId": "physics",
      "title": "Gravity",
      "folder": "gravity",
      "difficulty": "medium",
      "estimatedMinutes": 20,
      "pages": [
        {
          "id": "physics-gravity-intro",
          "file": "pages/intro.json",
          "title": "Introduction to Gravity",
          "order": 1,
          "estimatedMinutes": 10,
          "difficulty": "easy"
        },
        {
          "id": "physics-gravity-laws",
          "file": "pages/laws.json",
          "title": "Newton's Law of Gravitation",
          "order": 2,
          "estimatedMinutes": 10,
          "difficulty": "medium"
        }
      ]
    }
  ],
  "pages": {
    "physics-gravity-intro": {
      "id": "physics-gravity-intro",
      "topicId": "physics-gravity",
      "title": "Introduction to Gravity",
      "blocks": [
        { "type": "heading", "data": { "text": "What is Gravity?", "level": 2 } },
        { "type": "paragraph", "data": { "text": "Gravity is the force that attracts two masses toward each other." } }
      ],
      "clarifiers": [
        { "type": "key_fact", "title": "Definition", "body": "Gravity is a fundamental force of nature." }
      ],
      "questions": [],
      "attachments": [],
      "estimatedMinutes": 10,
      "difficulty": "easy",
      "conceptTags": ["gravity", "forces"]
    },
    "physics-gravity-laws": {
      "id": "physics-gravity-laws",
      "topicId": "physics-gravity",
      "title": "Newton's Law of Gravitation",
      "blocks": [
        { "type": "heading", "data": { "text": "Universal Gravitation", "level": 2 } },
        { "type": "equation", "data": { "latex": "F = G\\frac{m_1 m_2}{r^2}", "displayMode": true } }
      ],
      "clarifiers": [
        { "type": "tip", "title": "Remember", "body": "G = 6.674 × 10⁻¹¹ N·m²/kg²" }
      ],
      "questions": [
        {
          "type": "mcq",
          "mode": "exam_drill",
          "prompt": "What does G represent in Newton's law of gravitation?",
          "options": [
            "Gravitational acceleration",
            "Universal gravitational constant",
            "Mass of Earth",
            "Distance between masses"
          ],
          "answer": 1,
          "explanation": "G is the universal gravitational constant ≈ 6.674 × 10⁻¹¹ N·m²/kg².",
          "conceptTags": ["gravity", "constants"]
        }
      ],
      "attachments": [],
      "estimatedMinutes": 10,
      "difficulty": "medium",
      "conceptTags": ["gravity", "newton"]
    }
  }
}`
};

function CodeBlock({ code }) {
  return (
    <pre className="bg-gray-900 text-green-300 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{code}</pre>
  );
}

function AgentInstructionsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('Structure');
  const [copied, setCopied] = useState(false);

  const handleCopyTab = () => {
    const text = TAB_TEXT[activeTab] || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Agent Instructions — ZIP Pack Format</h2>
            <p className="text-sm text-gray-500 mt-0.5">Share this with an AI agent to generate a correctly structured ZIP pack</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4">&times;</button>
        </div>

        {/* Tab bar + Copy All */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b overflow-x-auto flex-shrink-0">
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {AGENT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCopied(false); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-t whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleCopyTab}
            title={`Copy all content in the ${activeTab} tab`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors mb-0.5 ${copied ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600'}`}
          >
            {copied ? '✓ Copied!' : '📋 Copy tab'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {activeTab === 'Structure' && (
            <>
              <p className="text-sm text-gray-700">The ZIP must contain exactly one file at the root named <code className="bg-gray-100 px-1 rounded font-mono text-xs">content-pack.json</code>.</p>
              <CodeBlock code={`{
  "version": 1,
  "topics": [ TopicObject, ... ],
  "pages": {
    "{pageId}": PageObject,
    ...
  }
}`} />
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li><strong>version</strong>: must be <code className="bg-gray-100 px-1 rounded font-mono text-xs">1</code></li>
                <li><strong>topics</strong>: array of TopicObject (see Topic & Page tab)</li>
                <li><strong>pages</strong>: object keyed by pageId → PageObject</li>
                <li>IDs use only lowercase letters, numbers, and hyphens</li>
                <li>subjectId must match an existing subject folder (e.g. <code className="bg-gray-100 px-1 rounded font-mono text-xs">physics</code>, <code className="bg-gray-100 px-1 rounded font-mono text-xs">mathematics</code>)</li>
              </ul>
            </>
          )}

          {activeTab === 'Topic & Page' && (
            <>
              <p className="text-sm font-semibold text-gray-700">Topic Object</p>
              <CodeBlock code={`{
  "id": "{subjectId}-{topicSlug}",
  "subjectId": "{subjectId}",
  "title": "Human readable title",
  "folder": "{topicSlug}",
  "difficulty": "easy | medium | hard",
  "estimatedMinutes": 30,
  "pages": [
    {
      "id": "{subjectId}-{topicSlug}-{pageSlug}",
      "file": "pages/{pageSlug}.json",
      "title": "Page title",
      "order": 1,
      "estimatedMinutes": 10,
      "difficulty": "easy | medium | hard"
    }
  ]
}`} />
              <p className="text-sm font-semibold text-gray-700 mt-4">Page Object (in "pages" dictionary)</p>
              <CodeBlock code={`{
  "id": "{subjectId}-{topicSlug}-{pageSlug}",
  "topicId": "{subjectId}-{topicSlug}",
  "title": "Page title",
  "blocks": [ BlockObject, ... ],
  "clarifiers": [ ClarifierObject, ... ],
  "questions": [ QuestionObject, ... ],
  "attachments": [],
  "difficulty": "easy | medium | hard",
  "estimatedMinutes": 10,
  "conceptTags": ["tag1", "tag2"]
}`} />
              <p className="text-xs text-gray-500 mt-2">
                ID rule: <code className="bg-gray-100 px-1 rounded font-mono">{'{subjectId}'}-{'{topicSlug}'}-{'{pageSlug}'}</code> — three segments joined by hyphens. Slugs are lowercase, hyphens only, no spaces.
              </p>
            </>
          )}

          {activeTab === 'Blocks' && (
            <>
              <p className="text-sm text-gray-700 mb-3">Each block: <code className="bg-gray-100 px-1 rounded font-mono text-xs">{'{ "type": "...", "data": { ... } }'}</code></p>
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">type</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">required data fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['heading', 'text (string), level (2–4)'],
                      ['paragraph', 'text'],
                      ['bullets', 'items (string[])'],
                      ['equation', 'latex (string), displayMode (bool)'],
                      ['table', 'rows (string[][], first row = header)'],
                      ['worked_solution', 'title, steps (string[]), answer'],
                      ['example', 'title, scenario, solution'],
                      ['callout / tip / warning / misconception', 'title, body'],
                      ['divider', '(no data needed)'],
                      ['image', 'src (relative path), alt, caption (optional)'],
                      ['interactive_html', 'assetPath (web path to .html file)'],
                    ].map(([type, fields]) => (
                      <tr key={type} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 border border-gray-200 font-mono text-purple-700">{type}</td>
                        <td className="px-3 py-1.5 border border-gray-200 text-gray-600">{fields}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CodeBlock code={`// Example blocks array
"blocks": [
  { "type": "heading", "data": { "text": "Introduction", "level": 2 } },
  { "type": "paragraph", "data": { "text": "Newton's first law states..." } },
  { "type": "equation", "data": { "latex": "F = ma", "displayMode": true } },
  { "type": "bullets", "data": { "items": ["Point A", "Point B"] } }
]`} />
            </>
          )}

          {activeTab === 'Questions' && (
            <>
              <p className="text-sm text-gray-700 mb-1">Supported question types:</p>
              <p className="text-xs text-gray-500 mb-3">
                <code className="bg-gray-100 px-1 rounded font-mono">mcq</code>, <code className="bg-gray-100 px-1 rounded font-mono">multi_select</code>, <code className="bg-gray-100 px-1 rounded font-mono">true_false</code>, <code className="bg-gray-100 px-1 rounded font-mono">short_answer</code>, <code className="bg-gray-100 px-1 rounded font-mono">numeric</code>, <code className="bg-gray-100 px-1 rounded font-mono">fill_in_blank</code>, <code className="bg-gray-100 px-1 rounded font-mono">match_following</code>, <code className="bg-gray-100 px-1 rounded font-mono">assertion_reason</code>, <code className="bg-gray-100 px-1 rounded font-mono">sequence_order</code>, <code className="bg-gray-100 px-1 rounded font-mono">long_answer</code>
              </p>
              <p className="text-sm font-semibold text-gray-700">Exam Drill flag</p>
              <p className="text-sm text-gray-600 mb-2">
                Add <code className="bg-gray-100 px-1 rounded font-mono text-xs">"mode": "exam_drill"</code> to any question to include it in the student's Exam Drill view. Questions without this flag appear only in the page study view.
              </p>
              <CodeBlock code={`// MCQ question — appears in Exam Drill
{
  "type": "mcq",
  "mode": "exam_drill",
  "prompt": "What is Newton's 2nd law?",
  "options": ["F=mv", "F=ma", "F=m/a", "F=v/t"],
  "answer": 1,
  "explanation": "Force equals mass times acceleration.",
  "conceptTags": ["newton", "dynamics"]
}

// Short answer — study view only (no mode flag)
{
  "type": "short_answer",
  "prompt": "Define inertia in your own words.",
  "modelAnswer": "Tendency of an object to resist change in motion."
}

// Numeric question — in Exam Drill
{
  "type": "numeric",
  "mode": "exam_drill",
  "prompt": "A 5kg object accelerates at 3 m/s². Find the force.",
  "answer": 15,
  "tolerance": 0.5,
  "unit": "N"
}

// True/False — in Exam Drill
{
  "type": "true_false",
  "mode": "exam_drill",
  "prompt": "Mass and weight are the same quantity.",
  "answer": false,
  "explanation": "Mass is scalar; weight is the gravitational force on mass."
}`} />
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
                <strong>Worksheet use:</strong> No special flag needed. All pages appear in the Worksheet Planner where the parent selects which pages to include. Set <code className="bg-indigo-100 px-1 rounded font-mono text-xs">estimatedMinutes</code> on each page so the planner shows total time.
              </div>
            </>
          )}

          {activeTab === 'Clarifiers' && (
            <>
              <p className="text-sm text-gray-700 mb-3">Clarifiers are contextual notes shown alongside the page. Each clarifier:</p>
              <CodeBlock code={`{
  "type": "tip | warning | key_fact | common_mistake | did_you_know",
  "title": "Short label",
  "body": "Detailed explanation shown to the student."
}`} />
              <div className="overflow-x-auto mt-3">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">type</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">when to use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['tip', 'Helpful hints, study strategies, mnemonic devices'],
                      ['warning', 'Common pitfalls or tricky edge cases'],
                      ['key_fact', 'Core definition or formula the student must know'],
                      ['common_mistake', 'Errors students typically make, with correction'],
                      ['did_you_know', 'Interesting context, real-world application'],
                    ].map(([type, usage]) => (
                      <tr key={type} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 border border-gray-200 font-mono text-green-700">{type}</td>
                        <td className="px-3 py-1.5 border border-gray-200 text-gray-600">{usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'Example' && (
            <>
              <p className="text-sm text-gray-700 mb-3">Minimal valid <code className="bg-gray-100 px-1 rounded font-mono text-xs">content-pack.json</code> with 1 topic, 2 pages, exam-drill question:</p>
              <CodeBlock code={`{
  "version": 1,
  "topics": [
    {
      "id": "physics-gravity",
      "subjectId": "physics",
      "title": "Gravity",
      "folder": "gravity",
      "difficulty": "medium",
      "estimatedMinutes": 20,
      "pages": [
        {
          "id": "physics-gravity-intro",
          "file": "pages/intro.json",
          "title": "Introduction to Gravity",
          "order": 1,
          "estimatedMinutes": 10,
          "difficulty": "easy"
        },
        {
          "id": "physics-gravity-laws",
          "file": "pages/laws.json",
          "title": "Newton's Law of Gravitation",
          "order": 2,
          "estimatedMinutes": 10,
          "difficulty": "medium"
        }
      ]
    }
  ],
  "pages": {
    "physics-gravity-intro": {
      "id": "physics-gravity-intro",
      "topicId": "physics-gravity",
      "title": "Introduction to Gravity",
      "blocks": [
        { "type": "heading", "data": { "text": "What is Gravity?", "level": 2 } },
        { "type": "paragraph", "data": { "text": "Gravity is the force that attracts two masses toward each other." } }
      ],
      "clarifiers": [
        { "type": "key_fact", "title": "Definition", "body": "Gravity is a fundamental force of nature." }
      ],
      "questions": [],
      "attachments": [],
      "estimatedMinutes": 10,
      "difficulty": "easy",
      "conceptTags": ["gravity", "forces"]
    },
    "physics-gravity-laws": {
      "id": "physics-gravity-laws",
      "topicId": "physics-gravity",
      "title": "Newton's Law of Gravitation",
      "blocks": [
        { "type": "heading", "data": { "text": "Universal Gravitation", "level": 2 } },
        { "type": "equation", "data": { "latex": "F = G\\\\frac{m_1 m_2}{r^2}", "displayMode": true } }
      ],
      "clarifiers": [
        { "type": "tip", "title": "Remember", "body": "G = 6.674 × 10⁻¹¹ N·m²/kg²" }
      ],
      "questions": [
        {
          "type": "mcq",
          "mode": "exam_drill",
          "prompt": "What does G represent in Newton's law of gravitation?",
          "options": [
            "Gravitational acceleration",
            "Universal gravitational constant",
            "Mass of Earth",
            "Distance between masses"
          ],
          "answer": 1,
          "explanation": "G is the universal gravitational constant ≈ 6.674 × 10⁻¹¹ N·m²/kg².",
          "conceptTags": ["gravity", "constants"]
        }
      ],
      "attachments": [],
      "estimatedMinutes": 10,
      "difficulty": "medium",
      "conceptTags": ["gravity", "newton"]
    }
  }
}`} />
            </>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ZIP import preview ───────────────────────────────────────────────────────

function ZipImportPreview({ pack, existingTopics, subjects, onImport, onBack }) {
  const existingFolderSet = new Set(existingTopics.map((t) => getTopicFolder(t)));

  const [selectedTopics, setSelectedTopics] = useState(
    () => new Set(pack.topics.map((t) => t.id))
  );
  const [selectedTopic, setSelectedTopic] = useState(pack.topics[0]?.id ?? null);
  // Tracks user-edited titles: pageId → new title
  const [pageTitles, setPageTitles] = useState(() =>
    Object.fromEntries(Object.entries(pack.pages).map(([id, p]) => [id, p.title]))
  );
  const [skippedPages, setSkippedPages] = useState(() => new Set());
  const [isImporting, setIsImporting] = useState(false);

  const toggleTopic = (id) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedTopics(
      selectedTopics.size === pack.topics.length
        ? new Set()
        : new Set(pack.topics.map((t) => t.id))
    );
  };

  const togglePage = (pageId) => {
    setSkippedPages((prev) => {
      const next = new Set(prev);
      next.has(pageId) ? next.delete(pageId) : next.add(pageId);
      return next;
    });
  };

  const selectedTopicObj = pack.topics.find((t) => t.id === selectedTopic);
  const selectedTopicPages = (selectedTopicObj?.pages || []).map((entry) => ({
    entry,
    page: pack.pages[entry.id]
  }));

  const totalSelected = pack.topics
    .filter((t) => selectedTopics.has(t.id))
    .reduce((acc, t) => acc + (t.pages || []).filter((p) => !skippedPages.has(p.id)).length, 0);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const filteredPack = {
        ...pack,
        topics: pack.topics.filter((t) => selectedTopics.has(t.id)),
        // Apply user-edited titles and filter skipped pages
        pages: Object.fromEntries(
          Object.entries(pack.pages)
            .filter(([id]) => !skippedPages.has(id))
            .map(([id, page]) => [id, { ...page, title: pageTitles[id] ?? page.title }])
        )
      };
      await onImport(filteredPack, subjects);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-700">
          ZIP Preview — {pack.topics.length} topic{pack.topics.length !== 1 ? 's' : ''}, {Object.keys(pack.pages).length} pages
        </span>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Choose different file
        </button>
      </div>
      <div className="flex divide-x divide-gray-200" style={{ minHeight: 360 }}>
        <div className="w-56 flex-shrink-0 p-3 space-y-1 overflow-y-auto">
          <button onClick={toggleSelectAll} className="text-xs text-indigo-600 hover:underline mb-2 block">
            {selectedTopics.size === pack.topics.length ? 'Deselect all' : 'Select all'}
          </button>
          {pack.topics.map((topic) => {
            const folder = getTopicFolder(topic);
            const exists = existingFolderSet.has(folder);
            const pageCount = (topic.pages || []).length;
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-2 rounded cursor-pointer border ${selectedTopic === topic.id ? 'border-indigo-400 bg-indigo-50' : 'border-transparent hover:bg-gray-100'}`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTopics.has(topic.id)}
                    onChange={() => toggleTopic(topic.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{topic.title}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-gray-500">{pageCount}p</span>
                      {exists
                        ? <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">&#9888; exists</span>
                        : <span className="text-xs bg-green-100 text-green-700 px-1 rounded">&#10003; new</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {selectedTopicObj ? (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{selectedTopicObj.title}</div>
              {selectedTopicPages.length === 0 && (
                <p className="text-sm text-gray-400">No pages in this topic.</p>
              )}
              {selectedTopicPages.map(({ entry, page }) => {
                const skipped = skippedPages.has(entry.id);
                const blockPreview = (page?.blocks || []).slice(0, 3).map((b) => b.type);
                return (
                  <div key={entry.id} className={`mb-2 p-2 rounded border ${skipped ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={!skipped} onChange={() => togglePage(entry.id)} className="flex-shrink-0" />
                      <input
                        type="text"
                        value={pageTitles[entry.id] ?? entry.title}
                        onChange={(e) => setPageTitles((p) => ({ ...p, [entry.id]: e.target.value }))}
                        disabled={skipped}
                        className="flex-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 bg-transparent"
                      />
                    </div>
                    {blockPreview.length > 0 && (
                      <div className="flex gap-1 mt-1 ml-6">
                        {blockPreview.map((type, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{type}</span>
                        ))}
                        {(page?.blocks || []).length > 3 && (
                          <span className="text-xs text-gray-400">+{page.blocks.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-gray-400 p-4">Click a topic to preview its pages.</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-100">
          &larr; Back
        </button>
        <button
          onClick={handleImport}
          disabled={isImporting || totalSelected === 0}
          className="px-5 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {isImporting ? 'Importing…' : `Import Selected (${totalSelected} page${totalSelected !== 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ZipPackPanel({ subjects = [], topics = [] }) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zipErrors, setZipErrors] = useState([]);
  const [previewPack, setPreviewPack] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [tagExamDrill, setTagExamDrill] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPack(subjects, topics);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const processZipFile = async (file) => {
    setZipErrors([]);
    setPreviewPack(null);
    setImportResult(null);
    try {
      const zip = await JSZip.loadAsync(file);
      const contentFile = zip.file('content-pack.json');
      if (!contentFile) throw new Error('content-pack.json not found in ZIP');
      const pack = JSON.parse(await contentFile.async('string'));
      const validation = ContentPackSchema.safeParse(pack);
      if (!validation.success) {
        setZipErrors(validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`));
        return;
      }
      setPreviewPack(validation.data);
    } catch (err) {
      setZipErrors([err.message]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processZipFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processZipFile(file);
  };

  const handleImport = async (filteredPack) => {
    // Optionally tag all questions as exam_drill
    const packToWrite = tagExamDrill ? {
      ...filteredPack,
      pages: Object.fromEntries(
        Object.entries(filteredPack.pages).map(([id, page]) => [
          id,
          {
            ...page,
            questions: (page.questions || []).map((q) => ({ ...q, mode: 'exam_drill' }))
          }
        ])
      )
    } : filteredPack;

    // Write topics concurrently
    await Promise.all(packToWrite.topics.map(async (topic) => {
      const subject = subjects.find((s) => s.id.toLowerCase() === topic.subjectId?.toLowerCase()) || { id: topic.subjectId?.toLowerCase() || 'unknown' };
      const folder = getTopicFolder(topic, subject.id);
      await createDirectory(`${subject.id}/${folder}/pages`);
      await saveJSON(`${subject.id}/${folder}/topic.json`, topic);
    }));

    // Write pages concurrently
    await Promise.all(Object.entries(packToWrite.pages).map(async ([pageId, pageData]) => {
      let subjectId, topicFolder;
      if (pageData.topicId) {
        const parts = pageData.topicId.split('-');
        subjectId = parts[0];
        topicFolder = parts.slice(1).join('-') || pageData.topicId;
      } else {
        const idParts = pageId.split('-');
        subjectId = idParts[0];
        topicFolder = idParts[1] || 'unknown';
      }
      const idParts = pageId.split('-');
      const pageSlug = idParts.slice(2).join('-') || pageId;
      const subject = subjects.find((s) => s.id.toLowerCase() === subjectId.toLowerCase()) || { id: subjectId.toLowerCase() };
      await saveJSON(`${subject.id}/${topicFolder}/pages/${pageSlug}.json`, pageData);
    }));

    setImportResult({
      topicsImported: packToWrite.topics.length,
      pagesImported: Object.keys(packToWrite.pages).length
    });
    setPreviewPack(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Export Pack</h3>
        <p className="text-sm text-gray-500 mb-3">Download all topics and pages as a portable ZIP pack.</p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded font-medium text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="text-indigo-600 font-bold">&#11015;</span>
          {isExporting ? 'Exporting…' : 'Export ZIP'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">Import Pack</h3>
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-xs font-bold hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
            title="Agent instructions for building a ZIP pack"
          >
            i
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Restore from a previously exported pack or a compatible ZIP.</p>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={tagExamDrill}
            onChange={(e) => setTagExamDrill(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">
            Tag all imported questions as <span className="font-semibold text-purple-700">Exam Drill</span>
            <span className="text-gray-400 ml-1">— adds <code className="font-mono bg-gray-100 px-0.5 rounded text-xs">mode:"exam_drill"</code> to every question</span>
          </span>
        </label>

        {!previewPack && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <p className="text-sm text-gray-500 mb-3">Drop a ZIP file here, or</p>
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-300 rounded font-medium text-sm hover:bg-gray-50">
              Choose file&hellip;
            </button>
            <input ref={fileInputRef} type="file" accept=".zip" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {zipErrors.length > 0 && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">Invalid ZIP format:</p>
            <ul className="text-xs text-red-600 space-y-0.5 list-disc pl-4">
              {zipErrors.map((e, i) => <li key={i} className="font-mono">{e}</li>)}
            </ul>
            <button onClick={() => setZipErrors([])} className="mt-2 text-xs text-red-500 hover:underline">Dismiss</button>
          </div>
        )}

        {previewPack && (
          <ZipImportPreview
            pack={previewPack}
            existingTopics={topics}
            subjects={subjects}
            onImport={handleImport}
            onBack={() => setPreviewPack(null)}
          />
        )}

        {importResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
            <p className="font-semibold text-green-800">Import complete!</p>
            <p className="text-sm text-green-700 mt-1">
              {importResult.topicsImported} topic{importResult.topicsImported !== 1 ? 's' : ''} and {importResult.pagesImported} page{importResult.pagesImported !== 1 ? 's' : ''} imported.
            </p>
            <button onClick={() => window.location.reload()} className="mt-3 px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">
              Reload now
            </button>
          </div>
        )}
      </div>

      {showInfoModal && <AgentInstructionsModal onClose={() => setShowInfoModal(false)} />}
    </div>
  );
}
