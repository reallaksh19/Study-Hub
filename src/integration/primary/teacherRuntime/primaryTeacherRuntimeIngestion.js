import { validateKaniAttempt } from '../../contracts/kaniContracts.js';
import {
  observationFromKaniAttempt,
  runFractionTeacherReplay,
} from './primaryTeacherRuntime.js';

const PROVIDER_PROFILES = new Set(['SQLITE', 'FIREBASE']);
const FORBIDDEN_JUDGEMENT_KEYS = new Set([
  'diagnosis',
  'teacherDecision',
  'teacherMove',
  'mastery',
  'masteryScore',
  'masteryState',
  'nextLearningAction',
  'childProfile',
  'skillState',
  'currentLearningState',
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function findForbiddenKey(value, path = []) {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenKey(value[index], [...path, index]);
      if (found) return found;
    }
    return null;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_JUDGEMENT_KEYS.has(key)) return { key, path: [...path, key] };
    const found = findForbiddenKey(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function assertNoJudgementLeakage(value, label) {
  const forbidden = findForbiddenKey(value);
  if (!forbidden) return;
  throw new Error(`${label} contains forbidden Teacher Runtime judgement key '${forbidden.key}' at ${forbidden.path.join('.')}`);
}

function validateNonGameObservation(value, index) {
  assertNoJudgementLeakage(value, `nonGameObservations[${index}]`);
  if (!value || typeof value !== 'object') throw new Error(`nonGameObservations[${index}] must be an object`);
  if (!value.observationId) throw new Error(`nonGameObservations[${index}].observationId is required`);
  if (!Array.isArray(value.learningObjectIds) || value.learningObjectIds.length === 0) {
    throw new Error(`nonGameObservations[${index}].learningObjectIds must contain at least one id`);
  }
  if (!value.observedAt || Number.isNaN(Date.parse(value.observedAt))) {
    throw new Error(`nonGameObservations[${index}].observedAt must be an ISO date-time`);
  }
  return clone(value);
}

function deduplicateAttempts(attempts) {
  const byId = new Map();
  for (const attempt of attempts) {
    const existing = byId.get(attempt.attemptId);
    if (!existing) {
      byId.set(attempt.attemptId, attempt);
      continue;
    }
    if (canonicalJson(existing) !== canonicalJson(attempt)) {
      throw new Error(`Conflicting payloads for immutable attemptId ${attempt.attemptId}`);
    }
  }
  return [...byId.values()];
}

/**
 * Explicit evidence-ingestion boundary between transport/persistence and Common-shaped
 * Teacher Runtime observations. Backend provider metadata is deliberately excluded
 * from educational observations and decisions.
 */
export function ingestPrimaryEvidenceEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object') throw new Error('Primary evidence envelope is required');
  const providerProfile = envelope.providerProfile || 'SQLITE';
  if (!PROVIDER_PROFILES.has(providerProfile)) {
    throw new Error(`Unsupported persistence provider profile ${providerProfile}`);
  }

  const parsedAttempts = (envelope.attempts || []).map((attempt, index) => {
    assertNoJudgementLeakage(attempt, `attempts[${index}]`);
    const result = validateKaniAttempt(attempt);
    if (!result.success) {
      throw new Error(`attempts[${index}] is not valid kani-attempt-v1: ${result.error.message}`);
    }
    return result.data;
  });
  const attempts = deduplicateAttempts(parsedAttempts);
  const nonGameObservations = (envelope.nonGameObservations || []).map(validateNonGameObservation);
  const observations = [
    ...attempts.map((attempt) => observationFromKaniAttempt(attempt)),
    ...nonGameObservations,
  ].sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));

  return {
    transportMetadata: {
      providerProfile,
      attemptCount: attempts.length,
      nonGameObservationCount: nonGameObservations.length,
    },
    attempts,
    nonGameObservations,
    observations,
  };
}

/**
 * First deployed-style Phase-3 fraction seam into Teacher Runtime. The profile is
 * transport metadata only; it is intentionally not passed into diagnosis/decision logic.
 */
export function runFractionTeacherRuntimeFromEvidenceEnvelope(envelope, options = {}) {
  const ingested = ingestPrimaryEvidenceEnvelope(envelope);
  const returnObservation = ingested.nonGameObservations.find((observation) =>
    observation.value?.evidenceRole === 'INDEPENDENT_RETURN');
  const delayedObservation = ingested.nonGameObservations.find((observation) =>
    observation.value?.evidenceRole === 'DELAYED_RETRIEVAL');
  const delayedRetention = options.delayedRetention
    || (delayedObservation
      ? (delayedObservation.value?.correctness === 'CORRECT' ? 'DEVELOPING' : 'EMERGING')
      : 'NOT_YET_TESTED');

  const educationalTrace = runFractionTeacherReplay({
    attempts: ingested.attempts,
    independentReturnObservation: returnObservation,
    learningObjectId: options.learningObjectId || 'MATH-FRAC-EQUIVALENCE',
    sessionId: options.sessionId || 'SESSION-PHASE4-INGESTION-001',
    delayedRetention,
  });

  return {
    transportMetadata: ingested.transportMetadata,
    educationalTrace,
  };
}
