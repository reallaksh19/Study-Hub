import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

export function McqQuestion({ question, onAnswer, darkMode }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [status, setStatus] = useState(null); // 'correct' | 'incorrect'

  const handleSubmit = (idx) => {
    setSelectedIdx(idx);

    // Support integer index or A/B/C/D letter
    let correct = false;
    if (typeof question.answer === 'number') {
      correct = idx === question.answer;
    } else if (typeof question.answer === 'string') {
      const charCode = question.answer.toUpperCase().charCodeAt(0) - 65; // A->0, B->1
      correct = idx === charCode;
    }

    setStatus(correct ? 'correct' : 'incorrect');
    if (onAnswer) onAnswer({ status: correct ? 'correct' : 'incorrect', value: idx });
  };

  return (
    <div className="mcq-question mb-4">
      <div className="font-bold text-lg mb-4">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="space-y-3">
        {(question.options || []).map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          let btnClass = "w-full text-left p-4 border rounded-lg transition-colors border-gray-300 hover:bg-gray-50 bg-white";

          if (status !== null) {
             const isCorrectAnswer = (typeof question.answer === 'number' && idx === question.answer) ||
                                     (typeof question.answer === 'string' && idx === (question.answer.toUpperCase().charCodeAt(0) - 65));

             if (isSelected) {
                btnClass = isCorrectAnswer ? "w-full text-left p-4 border-2 rounded-lg bg-green-50 border-green-500 font-bold"
                                           : "w-full text-left p-4 border-2 rounded-lg bg-red-50 border-red-500 font-bold";
             } else if (isCorrectAnswer && status === 'incorrect') {
                btnClass = "w-full text-left p-4 border-2 rounded-lg bg-green-50 border-green-500 opacity-80";
             } else {
                btnClass = "w-full text-left p-4 border rounded-lg bg-gray-50 border-gray-200 opacity-60";
             }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSubmit(idx)}
              className={btnClass}
              disabled={status !== null}
            >
              <div className="flex">
                 <span className="font-bold mr-4 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                 <div><ContentRenderer content={opt} /></div>
              </div>
            </button>
          );
        })}
      </div>

      {status !== null && question.explanation && (
        <div className={`mt-4 p-4 rounded-lg font-medium text-sm ${status === 'correct' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <ContentRenderer content={question.explanation} />
        </div>
      )}
    </div>
  );
}
