import React from 'react';
import { HintCard } from './HintCard.jsx';
import { BlockRenderer } from '../blocks/BlockRenderer.jsx';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

export function SupportMaterialCard({ hint, clarifiers = [], supportBlocks = [], supportPages = [], supportResources = [], retryAllowed, onRetry, onNext, onSaveForRevision }) {
  const getClarifierStyle = (type) => {
    switch (type) {
      case 'tip': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💡' };
      case 'warning': return { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' };
      case 'key_fact': return { bg: 'bg-indigo-50', border: 'border-indigo-500', icon: '📌' };
      case 'common_mistake': return { bg: 'bg-red-50', border: 'border-red-200', icon: '❌' };
      case 'did_you_know': return { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🌟' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'ℹ️' };
    }
  };

  return (
    <div className="support-material-card border-t border-gray-200 pt-4 mt-4">
      {hint && <HintCard text={hint} />}

      {clarifiers.map((clarifier) => {
        const style = getClarifierStyle(clarifier.type);
        return (
          <div key={clarifier.id} className={`${style.bg} ${style.border} border rounded p-3 mb-3 text-sm`}>
            <div className="font-bold mb-1 flex items-center">
              <span className="mr-2">{style.icon}</span>
              {clarifier.title}
            </div>
            <div><ContentRenderer content={clarifier.body} /></div>
          </div>
        );
      })}

      {supportBlocks.map((block) => (
        <div key={block.id} className="mb-4">
          <BlockRenderer block={block} />
        </div>
      ))}

      {supportPages.length > 0 && (
        <div className="mb-4 border rounded-lg p-3 bg-gray-50">
          <div className="font-semibold mb-2">Related pages to revisit</div>
          <div className="space-y-2">
            {supportPages.map((page) => (
              <a key={page.id} href={`#/topic/${page.topicId}/page/${page.id}`} className="block text-blue-700 hover:underline">{page.title}</a>
            ))}
          </div>
        </div>
      )}

      {supportResources.length > 0 && (
        <div className="mb-4 border rounded-lg p-3 bg-gray-50">
          <div className="font-semibold mb-2">Helpful resources</div>
          <div className="space-y-2">
            {supportResources.map((resource) => (
              <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="block text-blue-700 hover:underline">
                {resource.title}
                <div className="text-xs text-gray-500">{resource.whyThisHelps}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4 flex-wrap">
        {retryAllowed && <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Try again</button>}
        <button onClick={onSaveForRevision} className="px-4 py-2 border border-amber-300 rounded hover:bg-amber-50">Save for revision</button>
        <button onClick={onNext} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Move on →</button>
      </div>
    </div>
  );
}
