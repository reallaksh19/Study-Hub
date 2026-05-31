import React from 'react';

import { ConceptStrengthenerQuestion } from './ConceptStrengthenerQuestion.jsx';
import { ShortAnswerQuestion } from './ShortAnswerQuestion.jsx';
import { NumericQuestion } from './NumericQuestion.jsx';
import { McqQuestion } from './McqQuestion.jsx';
import { TrueFalseQuestion } from './TrueFalseQuestion.jsx';
import { MatchFollowingQuestion } from './MatchFollowingQuestion.jsx';
import { AssertionReasonQuestion } from './AssertionReasonQuestion.jsx';
import { FillInBlankQuestion } from './FillInBlankQuestion.jsx';

export function QuestionRendererExtended({ question, onAnswer, darkMode }) {
  if (!question) return null;
  switch (question.type) {
    case 'concept_strengthener':
    case 'strengthener':
      return <ConceptStrengthenerQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'short_answer':
      return <ShortAnswerQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'numeric':
      return <NumericQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'mcq':
    case 'multiple_choice':
      return <McqQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'true_false':
    case 'tf':
      return <TrueFalseQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'fill_blank':
    case 'fill':
    case 'fill_in_blank':
      return <FillInBlankQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'matching':
    case 'match_following':
      return <MatchFollowingQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    case 'assertion_reason':
      return <AssertionReasonQuestion question={question} onAnswer={onAnswer} darkMode={darkMode} />;
    default:
      return <div className="text-gray-400 bg-gray-100 p-2 mb-4">Unsupported question type: {question.type}</div>;
  }
}
