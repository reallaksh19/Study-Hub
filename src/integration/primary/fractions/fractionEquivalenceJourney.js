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
} from '../../contracts/primaryTransportContracts.js';
import { validateKaniAttempt } from '../../contracts/kaniContracts.js';
import {
  FRACTION_LEARNING_OBJECT_ID,
  fractionDelayedQuestionId,
  fractionMissionQuestionIds,
  fractionReturnQuestionId,
} from './fractionEquivalenceContent.js';

export const FRACTION_COMMON_SEMANTIC_REF = {
  semanticAuthority: COMMON_PRIMARY_AUTHORITY,
  semanticVersion: COMMON_PRIMARY_SEMANTIC_VERSION,
  sourceCommit: 'b558d33238b5edbc4dc37b7701edab2c5109242d',
  schemaPath: COMMON_PRIMARY_SCHEMA_PATH,
  schemaGitBlobSha: '2f6d95c1cdc8801205afef41beff3e818ae92be1',
};

export const fractionPrototypeScopeBasis = {
  schoolScope: {
    status: 'SOURCE_NOT_PROVIDED',
    sourceRef: null,
  },
  ibPypMapping: { status: 'MAPPING_PENDING' },
  ncfMapping: { status: 'MAPPING_PENDING' },
  selectionBasis: 'ARCHITECTURE_PROTOTYPE_ONLY',
  claim: 'No formal school, IB PYP, NCF-SE or NCERT alignment is claimed by this Phase-3 fixture.',
};

export const fractionEpisodeProjection = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef: FRACTION_COMMON_SEMANTIC_REF,
  episodeId: 'EP-G4-FRAC-EQUIV-001',
  teachingTargetId: 'TT-G4-FRAC-EQUIV-001',
  learningObjectIds: [FRACTION_LEARNING_OBJECT_ID],
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

export const fractionExperienceManifest = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef: FRACTION_COMMON_SEMANTIC_REF,
  experienceId: 'EX-G4-FRAC-EQUIV-001',
  learningEpisodeId: fractionEpisodeProjection.episodeId,
  sequence: [
    { stepId: 'STEP-1', renderer: 'STUDY_HUB', activityId: 'fraction-equiv-learn-001' },
    { stepId: 'STEP-2', renderer: 'PRINT', activityId: 'fraction-equiv-guided-print-001' },
    { stepId: 'STEP-3', renderer: 'KANI', missionId: 'KM-G4-FRAC-EQUIV-001' },
    { stepId: 'STEP-4', renderer: 'STUDY_HUB', activityId: 'fraction-equiv-return-001' },
    { stepId: 'STEP-5', renderer: 'DELAYED_RETRIEVAL', activityId: 'fraction-equiv-delayed-001' },
  ],
};

export const fractionKaniMission = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef: FRACTION_COMMON_SEMANTIC_REF,
  missionId: 'KM-G4-FRAC-EQUIV-001',
  learningEpisodeId: fractionEpisodeProjection.episodeId,
  learningObjectIds: [FRACTION_LEARNING_OBJECT_ID],
  purposeRef: 'REPRESENTATION_SHIFT',
  evidenceGoalRefs: ['recognise_equivalent_fractions', 'use_fraction_model'],
  questionRefs: fractionMissionQuestionIds.map((questionId) => ({ questionId })),
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
    activityId: 'fraction-equiv-return-001',
    endlessGameChain: false,
  },
};

/**
 * Printed artifacts carry only this opaque token/path. Learner identity and
 * educational truth are resolved at runtime; they are never encoded in QR data.
 */
export const fractionQrLaunch = {
  opaqueId: 'P4FE7K2Q',
  path: '/primary/m/P4FE7K2Q',
};

export const fractionMissionResolver = {
  P4FE7K2Q: {
    missionId: fractionKaniMission.missionId,
    renderer: 'fraction-frenzy',
  },
};

export const fractionReturnTask = {
  activityId: 'fraction-equiv-return-001',
  learningEpisodeId: fractionEpisodeProjection.episodeId,
  learningObjectIds: [FRACTION_LEARNING_OBJECT_ID],
  questionId: fractionReturnQuestionId,
  conceptualSupportExpected: 'H0',
  purpose: 'INDEPENDENT_TRANSFER',
};

export const fractionDelayedRetrievalTask = {
  activityId: 'fraction-equiv-delayed-001',
  learningEpisodeId: fractionEpisodeProjection.episodeId,
  learningObjectIds: [FRACTION_LEARNING_OBJECT_ID],
  questionId: fractionDelayedQuestionId,
  status: 'NOT_YET_TESTED',
  earliestDays: 3,
  latestDays: 7,
};

export function makeFractionGameAttempt({
  attemptId,
  studentId,
  questionId,
  correct,
  conceptualSupport = { level: 'H0', type: 'NONE' },
  accessAdjustments = [],
  representationRole = 'PROVIDED',
  selfCorrected = false,
  completedAt = '2026-09-10T19:30:00.000Z',
}) {
  return {
    schemaVersion: '1.0',
    attemptId,
    studentId,
    activityId: fractionKaniMission.missionId,
    activityType: 'game',
    sourceApp: 'game-app',
    subjectId: 'mathematics',
    topicId: 'topic_grade4-fractions',
    questionId,
    skillIds: ['skill_fraction-equivalence'],
    difficulty: 'medium',
    correct,
    primaryEvidence: {
      semanticVersion: COMMON_PRIMARY_SEMANTIC_VERSION,
      learningEpisodeId: fractionEpisodeProjection.episodeId,
      learningObjectIds: [FRACTION_LEARNING_OBJECT_ID],
      questionFamilyId: 'fraction-equiv-visual-family',
      selfCorrected,
      conceptualSupport,
      accessAdjustments,
      representation: {
        type: 'FRACTION_MODEL',
        role: representationRole,
      },
      responseMode: 'SELECT',
    },
    completedAt,
  };
}

export function validateFractionJourney() {
  const checks = [
    validateCommonLearningEpisodeProjection(fractionEpisodeProjection),
    validateExperienceManifest(fractionExperienceManifest),
    validateKaniMissionV1(fractionKaniMission),
    validateExperienceAgainstEpisodeProjection(fractionExperienceManifest, fractionEpisodeProjection),
    validateMissionAgainstEpisodeProjection(fractionKaniMission, fractionEpisodeProjection),
  ];
  if (checks.some((result) => !result.success)) return { success: false, error: 'transport_validation_failed' };

  if (fractionKaniMission.questionRefs.length !== 6) return { success: false, error: 'mission_question_count' };
  if (fractionKaniMission.timerPolicy !== 'OFF') return { success: false, error: 'timer_pressure' };
  if (fractionKaniMission.launchPolicy.gate !== 'ATTEMPT_NOT_SCORE') return { success: false, error: 'score_gate' };
  if (fractionKaniMission.completionPolicy.means !== 'ACTIVITY_COMPLETED') return { success: false, error: 'mastery_completion' };
  if (!fractionKaniMission.returnPolicy.required || fractionKaniMission.returnPolicy.endlessGameChain) return { success: false, error: 'return_policy' };
  if (fractionReturnTask.questionId && fractionMissionQuestionIds.includes(fractionReturnTask.questionId)) return { success: false, error: 'return_answer_leakage' };
  if (fractionDelayedRetrievalTask.status !== 'NOT_YET_TESTED') return { success: false, error: 'premature_retention_claim' };

  const qrSerialized = JSON.stringify(fractionQrLaunch);
  for (const forbidden of ['studentId', 'answer', 'mastery', 'skillState']) {
    if (qrSerialized.includes(forbidden)) return { success: false, error: `qr_contains_${forbidden}` };
  }

  const sampleAttempt = makeFractionGameAttempt({
    attemptId: 'ATT-FRAC-001',
    studentId: 'student-runtime-only',
    questionId: fractionMissionQuestionIds[0],
    correct: true,
  });
  if (!validateKaniAttempt(sampleAttempt).success) return { success: false, error: 'attempt_validation_failed' };

  return { success: true };
}
