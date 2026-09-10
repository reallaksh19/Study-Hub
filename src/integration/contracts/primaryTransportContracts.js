import { z } from 'zod';

/**
 * Study-Hub Primary transport contracts.
 *
 * EDUCATIONAL SEMANTICS ARE NOT OWNED HERE.
 * Canonical meaning is pinned to reallaksh19/Common by
 * integration/primary/common-semantic.lock.json.
 *
 * These schemas validate the minimum projection and wire payloads required to
 * orchestrate Common learning episodes across Study-Hub, print and Kani.
 */

export const PRIMARY_TRANSPORT_VERSION = '1.0';
export const COMMON_PRIMARY_SEMANTIC_VERSION = '1.0';
export const COMMON_PRIMARY_AUTHORITY = 'reallaksh19/Common';
export const COMMON_PRIMARY_SCHEMA_PATH = 'Primary/Architecture/contracts/v1/primary-learning-semantics.schema.json';

const NonEmptyStringSchema = z.string().min(1);
const GitShaSchema = z.string().regex(/^[0-9a-f]{40}$/);

export const CommonPrimarySemanticRefSchema = z.object({
  semanticAuthority: z.literal(COMMON_PRIMARY_AUTHORITY),
  semanticVersion: z.literal(COMMON_PRIMARY_SEMANTIC_VERSION),
  sourceCommit: GitShaSchema,
  schemaPath: z.literal(COMMON_PRIMARY_SCHEMA_PATH),
  schemaGitBlobSha: GitShaSchema,
}).strict();

/**
 * A routing projection of a Common LearningEpisode.
 *
 * It deliberately contains no learner profile, diagnosis, TeacherDecision,
 * TeacherMove semantics, mastery judgement, explanation content or answer truth.
 */
export const CommonLearningEpisodeProjectionSchema = z.object({
  transportVersion: z.literal(PRIMARY_TRANSPORT_VERSION),
  semanticRef: CommonPrimarySemanticRefSchema,
  episodeId: NonEmptyStringSchema,
  teachingTargetId: NonEmptyStringSchema,
  learningObjectIds: z.array(NonEmptyStringSchema).min(1),
  steps: z.array(z.object({
    stepId: NonEmptyStringSchema,
    role: NonEmptyStringSchema,
  }).strict()).min(1),
  independentCheckRequired: z.literal(true),
  delayedRetrieval: z.object({
    required: z.boolean(),
    earliestDays: z.number().int().nonnegative().optional(),
    latestDays: z.number().int().nonnegative().optional(),
  }).strict().optional(),
}).strict().superRefine((projection, ctx) => {
  const stepIds = projection.steps.map((step) => step.stepId);
  if (new Set(stepIds).size !== stepIds.length) {
    ctx.addIssue({ code: 'custom', path: ['steps'], message: 'stepId values must be unique' });
  }

  const hasIndependentCheck = projection.steps.some((step) => step.role === 'INDEPENDENT_CHECK');
  if (!hasIndependentCheck) {
    ctx.addIssue({ code: 'custom', path: ['steps'], message: 'projection must include the Common independent-check step' });
  }

  if (projection.delayedRetrieval?.required) {
    const hasRetrieval = projection.steps.some((step) => step.role === 'RETRIEVAL');
    if (!hasRetrieval) {
      ctx.addIssue({ code: 'custom', path: ['steps'], message: 'required delayed retrieval must expose a RETRIEVAL step' });
    }
    const { earliestDays, latestDays } = projection.delayedRetrieval;
    if (earliestDays !== undefined && latestDays !== undefined && latestDays < earliestDays) {
      ctx.addIssue({ code: 'custom', path: ['delayedRetrieval', 'latestDays'], message: 'latestDays must be >= earliestDays' });
    }
  }
});

export const PrimaryRendererSchema = z.enum([
  'STUDY_HUB',
  'PRINT',
  'KANI',
  'ORAL',
  'DELAYED_RETRIEVAL',
]);

const ExperienceSequenceItemSchema = z.object({
  stepId: NonEmptyStringSchema,
  renderer: PrimaryRendererSchema,
  activityId: NonEmptyStringSchema.optional(),
  missionId: NonEmptyStringSchema.optional(),
  sourceRef: NonEmptyStringSchema.optional(),
}).strict().superRefine((item, ctx) => {
  if (item.renderer === 'KANI') {
    if (!item.missionId) {
      ctx.addIssue({ code: 'custom', path: ['missionId'], message: 'KANI renderer requires missionId' });
    }
    return;
  }

  if (!item.activityId && !item.sourceRef) {
    ctx.addIssue({
      code: 'custom',
      path: ['activityId'],
      message: 'non-KANI renderer requires activityId or sourceRef',
    });
  }
});

/** Study-Hub-owned renderer orchestration instance. */
export const ExperienceManifestSchema = z.object({
  transportVersion: z.literal(PRIMARY_TRANSPORT_VERSION),
  semanticRef: CommonPrimarySemanticRefSchema,
  experienceId: NonEmptyStringSchema,
  learningEpisodeId: NonEmptyStringSchema,
  sequence: z.array(ExperienceSequenceItemSchema).min(1),
}).strict().superRefine((manifest, ctx) => {
  const stepIds = manifest.sequence.map((item) => item.stepId);
  if (new Set(stepIds).size !== stepIds.length) {
    ctx.addIssue({ code: 'custom', path: ['sequence'], message: 'manifest stepId values must be unique' });
  }
});

const MissionQuestionRefSchema = z.union([
  z.object({ questionId: NonEmptyStringSchema }).strict(),
  z.object({ questionFamilyId: NonEmptyStringSchema }).strict(),
]);

const FORBIDDEN_MISSION_KEYS = new Set([
  'studentId',
  'answer',
  'answerIndex',
  'correctAnswer',
  'mastery',
  'masteryScore',
  'masteryState',
  'childProfile',
  'skillState',
  'currentLearningState',
  'diagnosis',
  'teacherDecision',
  'teacherMove',
  'curriculumOntology',
  'explanation',
]);

const FORBIDDEN_EVIDENCE_KEYS = new Set([
  'diagnosis',
  'teacherDecision',
  'teacherMove',
  'mastery',
  'masteryScore',
  'masteryState',
  'nextLearningAction',
  'childProfile',
  'skillState',
]);

function findForbiddenKey(value, forbidden, path = []) {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenKey(value[index], forbidden, [...path, index]);
      if (found) return found;
    }
    return null;
  }

  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) return { key, path: [...path, key] };
    const found = findForbiddenKey(child, forbidden, [...path, key]);
    if (found) return found;
  }
  return null;
}

/** Study-Hub-owned Kani renderer hand-off. */
export const KaniMissionV1Schema = z.object({
  transportVersion: z.literal(PRIMARY_TRANSPORT_VERSION),
  semanticRef: CommonPrimarySemanticRefSchema,
  missionId: NonEmptyStringSchema,
  learningEpisodeId: NonEmptyStringSchema,
  learningObjectIds: z.array(NonEmptyStringSchema).min(1),
  purposeRef: NonEmptyStringSchema,
  evidenceGoalRefs: z.array(NonEmptyStringSchema).min(1),
  questionRefs: z.array(MissionQuestionRefSchema).min(1),
  rendererPreferences: z.array(NonEmptyStringSchema).optional(),
  supportPolicy: z.object({
    startingConceptualSupportLevel: NonEmptyStringSchema,
    allowAccessAdjustments: z.boolean(),
  }).strict(),
  timerPolicy: z.enum(['OFF', 'OPTIONAL', 'ON']).default('OFF'),
  launchPolicy: z.object({
    gate: z.literal('ATTEMPT_NOT_SCORE'),
  }).strict(),
  completionPolicy: z.object({
    means: z.literal('ACTIVITY_COMPLETED'),
    minimumAttempts: z.number().int().positive().optional(),
  }).strict(),
  returnPolicy: z.object({
    required: z.literal(true),
    activityId: NonEmptyStringSchema,
    endlessGameChain: z.literal(false),
  }).strict(),
}).strict().superRefine((mission, ctx) => {
  const forbidden = findForbiddenKey(mission, FORBIDDEN_MISSION_KEYS);
  if (forbidden) {
    ctx.addIssue({
      code: 'custom',
      path: forbidden.path,
      message: `${forbidden.key} is forbidden in KaniMissionV1 transport; missions must not embed learner identity, answer truth or Teacher Runtime judgement`,
    });
  }
});

/**
 * Bounded observable Primary evidence carried inside kani-attempt-v1.
 *
 * Semantic token meanings (support levels, access adjustments and
 * representation roles) come from the pinned Common semantic contract. This
 * transport schema preserves the tokens without redefining their taxonomy.
 */
export const PrimaryAttemptEvidenceTransportSchema = z.object({
  semanticVersion: z.literal(COMMON_PRIMARY_SEMANTIC_VERSION),
  learningEpisodeId: NonEmptyStringSchema.optional(),
  learningObjectIds: z.array(NonEmptyStringSchema).min(1).optional(),
  questionFamilyId: NonEmptyStringSchema.optional(),
  selfCorrected: z.boolean().optional(),
  confidenceBefore: z.enum(['LOW', 'MEDIUM', 'HIGH', 'NOT_OBSERVED']).optional(),
  confidenceAfter: z.enum(['LOW', 'MEDIUM', 'HIGH', 'NOT_OBSERVED']).optional(),
  conceptualSupport: z.object({
    level: NonEmptyStringSchema,
    type: NonEmptyStringSchema,
  }).strict().optional(),
  accessAdjustments: z.array(NonEmptyStringSchema).optional(),
  representation: z.object({
    type: NonEmptyStringSchema,
    role: NonEmptyStringSchema,
  }).strict().optional(),
  responseMode: NonEmptyStringSchema.optional(),
  errorSignature: z.object({
    source: z.literal('AUTHORED_RESPONSE_CLASSIFICATION'),
    code: NonEmptyStringSchema,
  }).strict().optional(),
}).strict().superRefine((evidence, ctx) => {
  const forbidden = findForbiddenKey(evidence, FORBIDDEN_EVIDENCE_KEYS);
  if (forbidden) {
    ctx.addIssue({
      code: 'custom',
      path: forbidden.path,
      message: `${forbidden.key} is Teacher Runtime judgement and cannot be serialized as raw attempt evidence`,
    });
  }
});

export function validateCommonLearningEpisodeProjection(value) {
  return CommonLearningEpisodeProjectionSchema.safeParse(value);
}

export function validateExperienceManifest(value) {
  return ExperienceManifestSchema.safeParse(value);
}

export function validateKaniMissionV1(value) {
  return KaniMissionV1Schema.safeParse(value);
}

export function validatePrimaryAttemptEvidenceTransport(value) {
  return PrimaryAttemptEvidenceTransportSchema.safeParse(value);
}

function semanticRefsMatch(left, right) {
  return left.semanticAuthority === right.semanticAuthority
    && left.semanticVersion === right.semanticVersion
    && left.sourceCommit === right.sourceCommit
    && left.schemaPath === right.schemaPath
    && left.schemaGitBlobSha === right.schemaGitBlobSha;
}

export function validateExperienceAgainstEpisodeProjection(manifestValue, episodeProjectionValue) {
  const manifest = validateExperienceManifest(manifestValue);
  const episode = validateCommonLearningEpisodeProjection(episodeProjectionValue);
  if (!manifest.success || !episode.success) return { success: false, error: 'invalid_transport' };

  if (!semanticRefsMatch(manifest.data.semanticRef, episode.data.semanticRef)) {
    return { success: false, error: 'semantic_ref_mismatch' };
  }
  if (manifest.data.learningEpisodeId !== episode.data.episodeId) {
    return { success: false, error: 'episode_id_mismatch' };
  }

  const episodeStepIds = new Set(episode.data.steps.map((step) => step.stepId));
  if (manifest.data.sequence.some((item) => !episodeStepIds.has(item.stepId))) {
    return { success: false, error: 'unknown_step_id' };
  }

  return { success: true, data: { manifest: manifest.data, episodeProjection: episode.data } };
}

export function validateMissionAgainstEpisodeProjection(missionValue, episodeProjectionValue) {
  const mission = validateKaniMissionV1(missionValue);
  const episode = validateCommonLearningEpisodeProjection(episodeProjectionValue);
  if (!mission.success || !episode.success) return { success: false, error: 'invalid_transport' };

  if (!semanticRefsMatch(mission.data.semanticRef, episode.data.semanticRef)) {
    return { success: false, error: 'semantic_ref_mismatch' };
  }
  if (mission.data.learningEpisodeId !== episode.data.episodeId) {
    return { success: false, error: 'episode_id_mismatch' };
  }

  const episodeObjects = new Set(episode.data.learningObjectIds);
  if (mission.data.learningObjectIds.some((id) => !episodeObjects.has(id))) {
    return { success: false, error: 'learning_object_mismatch' };
  }

  return { success: true, data: { mission: mission.data, episodeProjection: episode.data } };
}
