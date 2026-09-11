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
  ENGLISH_INFERENCE_LEARNING_OBJECT_ID,
  ENGLISH_INFERENCE_SKILL_ID,
  ENGLISH_TOPIC_ID,
  englishInferenceDelayedQuestionId,
  englishInferenceMissionQuestionIds,
  englishInferenceReturnQuestionId,
} from './englishInferenceContent.js';

export const ENGLISH_COMMON_SEMANTIC_REF = {
  semanticAuthority: COMMON_PRIMARY_AUTHORITY,
  semanticVersion: COMMON_PRIMARY_SEMANTIC_VERSION,
  sourceCommit: '00ef138bfc69c9ec062c7cddcc53a8f40a1a4f08',
  schemaPath: COMMON_PRIMARY_SCHEMA_PATH,
  schemaGitBlobSha: 'df84bc3ae4545bff2fff7b52fb1538779f00c55c',
};

export const ENGLISH_PHASE5_FIXTURE_REF = {
  fixtureId: 'PRIMARY-G4-ENGLISH-PHASE5-001',
  sourceCommit: 'c2a4a32335f6e26fc0b9359c2a6bdb640d2b4831',
  sourcePath: 'Primary/Architecture/contracts/v1/examples/grade4-english-phase5.example.json',
  sourceGitBlobSha: 'd6255d7cb2e49e859245fbb9adedd02524c47339',
};

export const englishInferenceScopeBasis = {
  schoolScope: {
    status: 'SOURCE_NOT_PROVIDED',
    sourceRef: null,
  },
  ibPypMapping: { status: 'MAPPING_PENDING' },
  ncfMapping: { status: 'MAPPING_PENDING' },
  selectionBasis: 'PHASE5_ENGLISH_ARCHITECTURE_VALIDATION',
  claim: 'No formal school, IB PYP, NCF-SE or NCERT alignment is claimed by this Phase-5 inference fixture.',
};

export const englishInferenceEpisodeProjection = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef: ENGLISH_COMMON_SEMANTIC_REF,
  episodeId: 'EP-G4-ENG-INFERENCE-001',
  teachingTargetId: 'TT-G4-ENG-INFERENCE-EVIDENCE-001',
  learningObjectIds: [ENGLISH_INFERENCE_LEARNING_OBJECT_ID],
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

export const englishInferenceExperienceManifest = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef: ENGLISH_COMMON_SEMANTIC_REF,
  experienceId: 'EX-G4-ENG-INFERENCE-001',
  learningEpisodeId: englishInferenceEpisodeProjection.episodeId,
  sequence: [
    { stepId: 'STEP-1', renderer: 'STUDY_HUB', activityId: 'eng-inference-learn-001' },
    { stepId: 'STEP-2', renderer: 'PRINT', activityId: 'eng-inference-guided-print-001' },
    { stepId: 'STEP-3', renderer: 'KANI', missionId: 'KM-G4-ENG-INFERENCE-001' },
    { stepId: 'STEP-4', renderer: 'STUDY_HUB', activityId: 'eng-inference-return-001' },
    { stepId: 'STEP-5', renderer: 'DELAYED_RETRIEVAL', activityId: 'eng-inference-delayed-001' },
  ],
};

export const englishInferenceKaniMission = {
  transportVersion: PRIMARY_TRANSPORT_VERSION,
  semanticRef: ENGLISH_COMMON_SEMANTIC_REF,
  missionId: 'KM-G4-ENG-INFERENCE-001',
  learningEpisodeId: englishInferenceEpisodeProjection.episodeId,
  learningObjectIds: [ENGLISH_INFERENCE_LEARNING_OBJECT_ID],
  purposeRef: 'INFERENCE_INVESTIGATOR_REPRESENTATION_SHIFT',
  evidenceGoalRefs: [
    'select_supported_inference',
    'identify_relevant_text_clue',
  ],
  questionRefs: englishInferenceMissionQuestionIds.map((questionId) => ({ questionId })),
  rendererPreferences: ['inference-investigator'],
  supportPolicy: {
    startingConceptualSupportLevel: 'H0',
    allowAccessAdjustments: true,
  },
  timerPolicy: 'OFF',
  launchPolicy: { gate: 'ATTEMPT_NOT_SCORE' },
  completionPolicy: { means: 'ACTIVITY_COMPLETED', minimumAttempts: 4 },
  returnPolicy: {
    required: true,
    activityId: 'eng-inference-return-001',
    endlessGameChain: false,
  },
};

/** Opaque mission token only: no learner identity, answer truth or judgement. */
export const englishInferenceQrLaunch = {
  opaqueId: 'P4EI7Q2K',
  path: '/primary/m/P4EI7Q2K',
};

export const englishInferenceMissionResolver = {
  P4EI7Q2K: {
    missionId: englishInferenceKaniMission.missionId,
    renderer: 'inference-investigator',
  },
};

export const englishInferenceReturnTask = {
  activityId: 'eng-inference-return-001',
  learningEpisodeId: englishInferenceEpisodeProjection.episodeId,
  learningObjectIds: [ENGLISH_INFERENCE_LEARNING_OBJECT_ID],
  questionId: englishInferenceReturnQuestionId,
  conceptualSupportExpected: 'H0',
  requiredEvidenceParts: ['ANSWER', 'TEXT_CLUE', 'CONNECTION'],
  allowedResponseModes: ['ORAL', 'WRITTEN'],
  purpose: 'INDEPENDENT_INFERENCE_WITH_EVIDENCE',
};

export const englishInferenceDelayedRetrievalTask = {
  activityId: 'eng-inference-delayed-001',
  learningEpisodeId: englishInferenceEpisodeProjection.episodeId,
  learningObjectIds: [ENGLISH_INFERENCE_LEARNING_OBJECT_ID],
  questionId: englishInferenceDelayedQuestionId,
  requiredEvidenceParts: ['ANSWER', 'TEXT_CLUE', 'CONNECTION'],
  status: 'NOT_YET_TESTED',
  earliestDays: 3,
  latestDays: 7,
};

export function makeEnglishInferenceGameAttempt({
  attemptId,
  studentId,
  questionId,
  correct,
  conceptualSupport = { level: 'H0', type: 'NONE' },
  accessAdjustments = [],
  responseMode = 'SELECT',
  selfCorrected = false,
  completedAt = '2026-09-11T09:00:00.000Z',
}) {
  return {
    schemaVersion: '1.0',
    attemptId,
    studentId,
    activityId: englishInferenceKaniMission.missionId,
    activityType: 'game',
    sourceApp: 'game-app',
    subjectId: 'english',
    topicId: ENGLISH_TOPIC_ID,
    questionId,
    skillIds: [ENGLISH_INFERENCE_SKILL_ID],
    difficulty: 'medium',
    correct,
    primaryEvidence: {
      semanticVersion: COMMON_PRIMARY_SEMANTIC_VERSION,
      learningEpisodeId: englishInferenceEpisodeProjection.episodeId,
      learningObjectIds: [ENGLISH_INFERENCE_LEARNING_OBJECT_ID],
      questionFamilyId: 'eng-inference-investigator-family',
      selfCorrected,
      conceptualSupport,
      accessAdjustments,
      representation: {
        type: 'SHORT_TEXT_WITH_CLUE',
        role: 'PROVIDED',
      },
      responseMode,
    },
    completedAt,
  };
}

export function validateEnglishInferenceJourney() {
  const checks = [
    validateCommonLearningEpisodeProjection(englishInferenceEpisodeProjection),
    validateExperienceManifest(englishInferenceExperienceManifest),
    validateKaniMissionV1(englishInferenceKaniMission),
    validateExperienceAgainstEpisodeProjection(englishInferenceExperienceManifest, englishInferenceEpisodeProjection),
    validateMissionAgainstEpisodeProjection(englishInferenceKaniMission, englishInferenceEpisodeProjection),
  ];
  if (checks.some((result) => !result.success)) return { success: false, error: 'transport_validation_failed' };

  if (englishInferenceKaniMission.questionRefs.length !== 6) return { success: false, error: 'mission_question_count' };
  if (englishInferenceKaniMission.timerPolicy !== 'OFF') return { success: false, error: 'timer_pressure' };
  if (englishInferenceKaniMission.launchPolicy.gate !== 'ATTEMPT_NOT_SCORE') return { success: false, error: 'score_gate' };
  if (englishInferenceKaniMission.completionPolicy.means !== 'ACTIVITY_COMPLETED') return { success: false, error: 'mastery_completion' };
  if (!englishInferenceKaniMission.returnPolicy.required || englishInferenceKaniMission.returnPolicy.endlessGameChain) {
    return { success: false, error: 'return_policy' };
  }
  if (englishInferenceReturnTask.questionId && englishInferenceMissionQuestionIds.includes(englishInferenceReturnTask.questionId)) {
    return { success: false, error: 'return_answer_leakage' };
  }
  if (englishInferenceDelayedRetrievalTask.status !== 'NOT_YET_TESTED') {
    return { success: false, error: 'premature_retention_claim' };
  }
  if (englishInferenceReturnTask.conceptualSupportExpected !== 'H0') {
    return { success: false, error: 'return_not_independent' };
  }
  if (JSON.stringify(englishInferenceReturnTask.requiredEvidenceParts) !== JSON.stringify(['ANSWER', 'TEXT_CLUE', 'CONNECTION'])) {
    return { success: false, error: 'return_missing_evidence_structure' };
  }

  const qrSerialized = JSON.stringify(englishInferenceQrLaunch);
  for (const forbidden of ['studentId', 'answer', 'mastery', 'skillState', 'teacherDecision']) {
    if (qrSerialized.includes(forbidden)) return { success: false, error: `qr_contains_${forbidden}` };
  }

  const missionSerialized = JSON.stringify(englishInferenceKaniMission);
  for (const forbidden of ['answerIndex', 'correctAnswer', 'masteryScore', 'teacherMove', 'childProfile']) {
    if (missionSerialized.includes(forbidden)) return { success: false, error: `mission_contains_${forbidden}` };
  }

  const sampleAttempt = makeEnglishInferenceGameAttempt({
    attemptId: 'ATT-ENG-INF-001',
    studentId: 'student-runtime-only',
    questionId: englishInferenceMissionQuestionIds[0],
    correct: true,
  });
  if (!validateKaniAttempt(sampleAttempt).success) return { success: false, error: 'attempt_validation_failed' };

  return { success: true };
}
