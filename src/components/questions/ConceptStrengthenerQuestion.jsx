import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

export function ConceptStrengthenerQuestion({ question, onAnswer, darkMode }) {
  const [explored, setExplored] = useState(false);

  const handleExplore = () => {
    if (question.externalLink) {
      window.open(question.externalLink, '_blank', 'noopener,noreferrer');
    }
    if (!explored) {
      setExplored(true);
      if (onAnswer) {
        onAnswer({ status: 'explored', xpReward: question.xpReward || 5 });
      }
    }
  };

  return (
    <div className={`concept-strengthener border rounded p-6 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
      {question.embedContent && (
        <div className="mb-4 p-4 bg-gray-50 border rounded text-gray-800">
          <ContentRenderer content={question.embedContent} />
        </div>
      )}

      <div className="font-bold text-lg mb-4">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleExplore}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center"
        >
          <span className="mr-2">🔍</span> Explore Further →
        </button>

        {explored && (
          <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200 flex items-center">
            <span className="mr-1">✓</span> Explored
          </span>
        )}
      </div>
    </div>
  );
}
