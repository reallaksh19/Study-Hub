import React from 'react';
import { BlockRenderer } from '../../blocks/BlockRenderer.jsx';

export function QuestionForm({ question, pageBlocks, pageClarifiers, onChange }) {
  if (!question) return <div>Select a question</div>;

  const handleChange = (field, value) => {
    onChange(question.id, { ...question, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg border-b pb-2">Question Editor ({question.type})</h3>

      <div>
        <label className="block text-sm font-bold mb-1">Type</label>
        <select className="w-full border p-2 rounded" value={question.type || 'mcq'} onChange={e => handleChange('type', e.target.value)}>
          <option value="mcq">MCQ</option>
          <option value="true_false">True / False</option>
          <option value="short_answer">Short Answer</option>
          <option value="numeric">Numeric</option>
          <option value="concept_strengthener">Concept Strengthener</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Prompt</label>
        <textarea className="w-full border p-2 rounded h-24" value={question.prompt || ''} onChange={e => handleChange('prompt', e.target.value)} />
      </div>

      {question.type === 'mcq' && (
        <div>
          <label className="block text-sm font-bold mb-1">Options</label>
          {['A', 'B', 'C', 'D'].map((letter, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.answer === idx}
                onChange={() => handleChange('answer', idx)}
              />
              <span className="font-bold w-6">{letter}.</span>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={(question.options && question.options[idx]) || ''}
                onChange={e => {
                  const newOpts = [...(question.options || ['', '', '', ''])];
                  newOpts[idx] = e.target.value;
                  handleChange('options', newOpts);
                }}
              />
            </div>
          ))}

          <label className="block text-sm font-bold mb-1 mt-4">Explanation</label>
          <textarea className="w-full border p-2 rounded h-24" value={question.explanation || ''} onChange={e => handleChange('explanation', e.target.value)} />

          <label className="block text-sm font-bold mb-1 mt-4">Hint</label>
          <textarea className="w-full border p-2 rounded h-24" value={question.hint || ''} onChange={e => handleChange('hint', e.target.value)} />
        </div>
      )}

      {question.type === 'true_false' && (
        <div>
          <label className="block text-sm font-bold mb-1">Correct Answer</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={question.answer === true} onChange={() => handleChange('answer', true)} /> True
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={question.answer === false} onChange={() => handleChange('answer', false)} /> False
            </label>
          </div>

          <label className="block text-sm font-bold mb-1 mt-4">Explanation</label>
          <textarea className="w-full border p-2 rounded h-24" value={question.explanation || ''} onChange={e => handleChange('explanation', e.target.value)} />

          <label className="block text-sm font-bold mb-1 mt-4">Hint</label>
          <textarea className="w-full border p-2 rounded h-24" value={question.hint || ''} onChange={e => handleChange('hint', e.target.value)} />
        </div>
      )}

      {question.type === 'short_answer' && (
        <div>
          <label className="block text-sm font-bold mb-1">Model Answer</label>
          <textarea className="w-full border p-2 rounded h-24" value={question.modelAnswer || ''} onChange={e => handleChange('modelAnswer', e.target.value)} />
        </div>
      )}

      {question.type === 'numeric' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-1">Answer</label>
            <input type="number" className="w-full border p-2 rounded" value={question.answer || ''} onChange={e => handleChange('answer', parseFloat(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold mb-1">Tolerance</label>
            <input type="number" className="w-full border p-2 rounded" value={question.tolerance || ''} onChange={e => handleChange('tolerance', parseFloat(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold mb-1">Unit</label>
            <input type="text" className="w-full border p-2 rounded" value={question.unit || ''} onChange={e => handleChange('unit', e.target.value)} />
          </div>
        </div>
      )}

      {question.type === 'concept_strengthener' && (
        <>
          <div>
            <label className="block text-sm font-bold mb-1">Embed Content (KaTeX/Markdown)</label>
            <textarea className="w-full border p-2 rounded h-24" value={question.embedContent || ''} onChange={e => handleChange('embedContent', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">External Link</label>
            <input type="text" className="w-full border p-2 rounded" value={question.externalLink || ''} onChange={e => handleChange('externalLink', e.target.value)} />
          </div>
        </>
      )}

      {['mcq', 'numeric', 'short_answer'].includes(question.type) && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <label className="block text-sm font-bold mb-1">Support Block IDs</label>
          <div className="flex gap-2 flex-wrap">
             {(pageBlocks || []).map(b => (
                <label key={b.id} className="flex items-center gap-1 text-sm border px-2 py-1 rounded bg-gray-50">
                  <input
                    type="checkbox"
                    checked={(question.supportBlockIds || []).includes(b.id)}
                    onChange={e => {
                      const newIds = e.target.checked
                        ? [...(question.supportBlockIds || []), b.id]
                        : (question.supportBlockIds || []).filter(id => id !== b.id);
                      handleChange('supportBlockIds', newIds);
                    }}
                  />
                  <span className="truncate max-w-[150px]" title={b.id}>{b.type}: {b.id.split('-').pop()}</span>
                </label>
             ))}
          </div>
        </div>
      )}

      {/* ── Question mode ── */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-2">Question mode</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: undefined, label: 'Standard', icon: '📖', desc: 'Shown in study view only', activeBg: 'border-gray-400 bg-gray-50', activeText: 'text-gray-700' },
            { value: 'practice', label: 'Practice', icon: '💡', desc: 'Hint button shown to student', activeBg: 'border-amber-400 bg-amber-50', activeText: 'text-amber-700' },
            { value: 'exam_drill', label: 'Exam Drill', icon: '🎯', desc: 'Closed-book, no hints, timed', activeBg: 'border-purple-400 bg-purple-50', activeText: 'text-purple-700' },
          ].map(({ value, label, icon, desc, activeBg, activeText }) => {
            const isActive = (question.mode || undefined) === value;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleChange('mode', value)}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-lg border-2 text-center transition-colors ${isActive ? activeBg : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <span className="text-xl">{icon}</span>
                <span className={`text-xs font-semibold ${isActive ? activeText : 'text-gray-600'}`}>{label}</span>
                <span className="text-xs text-gray-400 leading-tight">{desc}</span>
              </button>
            );
          })}
        </div>
        {question.mode === 'practice' && (
          <p className="text-xs text-amber-600 mt-2">
            {'💡'} Students can click a hint button to reveal the <strong>Hint</strong> field above. Make sure a hint is filled in.
          </p>
        )}
        {question.mode === 'exam_drill' && (
          <p className="text-xs text-purple-600 mt-2">
            {'🎯'} This question appears only in the student's closed-book Exam Drill. No hints shown.
          </p>
        )}
      </div>
    </div>
  );
}
