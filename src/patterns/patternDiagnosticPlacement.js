import { validateKaniAttempt } from '../integration/contracts/kaniContracts.js';
import { validateLearnerEvidence } from '../bridge/bridgeValidation.js';
import { generateBridgePlan } from '../bridge/bridgePlanner.js';
import { PATTERN_SKILLS } from './patternSkillCatalog.js';
import { IMO_CLASS_4_PATTERNS_TARGET } from './patternTarget.js';
import {
  PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  PATTERN_DIAGNOSTIC_QUESTIONS,
  getPatternDiagnosticQuestionById
} from './patternDiagnosticQuestions.js';

export function derivePatternDiagnosticEvidence({ studentId, activityId, attempts }) {
  assertText(studentId, 'studentId');
  if (activityId !== PATTERN_DIAGNOSTIC_ACTIVITY_ID) {
    fail('unexpected_activity_id', String(activityId));
  }
  if (!Array.isArray(attempts)) fail('invalid_attempts', 'expected_array');

  const attemptByQuestionId = validateSelectedAttempts(studentId, activityId, attempts);
  const skills = {};

  PATTERN_SKILLS.forEach((skill) => {
    const registeredQuestionIds = PATTERN_DIAGNOSTIC_QUESTIONS
      .filter((question) => question.skillIds[0] === skill.id)
      .map((question) => question.id);
    const observed = registeredQuestionIds
      .filter((questionId) => attemptByQuestionId.has(questionId))
      .map((questionId) => attemptByQuestionId.get(questionId));
    skills[skill.id] = Object.freeze(buildEvidenceRecord(observed));
  });

  const learnerEvidence = Object.freeze({ skills: Object.freeze(skills) });
  validateLearnerEvidence(learnerEvidence);
  return learnerEvidence;
}

export function buildPatternDiagnosticPlacement({
  studentId,
  activityId,
  attempts,
  capacityProfile
}) {
  const learnerEvidence = derivePatternDiagnosticEvidence({ studentId, activityId, attempts });
  const bridgePlan = generateBridgePlan({
    target: IMO_CLASS_4_PATTERNS_TARGET,
    skillLibrary: PATTERN_SKILLS,
    learnerEvidence,
    capacityProfile
  });
  return { learnerEvidence, bridgePlan };
}

function validateSelectedAttempts(studentId, activityId, attempts) {
  const byQuestionId = new Map();
  attempts.forEach((attempt, index) => {
    const parsed = validateKaniAttempt(attempt);
    if (!parsed.success) fail('invalid_attempt', String(index));
    if (attempt.studentId !== studentId) fail('student_mismatch', attempt.attemptId);
    if (attempt.activityId !== activityId) fail('activity_mismatch', attempt.attemptId);
    validateDiagnosticFields(attempt);

    const question = getPatternDiagnosticQuestionById(attempt.questionId);
    if (!question) fail('unknown_probe', String(attempt.questionId));
    const expectedSkillId = question.skillIds[0];
    if (!attempt.skillIds.includes(expectedSkillId)) fail('skill_mismatch', attempt.attemptId);
    if (byQuestionId.has(attempt.questionId)) fail('duplicate_probe_attempt', attempt.questionId);
    byQuestionId.set(attempt.questionId, attempt);
  });
  return byQuestionId;
}

function validateDiagnosticFields(attempt) {
  if (typeof attempt.correct !== 'boolean') fail('missing_correct', attempt.attemptId);
  if (!Number.isInteger(attempt.hintsUsed) || attempt.hintsUsed < 0) {
    fail('missing_hints_used', attempt.attemptId);
  }
}

function buildEvidenceRecord(observed) {
  const attemptCount = observed.length;
  const independentCorrect = observed.filter(
    (attempt) => attempt.correct === true && attempt.hintsUsed === 0
  ).length;
  const record = {
    state: deriveState(observed),
    attemptCount,
    independentCorrect
  };
  const lastObservedAt = latestCompletedAt(observed);
  if (lastObservedAt !== undefined) record.lastObservedAt = lastObservedAt;
  return record;
}

function deriveState(observed) {
  if (observed.length < 2) return 'unknown';
  const correctCount = observed.filter((attempt) => attempt.correct === true).length;
  if (correctCount === 2) {
    return observed.every((attempt) => attempt.hintsUsed === 0) ? 'independent' : 'supported';
  }
  if (correctCount === 0) return 'not_ready';
  return 'unknown';
}

function latestCompletedAt(observed) {
  if (observed.length === 0) return undefined;
  return [...observed]
    .sort((a, b) => {
      const byTime = Date.parse(a.completedAt) - Date.parse(b.completedAt);
      return byTime || a.completedAt.localeCompare(b.completedAt);
    })
    .at(-1).completedAt;
}

function assertText(value, path) {
  if (typeof value !== 'string' || value.trim() === '') fail('invalid_text', path);
}

function fail(code, detail) {
  throw new Error(`PATTERN_DIAGNOSTIC:${code}:${detail}`);
}
