import { z } from 'zod';

export const KANI_SCHEMA_VERSION = '1.0';

export const KaniDifficultySchema = z.enum(['easy', 'medium', 'hard', 'mixed', 'none']);
export const KaniActivityTypeSchema = z.enum([
  'lesson', 'worksheet', 'quiz', 'game', 'brain', 'challenge', 'interactive'
]);
export const KaniSourceAppSchema = z.enum(['study-hub', 'game-app', 'worksheet-app']);
export const IsoDateTimeSchema = z.string().refine(
  (value) => typeof value === 'string' && value.includes('T') && !Number.isNaN(Date.parse(value)),
  'Expected an ISO-8601 date-time string'
);

const KaniQuestionMetadataSchema = z.object({
  schemaVersion: z.literal(KANI_SCHEMA_VERSION).default(KANI_SCHEMA_VERSION),
  id: z.string().min(1),
  subjectId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  pageId: z.string().min(1).optional(),
  grade: z.string().min(1).optional(),
  skillIds: z.array(z.string().min(1)).default([]),
  conceptTags: z.array(z.string().min(1)).default([]),
  difficulty: KaniDifficultySchema.default('none'),
  cognitiveDemand: z.string().min(1).optional(),
  curriculumTags: z.array(z.string().min(1)).default([]),
  hint: z.string().optional(),
  explanation: z.string().optional()
});

export const KaniQuestionSchema = z.discriminatedUnion('type', [
  KaniQuestionMetadataSchema.extend({
    type: z.literal('mcq'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    answerIndex: z.number().int().nonnegative()
  }).refine((q) => q.answerIndex < q.options.length, {
    message: 'answerIndex must reference an option',
    path: ['answerIndex']
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('multi_select'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    answerIndexes: z.array(z.number().int().nonnegative()).min(1)
  }).refine((q) => q.answerIndexes.every((index) => index < q.options.length), {
    message: 'Every answerIndexes entry must reference an option',
    path: ['answerIndexes']
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('true_false'),
    prompt: z.string().min(1),
    answer: z.boolean()
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('short_answer'),
    prompt: z.string().min(1),
    acceptedAnswers: z.array(z.string().min(1)).min(1),
    caseSensitive: z.boolean().default(false)
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('numeric'),
    prompt: z.string().min(1),
    answer: z.number(),
    tolerance: z.number().nonnegative().default(0),
    unit: z.string().optional()
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('fill_in_blank'),
    prompt: z.string().min(1),
    acceptedAnswers: z.array(z.union([z.string().min(1), z.number()])).min(1),
    caseSensitive: z.boolean().default(false)
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('match_following'),
    prompt: z.string().min(1),
    leftItems: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2),
    rightItems: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2),
    correctPairs: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1)
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('assertion_reason'),
    assertion: z.string().min(1),
    reason: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    answerIndex: z.number().int().nonnegative()
  }).refine((q) => q.answerIndex < q.options.length, {
    message: 'answerIndex must reference an option',
    path: ['answerIndex']
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('sequence_order'),
    prompt: z.string().min(1),
    items: z.array(z.string().min(1)).min(2),
    correctOrder: z.array(z.number().int().nonnegative()).min(2)
  }).refine((q) => {
    if (q.correctOrder.length !== q.items.length) return false;
    return new Set(q.correctOrder).size === q.items.length && q.correctOrder.every((i) => i < q.items.length);
  }, {
    message: 'correctOrder must be a permutation of item indexes',
    path: ['correctOrder']
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('long_answer'),
    prompt: z.string().min(1),
    modelAnswer: z.string().min(1)
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('diagram_label'),
    prompt: z.string().min(1),
    labels: z.array(z.string().min(1)).min(1),
    answerMap: z.record(z.string(), z.string())
  }),
  KaniQuestionMetadataSchema.extend({
    type: z.literal('interactive_external'),
    prompt: z.string().optional(),
    externalRef: z.object({
      activityId: z.string().min(1),
      launchUrl: z.string().min(1)
    }).catchall(z.unknown())
  })
]);

export const KaniPageContentSchema = z.object({
  schemaVersion: z.literal(KANI_SCHEMA_VERSION).default(KANI_SCHEMA_VERSION),
  id: z.string().min(1),
  topicId: z.string().min(1),
  subjectId: z.string().min(1).optional(),
  title: z.string().min(1),
  pageKind: KaniActivityTypeSchema.default('lesson'),
  grade: z.string().min(1).optional(),
  difficulty: KaniDifficultySchema.default('none'),
  skillIds: z.array(z.string().min(1)).default([]),
  conceptTags: z.array(z.string().min(1)).default([]),
  questions: z.array(KaniQuestionSchema).default([])
});

export const KaniCatalogSubjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  grade: z.string().min(1).optional(),
  order: z.number().finite().optional()
});

export const KaniCatalogTopicSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  grade: z.string().min(1).optional(),
  difficulty: KaniDifficultySchema.default('none'),
  conceptTags: z.array(z.string().min(1)).default([]),
  pageRefs: z.array(z.string().min(1)).default([]),
  order: z.number().finite().optional()
});

export const KaniCatalogPageSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  activityType: KaniActivityTypeSchema,
  contentUrl: z.string().min(1),
  grade: z.string().min(1).optional(),
  difficulty: KaniDifficultySchema.default('none'),
  skillIds: z.array(z.string().min(1)).default([]),
  conceptTags: z.array(z.string().min(1)).default([]),
  order: z.number().finite().optional()
});

export const KaniCatalogSchema = z.object({
  schemaVersion: z.literal(KANI_SCHEMA_VERSION),
  publishedAt: IsoDateTimeSchema,
  sourceApp: z.literal('study-hub'),
  subjects: z.array(KaniCatalogSubjectSchema),
  topics: z.array(KaniCatalogTopicSchema),
  pages: z.array(KaniCatalogPageSchema)
});

const ActivityEnvelopeBase = z.object({
  schemaVersion: z.literal(KANI_SCHEMA_VERSION),
  launchId: z.string().min(1),
  activityId: z.string().min(1)
});

export const KaniActivityMessageSchema = z.discriminatedUnion('type', [
  ActivityEnvelopeBase.extend({
    type: z.literal('kani.activity.ready')
  }),
  ActivityEnvelopeBase.extend({
    type: z.literal('kani.activity.launch'),
    payload: z.object({
      studentId: z.string().min(1),
      activityType: KaniActivityTypeSchema,
      subjectId: z.string().min(1).optional(),
      topicId: z.string().min(1).optional(),
      pageId: z.string().min(1).optional(),
      skillIds: z.array(z.string().min(1)).default([]),
      difficulty: KaniDifficultySchema.default('none')
    })
  }),
  ActivityEnvelopeBase.extend({
    type: z.literal('kani.activity.started'),
    payload: z.object({ studentId: z.string().min(1), startedAt: IsoDateTimeSchema })
  }),
  ActivityEnvelopeBase.extend({
    type: z.literal('kani.activity.completed'),
    payload: z.object({
      studentId: z.string().min(1),
      attemptId: z.string().min(1),
      activityType: KaniActivityTypeSchema,
      correct: z.number().int().nonnegative().optional(),
      total: z.number().int().nonnegative().optional(),
      accuracy: z.number().min(0).max(1).optional(),
      score: z.number().finite().optional(),
      durationSeconds: z.number().nonnegative().optional(),
      difficulty: KaniDifficultySchema.default('none'),
      skillIds: z.array(z.string().min(1)).default([]),
      completedAt: IsoDateTimeSchema
    })
  }),
  ActivityEnvelopeBase.extend({
    type: z.literal('kani.activity.cancelled'),
    payload: z.object({ studentId: z.string().min(1).optional(), cancelledAt: IsoDateTimeSchema })
  }),
  ActivityEnvelopeBase.extend({
    type: z.literal('kani.activity.error'),
    payload: z.object({ code: z.string().min(1), message: z.string().min(1) })
  })
]);

export const KaniAttemptSchema = z.object({
  schemaVersion: z.literal(KANI_SCHEMA_VERSION),
  attemptId: z.string().min(1),
  studentId: z.string().min(1),
  activityId: z.string().min(1),
  activityType: KaniActivityTypeSchema,
  sourceApp: KaniSourceAppSchema,
  subjectId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  pageId: z.string().min(1).optional(),
  questionId: z.string().min(1).optional(),
  roundId: z.string().min(1).optional(),
  skillIds: z.array(z.string().min(1)).default([]),
  difficulty: KaniDifficultySchema.default('none'),
  correct: z.boolean().optional(),
  partialCredit: z.number().min(0).max(1).optional(),
  responseTimeMs: z.number().nonnegative().optional(),
  hintsUsed: z.number().int().nonnegative().optional(),
  score: z.number().finite().optional(),
  startedAt: IsoDateTimeSchema.optional(),
  completedAt: IsoDateTimeSchema
});

export function validateKaniQuestion(value) {
  return KaniQuestionSchema.safeParse(value);
}

export function validateKaniCatalog(value) {
  return KaniCatalogSchema.safeParse(value);
}

export function validateKaniActivityMessage(value) {
  return KaniActivityMessageSchema.safeParse(value);
}

export function validateKaniAttempt(value) {
  return KaniAttemptSchema.safeParse(value);
}
