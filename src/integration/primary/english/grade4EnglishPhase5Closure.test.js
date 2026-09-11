import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeEnglishInferenceGameAttempt } from './englishInferenceJourney.js';
import { makeInferenceIndependentReturnObservation } from './grade4EnglishVerticalSlice.js';
import {
  buildEnglishObservationReadyPlan,
  replayRepeatedAdjectiveConfusion,
  runEnglishTeacherRuntimeFromEvidenceEnvelope,
} from './grade4EnglishPhase5Closure.js';

const fixtureUrl = new URL('../../../../integration/primary/common-fixtures/grade4-english-phase5.example.json', import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'));

const attempts = Array.from({ length: 4 }, (_, index) => makeEnglishInferenceGameAttempt({
  attemptId: `ATT-ENG-CLOSE-${index + 1}`,
  studentId: 'student-runtime-only',
  questionId: `eng-inference-q-10${index + 1}`,
  correct: index !== 2,
  completedAt: `2026-09-11T09:0${index}:00.000Z`,
}));

// Game evidence alone cannot become independent inference-with-evidence or mastery.
const gameOnly = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [],
}, fixture);
assert.equal(gameOnly.learningEvidence.acquisition, 'DEVELOPING');
assert.equal(gameOnly.learningEvidence.independentUse, 'NOT_YET_TESTED');
assert.equal(gameOnly.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(gameOnly.diagnosis.code, 'INSUFFICIENT_EVIDENCE');
assert.equal(gameOnly.teacherMove.type, 'GIVE_INDEPENDENT_TURN');
assert.match(gameOnly.teacherMove.expectedChildAction, /answer.*text clue.*connection/i);
assert.equal(JSON.stringify(gameOnly).toLowerCase().includes('masteryscore'), false);

// A complete open response is observable evidence, but its interpretive correctness
// is NOT fabricated from free-text matching. Without explicit judgement it remains TEACHER_JUDGMENT.
const rawWrittenReturn = makeInferenceIndependentReturnObservation(fixture, {
  responseMode: 'WRITTEN',
  answer: 'He needed to return the library book.',
  textClue: 'library books were due that morning',
  connection: 'Putting it in his bag would let him take it to school and return it.',
}, {
  observedAt: '2026-09-11T09:10:00.000Z',
});
const unjudged = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [rawWrittenReturn],
}, fixture);
assert.equal(unjudged.evaluatedReturn.evidenceStatus, 'TEACHER_JUDGMENT');
assert.equal(unjudged.learningEvidence.independentUse, 'TEACHER_JUDGMENT');
assert.equal(unjudged.diagnosis.code, 'INSUFFICIENT_EVIDENCE');
assert.equal(unjudged.teacherDecision.strategy, 'REVIEW_EVIDENCE');
assert.notEqual(unjudged.teacherMove.type, 'SCHEDULE_RETRIEVAL');

// A teacher/source-grounded judgement can confirm the independent return, after which
// retrieval is scheduled while durability remains explicitly untested.
const writtenReturn = structuredClone(rawWrittenReturn);
writtenReturn.value.evaluation = {
  status: 'SUPPORTED',
  provenance: 'TEACHER',
  rationale: 'The cited due-date clue supports the inference that Arun brought the book to return it.',
};
const returned = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [writtenReturn],
}, fixture);
assert.equal(returned.evaluatedReturn.observation.value.responseMode, 'WRITTEN');
assert.equal(returned.evaluatedReturn.evidenceStatus, 'DEVELOPING');
assert.equal(returned.learningEvidence.independentUse, 'DEVELOPING');
assert.equal(returned.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(returned.diagnosis, null);
assert.equal(returned.teacherDecision.strategy, 'SCHEDULE_RETRIEVAL');
assert.equal(returned.teacherMove.type, 'SCHEDULE_RETRIEVAL');
assert.match(returned.teacherMove.expectedChildAction, /3–7 days later/);

// Oral response remains distinct observable evidence without changing the target.
const oralReturn = makeInferenceIndependentReturnObservation(fixture, {
  responseMode: 'ORAL',
  answer: 'He needed to return the library book.',
  textClue: 'library books were due that morning',
  connection: 'The due date explains why he took the book to school.',
}, {
  observationId: 'OBS-ENG-INF-RETURN-ORAL',
  observedAt: '2026-09-11T09:11:00.000Z',
});
oralReturn.value.evaluation = {
  status: 'SUPPORTED',
  provenance: 'SUPERVISED_OBSERVER',
};
const oralTrace = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [oralReturn],
}, fixture);
assert.equal(oralTrace.evaluatedReturn.observation.value.responseMode, 'ORAL');
assert.equal(oralTrace.learningObjectId, returned.learningObjectId);
assert.equal(oralTrace.learningEvidence.independentUse, 'DEVELOPING');

// A response missing clue/connection remains insufficient regardless of a plausible answer.
const answerOnlyReturn = makeInferenceIndependentReturnObservation(fixture, {
  responseMode: 'WRITTEN',
  answer: 'He needed to return the library book.',
  textClue: '',
  connection: '',
}, {
  observationId: 'OBS-ENG-INF-RETURN-NO-CLUE',
  observedAt: '2026-09-11T09:12:00.000Z',
});
const answerOnlyTrace = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [answerOnlyReturn],
}, fixture);
assert.equal(answerOnlyTrace.diagnosis.code, 'INSUFFICIENT_EVIDENCE');
assert.equal(answerOnlyTrace.teacherMove.type, 'ASK_TO_SHOW');
assert.notEqual(answerOnlyTrace.teacherDecision.strategy, 'SCHEDULE_RETRIEVAL');

// Explicit NOT_SUPPORTED judgement triggers repair rather than silent binary matching.
const unsupportedReturn = structuredClone(rawWrittenReturn);
unsupportedReturn.observationId = 'OBS-ENG-INF-RETURN-UNSUPPORTED';
unsupportedReturn.value.evaluation = {
  status: 'NOT_SUPPORTED',
  provenance: 'TEACHER',
};
const unsupportedTrace = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'SQLITE',
  attempts,
  nonGameObservations: [unsupportedReturn],
}, fixture);
assert.equal(unsupportedTrace.learningEvidence.independentUse, 'EMERGING');
assert.equal(unsupportedTrace.diagnosis.code, 'INFERENCE_ERROR');
assert.equal(unsupportedTrace.teacherMove.type, 'COMPARE');

// Persistence profile is transport metadata only; educational trace is identical.
const firebaseTrace = runEnglishTeacherRuntimeFromEvidenceEnvelope({
  providerProfile: 'FIREBASE',
  attempts,
  nonGameObservations: [writtenReturn],
}, fixture);
const stripTransport = (trace) => {
  const { transportMetadata: _transportMetadata, ...educational } = trace;
  return educational;
};
assert.deepEqual(stripTransport(firebaseTrace), stripTransport(returned));
assert.equal(firebaseTrace.transportMetadata.providerProfile, 'FIREBASE');
assert.equal(returned.transportMetadata.providerProfile, 'SQLITE');

// First clarification uses the source recognition cue plus a tiny child check.
const firstClarification = replayRepeatedAdjectiveConfusion(fixture, {
  word: 'large',
  sameRouteFailures: 0,
});
assert.equal(firstClarification.teacherMove.type, 'ASK_TO_NOTICE');
assert.match(firstClarification.teacherMove.explanation, /how big.*SIZE/i);
assert.match(firstClarification.teacherMove.expectedChildAction, /tiny/i);
assert.equal(firstClarification.routeSignature, 'VERBAL_SOURCE_QUESTION:HOW_BIG_OR_SMALL');

// Two failures through the same route materially change representation/task structure.
const variedClarification = replayRepeatedAdjectiveConfusion(fixture, {
  word: 'large',
  sameRouteFailures: 2,
});
assert.equal(variedClarification.teacherDecision.strategy, 'CHANGE_REPRESENTATION');
assert.equal(variedClarification.teacherMove.type, 'COMPARE');
assert.deepEqual(variedClarification.teacherMove.variation, {
  dimension: 'EXAMPLE_NON_EXAMPLE_CONTRAST',
  from: 'VERBAL_SOURCE_QUESTION',
  to: 'WORD_PAIR_SORT',
});
assert.match(variedClarification.teacherMove.expectedChildAction, /SIZE/);
assert.equal(variedClarification.teacherMove.followUpRequirement, 'INDEPENDENT_RETRY_AFTER_REPAIR');

// Boundary words remain outside the short source model rather than acquiring invented categories.
const boundary = replayRepeatedAdjectiveConfusion(fixture, {
  word: 'heavy',
  sameRouteFailures: 2,
});
assert.equal(boundary.diagnosis.code, 'SOURCE_MODEL_BOUNDARY');
assert.equal(boundary.classification.sourceCategory, null);
assert.match(boundary.teacherMove.explanation, /does not give.*clear category/i);
const boundarySerialized = JSON.stringify(boundary).toUpperCase();
for (const invented of ['PHYSICAL_QUALITY', 'QUALITY_TYPE', 'CONDITION']) {
  assert.equal(boundarySerialized.includes(invented), false);
}

// Observation-ready handoff contains no real child data and explicitly exposes #50 risks.
const plan = buildEnglishObservationReadyPlan(fixture);
assert.equal(plan.containsRealChildData, false);
assert.equal(plan.inferenceJourney.missionToken, 'P4EI7Q2K');
assert.equal(plan.inferenceJourney.timerPolicy, 'OFF');
assert.equal(plan.inferenceJourney.gameEvidenceMeaning, 'RECENT_PRACTICE_NOT_MASTERY');
assert.deepEqual(plan.inferenceJourney.returnRequiredEvidence, ['ANSWER', 'TEXT_CLUE', 'CONNECTION']);
assert.deepEqual(plan.inferenceJourney.responseModeChoice, ['ORAL', 'WRITTEN']);
assert.equal(plan.inferenceJourney.openResponseEvaluation, 'EXPLICIT_TEACHER_OR_SOURCE_JUDGMENT_REQUIRED');
assert.equal(plan.inferenceJourney.delayedRetrieval.status, 'NOT_YET_TESTED');
assert.equal(plan.adjectiveBoundaryJourney.boundaryWord, 'heavy');
assert.equal(plan.adjectiveBoundaryJourney.repeatedConfusionPolicy, 'TWO_SAME_ROUTE_FAILURES_REQUIRE_VARIATION');
assert.ok(plan.supervisedObservationChecks.some((item) => /rush/i.test(item)));
assert.ok(plan.supervisedObservationChecks.some((item) => /return/i.test(item)));
assert.ok(plan.supervisedObservationChecks.some((item) => /teacher.*supports/i.test(item)));
assert.ok(plan.supervisedObservationChecks.some((item) => /heavy.*SOURCE_MODEL_BOUNDARY/i.test(item)));

console.log('Grade 4 English Phase-5 closure + observation-readiness replay passed.');
