import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

export function TrueFalseQuestion({ question, onAnswer, darkMode }) {
  const [status, setStatus] = useState(null); // 'correct' | 'incorrect'

  const handleSubmit = (ans) => {
    // question.answer can be boolean or "True"/"False"
    let correct = false;
    if (typeof question.answer === 'boolean') {
      correct = ans === question.answer;
    } else {
      correct = String(ans).toLowerCase() === String(question.answer).toLowerCase();
    }

    setStatus(correct ? 'correct' : 'incorrect');
    if (onAnswer) onAnswer({ status: correct ? 'correct' : 'incorrect', value: ans });
  };

  return (
    <div className="true-false-question mb-4">
      <div className="font-bold text-lg mb-4">
        <ContentRenderer content={question.prompt} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit(true)}
          disabled={status !== null}
          className="flex-1 py-4 border rounded-lg text-center font-bold text-lg hover:bg-gray-50 transition-colors"
        >
          True
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={status !== null}
          className="flex-1 py-4 border rounded-lg text-center font-bold text-lg hover:bg-gray-50 transition-colors"
        >
          False
        </button>
      </div>

      {status !== null && (
        <div className={`mt-4 p-4 rounded-lg font-medium text-sm ${status === 'correct' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="mb-2 text-lg font-bold">{status === 'correct' ? '✓ Correct!' : '✗ Incorrect'}</div>
          {question.explanation && <ContentRenderer content={question.explanation} />}
        </div>
      )}
    </div>
  );
}
