import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  applyDiagnosticProbeOutcome,
  replayGoldenProjection,
  runSyntheticReplayMatrix,
} from './primaryTeacherRuntimeReplays.js';

const base = new URL('../../../../', import.meta.url);
const syntheticFixtureUrl = new URL('integration/primary/replays/primary-teacher-runtime-synthetic-v1.json', base);
const goldenUrl = new URL('integration/primary/replays/primary-teacher-runtime-synthetic-v1.golden.json', base);
const notebookFixtureUrl = new URL('integration/primary/common-fixtures/division-notebook-work-replay.example.json', base);
const diagnosticFixtureUrl = new URL('integration/primary/common-fixtures/division-zero-place-diagnostic-probe.example.json', base);
const fixtureLockUrl = new URL('integration/primary/common-fixtures.lock.json', base);
const semanticLockUrl = new URL('integration/primary/common-semantic.lock.json', base);

const syntheticFixture = JSON.parse(await readFile(syntheticFixtureUrl, 'utf8'));
const golden = JSON.parse(await readFile(goldenUrl, 'utf8'));
const notebookSource = await readFile(notebookFixtureUrl, 'utf8');
const notebookFixture = JSON.parse(notebookSource);
const diagnosticSource = await readFile(diagnosticFixtureUrl, 'utf8');
const diagnosticFixture = JSON.parse(diagnosticSource);
const fixtureLock = JSON.parse(await readFile(fixtureLockUrl, 'utf8'));
const semanticLock = JSON.parse(await readFile(semanticLockUrl, 'utf8'));

function gitBlobSha(content) {
  const body = Buffer.from(content, 'utf8');
  return createHash('sha1')
    .update(`blob ${body.length}\0`)
    .update(body)
    .digest('hex');
}

// Keep the Phase-3 primary semantic ref stable while pinning the newer diagnostic companion independently.
assert.equal(semanticLock.sourceCommit, '00ef138bfc69c9ec062c7cddcc53a8f40a1a4f08');
assert.equal(semanticLock.diagnosticReasoningSourceCommit, 'eaa548033d1daa398bcf35a60d1873d1ed3c5df3');
assert.equal(semanticLock.diagnosticReasoningPath, 'Primary/Architecture/PRIMARY_DIAGNOSTIC_REASONING.md');
assert.equal(semanticLock.diagnosticReasoningSchemaPath, 'Primary/Architecture/contracts/v1/primary-diagnostic-reasoning.schema.json');
assert.equal(semanticLock.diagnosticReasoningSchemaGitBlobSha, '52689b92ea095c318ed66f9b6b37f6232e43ba2e');
assert.equal(fixtureLock.sourceCommit, semanticLock.sourceCommit);

const notebookLock = fixtureLock.fixtures.find((item) => item.fixtureId === 'PRIMARY-MATH-NOTEBOOK-DIVISION-REPLAY-001');
const diagnosticLock = fixtureLock.fixtures.find((item) => item.fixtureId === 'PRIMARY-DIAGNOSTIC-DIVISION-ZERO-PLACE-001');
assert.equal(notebookLock.sourceCommit, semanticLock.sourceCommit);
assert.equal(diagnosticLock.sourceCommit, semanticLock.diagnosticReasoningSourceCommit);
assert.equal(gitBlobSha(notebookSource), notebookLock.sourceGitBlobSha);
assert.equal(gitBlobSha(diagnosticSource), diagnosticLock.sourceGitBlobSha);
assert.equal(diagnosticLock.sourceGitBlobSha, '2beb4c1d32a2490a109001321c493e5da888fa59');

const matrix = runSyntheticReplayMatrix(syntheticFixture, {
  notebookFixture,
  diagnosticFixture,
});
assert.equal(matrix.scenarios.length, 8);
assert.deepEqual(replayGoldenProjection(matrix), golden);

const byId = new Map(matrix.scenarios.map((item) => [item.scenarioId, item]));

// A: confirmed concept confusion changes representation and still requires independent retry.
const concept = byId.get('A_CONCEPT_CONFUSION');
assert.equal(concept.diagnoses[0].code, 'CONCEPTUAL_MISCONCEPTION');
assert.equal(concept.diagnoses[0].confidence, 'MEDIUM');
assert.equal(concept.teacherMove.type, 'CHANGE_REPRESENTATION');
assert.equal(concept.teacherMove.followUpRequirement, 'INDEPENDENT_RETRY_AFTER_REPAIR');
assert.equal(new Set(concept.observations.map((item) => item.value.routeSignature)).size, 2);

// B: an isolated self-corrected error with prior successes does not trigger broad reteaching.
const lapse = byId.get('B_PERFORMANCE_LAPSE');
assert.equal(lapse.diagnoses[0].code, 'PERFORMANCE_LAPSE');
assert.equal(lapse.teacherDecision.strategy, 'GIVE_INDEPENDENT_RETRY');
assert.equal(lapse.teacherMove.type, 'GIVE_INDEPENDENT_TURN');

// C: reduced language is access support, not conceptual help.
const language = byId.get('C_LANGUAGE_BOTTLENECK');
assert.equal(language.diagnoses[0].code, 'LANGUAGE_COMPREHENSION_ERROR');
assert.equal(language.teacherMove.type, 'REDUCE_LANGUAGE');
assert.deepEqual(language.observations[1].accessAdjustments, ['REDUCED_LANGUAGE']);
assert.deepEqual(language.observations[1].conceptualSupport, { level: 'H0', type: 'NONE' });

// D: repeated I-don't-know responses through one route force a meaningful route change.
const dontKnow = byId.get('D_REPEATED_DONT_KNOW');
assert.equal(dontKnow.currentLearningState.repeatedDontKnow, 2);
assert.equal(dontKnow.teacherDecision.strategy, 'CHANGE_REPRESENTATION');
assert.deepEqual(dontKnow.teacherMove.variation, {
  dimension: 'REPRESENTATION',
  from: 'SYMBOLIC_VERBAL',
  to: 'VISUAL_OR_CONCRETE',
});

// E: fast unsupported independence receives bounded agency for transfer, not more drill.
const fast = byId.get('E_FAST_INDEPENDENCE');
assert.equal(fast.skillState.learningEvidence.independentUse, 'SECURE');
assert.equal(fast.teacherDecision.strategy, 'EXTEND_TO_TRANSFER');
assert.equal(fast.teacherMove.type, 'OFFER_BOUNDED_CHOICE');
assert.deepEqual(fast.teacherMove.choices, ['DRAW_AND_EXPLAIN', 'NEW_CONTEXT_PROBLEM']);

// F: immediate success schedules delayed retrieval; later failure remains a separate retention signal.
const retention = byId.get('F_DELAYED_RETENTION');
assert.equal(retention.immediate.skillState.learningEvidence.delayedRetention, 'NOT_YET_TESTED');
assert.equal(retention.immediate.teacherMove.type, 'SCHEDULE_RETRIEVAL');
assert.equal(retention.delayed.skillState.learningEvidence.delayedRetention, 'EMERGING');
assert.equal(retention.delayed.diagnoses[0].code, 'MEMORY_RETRIEVAL_FAILURE');
assert.equal(retention.delayed.teacherMove.type, 'RETRIEVE_PRIOR_KNOWLEDGE');
assert.equal(retention.delayed.teacherMove.followUpRequirement, 'INDEPENDENT_RETRY_AFTER_REPAIR');

// G: controlled structural contrast + first-class probe updates a narrow competing hypothesis.
const notebook = byId.get('G_NOTEBOOK_CONTRAST_PROBE');
assert.equal(notebook.notebookReplay.diagnoses[0].errorSignature, 'DIV_QUOTIENT_ZERO_PLACE_VALUE');
assert.equal(notebook.probeOutcome.manipulatedFeature.id, 'QUOTIENT_ZERO_REQUIRED');
assert.deepEqual(notebook.probeOutcome.controlledLoad, {
  language: 'LOW',
  representationNovelty: 'LOW',
  factRetrievalDemand: 'LOW',
  stepCount: 'SMALL',
});
assert.equal(notebook.probeOutcome.matchedRule.increasesHypothesis, 'H-DIV-ZERO-PLACE');
assert.equal(
  notebook.probeOutcome.updatedHypotheses.find((item) => item.hypothesisId === 'H-DIV-ZERO-PLACE').confidence,
  'HIGH',
);
assert.equal(notebook.teacherMove.followUpRequirement, 'INDEPENDENT_RETRY_AFTER_REPAIR');

// Probe outcomes that fail both controlled items keep both hypotheses open rather than inventing certainty.
const unresolvedProbe = applyDiagnosticProbeOutcome(diagnosticFixture, {
  'DP-DIV-NOZERO': 'INCORRECT',
  'DP-DIV-ZERO': 'INCORRECT',
});
assert.deepEqual(unresolvedProbe.matchedRule.keepOpen, [
  'H-DIV-GENERAL-PROCEDURE',
  'H-DIV-ZERO-PLACE',
]);
assert.equal(unresolvedProbe.teacherDecision.strategy, 'DIAGNOSE_BEFORE_RETEACH');
assert.deepEqual(unresolvedProbe.teacherDecision.evidenceStillNeeded, ['FACT_RETRIEVAL', 'PLACE_VALUE']);

// H: quantity/unit structure drives diagnosis independently of the final multiplication result.
const quantity = byId.get('H_QUANTITY_UNIT_CHAIN');
assert.equal(quantity.diagnoses[0].code, 'TASK_INTERPRETATION_ERROR');
assert.equal(quantity.diagnoses[0].errorSignature, 'UNIT_GROUP_NOT_EXPANDED');
assert.equal(quantity.teacherMove.type, 'CHANGE_REPRESENTATION');
assert.match(quantity.teacherMove.expectedChildAction, /quantity.*unit.*conversion.*rate/i);
assert.deepEqual(
  quantity.observations[0].mathematicalWorkEvidence.quantityStructure.requiredRelationships,
  ['CONVERT_GROUPED_UNIT', 'MULTIPLY_QUANTITY_BY_RATE'],
);

// Support fading is explicit: success at H2 then H1 requests a fresh H0 turn.
assert.equal(matrix.supportFading.teacherDecision.strategy, 'FADE_SUPPORT');
assert.equal(matrix.supportFading.teacherMove.type, 'FADE_SUPPORT');
assert.match(matrix.supportFading.teacherMove.expectedChildAction, /H0/);

// Stop rule remains session-scoped and does not create a durable trait.
assert.equal(matrix.stopRule.currentLearningState.learnerReportedFatigue, true);
assert.equal(matrix.stopRule.teacherDecision.strategy, 'END_EPISODE');
assert.equal(matrix.stopRule.teacherMove.type, 'END_SESSION');

// Runtime traces must never collapse into one mastery score or a fixed learner label.
const serialized = JSON.stringify(matrix).toLowerCase();
assert.equal(serialized.includes('masteryscore'), false);
assert.equal(serialized.includes('weak in division'), false);
assert.equal(serialized.includes('fixed ability'), false);

console.log('Primary Teacher Runtime Phase-4 synthetic replay matrix A-H passed.');
