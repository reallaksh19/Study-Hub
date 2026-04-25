import React, { useState } from 'react';
import { QuestionRendererExtended } from '../questions/QuestionRenderer.jsx';
import { SupportMaterialCard } from '../questions/SupportMaterialCard.jsx';
import { useStudy } from '../../contexts/StudyContext.jsx';
import { groupHelpResources } from '../../services/revisionService.js';

export function QuizSection({ topic, page, questions = [], pageBlocks = [], clarifiers = [], onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState(null);
  const [score, setScore] = useState({ correct: 0 });
  const [finished, setFinished] = useState(false);
  const { recordQuestionOutcome, addPageRevision } = useStudy();

  if (questions.length === 0) return null;
  const currentQuestion = questions[currentIndex];
  const supportPages = (currentQuestion.supportPageIds || []).map((id) => {
    const pageMeta = (topic.pages || []).find((candidate) => candidate.id === id);
    return pageMeta ? { ...pageMeta, topicId: topic.id } : null;
  }).filter(Boolean);
  const supportResources = groupHelpResources(page).filter((resource) => (currentQuestion.supportResourceIds || []).length === 0 || (currentQuestion.supportResourceIds || []).includes(resource.id));

  const handleAnswer = (result) => {
    recordQuestionOutcome({ topicId: topic.id, page, question: currentQuestion, result });
    if (result.status === 'correct') {
      setStatus('correct');
      setScore((prev) => ({ correct: prev.correct + 1 }));
    } else if (result.status === 'incorrect' || result.status === 'wrong') {
      setStatus('wrong');
    } else if (result.status === 'submitted') {
      setStatus('submitted');
    } else if (result.status === 'explored') {
      setStatus('explored');
      setTimeout(() => handleNext(), 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStatus(null);
    } else {
      setFinished(true);
      onComplete?.();
    }
  };

  if (finished) {
    return (
      <div className="quiz-section mt-12 p-8 border rounded-xl bg-green-50 text-center">
        <h3 className="font-bold text-2xl mb-2 text-green-800">Quiz completed</h3>
        <p className="text-green-700 text-lg">You scored {score.correct} out of {questions.filter((question) => question.type !== 'concept_strengthener').length}</p>
      </div>
    );
  }

  return (
    <div className="quiz-section mt-12 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-2xl">Check your understanding</h3>
        <div className="text-gray-500 text-sm font-bold">Question {currentIndex + 1} of {questions.length}</div>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <QuestionRendererExtended question={currentQuestion} onAnswer={handleAnswer} />

        {status === 'wrong' && (
          <SupportMaterialCard
            hint={currentQuestion.hint}
            clarifiers={(currentQuestion.supportClarifierIds || []).map((id) => clarifiers.find((clarifier) => clarifier.id === id)).filter(Boolean)}
            supportBlocks={(currentQuestion.supportBlockIds || []).map((id) => pageBlocks.find((block) => block.id === id)).filter(Boolean)}
            supportPages={supportPages}
            supportResources={supportResources}
            retryAllowed={true}
            onRetry={() => setStatus(null)}
            onSaveForRevision={() => addPageRevision(page.id, 'manual')}
            onNext={handleNext}
          />
        )}

        {(status === 'correct' || status === 'submitted') && (
          <div className="mt-6 pt-4 border-t flex justify-end">
            <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Next question →</button>
          </div>
        )}
      </div>
    </div>
  );
}
