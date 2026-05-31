// QuizSection/index.jsx — UPGRADED
// Drop-in replacement for src/components/QuizSection/index.jsx.
// Preserves: state machine (idx → answer status → support → next → finished),
//            recordQuestionOutcome / addPageRevision, support pages + resources resolution,
//            SupportMaterialCard for wrong answers, finished screen with score.

import React, { useState } from 'react';
import { QuestionRendererExtended } from '../questions/QuestionRenderer.jsx';
import { SupportMaterialCard } from '../questions/SupportMaterialCard.jsx';
import { useStudy } from '../../contexts/StudyContext.jsx';
import { groupHelpResources } from '../../services/revisionService.js';
import { Ico } from '../../lib/Icons.jsx';

export function QuizSection({ topic, page, questions = [], pageBlocks = [], clarifiers = [], onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]); // per-question outcome: 'correct' | 'wrong' | 'submitted' | 'explored'
  const [score, setScore] = useState({ correct: 0 });
  const [finished, setFinished] = useState(false);
  const { recordQuestionOutcome, addPageRevision } = useStudy();

  if (questions.length === 0) return null;
  const currentQuestion = questions[currentIndex];

  const supportPages = (currentQuestion.supportPageIds || [])
    .map((id) => (topic.pages || []).find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => ({ ...p, topicId: topic.id }));

  const supportResources = groupHelpResources(page).filter(
    (resource) =>
      (currentQuestion.supportResourceIds || []).length === 0 ||
      (currentQuestion.supportResourceIds || []).includes(resource.id)
  );

  const handleAnswer = (result) => {
    recordQuestionOutcome({ topicId: topic.id, page, question: currentQuestion, result });

    if (result.status === 'correct') {
      setStatus('correct');
      setScore((p) => ({ correct: p.correct + 1 }));
      setHistory((h) => [...h.slice(0, currentIndex), 'correct', ...h.slice(currentIndex + 1)]);
    } else if (result.status === 'incorrect' || result.status === 'wrong') {
      setStatus('wrong');
      setHistory((h) => [...h.slice(0, currentIndex), 'wrong', ...h.slice(currentIndex + 1)]);
    } else if (result.status === 'submitted') {
      setStatus('submitted');
      setHistory((h) => [...h.slice(0, currentIndex), 'submitted', ...h.slice(currentIndex + 1)]);
    } else if (result.status === 'explored') {
      setStatus('explored');
      setHistory((h) => [...h.slice(0, currentIndex), 'explored', ...h.slice(currentIndex + 1)]);
      setTimeout(() => handleNext(), 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
      setStatus(null);
    } else {
      setFinished(true);
      onComplete?.();
    }
  };

  if (finished) {
    const scored = questions.filter((q) => q.type !== 'concept_strengthener').length || 1;
    const pct = Math.round((score.correct / scored) * 100);
    const tone = pct >= 80 ? 'success' : pct >= 50 ? 'warn' : 'danger';
    const palette = {
      success: ['var(--color-success-soft)', 'var(--color-success)'],
      warn:    ['var(--color-warn-soft)',    'var(--color-warn)'],
      danger:  ['var(--color-danger-soft)',  'var(--color-danger)'],
    }[tone];
    return (
      <div className="mt-12 sh-card p-8 sm:p-10 text-center" style={{ background: palette[0], borderColor: palette[1] + '40' }}>
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: palette[1], color: '#fff' }}>
          <Ico.Check width="28" height="28" />
        </div>
        <h3 className="serif text-3xl m-0 mb-1" style={{ color: palette[1] }}>Quiz complete</h3>
        <p className="text-[15px] m-0 mb-4" style={{ color: palette[1] }}>
          You scored <b className="stat">{score.correct}</b> of <b className="stat">{scored}</b> ({pct}%)
        </p>
        <button onClick={() => addPageRevision(page.id, 'manual')} className="sh-btn sh-btn-secondary">
          <Ico.Bookmark width="14" height="14" /> Save weak ones for revision
        </button>
      </div>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-line">
      {/* Progress strip */}
      <div className="mb-6 flex gap-1.5">
        {questions.map((_, i) => {
          const past = history[i];
          const isCurrent = i === currentIndex;
          const bg =
            past === 'correct'  ? 'var(--color-success)' :
            past === 'wrong'    ? 'var(--color-danger)'  :
            past === 'submitted'? 'var(--color-ink-2)'   :
            isCurrent           ? 'var(--color-ink)'     : 'var(--color-line-2)';
          return (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div className="h-1 rounded-full" style={{ background: bg }} />
            </div>
          );
        })}
      </div>

      <header className="flex justify-between items-baseline mb-5">
        <div>
          <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em]">
            Check your understanding
          </div>
          <h3 className="serif text-2xl m-0 mt-1">
            Question {currentIndex + 1} <span className="text-muted font-normal">of {questions.length}</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="sh-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {score.correct} correct
          </span>
        </div>
      </header>

      <div className="sh-card p-6 sm:p-7">
        <QuestionRendererExtended question={currentQuestion} onAnswer={handleAnswer} />

        {status === 'wrong' && (
          <SupportMaterialCard
            hint={currentQuestion.hint}
            clarifiers={(currentQuestion.supportClarifierIds || [])
              .map((id) => clarifiers.find((c) => c.id === id))
              .filter(Boolean)}
            supportBlocks={(currentQuestion.supportBlockIds || [])
              .map((id) => pageBlocks.find((b) => b.id === id))
              .filter(Boolean)}
            supportPages={supportPages}
            supportResources={supportResources}
            retryAllowed={true}
            onRetry={() => setStatus(null)}
            onSaveForRevision={() => addPageRevision(page.id, 'manual')}
            onNext={handleNext}
          />
        )}

        {(status === 'correct' || status === 'submitted') && (
          <div className="mt-6 pt-4 border-t border-line flex justify-end">
            <button onClick={handleNext} className="sh-btn sh-btn-primary text-[13px]">
              Next question <Ico.Arrow width="14" height="14" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
