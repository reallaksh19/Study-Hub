import assert from 'node:assert/strict';
import { validateKaniQuestion } from '../integration/contracts/kaniContracts.js';
import { buildPatternDiagnosticPlacement } from './patternDiagnosticPlacement.js';
import {
  PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  PATTERN_DIAGNOSTIC_QUESTIONS
} from './patternDiagnosticQuestions.js';
import {
  PATTERN_DIAGNOSTIC_HANDOFF_ROUTE,
  PATTERN_DIAGNOSTIC_PILOT_SUPPORT_PROFILE,
  buildPatternDiagnosticBridgeFromRoute,
  createPatternDiagnosticPublicationEnvelope,
  decodePatternDiagnosticHandoff,
  encodePatternDiagnosticHandoff
} from './patternDiagnosticHandoff.js';

const STUDENT_ID = 'student_m004_patterns';
const first = PATTERN_DIAGNOSTIC_QUESTIONS[0];
const second = PATTERN_DIAGNOSTIC_QUESTIONS[1];
const selected = Object.freeze([
  Object.freeze(attempt(first, { attemptId: 'm004_a' })),
  Object.freeze(attempt(second, { attemptId: 'm004_b', hintsUsed: 1 }))
]);

assert.deepEqual(PATTERN_DIAGNOSTIC_PILOT_SUPPORT_PROFILE, {
  instructionLength: 'standard',
  maxVisibleItems: 6,
  answerChoiceLoad: 4,
  hintAvailability: 'on_request',
  preferredRepresentation: 'mixed',
  recommendedSessionSize: 6
});
assert.equal(Object.isFrozen(PATTERN_DIAGNOSTIC_PILOT_SUPPORT_PROFILE), true);

const publication = createPatternDiagnosticPublicationEnvelope();
assert.equal(publication.schemaVersion, '1.0');
assert.equal(publication.activityId, PATTERN_DIAGNOSTIC_ACTIVITY_ID);
assert.equal(publication.sourceApp, 'study-hub');
assert.equal(publication.questions.length, 26);
assert.deepEqual(
  publication.questions,
  PATTERN_DIAGNOSTIC_QUESTIONS.map((question) => validateKaniQuestion(question).data)
);
publication.questions.forEach((question) => {
  assert.equal(validateKaniQuestion(question).success, true);
  assert.deepEqual(question.curriculumTags, []);
});

const route = encodePatternDiagnosticHandoff(selected);
assert.ok(route.startsWith(`${PATTERN_DIAGNOSTIC_HANDOFF_ROUTE}?payload=`));
assert.equal(route, encodePatternDiagnosticHandoff(selected));
const decoded = decodePatternDiagnosticHandoff(route);
assert.equal(decoded.activityId, PATTERN_DIAGNOSTIC_ACTIVITY_ID);
assert.deepEqual(decoded.attempts, selected);

const direct = buildPatternDiagnosticPlacement({
  studentId: STUDENT_ID,
  activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  attempts: selected,
  capacityProfile: PATTERN_DIAGNOSTIC_PILOT_SUPPORT_PROFILE
});
const bridge = buildPatternDiagnosticBridgeFromRoute(route);
assert.equal(bridge.studentId, STUDENT_ID);
assert.deepEqual(bridge.learnerEvidence, direct.learnerEvidence);
assert.deepEqual(bridge.bridgePlan, direct.bridgePlan);
assert.deepEqual(bridge.bridgePlan.supportProfile, PATTERN_DIAGNOSTIC_PILOT_SUPPORT_PROFILE);

assert.throws(
  () => decodePatternDiagnosticHandoff('#/patterns/diagnostic-bridge'),
  /missing_payload/
);
assert.throws(
  () => decodePatternDiagnosticHandoff(`${PATTERN_DIAGNOSTIC_HANDOFF_ROUTE}?payload=not-json`),
  /invalid_json/
);
assert.throws(
  () => encodePatternDiagnosticHandoff(Array.from({ length: 27 }, (_, index) => attempt(first, { attemptId: `many_${index}` }))),
  /too_many_attempts/
);
assert.throws(
  () => encodePatternDiagnosticHandoff([
    attempt(first, { attemptId: 'mixed_a' }),
    attempt(second, { attemptId: 'mixed_b', studentId: 'student_other' })
  ]),
  /mixed_students/
);
assert.throws(
  () => encodePatternDiagnosticHandoff([attempt(first, { activityId: 'patterns.diagnostic.other' })]),
  /wrong_activity/
);
assert.throws(
  () => encodePatternDiagnosticHandoff([
    attempt(first, { attemptId: 'dup_a' }),
    attempt(first, { attemptId: 'dup_b' })
  ]),
  /duplicate_probe/
);

const oversized = JSON.stringify({
  schemaVersion: '1.0',
  activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  attempts: [{ ...attempt(first), padding: 'x'.repeat(70_000) }]
});
assert.throws(
  () => decodePatternDiagnosticHandoff(`${PATTERN_DIAGNOSTIC_HANDOFF_ROUTE}?payload=${encodeURIComponent(oversized)}`),
  /payload_too_large/
);

const selectedSnapshot = JSON.stringify(selected);
buildPatternDiagnosticBridgeFromRoute(route);
assert.equal(JSON.stringify(selected), selectedSnapshot);

console.log('patternDiagnosticHandoff tests passed');

function attempt(question, overrides = {}) {
  return {
    schemaVersion: '1.0',
    attemptId: `attempt:${question.id}`,
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    activityType: 'quiz',
    sourceApp: 'study-hub',
    questionId: question.id,
    skillIds: [...question.skillIds],
    difficulty: 'none',
    correct: true,
    partialCredit: 1,
    responseTimeMs: 1200,
    hintsUsed: 0,
    completedAt: '2026-09-08T17:30:00.000Z',
    ...overrides
  };
}
