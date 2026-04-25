import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

export function FillInBlankQuestion({ question, onAnswer }) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function normalize(input) {
    return String(input || '').trim().toLowerCase();
  }

  function handleSubmit() {
    const expected = question.answer;
    let isCorrect = false;
    if (Array.isArray(expected)) {
      isCorrect = expected.map(normalize).includes(normalize(value));
    } else {
      isCorrect = normalize(expected) === normalize(value);
    }
    setSubmitted(true);
    onAnswer?.({ status: isCorrect ? 'correct' : 'incorrect', value });
  }

  return (
    <div className="mb-4">
      <div className="font-bold text-lg mb-4">
        <ContentRenderer content={question.prompt} />
      </div>
      {!submitted ? (
        <div className="flex flex-col gap-3">
          <input
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your answer"
          />
          <button onClick={handleSubmit} className="self-start px-4 py-2 rounded-lg bg-blue-600 text-white">
            Submit
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-lg border bg-gray-50">
          <div className="font-semibold mb-2">Expected answer</div>
          <div>{Array.isArray(question.answer) ? question.answer.join(' / ') : String(question.answer ?? '')}</div>
          {question.explanation && <div className="mt-3"><ContentRenderer content={question.explanation} /></div>}
        </div>
      )}
    </div>
  );
}
