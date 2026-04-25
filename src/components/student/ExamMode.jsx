import React, { useState, useEffect, useRef } from 'react';
import { QuestionRendererExtended } from '../questions/QuestionRenderer.jsx';

// ─── Collect exam-drill questions from topic ──────────────────────────────────

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

// ─── Countdown timer ──────────────────────────────────────────────────────────

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
    <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1 rounded-full ${urgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
      {urgent ? '⏰' : '⏱'} {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}

// ─── Score report screen ──────────────────────────────────────────────────────

function ScoreReport({ results, topic, onRetry, onBack }) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const colorClass = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '📚' : '💪'}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Exam complete</h1>
        <p className="text-gray-500 mb-4">{topic.title}</p>
        <div className={`text-5xl font-bold mb-2 ${colorClass}`}>{pct}%</div>
        <p className="text-gray-500 text-sm">{correct} / {total} correct</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm mb-6">
        {results.map((r, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 ${r.correct ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <span className={`text-lg flex-shrink-0 mt-0.5 ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
              {r.correct ? '✓' : '✗'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-800 line-clamp-2">
                {r.question.prompt || r.question.statement || `Question ${i + 1}`}
              </div>
              {r.skipped && <div className="text-xs text-gray-500 mt-0.5">Skipped — time ran out</div>}
            </div>
            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${r.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {r.correct ? '+1' : '0'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={onRetry} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
          Try again
        </button>
        <button onClick={onBack} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
          Back to topic
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Persist exam result to localStorage ────────────────────────────────────

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
      history: [...(store[topicId]?.history || []), { score: correct, total, completedAt: new Date().toISOString() }].slice(-10)
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
  const [answered, setAnswered] = useState(false); // true once onAnswer fires
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  const timerSeconds = (examDurationMinutes || 0) > 0 ? examDurationMinutes * 60 : 0;

  const finishExam = (finalResults) => {
    saveExamResult(topic.id, finalResults);
    setDone(true);
  };

  const handleTimerExpire = () => {
    const remaining = questions.slice(results.length).map((q) => ({ question: q, correct: false, skipped: true }));
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
      // results already has the last answer added by handleAnswer
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

  // ── No questions ──────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-4">
          <button onClick={onBack} className="inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            ← Back
          </button>
        </div>
        <div className="border rounded-xl p-6 bg-amber-50 text-amber-800">
          <p className="font-semibold mb-1">No exam-drill questions found</p>
          <p className="text-sm">
            No questions are tagged <code className="bg-amber-100 px-1 rounded font-mono">mode: "exam_drill"</code> for{' '}
            {filterTag ? `tag "${filterTag}"` : 'this topic'}. Mark questions as Exam Drill in the parent portal question editor.
          </p>
        </div>
      </div>
    );
  }

  // ── Score report ──────────────────────────────────────────────────────────
  if (done) {
    return <ScoreReport results={results} topic={topic} onRetry={handleRetry} onBack={onBack} />;
  }

  const current = questions[currentIndex];
  const progressPct = Math.round((results.length / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Exam drill · {topic.title}</div>
          <div className="text-sm font-semibold text-gray-700">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {timerSeconds > 0 && (
            <CountdownTimer totalSeconds={timerSeconds} onExpire={handleTimerExpire} />
          )}
          <button
            onClick={onBack}
            className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded"
          >
            Exit
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Question card ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-4">
        {/* Reset the question component on every index change */}
        <QuestionRendererExtended
          key={currentIndex}
          question={current}
          onAnswer={handleAnswer}
        />
      </div>

      {/* ── Closed-book notice (before answering) ── */}
      {!answered && (
        <p className="text-xs text-center text-gray-400 mb-4">
          Closed-book — no reference material during this drill
        </p>
      )}

      {/* ── Next button (after answering) ── */}
      {answered && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700"
          >
            {currentIndex >= questions.length - 1 ? 'See results →' : 'Next question →'}
          </button>
        </div>
      )}
    </div>
  );
}
