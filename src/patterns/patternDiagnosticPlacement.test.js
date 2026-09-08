import assert from 'node:assert/strict';
import { validateKaniAttempt } from '../integration/contracts/kaniContracts.js';
import { validateLearnerEvidence } from '../bridge/bridgeValidation.js';
import { generateBridgePlan } from '../bridge/bridgePlanner.js';
import { PATTERN_SKILLS } from './patternSkillCatalog.js';
import { IMO_CLASS_4_PATTERNS_TARGET } from './patternTarget.js';
import {
  PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  PATTERN_DIAGNOSTIC_QUESTIONS
} from './patternDiagnosticQuestions.js';
import {
  derivePatternDiagnosticEvidence,
  buildPatternDiagnosticPlacement
} from './patternDiagnosticPlacement.js';

const STUDENT_ID = 'student_m003_patterns';
const CAPACITY_PROFILE = Object.freeze({
  instructionLength: 'short',
  maxVisibleItems: 4,
  answerChoiceLoad: 4,
  hintAvailability: 'available',
  preferredRepresentation: 'visual',
  recommendedSessionSize: 4
});

const firstPair = pairFor(PATTERN_SKILLS[0].id);
const secondPair = pairFor(PATTERN_SKILLS[1].id);

assert.throws(
  () => derivePatternDiagnosticEvidence({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: [attempt(firstPair[0], { studentId: 'student_other' })]
  }),
  /student_mismatch/
);

assert.throws(
  () => derivePatternDiagnosticEvidence({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: [attempt(firstPair[0], { activityId: 'patterns.diagnostic.other' })]
  }),
  /activity_mismatch/
);

assert.throws(
  () => derivePatternDiagnosticEvidence({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: [attempt(firstPair[0], { questionId: 'patterns.probe.unknown.1' })]
  }),
  /unknown_probe/
);

assert.throws(
  () => derivePatternDiagnosticEvidence({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: [attempt(firstPair[0], { skillIds: [PATTERN_SKILLS[1].id] })]
  }),
  /skill_mismatch/
);

assert.throws(
  () => derivePatternDiagnosticEvidence({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: [
      attempt(firstPair[0], { attemptId: 'attempt_duplicate_a' }),
      attempt(firstPair[0], { attemptId: 'attempt_duplicate_b' })
    ]
  }),
  /duplicate_probe_attempt/
);

const emptyEvidence = derivePatternDiagnosticEvidence({
  studentId: STUDENT_ID,
  activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  attempts: []
});
assert.doesNotThrow(() => validateLearnerEvidence(emptyEvidence));
PATTERN_SKILLS.forEach((skill) => {
  assert.deepEqual(emptyEvidence.skills[skill.id], {
    state: 'unknown',
    attemptCount: 0,
    independentCorrect: 0
  });
});

const oneProbeEvidence = deriveForPair(firstPair, [
  attempt(firstPair[0], { correct: true, hintsUsed: 0 })
]);
assert.equal(oneProbeEvidence.state, 'unknown');
assert.equal(oneProbeEvidence.attemptCount, 1);
assert.equal(oneProbeEvidence.independentCorrect, 1);

const independentEvidence = deriveForPair(firstPair, [
  attempt(firstPair[0], { correct: true, hintsUsed: 0, completedAt: '2026-09-08T10:00:00.000Z' }),
  attempt(firstPair[1], { correct: true, hintsUsed: 0, completedAt: '2026-09-08T11:00:00.000Z' })
]);
assert.deepEqual(independentEvidence, {
  state: 'independent',
  attemptCount: 2,
  independentCorrect: 2,
  lastObservedAt: '2026-09-08T11:00:00.000Z'
});

const supportedEvidence = deriveForPair(firstPair, [
  attempt(firstPair[0], { correct: true, hintsUsed: 0 }),
  attempt(firstPair[1], { correct: true, hintsUsed: 1 })
]);
assert.equal(supportedEvidence.state, 'supported');
assert.equal(supportedEvidence.independentCorrect, 1);

const notReadyEvidence = deriveForPair(firstPair, [
  attempt(firstPair[0], { correct: false, hintsUsed: 0, partialCredit: 0 }),
  attempt(firstPair[1], { correct: false, hintsUsed: 0, partialCredit: 0 })
]);
assert.equal(notReadyEvidence.state, 'not_ready');
assert.equal(notReadyEvidence.independentCorrect, 0);

const splitEvidence = deriveForPair(firstPair, [
  attempt(firstPair[0], { correct: true, hintsUsed: 0 }),
  attempt(firstPair[1], { correct: false, hintsUsed: 0, partialCredit: 0 })
]);
assert.equal(splitEvidence.state, 'unknown');

const mixedEvidence = derivePatternDiagnosticEvidence({
  studentId: STUDENT_ID,
  activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  attempts: [
    attempt(firstPair[0], { correct: true, hintsUsed: 0 }),
    attempt(firstPair[1], { correct: true, hintsUsed: 0 }),
    attempt(secondPair[0], { correct: false, hintsUsed: 0, partialCredit: 0 }),
    attempt(secondPair[1], { correct: false, hintsUsed: 0, partialCredit: 0 })
  ]
});
assert.equal(
  Object.values(mixedEvidence.skills).some((record) => record.state === 'secure'),
  false
);

const chronological = [
  attempt(firstPair[0], { completedAt: '2026-09-08T08:00:00.000Z' }),
  attempt(firstPair[1], { completedAt: '2026-09-08T12:00:00.000Z' })
];
const reverseEvidence = deriveAll([...chronological].reverse());
const forwardEvidence = deriveAll(chronological);
assert.deepEqual(reverseEvidence, forwardEvidence);
assert.equal(
  forwardEvidence.skills[PATTERN_SKILLS[0].id].lastObservedAt,
  '2026-09-08T12:00:00.000Z'
);

const timingA = deriveForPair(firstPair, [
  attempt(firstPair[0], { responseTimeMs: 100 }),
  attempt(firstPair[1], { responseTimeMs: 50000 })
]);
const timingB = deriveForPair(firstPair, [
  attempt(firstPair[0], { responseTimeMs: 90000 }),
  attempt(firstPair[1], { responseTimeMs: 200 })
]);
assert.equal(timingA.state, timingB.state);

const extraFieldsA = deriveForPair(firstPair, [
  attempt(firstPair[0], { score: 1, partialCredit: 1, difficulty: 'easy' }),
  attempt(firstPair[1], { score: 1, partialCredit: 1, difficulty: 'medium' })
]);
const extraFieldsB = deriveForPair(firstPair, [
  attempt(firstPair[0], { score: 99, partialCredit: 0.2, difficulty: 'hard' }),
  attempt(firstPair[1], { score: -7, partialCredit: 0.4, difficulty: 'mixed' })
]);
assert.equal(extraFieldsA.state, extraFieldsB.state);

const placementAttempts = [
  attempt(firstPair[0], { correct: true, hintsUsed: 0 }),
  attempt(firstPair[1], { correct: true, hintsUsed: 1 }),
  attempt(secondPair[0], { correct: false, hintsUsed: 0, partialCredit: 0 }),
  attempt(secondPair[1], { correct: false, hintsUsed: 0, partialCredit: 0 })
];
const placement = buildPatternDiagnosticPlacement({
  studentId: STUDENT_ID,
  activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  attempts: placementAttempts,
  capacityProfile: CAPACITY_PROFILE
});
const directPlan = generateBridgePlan({
  target: IMO_CLASS_4_PATTERNS_TARGET,
  skillLibrary: PATTERN_SKILLS,
  learnerEvidence: placement.learnerEvidence,
  capacityProfile: CAPACITY_PROFILE
});
assert.deepEqual(placement.bridgePlan, directPlan);
assert.deepEqual(
  buildPatternDiagnosticPlacement({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts: placementAttempts,
    capacityProfile: CAPACITY_PROFILE
  }),
  placement
);

const frozenAttempts = Object.freeze(placementAttempts.map((item) => Object.freeze({
  ...item,
  skillIds: Object.freeze([...item.skillIds])
})));
const attemptsSnapshot = JSON.stringify(frozenAttempts);
const capacitySnapshot = JSON.stringify(CAPACITY_PROFILE);
buildPatternDiagnosticPlacement({
  studentId: STUDENT_ID,
  activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  attempts: frozenAttempts,
  capacityProfile: CAPACITY_PROFILE
});
assert.equal(JSON.stringify(frozenAttempts), attemptsSnapshot);
assert.equal(JSON.stringify(CAPACITY_PROFILE), capacitySnapshot);

placementAttempts.forEach((item) => {
  assert.equal(validateKaniAttempt(item).success, true);
});

console.log('patternDiagnosticPlacement tests passed');

function deriveForPair(pair, attempts) {
  const evidence = deriveAll(attempts);
  return evidence.skills[pair[0].skillIds[0]];
}

function deriveAll(attempts) {
  return derivePatternDiagnosticEvidence({
    studentId: STUDENT_ID,
    activityId: PATTERN_DIAGNOSTIC_ACTIVITY_ID,
    attempts
  });
}

function pairFor(skillId) {
  return PATTERN_DIAGNOSTIC_QUESTIONS.filter((question) => question.skillIds[0] === skillId);
}

function attempt(question, overrides = {}) {
  const base = {
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
    completedAt: '2026-09-08T10:00:00.000Z'
  };
  return { ...base, ...overrides };
}
