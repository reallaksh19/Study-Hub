import assert from 'node:assert/strict';
import {
  COMMON_PRIMARY_AUTHORITY,
  COMMON_PRIMARY_SCHEMA_PATH,
  COMMON_PRIMARY_SEMANTIC_VERSION,
  PRIMARY_TRANSPORT_VERSION,
  validateCommonLearningEpisodeProjection,
  validateExperienceAgainstEpisodeProjection,
  validateExperienceManifest,
  validateKaniMissionV1,
  validateMissionAgainstEpisodeProjection,
  validatePrimaryAttemptEvidenceTransport,
} from './primaryTransportContracts.js';

const semanticRef = {
  semanticAuthority: COMMON_PRIMARY_AUTHORITY,
  semanticVersion: COMMON_PRIMARY_SEMANTIC_VERSION,
  sourceCommit: 'b558d33238b5edbc4dc37b7701edab2c5109242d',
  schemaPath: COMMON_PRIMARY_SCHEMA_PATH,
  schemaGitBlobSha: '2f6d95c1cdc8801205afef41beff3e818ae92be1',
};

const learningObjectId = 'MATH-FRAC-EQUIVALENCE';

// This is only the Study-Hub routing projection of the canonical Common
// fractions episode. Child state, diagnosis and TeacherMove semantics remain
// in Common and are intentionally absent here.
const episodeProjection = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef,
  episodeId: 'EP-G4-FRAC-EQUIV-001',
  teachingTargetId: 'TT-G4-FRAC-EQUIV-001',
  learningObjectIds: [learningObjectId],
  steps: [
    { stepId: 'STEP-1', role: 'TEACH' },
    { stepId: 'STEP-2', role: 'GUIDED_PRACTICE' },
    { stepId: 'STEP-3', role: 'REPRESENTATION_SHIFT' },
    { stepId: 'STEP-4', role: 'INDEPENDENT_CHECK' },
    { stepId: 'STEP-5', role: 'RETRIEVAL' },
  ],
  independentCheckRequired: true,
  delayedRetrieval: { required: true, earliestDays: 3, latestDays: 7 },
};

const manifest = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef,
  experienceId: 'EX-G4-FRAC-EQUIV-001',
  learningEpisodeId: episodeProjection.episodeId,
  sequence: [
    { stepId: 'STEP-1', renderer: 'STUDY_HUB', activityId: 'page-fraction-equiv-learn' },
    { stepId: 'STEP-2', renderer: 'PRINT', activityId: 'print-fraction-equiv-guided' },
    { stepId: 'STEP-3', renderer: 'KANI', missionId: 'mission-fraction-equiv-001' },
    { stepId: 'STEP-4', renderer: 'STUDY_HUB', activityId: 'activity-fraction-equiv-return' },
    { stepId: 'STEP-5', renderer: 'DELAYED_RETRIEVAL', activityId: 'activity-fraction-equiv-delayed' },
  ],
};

const mission = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef,
  missionId: 'mission-fraction-equiv-001',
  learningEpisodeId: episodeProjection.episodeId,
  learningObjectIds: [learningObjectId],
  purposeRef: 'REPRESENTATION_SHIFT',
  evidenceGoalRefs: ['recognise_equivalent_fractions'],
  questionRefs: [
    { questionId: 'fraction-equiv-q-101' },
    { questionFamilyId: 'fraction-equiv-visual-family' },
  ],
  rendererPreferences: ['fraction-frenzy'],
  supportPolicy: {
    startingConceptualSupportLevel: 'H0',
    allowAccessAdjustments: true,
  },
  timerPolicy: 'OFF',
  launchPolicy: { gate: 'ATTEMPT_NOT_SCORE' },
  completionPolicy: { means: 'ACTIVITY_COMPLETED', minimumAttempts: 4 },
  returnPolicy: {
    required: true,
    activityId: 'activity-fraction-equiv-return',
    endlessGameChain: false,
  },
};

assert.equal(validateCommonLearningEpisodeProjection(episodeProjection).success, true, 'valid Common episode projection should pass');
assert.equal(validateExperienceManifest(manifest).success, true, 'valid ExperienceManifest should pass');
assert.equal(validateKaniMissionV1(mission).success, true, 'valid KaniMissionV1 should pass');
assert.equal(validateExperienceAgainstEpisodeProjection(manifest, episodeProjection).success, true, 'manifest should resolve against Common episode projection');
assert.equal(validateMissionAgainstEpisodeProjection(mission, episodeProjection).success, true, 'mission should resolve against Common episode projection');

assert.equal(
  validateCommonLearningEpisodeProjection({
    ...episodeProjection,
    steps: episodeProjection.steps.filter((step) => step.role !== 'INDEPENDENT_CHECK'),
  }).success,
  false,
  'projection must preserve Common independent-check obligation',
);

assert.equal(
  validateCommonLearningEpisodeProjection({
    ...episodeProjection,
    delayedRetrieval: { required: true, earliestDays: 7, latestDays: 3 },
  }).success,
  false,
  'delayed retrieval window must remain ordered',
);

const badKaniManifest = {
  ...manifest,
  sequence: manifest.sequence.map((item) => item.renderer === 'KANI'
    ? { stepId: item.stepId, renderer: 'KANI' }
    : item),
};
assert.equal(validateExperienceManifest(badKaniManifest).success, false, 'KANI renderer must reference a mission');

assert.equal(
  validateExperienceAgainstEpisodeProjection({ ...manifest, learningEpisodeId: 'another-episode' }, episodeProjection).success,
  false,
  'manifest/episode IDs must match',
);

const mismatchedSemanticRef = {
  ...semanticRef,
  sourceCommit: '1111111111111111111111111111111111111111',
};
assert.equal(
  validateExperienceAgainstEpisodeProjection({ ...manifest, semanticRef: mismatchedSemanticRef }, episodeProjection).success,
  false,
  'transport must fail closed when Common semantic refs differ',
);

assert.equal(
  validateKaniMissionV1({ ...mission, studentId: 'student-1' }).success,
  false,
  'mission must not embed learner identity',
);
assert.equal(
  validateKaniMissionV1({ ...mission, answer: '1/2' }).success,
  false,
  'mission must not embed answer truth',
);
assert.equal(
  validateKaniMissionV1({
    ...mission,
    supportPolicy: { ...mission.supportPolicy, diagnosis: 'fraction misconception' },
  }).success,
  false,
  'mission must not smuggle Teacher Runtime diagnosis into nested transport data',
);
assert.equal(
  validateMissionAgainstEpisodeProjection({ ...mission, learningObjectIds: ['MATH-OTHER'] }, episodeProjection).success,
  false,
  'mission learning objects must belong to the Common episode projection',
);

const primaryEvidence = {
  semanticVersion: COMMON_PRIMARY_SEMANTIC_VERSION,
  learningEpisodeId: episodeProjection.episodeId,
  learningObjectIds: [learningObjectId],
  questionFamilyId: 'fraction-equiv-visual-family',
  selfCorrected: true,
  confidenceBefore: 'LOW',
  confidenceAfter: 'MEDIUM',
  conceptualSupport: { level: 'H1', type: 'PROMPT' },
  accessAdjustments: ['REDUCED_LANGUAGE', 'ONE_STEP_AT_A_TIME'],
  representation: { type: 'FRACTION_MODEL', role: 'CHILD_SELECTED' },
  responseMode: 'DRAWN',
  errorSignature: {
    source: 'AUTHORED_RESPONSE_CLASSIFICATION',
    code: 'NUMERATOR_ONLY_MATCH',
  },
};
assert.equal(validatePrimaryAttemptEvidenceTransport(primaryEvidence).success, true, 'bounded observable Primary evidence should pass');
assert.equal(
  validatePrimaryAttemptEvidenceTransport({ ...primaryEvidence, diagnosis: 'fraction misconception' }).success,
  false,
  'Teacher Runtime diagnosis must not be serialized as raw attempt evidence',
);
assert.equal(
  validatePrimaryAttemptEvidenceTransport({
    ...primaryEvidence,
    representation: { ...primaryEvidence.representation, teacherDecision: 'reteach' },
  }).success,
  false,
  'nested pedagogical judgement must be rejected from raw evidence transport',
);

assert.equal(primaryEvidence.conceptualSupport.level, 'H1', 'conceptual support remains independently inspectable');
assert.deepEqual(
  primaryEvidence.accessAdjustments,
  ['REDUCED_LANGUAGE', 'ONE_STEP_AT_A_TIME'],
  'access adjustments remain separate from conceptual support',
);
assert.equal(primaryEvidence.representation.role, 'CHILD_SELECTED', 'representation role survives transport without reinterpretation');

console.log('Primary Common-backed transport contract tests passed');
