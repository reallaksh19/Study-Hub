import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  assertCrossTurnSourceStability,
  classifyAdjectiveAgainstSourceModel,
  evaluateInferenceResponse,
  grade4EnglishFixtureSummary,
  makeInferenceIndependentReturnObservation,
  respondToAdjectiveClarification,
  validateAdjectiveCategoryClaim,
} from './grade4EnglishVerticalSlice.js';

const base = new URL('../../../../', import.meta.url);
const fixtureUrl = new URL('integration/primary/common-fixtures/grade4-english-phase5.example.json', base);
const lockUrl = new URL('integration/primary/common-fixtures.lock.json', base);
const fixtureSource = await readFile(fixtureUrl, 'utf8');
const fixture = JSON.parse(fixtureSource);
const lock = JSON.parse(await readFile(lockUrl, 'utf8'));

function gitBlobSha(content) {
  const body = Buffer.from(content, 'utf8');
  return createHash('sha1')
    .update(`blob ${body.length}\0`)
    .update(body)
    .digest('hex');
}

const fixtureLock = lock.fixtures.find((item) => item.fixtureId === 'PRIMARY-G4-ENGLISH-PHASE5-001');
assert.ok(fixtureLock, 'English Common fixture lock is required');
assert.equal(fixtureLock.sourceCommit, 'c2a4a32335f6e26fc0b9359c2a6bdb640d2b4831');
assert.equal(fixtureLock.sourceGitBlobSha, 'd6255d7cb2e49e859245fbb9adedd02524c47339');
assert.equal(gitBlobSha(fixtureSource), fixtureLock.sourceGitBlobSha);

const summary = grade4EnglishFixtureSummary(fixture);
assert.deepEqual(summary.learningObjectIds, [
  'ENG-INFERENCE-TEXT-EVIDENCE',
  'ENG-ADJECTIVE-ORDER-RECOGNITION',
]);
assert.deepEqual(summary.inferenceEvidenceModel, ['ANSWER', 'TEXT_CLUE', 'CONNECTION']);
assert.deepEqual(summary.sourceOrder, [
  'NUMBER', 'OPINION', 'SIZE', 'AGE', 'SHAPE', 'COLOUR', 'ORIGIN', 'MATERIAL', 'PURPOSE',
]);

// A correct-looking inference without text evidence is not secure comprehension.
const answerOnly = evaluateInferenceResponse(fixture, {
  responseMode: 'WRITTEN',
  answer: 'She thought it was going to rain.',
  textClue: '',
  connection: '',
});
assert.equal(answerOnly.evidenceStatus, 'INSUFFICIENT_EVIDENCE');
assert.equal(answerOnly.errorSignature, 'EVIDENCE_NOT_PROVIDED');
assert.equal(answerOnly.diagnosis.code, 'INSUFFICIENT_EVIDENCE');
assert.equal(answerOnly.teacherMove.type, 'ASK_TO_SHOW');
assert.match(answerOnly.teacherMove.expectedChildAction, /words in the text/i);

// Answer + relevant clue + connection produces stronger evidence and a fresh independent turn.
const supported = evaluateInferenceResponse(fixture, {
  responseMode: 'WRITTEN',
  answer: 'She thought it was going to rain.',
  textClue: 'dark clouds',
  connection: 'Dark clouds can mean rain, so she wanted to keep the clothes dry.',
});
assert.equal(supported.evidenceStatus, 'DEVELOPING');
assert.equal(supported.errorSignature, null);
assert.equal(supported.diagnosis, null);
assert.equal(supported.teacherMove.type, 'GIVE_INDEPENDENT_TURN');

// Oral and written response modes remain distinct observable evidence.
const oral = evaluateInferenceResponse(fixture, {
  responseMode: 'ORAL',
  answer: 'She thought it was going to rain.',
  textClue: 'dark clouds',
  connection: 'Dark clouds can signal rain.',
});
assert.equal(oral.observation.value.responseMode, 'ORAL');
assert.equal(supported.observation.value.responseMode, 'WRITTEN');

// A different answer with a relevant clue is not mechanically marked wrong; ask for the reasoning link.
const alternative = evaluateInferenceResponse(fixture, {
  responseMode: 'ORAL',
  answer: 'She wanted to protect the clothes.',
  textClue: 'dark clouds',
  connection: 'The clouds made her think the clothes could get wet.',
});
assert.equal(alternative.evidenceStatus, 'TEACHER_JUDGMENT');
assert.equal(alternative.diagnosis.code, 'INSUFFICIENT_EVIDENCE');
assert.equal(alternative.teacherMove.type, 'ASK_TO_EXPLAIN');

const independentReturn = makeInferenceIndependentReturnObservation(fixture, {
  responseMode: 'WRITTEN',
  answer: 'He needed to return the library book.',
  textClue: 'library books were due that morning',
  connection: 'He put it in his bag so he could return it at school.',
});
assert.equal(independentReturn.value.evidenceRole, 'INDEPENDENT_RETURN');
assert.deepEqual(independentReturn.conceptualSupport, { level: 'H0', type: 'NONE' });
assert.deepEqual(independentReturn.value.requiredEvidence, ['ANSWER', 'TEXT_CLUE', 'CONNECTION']);
assert.throws(() => makeInferenceIndependentReturnObservation(fixture, {
  responseMode: 'WRITTEN',
  conceptualSupport: { level: 'H1', type: 'PROMPT' },
}), /must use H0 conceptual support/i);

// Preserve the workbook's short source model exactly.
const large = classifyAdjectiveAgainstSourceModel(fixture, 'large');
assert.equal(large.status, 'VERIFIED');
assert.equal(large.sourceCategory, 'SIZE');
assert.match(large.recognitionCue, /how big/i);

const tiny = classifyAdjectiveAgainstSourceModel(fixture, 'tiny');
assert.equal(tiny.status, 'VERIFIED');
assert.equal(tiny.sourceCategory, 'SIZE');

for (const word of ['heavy', 'handmade', 'broken']) {
  const boundary = classifyAdjectiveAgainstSourceModel(fixture, word);
  assert.equal(boundary.status, 'SOURCE_MODEL_BOUNDARY');
  assert.equal(boundary.sourceCategory, null);
  assert.match(boundary.childFriendlyExplanation, /source-boundary|short adjective list/i);
}

// Invented categories must be rejected even if they sound linguistically plausible.
for (const [word, category] of [
  ['heavy', 'QUALITY'],
  ['heavy', 'PHYSICAL_QUALITY'],
  ['broken', 'CONDITION'],
  ['handmade', 'QUALITY_TYPE'],
]) {
  const claim = validateAdjectiveCategoryClaim(fixture, word, category);
  assert.equal(claim.accepted, false);
  assert.equal(claim.status, 'SOURCE_MODEL_BOUNDARY');
  assert.equal(claim.reason, 'FORBIDDEN_INVENTED_SOURCE_CATEGORY');
}

const clarification = respondToAdjectiveClarification(fixture, 'Large?');
assert.equal(clarification.teacherMove.type, 'ASK_TO_NOTICE');
assert.match(clarification.teacherMove.explanation, /how big.*SIZE/i);
assert.equal(clarification.tinyCheck.expectedAnswer, 'SIZE');
assert.match(clarification.tinyCheck.prompt, /tiny/i);

// Cross-turn source classification may not silently drift.
assert.equal(assertCrossTurnSourceStability([
  { word: 'large', sourceCategory: 'SIZE' },
  { word: 'large', sourceCategory: 'SIZE' },
  { word: 'heavy', sourceCategory: null },
  { word: 'heavy', sourceCategory: null },
]), true);
assert.throws(() => assertCrossTurnSourceStability([
  { word: 'large', sourceCategory: 'SIZE' },
  { word: 'large', sourceCategory: 'OPINION' },
]), /classification drift/i);
assert.equal(assertCrossTurnSourceStability([
  { word: 'large', sourceCategory: 'SIZE' },
  { word: 'large', sourceCategory: 'OPINION' },
], {
  explicitCorrection: true,
  correctionReason: 'new source evidence',
}), true);

const serialized = JSON.stringify({ answerOnly, supported, oral, alternative, clarification }).toUpperCase();
assert.equal(serialized.includes('PHYSICAL_QUALITY'), false);
assert.equal(serialized.includes('QUALITY_TYPE'), false);
assert.equal(serialized.includes('CONDITION'), false);

console.log('Grade 4 English Phase-5 inference + adjective source-boundary regressions passed.');
