import { z } from 'zod';

export const PRIMARY_SCHEMA_VERSION = '1.0';

export const PrimaryTeachingPurposeSchema = z.enum([
  'ACQUIRE',
  'REPAIR',
  'INDEPENDENT',
  'RETAIN',
  'TRANSFER',
  'STRETCH'
]);

export const PrimaryRendererSchema = z.enum([
  'STUDY_HUB',
  'PRINT',
  'KANI',
  'ORAL',
  'DELAYED_RETRIEVAL'
]);

export const PrimaryStepRoleSchema = z.enum([
  'TEACH',
  'GUIDED_PRACTICE',
  'INDEPENDENT_CHECK',
  'REPRESENTATION_SHIFT',
  'RETRIEVAL',
  'TRANSFER',
  'REFLECTION'
]);

export const ConceptualSupportLevelSchema = z.enum(['H0', 'H1', 'H2', 'H3', 'H4', 'H5']);
export const ConceptualSupportTypeSchema = z.enum([
  'NONE',
  'PROMPT',
  'HINT',
  'MODEL',
  'THINK_ALOUD',
  'WORKED_EXAMPLE'
]);

export const AccessAdjustmentSchema = z.enum([
  'REDUCED_LANGUAGE',
  'ONE_STEP_AT_A_TIME',
  'ORAL_RESPONSE_ALLOWED',
  'REDUCED_WRITING',
  'READ_ALOUD',
  'EXTRA_VISUAL_SPACING'
]);

export const RepresentationRoleSchema = z.enum([
  'PROVIDED',
  'CHILD_SELECTED',
  'CHILD_PRODUCED'
]);

export const PrimaryStatusSchema = z.enum([
  'UNKNOWN',
  'NOT_OBSERVED',
  'NOT_YET_TESTED',
  'NOT_APPLICABLE',
  'SOURCE_NOT_PROVIDED',
  'SOURCE_BOUNDARY',
  'AMBIGUOUS',
  'TEACHER_JUDGMENT',
  'CHILD_CHOICE',
  'REASSESS_LATER'
]);

const ConceptualSupportSchema = z.object({
  level: ConceptualSupportLevelSchema,
  type: ConceptualSupportTypeSchema
}).passthrough();

export const RepresentationEvidenceSchema = z.object({
  type: z.string().min(1),
  role: RepresentationRoleSchema
}).passthrough();

const StepSupportPolicySchema = z.object({
  conceptualSupport: ConceptualSupportSchema.optional(),
  accessAdjustments: z.array(AccessAdjustmentSchema).optional()
}).passthrough();

const LearningEpisodeStepSchema = z.object({
  stepId: z.string().min(1),
  role: PrimaryStepRoleSchema,
  expectedChildAction: z.string().min(1),
  supportPolicy: StepSupportPolicySchema.optional(),
  representationPolicy: z.object({
    allowedTypes: z.array(z.string().min(1)).optional(),
    childChoiceAllowed: z.boolean().optional()
  }).passthrough().optional()
}).passthrough();

export const LearningEpisodeSchema = z.object({
  schemaVersion: z.literal(PRIMARY_SCHEMA_VERSION),
  episodeId: z.string().min(1),
  learningObjectIds: z.array(z.string().min(1)).min(1),
  teachingPurpose: PrimaryTeachingPurposeSchema,
  prerequisiteLearningObjectIds: z.array(z.string().min(1)).default([]),
  evidenceGoals: z.array(z.string().min(1)).min(1),
  steps: z.array(LearningEpisodeStepSchema).min(1),
  independentCheck: z.object({
    required: z.literal(true),
    stepId: z.string().min(1)
  }).passthrough(),
  delayedRetrieval: z.object({
    required: z.boolean(),
    stepId: z.string().min(1).optional(),
    earliestDays: z.number().int().nonnegative().optional(),
    latestDays: z.number().int().nonnegative().optional()
  }).passthrough().optional()
}).passthrough().superRefine((episode, ctx) => {
  const stepIds = episode.steps.map((step) => step.stepId);
  if (new Set(stepIds).size !== stepIds.length) {
    ctx.addIssue({ code: 'custom', path: ['steps'], message: 'stepId values must be unique' });
  }

  const independent = episode.steps.find((step) => step.stepId === episode.independentCheck.stepId);
  if (!independent || independent.role !== 'INDEPENDENT_CHECK') {
    ctx.addIssue({
      code: 'custom',
      path: ['independentCheck', 'stepId'],
      message: 'independentCheck.stepId must reference an INDEPENDENT_CHECK step'
    });
  }

  if (episode.delayedRetrieval?.required) {
    if (!episode.delayedRetrieval.stepId) {
      ctx.addIssue({
        code: 'custom',
        path: ['delayedRetrieval', 'stepId'],
        message: 'required delayed retrieval must reference a step'
      });
    } else {
      const retrieval = episode.steps.find((step) => step.stepId === episode.delayedRetrieval.stepId);
      if (!retrieval || retrieval.role !== 'RETRIEVAL') {
        ctx.addIssue({
          code: 'custom',
          path: ['delayedRetrieval', 'stepId'],
          message: 'delayedRetrieval.stepId must reference a RETRIEVAL step'
        });
      }
    }
  }

  const { earliestDays, latestDays } = episode.delayedRetrieval || {};
  if (earliestDays !== undefined && latestDays !== undefined && latestDays < earliestDays) {
    ctx.addIssue({
      code: 'custom',
      path: ['delayedRetrieval', 'latestDays'],
      message: 'latestDays must be greater than or equal to earliestDays'
    });
  }
});

const ExperienceSequenceItemSchema = z.object({
  stepId: z.string().min(1),
  renderer: PrimaryRendererSchema,
  activityId: z.string().min(1).optional(),
  missionId: z.string().min(1).optional(),
  sourceRef: z.string().min(1).optional()
}).passthrough().superRefine((item, ctx) => {
  if (item.renderer === 'KANI' && !item.missionId) {
    ctx.addIssue({ code: 'custom', path: ['missionId'], message: 'KANI renderer requires missionId' });
  }
  if (item.renderer !== 'KANI' && !item.activityId && !item.sourceRef) {
    ctx.addIssue({
      code: 'custom',
      path: ['activityId'],
      message: 'non-KANI renderer requires activityId or sourceRef'
    });
  }
});

export const ExperienceManifestSchema = z.object({
  schemaVersion: z.literal(PRIMARY_SCHEMA_VERSION),
  experienceId: z.string().min(1),
  learningEpisodeId: z.string().min(1),
  sequence: z.array(ExperienceSequenceItemSchema).min(1)
}).passthrough().superRefine((manifest, ctx) => {
  const stepIds = manifest.sequence.map((item) => item.stepId);
  if (new Set(stepIds).size !== stepIds.length) {
    ctx.addIssue({ code: 'custom', path: ['sequence'], message: 'manifest stepId values must be unique' });
  }
});

const MissionQuestionRefSchema = z.union([
  z.object({ questionId: z.string().min(1) }).passthrough(),
  z.object({ questionFamilyId: z.string().min(1) }).passthrough()
]);

const forbiddenMissionKeys = new Set([
  'studentId',
  'answer',
  'answerIndex',
  'correctAnswer',
  'mastery',
  'masteryState',
  'childProfile',
  'curriculumOntology'
]);

export const KaniMissionV1Schema = z.object({
  schemaVersion: z.literal(PRIMARY_SCHEMA_VERSION),
  missionId: z.string().min(1),
  learningEpisodeId: z.string().min(1),
  learningObjectIds: z.array(z.string().min(1)).min(1),
  purpose: z.enum(['PRACTICE', 'REPRESENTATION_SHIFT', 'RETRIEVAL', 'TRANSFER']),
  evidenceGoals: z.array(z.string().min(1)).min(1),
  questionRefs: z.array(MissionQuestionRefSchema).min(1),
  rendererPreferences: z.array(z.string().min(1)).optional(),
  supportPolicy: z.object({
    startingConceptualSupportLevel: ConceptualSupportLevelSchema.default('H0'),
    allowAccessAdjustments: z.boolean().default(true)
  }).passthrough(),
  timerPolicy: z.enum(['OFF', 'OPTIONAL', 'ON']).default('OFF'),
  launchPolicy: z.object({
    gate: z.literal('ATTEMPT_NOT_SCORE')
  }).passthrough(),
  completionPolicy: z.object({
    means: z.literal('ACTIVITY_COMPLETED'),
    minimumAttempts: z.number().int().positive().optional()
  }).passthrough(),
  returnPolicy: z.object({
    required: z.literal(true),
    activityId: z.string().min(1),
    endlessGameChain: z.literal(false)
  }).passthrough()
}).passthrough().superRefine((mission, ctx) => {
  for (const key of forbiddenMissionKeys) {
    if (Object.prototype.hasOwnProperty.call(mission, key)) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: `${key} is forbidden in KaniMissionV1; mission hand-off must not embed learner identity, answers or durable judgement`
      });
    }
  }
});

export const PrimaryAttemptEvidenceSchema = z.object({
  learningEpisodeId: z.string().min(1).optional(),
  learningObjectIds: z.array(z.string().min(1)).min(1).optional(),
  questionFamilyId: z.string().min(1).optional(),
  selfCorrected: z.boolean().optional(),
  confidenceBefore: z.enum(['LOW', 'MEDIUM', 'HIGH', 'NOT_OBSERVED']).optional(),
  confidenceAfter: z.enum(['LOW', 'MEDIUM', 'HIGH', 'NOT_OBSERVED']).optional(),
  conceptualSupport: ConceptualSupportSchema.optional(),
  accessAdjustments: z.array(AccessAdjustmentSchema).optional(),
  representation: RepresentationEvidenceSchema.optional(),
  responseMode: z.enum(['SELECTED', 'WRITTEN', 'ORAL', 'MANIPULATIVE', 'DRAWN']).optional(),
  errorSignature: z.object({
    source: z.literal('AUTHORED_RESPONSE_CLASSIFICATION'),
    code: z.string().min(1)
  }).passthrough().optional()
}).passthrough().superRefine((evidence, ctx) => {
  for (const forbidden of ['diagnosis', 'teacherDecision', 'masteryState', 'nextLearningAction']) {
    if (Object.prototype.hasOwnProperty.call(evidence, forbidden)) {
      ctx.addIssue({
        code: 'custom',
        path: [forbidden],
        message: `${forbidden} is Teacher Runtime interpretation and cannot be serialized as raw attempt evidence`
      });
    }
  }
});

export function validateLearningEpisode(value) {
  return LearningEpisodeSchema.safeParse(value);
}

export function validateExperienceManifest(value) {
  return ExperienceManifestSchema.safeParse(value);
}

export function validateKaniMissionV1(value) {
  return KaniMissionV1Schema.safeParse(value);
}

export function validatePrimaryAttemptEvidence(value) {
  return PrimaryAttemptEvidenceSchema.safeParse(value);
}

export function validateExperienceAgainstEpisode(manifestValue, episodeValue) {
  const manifest = validateExperienceManifest(manifestValue);
  const episode = validateLearningEpisode(episodeValue);
  if (!manifest.success || !episode.success) {
    return { success: false, error: 'invalid_contract' };
  }
  if (manifest.data.learningEpisodeId !== episode.data.episodeId) {
    return { success: false, error: 'episode_id_mismatch' };
  }
  const episodeStepIds = new Set(episode.data.steps.map((step) => step.stepId));
  if (manifest.data.sequence.some((item) => !episodeStepIds.has(item.stepId))) {
    return { success: false, error: 'unknown_step_id' };
  }
  return { success: true, data: { manifest: manifest.data, episode: episode.data } };
}

export function validateMissionAgainstEpisode(missionValue, episodeValue) {
  const mission = validateKaniMissionV1(missionValue);
  const episode = validateLearningEpisode(episodeValue);
  if (!mission.success || !episode.success) {
    return { success: false, error: 'invalid_contract' };
  }
  if (mission.data.learningEpisodeId !== episode.data.episodeId) {
    return { success: false, error: 'episode_id_mismatch' };
  }
  const episodeObjects = new Set(episode.data.learningObjectIds);
  if (mission.data.learningObjectIds.some((id) => !episodeObjects.has(id))) {
    return { success: false, error: 'learning_object_mismatch' };
  }
  return { success: true, data: { mission: mission.data, episode: episode.data } };
}
