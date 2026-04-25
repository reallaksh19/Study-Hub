import React, { useState } from 'react';

import { ConceptStrengthenerQuestion } from './ConceptStrengthenerQuestion.jsx';
import { ShortAnswerQuestion } from './ShortAnswerQuestion.jsx';
import { NumericQuestion } from './NumericQuestion.jsx';
import { McqQuestion } from './McqQuestion.jsx';
import { TrueFalseQuestion } from './TrueFalseQuestion.jsx';
import { MatchFollowingQuestion } from './MatchFollowingQuestion.jsx';
import { AssertionReasonQuestion } from './AssertionReasonQuestion.jsx';
import { FillInBlankQuestion } from './FillInBlankQuestion.jsx';

// ─── Practice hint button ──────────────────────────────────────────────────────
// Shown only when question.mode === 'practice' and question.hint exists.
// Collapsed by default; click to reveal the hint text.

function PracticeHint({ hint }) {
  const [open, setOpen] = useState(false);
  if (!hint) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <span>{'💡'}</span>
        {open ? 'Hide hint' : 'Show hint'}
      </button>
      {open && (
        <div className="mt-2 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-900 leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── Wrapper: adds practice hint after any question type ─────────────────────

function withPracticeHint(RenderedQuestion, question) {
  if (question.mode !== 'practice' || !question.hint) return RenderedQuestion;
  return (
    <>
      {RenderedQuestion}
      <PracticeHint hint={question.hint} />
    </>
  );
}

export function QuestionRendererExtended({ question, onAnswer, darkMode }) {
  if (!question) return null;

  let inner;
  switch (question.type) {
    case 'concept_strengthener':
    case 'strengthener':
      inner = <ConceptStrengthenerQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'short_answer':
      inner = <ShortAnswerQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'numeric':
      inner = <NumericQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'mcq':
    case 'multiple_choice':
      inner = <McqQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'true_false':
    case 'tf':
      inner = <TrueFalseQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'fill_blank':
    case 'fill':
    case 'fill_in_blank':
      inner = <FillInBlankQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'matching':
    case 'match_following':
      inner = <MatchFollowingQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    case 'assertion_reason':
      inner = <AssertionReasonQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
      break;
    default:
      inner = <div className="text-gray-400 bg-gray-100 p-2 mb-4">Unsupported question type: {question.type}</div>;
  }

  return withPracticeHint(inner, question);
}
