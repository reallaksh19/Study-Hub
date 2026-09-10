import assert from 'node:assert/strict';
import {
  PRIMARY_SCHEMA_VERSION,
  validateExperienceAgainstEpisode,
  validateExperienceManifest,
  validateKaniMissionV1,
  validateLearningEpisode,
  validateMissionAgainstEpisode,
  validatePrimaryAttemptEvidence,
} from './primaryLearningContracts.js';

const learningObjectId = 'MATH-FRACTION-EQUIVALENCE';

const episode = {
  schemaVersion: PRIMARY_SCHEMA_VERSION,
  episodeId: 'episode-g4-fraction-equivalence-001',
  learningObjectIds: [learningObjectId],
  teachingPurpose: 'ACQUIRE',
  prerequisiteLearningObjectIds: ['MATH-FRACTION-PART-WHOLE'],
  evidenceGoals: [
    'RECOGNISE_EQUIVALENT_FRACTIONS',
    'EXPLAIN_EQUIVALENCE_WITH_A_VISUAL_MODEL'
  ],
  steps: [
    {
      stepId: 'learn-visual',
      role: 'TEACH',
      expectedChildAction: 'Notice that two differently partitioned models can show the same amount.',
      representationPolicy: { allowedTypes: ['FRACTION_MODEL'] }
    },
    {
      stepId: 'guided-try',
      role: 'GUIDED_PRACTICE',
      expectedChildAction: 'Match two equivalent fraction models.',
      supportPolicy: {
        conceptualSupport: { level: 'H1', type: 'PROMPT' },
        accessAdjustments: ['ONE_STEP_AT_A_TIME']
      }
    },
    {
      stepId: 'pre-game-independent',
      role: 'INDEPENDENT_CHECK',
      expectedChildAction: 'Choose an equivalent fraction without conceptual help.'
    },
    {
      stepId: 'kani-representation-shift',
      role: 'REPRESENTATION_SHIFT',
      expectedChildAction: 'Solve equivalent-fraction items in the Kani renderer.'
    },
    {
      stepId: 'return-independent',
      role: 'TRANSFER',
      expectedChildAction: 'Solve a new equivalent-fraction problem outside the game.'
    },
    {
      stepId: 'delayed-check',
      role: 'RETRIEVAL',
      expectedChildAction: 'Solve a new equivalent-fraction item after a delay.'
    }
  ],
  independentCheck: {
    required: true,
    stepId: 'pre-game-independent'
  },
  delayedRetrieval: {
    required: true,
    stepId: 'delayed-check',
    earliestDays: 3,
    latestDays: 7
  }
};

const manifest = {
  schemaVersion: PRIMARY_SCHEMA_VERSION,
  experienceId: 'experience-g4-fraction-equivalence-001',
  learningEpisodeId: episode.episodeId,
  sequence: [
    { stepId: 'learn-visual', renderer: 'STUDY_HUB', activityId: 'page-fraction-equiv-learn' },
    { stepId: 'guided-try', renderer: 'PRINT', activityId: 'print-fraction-equiv-guided' },
    { stepId: 'pre-game-independent', renderer: 'PRINT', activityId: 'print-fraction-equiv-independent' },
    { stepId: 'kani-representation-shift', renderer: 'KANI', missionId: 'mission-fraction-equiv-001' },
    { stepId: 'return-independent', renderer: 'STUDY_HUB', activityId: 'activity-fraction-equiv-return' },
    { stepId: 'delayed-check', renderer: 'DELAYED_RETRIEVAL', activityId: 'activity-fraction-equiv-delayed' }
  ]
};

const mission = {
  schemaVersion: PRIMARY_SCHEMA_VERSION,
  missionId: 'mission-fraction-equiv-001',
  learningEpisodeId: episode.episodeId,
  learningObjectIds: [learningObjectId],
  purpose: 'REPRESENTATION_SHIFT',
  evidenceGoals: ['RECOGNISE_EQUIVALENT_FRACTIONS'],
  questionRefs: [
    { questionId: 'fraction-equiv-q-101' },
    { questionFamilyId: 'fraction-equiv-visual-family' }
  ],
  rendererPreferences: ['fraction-frenzy'],
  supportPolicy: {
    startingConceptualSupportLevel: 'H0',
    allowAccessAdjustments: true
  },
  timerPolicy: 'OFF',
  launchPolicy: { gate: 'ATTEMPT_NOT_SCORE' },
  completionPolicy: { means: 'ACTIVITY_COMPLETED', minimumAttempts: 4 },
  returnPolicy: {
    required: true,
    activityId: 'activity-fraction-equiv-return',
    endlessGameChain: false
  }
};

assert.equal(validateLearningEpisode(episode).success, true, 'valid LearningEpisode should pass');
assert.equal(validateExperienceManifest(manifest).success, true, 'valid ExperienceManifest should pass');
assert.equal(validateKaniMissionV1(mission).success, true, 'valid KaniMissionV1 should pass');
assert.equal(validateExperienceAgainstEpisode(manifest, episode).success, true, 'manifest should resolve against episode');
assert.equal(validateMissionAgainstEpisode(mission, episode).success, true, 'mission should resolve against episode');

const badIndependent = {
  ...episode,
  independentCheck: { required: true, stepId: 'guided-try' }
};
assert.equal(validateLearningEpisode(badIndependent).success, false, 'independent check must reference an independent step');

const badRetrievalWindow = {
  ...episode,
  delayedRetrieval: {
    required: true,
    stepId: 'delayed-check',
    earliestDays: 7,
    latestDays: 3
  }
};
assert.equal(validateLearningEpisode(badRetrievalWindow).success, false, 'delayed retrieval window must be ordered');

const badKaniManifest = {
  ...manifest,
  sequence: manifest.sequence.map((item) => item.renderer === 'KANI' ? { stepId: item.stepId, renderer: 'KANI' } : item)
};
assert.equal(validateExperienceManifest(badKaniManifest).success, false, 'KANI renderer must reference a mission');

const mismatchedManifest = { ...manifest, learningEpisodeId: 'another-episode' };
assert.equal(validateExperienceAgainstEpisode(mismatchedManifest, episode).success, false, 'manifest/episode IDs must match');

assert.equal(
  validateKaniMissionV1({ ...mission, studentId: 'student-1' }).success,
  false,
  'mission must not embed learner identity'
);
assert.equal(
  validateKaniMissionV1({ ...mission, answer: '1/2' }).success,
  false,
  'mission must not embed answer truth'
);
assert.equal(
  validateMissionAgainstEpisode({ ...mission, learningObjectIds: ['MATH-OTHER'] }, episode).success,
  false,
  'mission learning objects must belong to the episode'
);

const primaryEvidence = {
  learningEpisodeId: episode.episodeId,
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
    code: 'NUMERATOR_ONLY_MATCH'
  }
};
assert.equal(validatePrimaryAttemptEvidence(primaryEvidence).success, true, 'observable Primary evidence should pass');
assert.equal(
  validatePrimaryAttemptEvidence({ ...primaryEvidence, diagnosis: 'fraction misconception' }).success,
  false,
  'Teacher Runtime diagnosis must not be serialized as raw attempt evidence'
);
assert.equal(
  primaryEvidence.conceptualSupport.level,
  'H1',
  'conceptual support remains independently inspectable'
);
assert.deepEqual(
  primaryEvidence.accessAdjustments,
  ['REDUCED_LANGUAGE', 'ONE_STEP_AT_A_TIME'],
  'access adjustments remain separate from conceptual support'
);
assert.equal(
  primaryEvidence.representation.role,
  'CHILD_SELECTED',
  'representation role distinguishes child choice from a provided model'
);

console.log('Primary learning contract tests passed');
