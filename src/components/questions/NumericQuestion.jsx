import React, { useState } from 'react';

export function NumericQuestion({ question, onAnswer }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState(null); // 'correct' | 'incorrect' | null

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    const correct = Math.abs(numValue - question.answer) <= (question.tolerance || 0);
    setStatus(correct ? 'correct' : 'incorrect');
    if (onAnswer) onAnswer({ status: correct ? 'correct' : 'incorrect', value: numValue });
  };

  return (
    <div className="numeric-question mb-4">
      <p className="font-bold mb-2">{question.prompt}</p>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          className="border p-2 rounded w-32"
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={status !== null}
        />
        {question.unit && <span>{question.unit}</span>}
      </div>

      {status === null ? (
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
      ) : (
        <div className={`mt-2 font-bold ${status === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {status === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
        </div>
      )}
    </div>
  );
}
