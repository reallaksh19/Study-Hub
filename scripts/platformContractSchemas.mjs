export const SCHEMA_VERSION = '1.0';
export const CONTRACT_IDS = ['kani-content-v1', 'kani-catalog-v1', 'kani-activity-v1', 'kani-attempt-v1'];
export const CANONICAL_SOURCE_PATH = 'src/integration/contracts/kaniContracts.js';
export const CANONICAL_SOURCE_GIT_BLOB_SHA = '3a820dfd3b379720e59ee4e17fe92b6fe2c340b9';
export const CERTIFIED_BASELINES = {
  studyHub: '8d07b5070832e43894c36817bc558467270249cb',
  kaniGameApp: 'c48688c0653a1d84f15c35a18b3115112af1fd4e',
};

const schemaHeader = (id, title) => ({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `https://reallaksh19.github.io/Study-Hub/contracts/${id}.schema.json`,
  title,
  'x-kani-contract': id,
  'x-kani-schema-version': SCHEMA_VERSION,
  $comment: 'Canonical normalized payload schema. Runtime validators remain authoritative for normalization and relational refinements not expressible here.',
});
const s = { type: 'string', minLength: 1 };
const sa = { type: 'array', items: s };
const difficulty = { enum: ['easy', 'medium', 'hard', 'mixed', 'none'] };
const activityType = { enum: ['lesson', 'worksheet', 'quiz', 'game', 'brain', 'challenge', 'interactive'] };
const sourceApp = { enum: ['study-hub', 'game-app', 'worksheet-app'] };
const dt = { type: 'string', format: 'date-time' };
const num = { type: 'number' };
const nn = { type: 'number', minimum: 0 };
const nni = { type: 'integer', minimum: 0 };
const variant = (type, properties, required = []) => ({
  allOf: [
    { $ref: '#/$defs/questionBase' },
    { type: 'object', properties: { type: { const: type }, ...properties }, required: ['type', ...required], additionalProperties: true },
  ],
});

export function getContractSchemas() {
  const questionBase = {
    type: 'object',
    properties: {
      schemaVersion: { const: SCHEMA_VERSION }, id: s, subjectId: s, topicId: s, pageId: s, grade: s,
      skillIds: sa, conceptTags: sa, difficulty, cognitiveDemand: s, curriculumTags: sa,
      hint: { type: 'string' }, explanation: { type: 'string' },
    },
    required: ['schemaVersion', 'id', 'skillIds', 'conceptTags', 'difficulty', 'curriculumTags'],
    additionalProperties: true,
  };
  const content = {
    ...schemaHeader('kani-content-v1', 'Kani canonical content v1'),
    type: 'object',
    $defs: {
      questionBase,
      mcq: variant('mcq', { prompt: s, options: { type: 'array', minItems: 2, items: s }, answerIndex: nni }, ['prompt', 'options', 'answerIndex']),
      multiSelect: variant('multi_select', { prompt: s, options: { type: 'array', minItems: 2, items: s }, answerIndexes: { type: 'array', minItems: 1, uniqueItems: true, items: nni } }, ['prompt', 'options', 'answerIndexes']),
      trueFalse: variant('true_false', { prompt: s, answer: { type: 'boolean' } }, ['prompt', 'answer']),
      shortAnswer: variant('short_answer', { prompt: s, acceptedAnswers: { type: 'array', minItems: 1, items: s }, caseSensitive: { type: 'boolean' } }, ['prompt', 'acceptedAnswers', 'caseSensitive']),
      numeric: variant('numeric', { prompt: s, answer: num, tolerance: nn, unit: { type: 'string' } }, ['prompt', 'answer', 'tolerance']),
      fillBlank: variant('fill_in_blank', { prompt: s, acceptedAnswers: { type: 'array', minItems: 1, items: { anyOf: [s, num] } }, caseSensitive: { type: 'boolean' } }, ['prompt', 'acceptedAnswers', 'caseSensitive']),
      matching: variant('match_following', {
        prompt: s,
        leftItems: { type: 'array', minItems: 2, items: { type: 'object', properties: { id: s, text: s }, required: ['id', 'text'], additionalProperties: false } },
        rightItems: { type: 'array', minItems: 2, items: { type: 'object', properties: { id: s, text: s }, required: ['id', 'text'], additionalProperties: false } },
        correctPairs: { type: 'array', minItems: 1, items: { type: 'array', prefixItems: [s, s], minItems: 2, maxItems: 2 } },
      }, ['prompt', 'leftItems', 'rightItems', 'correctPairs']),
      assertionReason: variant('assertion_reason', { assertion: s, reason: s, options: { type: 'array', minItems: 2, items: s }, answerIndex: nni }, ['assertion', 'reason', 'options', 'answerIndex']),
      sequence: variant('sequence_order', { prompt: s, items: { type: 'array', minItems: 2, items: s }, correctOrder: { type: 'array', minItems: 2, uniqueItems: true, items: nni } }, ['prompt', 'items', 'correctOrder']),
      longAnswer: variant('long_answer', { prompt: s, modelAnswer: s }, ['prompt', 'modelAnswer']),
      diagramLabel: variant('diagram_label', { prompt: s, labels: { type: 'array', minItems: 1, items: s }, answerMap: { type: 'object', additionalProperties: s } }, ['prompt', 'labels', 'answerMap']),
      external: variant('interactive_external', { prompt: { type: 'string' }, externalRef: { type: 'object', properties: { activityId: s, launchUrl: s }, required: ['activityId', 'launchUrl'], additionalProperties: true } }, ['externalRef']),
    },
    properties: {
      schemaVersion: { const: SCHEMA_VERSION }, id: s, topicId: s, subjectId: s, title: s, pageKind: activityType, grade: s,
      difficulty, skillIds: sa, conceptTags: sa,
      questions: { type: 'array', items: { oneOf: [
        { $ref: '#/$defs/mcq' }, { $ref: '#/$defs/multiSelect' }, { $ref: '#/$defs/trueFalse' }, { $ref: '#/$defs/shortAnswer' },
        { $ref: '#/$defs/numeric' }, { $ref: '#/$defs/fillBlank' }, { $ref: '#/$defs/matching' }, { $ref: '#/$defs/assertionReason' },
        { $ref: '#/$defs/sequence' }, { $ref: '#/$defs/longAnswer' }, { $ref: '#/$defs/diagramLabel' }, { $ref: '#/$defs/external' },
      ] } },
    },
    required: ['schemaVersion', 'id', 'topicId', 'title', 'pageKind', 'difficulty', 'skillIds', 'conceptTags', 'questions'],
    additionalProperties: true,
  };

  const catalog = {
    ...schemaHeader('kani-catalog-v1', 'Kani published catalog v1'), type: 'object',
    properties: {
      schemaVersion: { const: SCHEMA_VERSION }, publishedAt: dt, sourceApp: { const: 'study-hub' },
      subjects: { type: 'array', items: { type: 'object', properties: { id: s, title: s, grade: s, order: num }, required: ['id', 'title'], additionalProperties: true } },
      topics: { type: 'array', items: { type: 'object', properties: { id: s, subjectId: s, title: s, grade: s, difficulty, conceptTags: sa, pageRefs: sa, order: num }, required: ['id', 'subjectId', 'title', 'difficulty', 'conceptTags', 'pageRefs'], additionalProperties: true } },
      pages: { type: 'array', items: { type: 'object', properties: { id: s, topicId: s, subjectId: s, title: s, activityType, contentUrl: s, learnerUrl: s, grade: s, difficulty, skillIds: sa, conceptTags: sa, order: num }, required: ['id', 'topicId', 'subjectId', 'title', 'activityType', 'contentUrl', 'difficulty', 'skillIds', 'conceptTags'], additionalProperties: true } },
    },
    required: ['schemaVersion', 'publishedAt', 'sourceApp', 'subjects', 'topics', 'pages'], additionalProperties: true,
  };

  const ab = { schemaVersion: { const: SCHEMA_VERSION }, launchId: s, activityId: s };
  const av = (type, payload) => ({ type: 'object', properties: { ...ab, type: { const: type }, ...(payload ? { payload } : {}) }, required: ['schemaVersion', 'launchId', 'activityId', 'type', ...(payload ? ['payload'] : [])], additionalProperties: true });
  const activity = {
    ...schemaHeader('kani-activity-v1', 'Kani activity lifecycle v1'),
    oneOf: [
      av('kani.activity.ready'),
      av('kani.activity.launch', { type: 'object', properties: { studentId: s, activityType, subjectId: s, topicId: s, pageId: s, skillIds: sa, difficulty }, required: ['studentId', 'activityType', 'skillIds', 'difficulty'], additionalProperties: true }),
      av('kani.activity.started', { type: 'object', properties: { studentId: s, startedAt: dt }, required: ['studentId', 'startedAt'], additionalProperties: true }),
      av('kani.activity.completed', { type: 'object', properties: { studentId: s, attemptId: s, activityType, correct: nni, total: nni, accuracy: { type: 'number', minimum: 0, maximum: 1 }, score: num, durationSeconds: nn, difficulty, skillIds: sa, completedAt: dt }, required: ['studentId', 'attemptId', 'activityType', 'difficulty', 'skillIds', 'completedAt'], additionalProperties: true }),
      av('kani.activity.cancelled', { type: 'object', properties: { studentId: s, cancelledAt: dt }, required: ['cancelledAt'], additionalProperties: true }),
      av('kani.activity.error', { type: 'object', properties: { code: s, message: s }, required: ['code', 'message'], additionalProperties: true }),
    ],
  };

  const attempt = {
    ...schemaHeader('kani-attempt-v1', 'Kani immutable attempt evidence v1'), type: 'object',
    properties: {
      schemaVersion: { const: SCHEMA_VERSION }, attemptId: s, studentId: s, activityId: s, activityType, sourceApp,
      subjectId: s, topicId: s, pageId: s, questionId: s, roundId: s, skillIds: sa, difficulty,
      correct: { type: 'boolean' }, partialCredit: { type: 'number', minimum: 0, maximum: 1 }, responseTimeMs: nn,
      hintsUsed: nni, score: num, startedAt: dt, completedAt: dt,
    },
    required: ['schemaVersion', 'attemptId', 'studentId', 'activityId', 'activityType', 'sourceApp', 'skillIds', 'difficulty', 'completedAt'], additionalProperties: true,
  };
  return { 'kani-content-v1': content, 'kani-catalog-v1': catalog, 'kani-activity-v1': activity, 'kani-attempt-v1': attempt };
}
