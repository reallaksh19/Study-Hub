import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FRACTION_COMMON_SEMANTIC_REF,
  fractionDelayedRetrievalTask,
  fractionEpisodeProjection,
  fractionExperienceManifest,
  fractionKaniMission,
  fractionMissionResolver,
  fractionPrototypeScopeBasis,
  fractionQrLaunch,
  fractionReturnTask,
  makeFractionGameAttempt,
  validateFractionJourney,
} from './fractionEquivalenceJourney.js';
import {
  fractionMissionQuestionIds,
  validateFractionEquivalenceContent,
} from './fractionEquivalenceContent.js';
import { validateKaniAttempt } from '../../contracts/kaniContracts.js';

assert.equal(validateFractionEquivalenceContent().success, true, 'canonical fraction content fixture should validate');
assert.equal(validateFractionJourney().success, true, 'complete fraction journey should satisfy Phase-3 plumbing invariants');

// The Study-Hub projection must remain pinned to the exact Common semantic lock.
const lock = JSON.parse(await readFile(new URL('../../../../integration/primary/common-semantic.lock.json', import.meta.url), 'utf8'));
assert.equal(FRACTION_COMMON_SEMANTIC_REF.semanticAuthority, lock.semanticAuthority);
assert.equal(FRACTION_COMMON_SEMANTIC_REF.semanticVersion, lock.semanticVersion);
assert.equal(FRACTION_COMMON_SEMANTIC_REF.sourceCommit, lock.sourceCommit);
assert.equal(FRACTION_COMMON_SEMANTIC_REF.schemaPath, lock.schemaPath);
assert.equal(FRACTION_COMMON_SEMANTIC_REF.schemaGitBlobSha, lock.schemaGitBlobSha);

// Scope honesty: Phase 3 is a plumbing prototype, not an invented curriculum claim.
assert.equal(fractionPrototypeScopeBasis.schoolScope.status, 'SOURCE_NOT_PROVIDED');
assert.equal(fractionPrototypeScopeBasis.ibPypMapping.status, 'MAPPING_PENDING');
assert.equal(fractionPrototypeScopeBasis.ncfMapping.status, 'MAPPING_PENDING');
assert.equal(fractionPrototypeScopeBasis.selectionBasis, 'ARCHITECTURE_PROTOTYPE_ONLY');

// One canonical learning-object/episode identity survives all renderer hand-offs.
assert.equal(fractionExperienceManifest.learningEpisodeId, fractionEpisodeProjection.episodeId);
assert.equal(fractionKaniMission.learningEpisodeId, fractionEpisodeProjection.episodeId);
assert.deepEqual(fractionKaniMission.learningObjectIds, fractionEpisodeProjection.learningObjectIds);
assert.equal(fractionMissionQuestionIds.length, 6);

// The QR/deep-link is intentionally opaque and contains no learner or answer truth.
assert.match(fractionQrLaunch.opaqueId, /^[A-Z0-9]{8}$/);
assert.equal(fractionQrLaunch.path, `/primary/m/${fractionQrLaunch.opaqueId}`);
assert.equal(fractionMissionResolver[fractionQrLaunch.opaqueId].missionId, fractionKaniMission.missionId);
assert.equal(fractionMissionResolver[fractionQrLaunch.opaqueId].renderer, 'fraction-frenzy');
const qrPayload = JSON.stringify(fractionQrLaunch);
for (const forbidden of ['studentId', 'answer', 'mastery', 'correctAnswer']) {
  assert.equal(qrPayload.includes(forbidden), false, `QR must not contain ${forbidden}`);
}

// Struggling learners are not locked out of the game, and game completion is not mastery.
assert.equal(fractionKaniMission.launchPolicy.gate, 'ATTEMPT_NOT_SCORE');
assert.equal(fractionKaniMission.completionPolicy.means, 'ACTIVITY_COMPLETED');
assert.equal(fractionKaniMission.timerPolicy, 'OFF');
assert.equal(fractionKaniMission.returnPolicy.required, true);
assert.equal(fractionKaniMission.returnPolicy.endlessGameChain, false);

// Return and delayed tasks are fresh/non-game obligations.
assert.equal(fractionMissionQuestionIds.includes(fractionReturnTask.questionId), false, 'return question must not be answer-leaked in mission practice');
assert.equal(fractionMissionQuestionIds.includes(fractionDelayedRetrievalTask.questionId), false, 'delayed question must be fresh');
assert.equal(fractionDelayedRetrievalTask.status, 'NOT_YET_TESTED');
assert.equal(fractionDelayedRetrievalTask.earliestDays, 3);
assert.equal(fractionDelayedRetrievalTask.latestDays, 7);

// Canonical attempt evidence carries observable Primary context without durable judgement.
const attempt = makeFractionGameAttempt({
  attemptId: 'ATT-FRAC-PHASE3-001',
  studentId: 'student-bound-at-runtime',
  questionId: fractionMissionQuestionIds[0],
  correct: false,
  conceptualSupport: { level: 'H1', type: 'PROMPT' },
  accessAdjustments: ['REDUCED_LANGUAGE'],
  representationRole: 'CHILD_SELECTED',
  selfCorrected: false,
});
assert.equal(validateKaniAttempt(attempt).success, true);
assert.equal(attempt.primaryEvidence.conceptualSupport.level, 'H1');
assert.deepEqual(attempt.primaryEvidence.accessAdjustments, ['REDUCED_LANGUAGE']);
assert.equal(attempt.primaryEvidence.representation.role, 'CHILD_SELECTED');
assert.equal('masteryState' in attempt.primaryEvidence, false);
assert.equal('teacherDecision' in attempt.primaryEvidence, false);

console.log('Grade 4 fraction-equivalence Phase-3 cross-renderer fixture passed.');
