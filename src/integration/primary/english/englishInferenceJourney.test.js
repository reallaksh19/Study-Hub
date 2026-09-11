import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ENGLISH_INFERENCE_LEARNING_OBJECT_ID,
  englishInferenceMissionQuestionIds,
  englishInferenceQuestions,
  validateEnglishInferenceContent,
} from './englishInferenceContent.js';
import {
  ENGLISH_PHASE5_FIXTURE_REF,
  englishInferenceDelayedRetrievalTask,
  englishInferenceEpisodeProjection,
  englishInferenceExperienceManifest,
  englishInferenceKaniMission,
  englishInferenceMissionResolver,
  englishInferenceQrLaunch,
  englishInferenceReturnTask,
  makeEnglishInferenceGameAttempt,
  validateEnglishInferenceJourney,
} from './englishInferenceJourney.js';
import {
  evaluateInferenceResponse,
  makeInferenceIndependentReturnObservation,
} from './grade4EnglishVerticalSlice.js';

const fixtureUrl = new URL('../../../../integration/primary/common-fixtures/grade4-english-phase5.example.json', import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'));

assert.equal(validateEnglishInferenceContent().success, true);
assert.equal(validateEnglishInferenceJourney().success, true);
assert.equal(ENGLISH_PHASE5_FIXTURE_REF.fixtureId, fixture.fixtureId);

assert.equal(englishInferenceEpisodeProjection.learningObjectIds[0], ENGLISH_INFERENCE_LEARNING_OBJECT_ID);
assert.equal(englishInferenceExperienceManifest.learningEpisodeId, englishInferenceEpisodeProjection.episodeId);
assert.equal(englishInferenceKaniMission.learningEpisodeId, englishInferenceEpisodeProjection.episodeId);
assert.deepEqual(englishInferenceMissionQuestionIds, [
  'eng-inference-q-101',
  'eng-inference-q-102',
  'eng-inference-q-103',
  'eng-inference-q-104',
  'eng-inference-q-105',
  'eng-inference-q-106',
]);
assert.equal(englishInferenceKaniMission.questionRefs.length, 6);
assert.equal(englishInferenceKaniMission.timerPolicy, 'OFF');
assert.equal(englishInferenceKaniMission.launchPolicy.gate, 'ATTEMPT_NOT_SCORE');
assert.equal(englishInferenceKaniMission.completionPolicy.means, 'ACTIVITY_COMPLETED');
assert.equal(englishInferenceKaniMission.returnPolicy.required, true);
assert.equal(englishInferenceKaniMission.returnPolicy.endlessGameChain, false);

assert.deepEqual(englishInferenceReturnTask.requiredEvidenceParts, ['ANSWER', 'TEXT_CLUE', 'CONNECTION']);
assert.equal(englishInferenceReturnTask.conceptualSupportExpected, 'H0');
assert.deepEqual(englishInferenceReturnTask.allowedResponseModes, ['ORAL', 'WRITTEN']);
assert.equal(englishInferenceDelayedRetrievalTask.status, 'NOT_YET_TESTED');
assert.equal(englishInferenceDelayedRetrievalTask.earliestDays, 3);
assert.equal(englishInferenceDelayedRetrievalTask.latestDays, 7);

// Mission/QR transport never embeds learner identity, answer truth or Teacher Runtime judgement.
const missionSerialized = JSON.stringify(englishInferenceKaniMission);
for (const forbidden of ['studentId', 'answerIndex', 'correctAnswer', 'teacherDecision', 'teacherMove', 'masteryState']) {
  assert.equal(missionSerialized.includes(forbidden), false, `${forbidden} leaked into mission transport`);
}
const qrSerialized = JSON.stringify(englishInferenceQrLaunch);
for (const forbidden of ['studentId', 'answer', 'mastery', 'skillState']) {
  assert.equal(qrSerialized.includes(forbidden), false, `${forbidden} leaked into QR transport`);
}
assert.deepEqual(englishInferenceMissionResolver[englishInferenceQrLaunch.opaqueId], {
  missionId: 'KM-G4-ENG-INFERENCE-001',
  renderer: 'inference-investigator',
});

// Game attempts are evidence only; selected-answer accuracy does not become full inference evidence.
const gameAttempt = makeEnglishInferenceGameAttempt({
  attemptId: 'ATT-ENG-INF-TEST-001',
  studentId: 'student-bound-at-runtime',
  questionId: englishInferenceMissionQuestionIds[0],
  correct: true,
});
assert.equal(gameAttempt.correct, true);
assert.equal(gameAttempt.primaryEvidence.responseMode, 'SELECT');
assert.equal(gameAttempt.primaryEvidence.learningObjectIds[0], ENGLISH_INFERENCE_LEARNING_OBJECT_ID);
assert.equal('masteryState' in gameAttempt.primaryEvidence, false);
assert.equal('teacherDecision' in gameAttempt.primaryEvidence, false);
assert.equal('textClue' in gameAttempt.primaryEvidence, false);
assert.equal('connection' in gameAttempt.primaryEvidence, false);

// The non-game return is where answer + clue + connection are required independently at H0.
const returnObservation = makeInferenceIndependentReturnObservation(fixture, {
  responseMode: 'WRITTEN',
  answer: 'He needed to return the library book.',
  textClue: 'library books were due that morning',
  connection: 'Taking the book to school would let him return it.',
});
assert.equal(returnObservation.value.evidenceRole, 'INDEPENDENT_RETURN');
assert.deepEqual(returnObservation.value.requiredEvidence, ['ANSWER', 'TEXT_CLUE', 'CONNECTION']);
assert.deepEqual(returnObservation.conceptualSupport, { level: 'H0', type: 'NONE' });

// Immediate selected-answer success still cannot substitute for textual-evidence reasoning.
const answerOnly = evaluateInferenceResponse(fixture, {
  responseMode: 'WRITTEN',
  answer: fixture.inferenceFixture.defensibleResponse.answer,
  textClue: '',
  connection: '',
});
assert.equal(answerOnly.evidenceStatus, 'INSUFFICIENT_EVIDENCE');
assert.equal(answerOnly.teacherMove.type, 'ASK_TO_SHOW');

// Mission contexts vary while keeping the same learning object and evidence demand.
assert.ok(englishInferenceQuestions.slice(0, 6).every((question) => question.skillIds.includes('skill_inference-text-evidence')));
assert.ok(englishInferenceQuestions.slice(0, 6).every((question) => question.conceptTags.includes('inference')));
assert.equal(new Set(englishInferenceQuestions.slice(0, 6).map((question) => question.prompt)).size, 6);

console.log('Grade 4 English Phase-5 inference journey contracts passed.');
