import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { makeFractionGameAttempt } from '../fractions/fractionEquivalenceJourney.js';
import {
  runFractionTeacherReplay,
  runNotebookTeacherReplay,
} from './primaryTeacherRuntime.js';

const fixtureUrl = new URL('../../../../integration/primary/common-fixtures/division-notebook-work-replay.example.json', import.meta.url);
const fixtureLockUrl = new URL('../../../../integration/primary/common-fixtures.lock.json', import.meta.url);
const fixtureSource = await readFile(fixtureUrl, 'utf8');
const fixture = JSON.parse(fixtureSource);
const fixtureLock = JSON.parse(await readFile(fixtureLockUrl, 'utf8'));

function gitBlobSha(content) {
  const body = Buffer.from(content, 'utf8');
  return createHash('sha1')
    .update(`blob ${body.length}\0`)
    .update(body)
    .digest('hex');
}

// The notebook replay is a byte-for-byte snapshot of the Common-owned fixture.
assert.equal(fixtureLock.semanticAuthority, 'reallaksh19/Common');
assert.equal(fixtureLock.sourceCommit, '00ef138bfc69c9ec062c7cddcc53a8f40a1a4f08');
assert.equal(fixtureLock.fixtures[0].fixtureId, fixture.fixtureId);
assert.equal(gitBlobSha(fixtureSource), fixtureLock.fixtures[0].sourceGitBlobSha);

const notebookReplay = runNotebookTeacherReplay(fixture);
assert.equal(notebookReplay.semanticAuthority, 'reallaksh19/Common');
assert.equal(notebookReplay.sourceFixtureId, 'PRIMARY-MATH-NOTEBOOK-DIVISION-REPLAY-001');
assert.equal(notebookReplay.diagnoses.length, 1);
assert.deepEqual(notebookReplay.diagnoses[0], {
  diagnosisId: 'DX-CONTRAST-DIV-ZERO-QUOTIENT-001',
  code: 'PROCEDURAL_ERROR',
  confidence: 'MEDIUM',
  evidenceRefs: [
    'OBS-MWE-DIV-366-12',
    'OBS-MWE-DIV-7843-13',
    'OBS-MWE-DIV-3496-23',
  ],
  errorSignature: 'DIV_QUOTIENT_ZERO_PLACE_VALUE',
  informationNeeded: [
    'Can the learner correctly place a zero in the quotient when the current partial dividend is smaller than the divisor?',
  ],
  contrastSetId: 'CONTRAST-DIV-ZERO-QUOTIENT-001',
  contrastDimension: 'ZERO_IN_QUOTIENT_REQUIRED',
});

// Two zero-place failures through the written-algorithm route trigger a changed task structure,
// not a whole-topic reteach.
assert.equal(notebookReplay.currentLearningState.sameRouteFailures, 2);
assert.ok(notebookReplay.currentLearningState.sessionSignals.includes('SAME_ROUTE_FAILURE_REQUIRES_VARIATION'));
assert.equal(notebookReplay.teacherDecision.strategy, 'DIAGNOSE_BEFORE_RETEACH');
assert.equal(notebookReplay.teacherMove.type, 'ASK_TO_SHOW');
assert.deepEqual(notebookReplay.teacherMove.variation, {
  dimension: 'TASK_STRUCTURE',
  from: 'FULL_ROUTE',
  to: 'ONE_MECHANISM_AT_A_TIME',
});
assert.equal(notebookReplay.teacherMove.followUpRequirement, 'INDEPENDENT_RETRY_AFTER_REPAIR');
assert.match(notebookReplay.teacherMove.expectedChildAction, /zero quotient digit/i);

// Successful contrasting/substep evidence survives the incorrect final answers.
assert.ok(notebookReplay.currentLearningState.strengthEvidenceRefs.includes('MWE-DIV-3496-23'));
assert.ok(notebookReplay.currentLearningState.strengthEvidenceRefs.includes('MWE-ROUNDING-SET'));
const zeroPlaceWork = notebookReplay.observations.find((item) => item.observationId === 'OBS-MWE-DIV-7843-13');
assert.equal(zeroPlaceWork.mathematicalWorkEvidence.workSteps[0].status, 'CORRECT');
assert.equal(zeroPlaceWork.mathematicalWorkEvidence.workSteps[3].status, 'INCORRECT');

// Child-produced multiples tables remain child-produced strategy evidence, not conceptual hints.
assert.ok(notebookReplay.currentLearningState.childProducedStrategyRefs.includes('MWE-DIV-7843-13'));
assert.equal(zeroPlaceWork.mathematicalWorkEvidence.strategySupports[0].role, 'CHILD_PRODUCED');
assert.deepEqual(zeroPlaceWork.conceptualSupport, { level: 'H0', type: 'NONE' });

// Quantity/unit structure is preserved so the dozen problem cannot collapse into keyword arithmetic.
assert.deepEqual(notebookReplay.currentLearningState.quantityStructureRefs, ['MWE-DOZEN-COST']);
const dozenObservation = notebookReplay.observations.find((item) => item.observationId === 'OBS-MWE-DOZEN-COST');
assert.deepEqual(dozenObservation.mathematicalWorkEvidence.quantityStructure.requiredRelationships, [
  'CONVERT_GROUPED_UNIT',
  'MULTIPLY_QUANTITY_BY_RATE',
]);
assert.equal(dozenObservation.mathematicalWorkEvidence.workSteps[0].observedValue, '23 × 6 = 138');

// The wrong-operation word problem remains an operation-selection observation rather than a global division label.
const wrongOperation = notebookReplay.observations.find((item) => item.observationId === 'OBS-MWE-WP-3150-15');
assert.equal(wrongOperation.mathematicalWorkEvidence.selectedOperation, 'MULTIPLICATION');
assert.equal(wrongOperation.mathematicalWorkEvidence.promptStructure.expectedOperation, 'DIVISION');
assert.equal(JSON.stringify(notebookReplay).toLowerCase().includes('weak in division'), false);

// Teacher annotations remain provenance-separated and cannot overwrite child work.
const annotatedFixture = structuredClone(fixture);
annotatedFixture.workEvidence.find((work) => work.workEvidenceId === 'MWE-DIV-366-12').teacherAnnotations = [{
  annotationId: 'TA-1',
  kind: 'CORRECTION',
  value: '30 R6',
  provenance: 'TEACHER',
}];
const annotatedReplay = runNotebookTeacherReplay(annotatedFixture);
const annotatedObservation = annotatedReplay.observations.find((item) => item.observationId === 'OBS-MWE-DIV-366-12');
assert.equal(annotatedObservation.mathematicalWorkEvidence.teacherAnnotations[0].provenance, 'TEACHER');
assert.equal(annotatedReplay.diagnoses[0].errorSignature, 'DIV_QUOTIENT_ZERO_PLACE_VALUE');

// Ambiguity is preserved verbatim rather than silently reconstructed.
const ambiguousFixture = structuredClone(fixture);
ambiguousFixture.workEvidence.find((work) => work.workEvidenceId === 'MWE-DIV-366-12').workSteps.push({
  stepId: 'WS-366-AMB',
  sequence: 5,
  kind: 'OTHER',
  observedValue: 'unreadable handwritten mark',
  status: 'AMBIGUOUS',
});
const ambiguousReplay = runNotebookTeacherReplay(ambiguousFixture);
const ambiguousObservation = ambiguousReplay.observations.find((item) => item.observationId === 'OBS-MWE-DIV-366-12');
assert.equal(ambiguousObservation.mathematicalWorkEvidence.workSteps.at(-1).status, 'AMBIGUOUS');
assert.equal(ambiguousObservation.mathematicalWorkEvidence.workSteps.at(-1).observedValue, 'unreadable handwritten mark');

// Real #44 Kani attempt evidence flows into the runtime without importing judgement into Kani.
const fractionAttempts = [
  makeFractionGameAttempt({
    attemptId: 'ATT-P4-001',
    studentId: 'student-runtime-only',
    questionId: 'fraction-equiv-q-101',
    correct: true,
    completedAt: '2026-09-11T05:00:00.000Z',
  }),
  makeFractionGameAttempt({
    attemptId: 'ATT-P4-002',
    studentId: 'student-runtime-only',
    questionId: 'fraction-equiv-q-102',
    correct: true,
    completedAt: '2026-09-11T05:01:00.000Z',
  }),
  makeFractionGameAttempt({
    attemptId: 'ATT-P4-003',
    studentId: 'student-runtime-only',
    questionId: 'fraction-equiv-q-103',
    correct: false,
    completedAt: '2026-09-11T05:02:00.000Z',
  }),
];
const fractionReplay = runFractionTeacherReplay({ attempts: fractionAttempts });
assert.equal(fractionReplay.skillState.learningObjectId, 'MATH-FRAC-EQUIVALENCE');
assert.equal(fractionReplay.skillState.learningEvidence.acquisition, 'DEVELOPING');
assert.equal(fractionReplay.skillState.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(fractionReplay.diagnoses[0].code, 'INSUFFICIENT_EVIDENCE');
assert.equal(fractionReplay.teacherDecision.strategy, 'DIAGNOSE_BEFORE_RETEACH');
assert.equal(fractionReplay.teacherMove.type, 'ASK_TO_SHOW');
assert.equal('teacherDecision' in fractionAttempts[2].primaryEvidence, false);
assert.equal('masteryState' in fractionAttempts[2].primaryEvidence, false);

// A fresh successful return item is independent evidence, but delayed retention is still not inferred.
const independentReturnObservation = {
  observationId: 'OBS-FRAC-RETURN-001',
  learningObjectIds: ['MATH-FRAC-EQUIVALENCE'],
  kind: 'STUDY_HUB_RETURN',
  value: {
    correctness: 'CORRECT',
    evidenceRole: 'INDEPENDENT_RETURN',
    responseMode: 'EXPLAIN_OR_DRAW',
    routeSignature: 'STUDY_HUB:RETURN:EXPLAIN_OR_DRAW',
  },
  observedAt: '2026-09-11T05:10:00.000Z',
  conceptualSupport: { level: 'H0', type: 'NONE' },
  accessAdjustments: [],
  sourceStatus: 'VERIFIED',
};
const successfulFractionAttempts = fractionAttempts.map((attempt) => ({ ...attempt, correct: true }));
const returnReplay = runFractionTeacherReplay({
  attempts: successfulFractionAttempts,
  independentReturnObservation,
});
assert.equal(returnReplay.skillState.learningEvidence.independentUse, 'DEVELOPING');
assert.equal(returnReplay.skillState.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(returnReplay.diagnoses.length, 0);
assert.equal(returnReplay.teacherDecision.strategy, 'SCHEDULE_RETRIEVAL');
assert.equal(returnReplay.teacherMove.type, 'SCHEDULE_RETRIEVAL');

console.log('Primary Teacher Runtime Phase-4 fraction + notebook replay passed.');
