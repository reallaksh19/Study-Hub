import assert from 'node:assert/strict';
import { makeFractionGameAttempt } from '../fractions/fractionEquivalenceJourney.js';
import {
  ingestPrimaryEvidenceEnvelope,
  runFractionTeacherRuntimeFromEvidenceEnvelope,
} from './primaryTeacherRuntimeIngestion.js';
import { verifyIndependentRetryAfterRepair } from './primaryTeacherRuntimeClosure.js';

const attempts = [
  makeFractionGameAttempt({
    attemptId: 'ATT-INGEST-001',
    studentId: 'student-runtime-only',
    questionId: 'fraction-equiv-q-101',
    correct: true,
    completedAt: '2026-09-11T06:00:00.000Z',
  }),
  makeFractionGameAttempt({
    attemptId: 'ATT-INGEST-002',
    studentId: 'student-runtime-only',
    questionId: 'fraction-equiv-q-102',
    correct: false,
    completedAt: '2026-09-11T06:01:00.000Z',
  }),
];

const returnObservation = {
  observationId: 'OBS-INGEST-RETURN-001',
  learningObjectIds: ['MATH-FRAC-EQUIVALENCE'],
  kind: 'STUDY_HUB_RETURN',
  value: {
    correctness: 'CORRECT',
    evidenceRole: 'INDEPENDENT_RETURN',
    responseMode: 'EXPLAIN_OR_DRAW',
    routeSignature: 'STUDY_HUB:RETURN:EXPLAIN_OR_DRAW',
  },
  observedAt: '2026-09-11T06:05:00.000Z',
  conceptualSupport: { level: 'H0', type: 'NONE' },
  accessAdjustments: [],
  sourceStatus: 'VERIFIED',
};

// Simulate the deployed evidence seam: serialize over a transport boundary and parse again.
const deployedLikeEnvelope = JSON.parse(JSON.stringify({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [returnObservation],
}));
const ingested = ingestPrimaryEvidenceEnvelope(deployedLikeEnvelope);
assert.equal(ingested.attempts.length, 2);
assert.equal(ingested.nonGameObservations.length, 1);
assert.equal(ingested.observations.length, 3);
assert.equal(ingested.observations[0].kind, 'KANI_ATTEMPT');
assert.equal(ingested.observations[2].kind, 'STUDY_HUB_RETURN');

// Immutable replay of an identical attempt is idempotent at the ingestion boundary.
const replayed = ingestPrimaryEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts: [attempts[0], structuredClone(attempts[0])],
});
assert.equal(replayed.attempts.length, 1);

// Same attemptId with different evidence is a conflict, never a silent overwrite.
const conflicting = structuredClone(attempts[0]);
conflicting.correct = !conflicting.correct;
assert.throws(() => ingestPrimaryEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts: [attempts[0], conflicting],
}), /Conflicting payloads for immutable attemptId/);

// Teacher Runtime judgement may not be smuggled back through raw evidence.
const judgementLeak = structuredClone(attempts[0]);
judgementLeak.primaryEvidence.teacherDecision = { strategy: 'RETEACH' };
assert.throws(() => ingestPrimaryEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts: [judgementLeak],
}), /forbidden Teacher Runtime judgement key 'teacherDecision'/);

const masteryLeak = structuredClone(returnObservation);
masteryLeak.value.masteryState = 'MASTERED';
assert.throws(() => ingestPrimaryEvidenceEnvelope({
  providerProfile: 'SQLITE',
  nonGameObservations: [masteryLeak],
}), /forbidden Teacher Runtime judgement key 'masteryState'/);

// Provider profile is transport metadata only. SQLite and Firebase yield identical educational traces.
const sqliteRun = runFractionTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [returnObservation],
}, { sessionId: 'SESSION-PROVIDER-NEUTRAL' });
const firebaseRun = runFractionTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'FIREBASE',
  attempts: JSON.parse(JSON.stringify(attempts)),
  nonGameObservations: [structuredClone(returnObservation)],
}, { sessionId: 'SESSION-PROVIDER-NEUTRAL' });
assert.equal(sqliteRun.transportMetadata.providerProfile, 'SQLITE');
assert.equal(firebaseRun.transportMetadata.providerProfile, 'FIREBASE');
assert.deepEqual(sqliteRun.educationalTrace, firebaseRun.educationalTrace);
assert.equal(sqliteRun.educationalTrace.skillState.learningEvidence.independentUse, 'DEVELOPING');
assert.equal(sqliteRun.educationalTrace.skillState.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(sqliteRun.educationalTrace.teacherDecision.strategy, 'SCHEDULE_RETRIEVAL');

// The repair is not complete merely because a model/probe was shown: observe a fresh H0 retry.
const priorZeroPlaceObservations = [
  {
    observationId: 'OBS-REPAIR-PRIOR-1',
    learningObjectIds: ['DIV-M6.6'],
    kind: 'MATHEMATICAL_WORK',
    value: {
      correctness: 'INCORRECT',
      evidenceRole: 'SOURCE_WORK',
      routeSignature: 'WORK_TRACE:DIVISION:WRITTEN_ALGORITHM',
    },
    observedAt: '2026-09-11T07:00:00.000Z',
    conceptualSupport: { level: 'H0', type: 'NONE' },
    accessAdjustments: [],
    sourceStatus: 'VERIFIED',
  },
  {
    observationId: 'OBS-REPAIR-PRIOR-2',
    learningObjectIds: ['DIV-M6.6'],
    kind: 'MATHEMATICAL_WORK',
    value: {
      correctness: 'INCORRECT',
      evidenceRole: 'SOURCE_WORK',
      routeSignature: 'WORK_TRACE:DIVISION:WRITTEN_ALGORITHM',
    },
    observedAt: '2026-09-11T07:01:00.000Z',
    conceptualSupport: { level: 'H0', type: 'NONE' },
    accessAdjustments: [],
    sourceStatus: 'VERIFIED',
  },
];
const retryObservation = {
  observationId: 'OBS-REPAIR-RETRY-608-4',
  learningObjectIds: ['DIV-M6.6'],
  kind: 'INDEPENDENT_RETRY',
  value: {
    correctness: 'CORRECT',
    evidenceRole: 'INDEPENDENT_RETRY_AFTER_REPAIR',
    response: '152',
    routeSignature: 'WORK_TRACE:DIVISION:FRESH_ITEM',
  },
  observedAt: '2026-09-11T07:10:00.000Z',
  conceptualSupport: { level: 'H0', type: 'NONE' },
  accessAdjustments: [],
  sourceStatus: 'VERIFIED',
};
const repairVerification = verifyIndependentRetryAfterRepair({
  learningObjectId: 'DIV-M6.6',
  priorObservations: priorZeroPlaceObservations,
  retryObservation,
});
assert.equal(repairVerification.verificationStatus, 'CONFIRMED_IN_SESSION');
assert.equal(repairVerification.durability, 'NOT_ESTABLISHED');
assert.equal(repairVerification.skillState.learningEvidence.independentUse, 'DEVELOPING');
assert.equal(repairVerification.skillState.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(repairVerification.teacherDecision.strategy, 'SCHEDULE_RETRIEVAL');
assert.equal(repairVerification.teacherMove.type, 'SCHEDULE_RETRIEVAL');
assert.equal(JSON.stringify(repairVerification).toLowerCase().includes('mastered'), false);

// A supported retry cannot be counted as independent verification.
const supportedRetry = structuredClone(retryObservation);
supportedRetry.observationId = 'OBS-REPAIR-RETRY-SUPPORTED';
supportedRetry.conceptualSupport = { level: 'H1', type: 'PROMPT' };
assert.throws(() => verifyIndependentRetryAfterRepair({
  learningObjectId: 'DIV-M6.6',
  priorObservations: priorZeroPlaceObservations,
  retryObservation: supportedRetry,
}), /must use H0 conceptual support/);

console.log('Primary Teacher Runtime Phase-4 closure ingestion + repair verification passed.');
