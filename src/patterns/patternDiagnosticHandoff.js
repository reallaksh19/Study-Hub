import {
  validateKaniAttempt,
  validateKaniQuestion
} from '../integration/contracts/kaniContracts.js';
import { buildPatternDiagnosticPlacement } from './patternDiagnosticPlacement.js';
import {
  PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  PATTERN_DIAGNOSTIC_QUESTIONS,
  getPatternDiagnosticQuestionById
} from './patternDiagnosticQuestions.js';

export const PATTERN_DIAGNOSTIC_HANDOFF_ROUTE = '#/patterns/diagnostic-bridge';
export const PATTERN_DIAGNOSTIC_MAX_ATTEMPTS = 26;
export const PATTERN_DIAGNOSTIC_MAX_PAYLOAD_BYTES = 64 * 1024;

export function createPatternDiagnosticPublicationEnvelope() {
  const questions = PATTERN_DIAGNOSTIC_QUESTIONS.map((question) => {
    const parsed = validateKaniQuestion(question);
    if (!parsed.success) fail('invalid_published_question', question.id);
    return Object.freeze(parsed.data);
  });
  return Object.freeze({
    schemaVersion: '1.0',
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    sourceApp: 'study-hub',
    questions: Object.freeze(questions)
  });
}

export function encodePatternDiagnosticHandoff(attempts) {
  const payload = validatePayload({
    schemaVersion: '1.0',
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts
  });
  const json = JSON.stringify(payload);
  assertPayloadSize(json);
  return `${PATTERN_DIAGNOSTIC_HANDOFF_ROUTE}?payload=${encodeURIComponent(json)}`;
}

export function decodePatternDiagnosticHandoff(route) {
  if (typeof route !== 'string' || !route.startsWith(PATTERN_DIAGNOSTIC_HANDOFF_ROUTE)) {
    fail('invalid_route');
  }
  const queryIndex = route.indexOf('?');
  if (queryIndex < 0) fail('missing_payload');
  const json = new URLSearchParams(route.slice(queryIndex + 1)).get('payload');
  if (!json) fail('missing_payload');
  assertPayloadSize(json);

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    fail('invalid_json');
  }
  return validatePayload(parsed);
}

export function buildPatternDiagnosticBridgeFromRoute(route) {
  const payload = decodePatternDiagnosticHandoff(route);
  const studentId = payload.attempts[0].studentId;
  const placement = buildPatternDiagnosticPlacement({
    studentId,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: payload.attempts,
    capacityProfile: {}
  });
  return Object.freeze({
    studentId,
    attempts: payload.attempts,
    learnerEvidence: placement.learnerEvidence,
    bridgePlan: placement.bridgePlan
  });
}

function validatePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid_payload');
  if (value.schemaVersion !== '1.0') fail('invalid_schema_version');
  if (value.activityId !== PATTERN_DIAGNOSTIC_ACTIVITY_ID) fail('wrong_activity');
  if (!Array.isArray(value.attempts) || value.attempts.length === 0) fail('missing_attempts');
  if (value.attempts.length > PATTERN_DIAGNOSTIC_MAX_ATTEMPTS) fail('too_many_attempts');

  const studentId = value.attempts[0]?.studentId;
  if (typeof studentId !== 'string' || studentId.trim() === '') fail('invalid_student');
  const questionIds = new Set();

  value.attempts.forEach((attempt, index) => {
    if (!validateKaniAttempt(attempt).success) fail('invalid_attempt', index);
    if (attempt.activityId !== PATTERN_DIAGNOSTIC_ACTIVITY_ID) fail('wrong_activity', index);
    if (attempt.studentId !== studentId) fail('mixed_students', index);
    if (typeof attempt.questionId !== 'string' || !getPatternDiagnosticQuestionById(attempt.questionId)) {
      fail('unknown_probe', index);
    }
    if (questionIds.has(attempt.questionId)) fail('duplicate_probe', attempt.questionId);
    questionIds.add(attempt.questionId);
  });

  return Object.freeze({
    schemaVersion: '1.0',
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: Object.freeze([...value.attempts])
  });
}

function assertPayloadSize(json) {
  if (new TextEncoder().encode(json).length > PATTERN_DIAGNOSTIC_MAX_PAYLOAD_BYTES) {
    fail('payload_too_large');
  }
}

function fail(code, detail) {
  throw new Error(`PATTERN_DIAGNOSTIC_HANDOFF:${code}${detail === undefined ? '' : `:${detail}`}`);
}
