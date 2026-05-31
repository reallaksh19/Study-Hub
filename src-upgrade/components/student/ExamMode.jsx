// ExamMode.jsx — UPGRADED
// Drop-in replacement for src/components/student/ExamMode.jsx.
// Preserves: collectExamQuestions, CountdownTimer, saveExamResult + getExamResult export,
//            timed run, closed-book notice, results screen with retry/back.

import React, { useState, useEffect, useRef } from 'react';
import { QuestionRendererExtended } from '../questions/QuestionRenderer.jsx';
import { Ico } from '../../lib/Icons.jsx';

function collectExamQuestions(topic, filterTag) {
  const collected = [];
  (topic._fullPages || []).forEach((pageRef) => {
    const page = pageRef._fullData;
    if (!page?.questions) return;
    page.questions.forEach((question) => {
      const matchesMode = question.mode === 'exam_drill' || question.examOnly;
      const matchesTag = filterTag ? (question.conceptTags || []).includes(filterTag) : true;
      if (matchesMode && matchesTag) collected.push(question);
    });
  });
  return collected;
}

function CountdownTimer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining < 120;

  return (
    <span
      className="mono px-3 py-1.5 rounded-full text-[13px] font-bold inline-flex items-center gap-1.5"
      style={{
        background: urgent ? 'var(--color-danger-soft)' : 'var(--color-paper-2)',
        color: urgent ? 'var(--color-danger)' : 'var(--color-ink-2)',
        border: urgent ? '1px solid #F2B3B3' : '1px solid var(--color-line-2)',
      }}
    >
      <Ico.Clock width="13" height="13" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

function ScoreReport({ results, topic, onRetry, onBack }) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const tone = pct >= 80 ? 'success' : pct >= 50 ? 'warn' : 'danger';
  const palette = {
    success: { bg: 'var(--color-success-soft)', col: 'var(--color-success)', emoji: '🏆' },
    warn:    { bg: 'var(--color-warn-soft)',    col: 'var(--color-warn)',    emoji: '📚' },
    danger:  { bg: 'var(--color-danger-soft)',  col: 'var(--color-danger)',  emoji: '💪' },
  }[tone];

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 sm:px-8 py-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{palette.emoji}</div>
          <h1 className="serif text-3xl m-0">Exam complete</h1>
          <p className="text-muted m-0 mt-1">{topic.title}</p>
          <div className="stat text-[56px] font-semibold mt-4 leading-none" style={{ color: palette.col }}>{pct}%</div>
          <p className="text-muted text-[14px] mt-2 m-0">{correct} / {total} correct</p>
        </div>

        <div className="bg-white border border-line-2 rounded-[14px] overflow-hidden mb-5">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 border-b border-line last:border-0"
              style={{ background: r.correct ? 'var(--color-success-soft)' : 'var(--color-danger-soft)' }}
            >
              <span
                className="flex-shrink-0 mt-0.5"
                style={{ color: r.correct ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {r.correct ? <Ico.Check width="18" height="18" /> : <Ico.Close width="18" height="18" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink line-clamp-2">
                  {r.question.prompt || r.question.statement || `Question ${i + 1}`}
                </div>
                {r.skipped && <div className="text-[11.5px] text-muted mt-0.5">Skipped — time ran out</div>}
              </div>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: r.correct ? 'var(--color-success)' : 'var(--color-danger)',
                  color: '#fff',
                }}
              >
                {r.correct ? '+1' : '0'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={onRetry} className="sh-btn sh-btn-secondary">Try again</button>
          <button onClick={onBack} className="sh-btn sh-btn-primary">Back to topic</button>
        </div>
      </div>
    </div>
  );
}

function saveExamResult(topicId, results) {
  try {
    const key = 'study_hub_exam_results_v1';
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    store[topicId] = {
      topicId,
      score: correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      completedAt: new Date().toISOString(),
      history: [
        ...(store[topicId]?.history || []),
        { score: correct, total, completedAt: new Date().toISOString() },
      ].slice(-10),
    };
    localStorage.setItem(key, JSON.stringify(store));
  } catch { /* ignore storage errors */ }
}

export function getExamResult(topicId) {
  try {
    const store = JSON.parse(localStorage.getItem('study_hub_exam_results_v1') || '{}');
    return store[topicId] || null;
  } catch { return null; }
}

export function ExamMode({ topic, filterTag, examDurationMinutes, onBack }) {
  const questions = collectExamQuestions(topic, filterTag);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  const timerSeconds = (examDurationMinutes || 0) > 0 ? examDurationMinutes * 60 : 0;

  const finishExam = (finalResults) => {
    saveExamResult(topic.id, finalResults);
    setDone(true);
  };

  const handleTimerExpire = () => {
    const remaining = questions
      .slice(results.length)
      .map((q) => ({ question: q, correct: false, skipped: true }));
    const finalResults = [...results, ...remaining];
    setResults(finalResults);
    finishExam(finalResults);
  };

  const handleAnswer = ({ status }) => {
    const isCorrect = status === 'correct';
    setResults((prev) => [...prev, { question: questions[currentIndex], correct: isCorrect, skipped: false }]);
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      finishExam(results);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswered(false);
    setResults([]);
    setDone(false);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="max-w-[680px] mx-auto px-6 sm:px-8 py-8">
          <button onClick={onBack} className="sh-btn sh-btn-ghost text-[13px] pl-0 mb-5">
            <Ico.ArrowLeft width="16" height="16" /> Back
          </button>
          <div
            className="rounded-[14px] border p-6"
            style={{ background: 'var(--color-warn-soft)', borderColor: '#EBD79A', color: '#7A4A09' }}
          >
            <p className="font-semibold m-0">No exam-drill questions found</p>
            <p className="text-[13.5px] m-0 mt-1">
              No questions are tagged <code className="mono bg-white px-1.5 py-px rounded">mode: "exam_drill"</code> for{' '}
              {filterTag ? `tag "${filterTag}"` : 'this topic'}. Mark questions as Exam Drill in the parent portal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return <ScoreReport results={results} topic={topic} onRetry={handleRetry} onBack={onBack} />;
  }

  const current = questions[currentIndex];
  const progressPct = Math.round((results.length / questions.length) * 100);

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 sm:px-8 py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em] mb-1">
              Exam drill · {topic.title}
            </div>
            <div className="serif text-[22px] leading-tight">
              Question {currentIndex + 1} <span className="text-muted font-normal">of {questions.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {timerSeconds > 0 && <CountdownTimer totalSeconds={timerSeconds} onExpire={handleTimerExpire} />}
            <button onClick={onBack} className="sh-btn sh-btn-ghost text-[12px] px-2.5 py-1.5">Exit</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-line-2 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-violet rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Card */}
        <div className="bg-white border border-line-2 rounded-[16px] p-6 sm:p-7 mb-4">
          <div className="flex gap-2 mb-3.5">
            <span
              className="sh-chip"
              style={{ background: 'var(--color-violet-soft)', borderColor: '#D7C3F5', color: 'var(--color-violet)' }}
            >
              Exam-only
            </span>
          </div>
          <QuestionRendererExtended key={currentIndex} question={current} onAnswer={handleAnswer} />
        </div>

        {!answered && (
          <p className="text-[12px] text-center text-muted m-0 mb-3">
            🔒 Closed-book — no reference material during this drill
          </p>
        )}

        {answered && (
          <div className="flex justify-end mt-2">
            <button onClick={handleNext} className="sh-btn sh-btn-primary">
              {currentIndex >= questions.length - 1 ? 'See results' : 'Next question'}
              <Ico.Arrow width="14" height="14" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
