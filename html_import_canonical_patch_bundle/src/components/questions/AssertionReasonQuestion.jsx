import React, { useState } from 'react';
import { ContentRenderer } from '../common/ContentRenderer.jsx';

const OPTIONS = [
  { id: 'both_true_reason_explains_assertion', label: 'Both A and R are true, and R correctly explains A.' },
  { id: 'both_true_reason_not_explain', label: 'Both A and R are true, but R does not explain A.' },
  { id: 'assertion_true_reason_false', label: 'A is true, but R is false.' },
  { id: 'assertion_false_reason_true', label: 'A is false, but R is true.' }
];

export function AssertionReasonQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    const isCorrect = selected === question.answerPattern;
    setSubmitted(true);
    onAnswer?.({ status: isCorrect ? 'correct' : 'incorrect', value: selected });
  }

  return (
    <div className="mb-4">
      <div className="space-y-3 mb-4">
        <div>
          <div className="font-semibold mb-1">Assertion</div>
          <ContentRenderer content={question.assertion} />
        </div>
        <div>
          <div className="font-semibold mb-1">Reason</div>
          <ContentRenderer content={question.reason} />
        </div>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(option => (
          <label key={option.id} className="flex items-start gap-3 border rounded-lg p-3 cursor-pointer">
            <input
              type="radio"
              name={question.id}
              value={option.id}
              disabled={submitted}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
              className="mt-1"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} disabled={!selected} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
          Submit
        </button>
      ) : (
        <div className={`mt-4 p-4 rounded-lg border ${selected === question.answerPattern ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
          <div className="font-semibold mb-2">{selected === question.answerPattern ? 'Correct!' : 'Not quite.'}</div>
          {question.explanation && <ContentRenderer content={question.explanation} />}
        </div>
      )}
    </div>
  );
}
