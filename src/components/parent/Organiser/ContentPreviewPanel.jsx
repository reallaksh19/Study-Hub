import React, { Component } from 'react';
import { BlockRenderer } from '../../blocks/BlockRenderer.jsx';

class BlockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="border border-amber-200 rounded p-3 bg-amber-50 text-xs font-mono">
          <span className="text-amber-700 font-semibold">&#9888; Unknown block type</span>
          <pre className="mt-1 text-amber-600 overflow-x-auto">{JSON.stringify(this.props.block, null, 2)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function SingleBlock({ block }) {
  return (
    <BlockErrorBoundary block={block}>
      <BlockRenderer block={block} />
    </BlockErrorBoundary>
  );
}

export function ContentPreviewPanel({ page, selectedBlock, mode }) {
  const [previewMode, setPreviewMode] = React.useState(mode || 'raw');

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Click a page or block to preview
      </div>
    );
  }

  const blocks = page.blocks || [];
  const displayBlocks = selectedBlock && previewMode === 'raw' ? [selectedBlock] : blocks;

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 flex-shrink-0">
        {['raw', 'student'].map((m) => (
          <button
            key={m}
            onClick={() => setPreviewMode(m)}
            className={`text-xs px-2.5 py-1 rounded font-medium capitalize ${previewMode === m ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {m}
          </button>
        ))}
        {selectedBlock && previewMode === 'raw' && (
          <span className="text-xs text-gray-400 ml-1">(single block)</span>
        )}
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-4">
        {previewMode === 'student' && (
          <h1 className="text-xl font-bold text-gray-800 mb-4">{page.title}</h1>
        )}

        <div className="prose prose-sm max-w-none">
          {displayBlocks.map((block, i) => (
            <SingleBlock key={block.id || i} block={block} />
          ))}
        </div>

        {previewMode === 'student' && (page.clarifiers || []).length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Clarifiers</h3>
            <div className="space-y-2">
              {(page.clarifiers || []).map((c, i) => (
                <div key={c.id || i} className="bg-blue-50 border border-blue-100 rounded p-3">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">{c.type}</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{c.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {previewMode === 'student' && (page.questions || []).length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded px-3 py-1.5">
              <span className="text-purple-700 font-semibold text-sm">{page.questions.length}</span>
              <span className="text-xs text-purple-600">question{page.questions.length !== 1 ? 's' : ''} on this page</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
