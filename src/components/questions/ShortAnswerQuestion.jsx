import React, { useState } from 'react';

export function ShortAnswerQuestion({ question, onAnswer }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (onAnswer) onAnswer({ status: 'submitted', answer });
  };

  return (
    <div className="short-answer-question mb-4">
      <p className="font-bold mb-2">{question.prompt}</p>

      {!submitted ? (
        <div>
          <textarea
            className="w-full border p-2 rounded h-24 mb-2"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
        </div>
      ) : (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h4 className="font-bold text-gray-700 mb-2">Model Answer:</h4>
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: question.modelAnswer }} />
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded">Self-mark: Got it ✓</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded">Need more practice ✗</button>
          </div>
        </div>
      )}
    </div>
  );
}
