export const SCHEMA_VERSION = '1.0';
export const CONTRACT_IDS = ['kani-content-v1', 'kani-catalog-v1', 'kani-activity-v1', 'kani-attempt-v1'];

const schemaHeader = (id, title) => ({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `https://reallaksh19.github.io/Study-Hub/contracts/${id}.schema.json`,
  title,
  'x-kani-contract': id,
  'x-kani-schema-version': SCHEMA_VERSION,
  $comment: 'Canonical normalized payload schema. Runtime validators remain authoritative for normalization and relational refinements not expressible here.',
});

const nonEmptyString = { type: 'string', minLength: 1 };
const stringArray = { type: 'array', items: nonEmptyString };
const difficulty = { enum: ['easy', 'medium', 'hard', 'mixed', 'none'] };
const activityType = { enum: ['lesson', 'worksheet', 'quiz', 'game', 'brain', 'challenge', 'interactive'] };
const sourceApp = { enum: ['study-hub', 'game-app', 'worksheet-app'] };
const dateTime = { type: 'string', format: 'date-time' };
const finiteNumber = { type: 'number' };
const nonNegativeNumber = { type: 'number', minimum: 0 };
const nonNegativeInteger = { type: 'integer', minimum: 0 };

const questionBaseProperties = {
  schemaVersion: { const: SCHEMA_VERSION },
  id: nonEmptyString,
  subjectId: nonEmptyString,
  topicId: nonEmptyString,
  pageId: nonEmptyString,
  grade: nonEmptyString,
  skillIds: stringArray,
  conceptTags: stringArray,
  difficulty,
  cognitiveDemand: nonEmptyString,
  curriculumTags: stringArray,
  hint: { type: 'string' },
  explanation: { type: 'string' },
};
const questionBaseRequired = ['schemaVersion', 'id', 'skillIds', 'conceptTags', 'difficulty', 'curriculumTags'];
const q = (type, props, required = []) => ({
  type: 'object',
  properties: { ...questionBaseProperties, type: { const: type }, ...props },
  required: [...questionBaseRequired, 'type', ...required],
  additionalProperties: true,
});

export function getContractSchemas() {
  const content = {
    ...schemaHeader('kani-content-v1', 'Kani canonical content v1'),
    type: 'object',
    properties: {
      schemaVersion: { const: SCHEMA_VERSION },
      id: nonEmptyString,
      topicId: nonEmptyString,
      subjectId: nonEmptyString,
      title: nonEmptyString,
      pageKind: activityType,
      grade: nonEmptyString,
      difficulty,
      skillIds: stringArray,
      conceptTags: stringArray,
      questions: {
        type: 'array',
        items: {
          oneOf: [
            q('mcq', { prompt: nonEmptyString, options: { type: 'array', minItems: 2, items: nonEmptyString }, answerIndex: nonNegativeInteger }, ['prompt', 'options', 'answerIndex']),
            q('multi_select', { prompt: nonEmptyString, options: { type: 'array', minItems: 2, items: nonEmptyString }, answerIndexes: { type: 'array', minItems: 1, uniqueItems: true, items: nonNegativeInteger } }, ['prompt', 'options', 'answerIndexes']),
            q('true_false', { prompt: nonEmptyString, answer: { type: 'boolean' } }, ['prompt', 'answer']),
            q('short_answer', { prompt: nonEmptyString, acceptedAnswers: { type: 'array', minItems: 1, items: nonEmptyString }, caseSensitive: { type: 'boolean' } }, ['prompt', 'acceptedAnswers', 'caseSensitive']),
            q('numeric', { prompt: nonEmptyString, answer: finiteNumber, tolerance: nonNegativeNumber, unit: { type: 'string' } }, ['prompt', 'answer', 'tolerance']),
            q('fill_in_blank', { prompt: nonEmptyString, acceptedAnswers: { type: 'array', minItems: 1, items: { anyOf: [nonEmptyString, finiteNumber] } }, caseSensitive: { type: 'boolean' } }, ['prompt', 'acceptedAnswers', 'caseSensitive']),
            q('match_following', {
              prompt: nonEmptyString,
              leftItems: { type: 'array', minItems: 2, items: { type: 'object', properties: { id: nonEmptyString, text: nonEmptyString }, required: ['id', 'text'], additionalProperties: false } },
              rightItems: { type: 'array', minItems: 2, items: { type: 'object', properties: { id: nonEmptyString, text: nonEmptyString }, required: ['id', 'text'], additionalProperties: false } },
              correctPairs: { type: 'array', minItems: 1, items: { type: 'array', prefixItems: [nonEmptyString, nonEmptyString], minItems: 2, maxItems: 2 } },
            }, ['prompt', 'leftItems', 'rightItems', 'correctPairs']),
            q('assertion_reason', { assertion: nonEmptyString, reason: nonEmptyString, options: { type: 'array', minItems: 2, items: nonEmptyString }, answerIndex: nonNegativeInteger }, ['assertion', 'reason', 'options', 'answerIndex']),
            q('sequence_order', { prompt: nonEmptyString, items: { type: 'array', minItems: 2, items: nonEmptyString }, correctOrder: { type: 'array', minItems: 2, uniqueItems: true, items: nonNegativeInteger } }, ['prompt', 'items', 'correctOrder']),
            q('long_answer', { prompt: nonEmptyString, modelAnswer: nonEmptyString }, ['prompt', 'modelAnswer']),
            q('diagram_label', { prompt: nonEmptyString, labels: { type: 'array', minItems: 1, items: nonEmptyString }, answerMap: { type: 'object', additionalProperties: nonEmptyString } }, ['prompt', 'labels', 'answerMap']),
            q('interactive_external', { prompt: { type: 'string' }, externalRef: { type: 'object', properties: { activityId: nonEmptyString, launchUrl: nonEmptyString }, required: ['activityId', 'launchUrl'], additionalProperties: true } }, ['externalRef']),
          ],
        },
      },
    },
    required: ['schemaVersion', 'id', 'topicId', 'title', 'pageKind', 'difficulty', 'skillIds', 'conceptTags', 'questions'],
    additionalProperties: true,
  };

  const catalog = {
    ...schemaHeader('kani-catalog-v1', 'Kani published catalog v1'),
    type: 'object',
    properties: {
      schemaVersion: { const: SCHEMA_VERSION },
      publishedAt: dateTime,
      sourceApp: { const: 'study-hub' },
      subjects: { type: 'array', items: { type: 'object', properties: { id: nonEmptyString, title: nonEmptyString, grade: nonEmptyString, order: finiteNumber }, required: ['id', 'title'], additionalProperties: true } },
      topics: { type: 'array', items: { type: 'object', properties: { id: nonEmptyString, subjectId: nonEmptyString, title: nonEmptyString, grade: nonEmptyString, difficulty, conceptTags: stringArray, pageRefs: stringArray, order: finiteNumber }, required: ['id', 'subjectId', 'title', 'difficulty', 'conceptTags', 'pageRefs'], additionalProperties: true } },
      pages: { type: 'array', items: { type: 'object', properties: { id: nonEmptyString, topicId: nonEmptyString, subjectId: nonEmptyString, title: nonEmptyString, activityType, contentUrl: nonEmptyString, learnerUrl: nonEmptyString, grade: nonEmptyString, difficulty, skillIds: stringArray, conceptTags: stringArray, order: finiteNumber }, required: ['id', 'topicId', 'subjectId', 'title', 'activityType', 'contentUrl', 'difficulty', 'skillIds', 'conceptTags'], additionalProperties: true } },
    },
    required: ['schemaVersion', 'publishedAt', 'sourceApp', 'subjects', 'topics', 'pages'],
    additionalProperties: true,
  };

  const activityBase = {
    schemaVersion: { const: SCHEMA_VERSION }, launchId: nonEmptyString, activityId: nonEmptyString,
  };
  const activityVariant = (type, payload) => ({
    type: 'object', properties: { ...activityBase, type: { const: type }, ...(payload ? { payload } : {}) }, required: ['schemaVersion', 'launchId', 'activityId', 'type', ...(payload ? ['payload'] : [])], additionalProperties: true,
  });
  const activity = {
    ...schemaHeader('kani-activity-v1', 'Kani activity lifecycle v1'),
    oneOf: [
      activityVariant('kani.activity.ready'),
      activityVariant('kani.activity.launch', { type: 'object', properties: { studentId: nonEmptyString, activityType, subjectId: nonEmptyString, topicId: nonEmptyString, pageId: nonEmptyString, skillIds: stringArray, difficulty }, required: ['studentId', 'activityType', 'skillIds', 'difficulty'], additionalProperties: true }),
      activityVariant('kani.activity.started', { type: 'object', properties: { studentId: nonEmptyString, startedAt: dateTime }, required: ['studentId', 'startedAt'], additionalProperties: true }),
      activityVariant('kani.activity.completed', { type: 'object', properties: { studentId: nonEmptyString, attemptId: nonEmptyString, activityType, correct: nonNegativeInteger, total: nonNegativeInteger, accuracy: { type: 'number', minimum: 0, maximum: 1 }, score: finiteNumber, durationSeconds: nonNegativeNumber, difficulty, skillIds: stringArray, completedAt: dateTime }, required: ['studentId', 'attemptId', 'activityType', 'difficulty', 'skillIds', 'completedAt'], additionalProperties: true }),
      activityVariant('kani.activity.cancelled', { type: 'object', properties: { studentId: nonEmptyString, cancelledAt: dateTime }, required: ['cancelledAt'], additionalProperties: true }),
      activityVariant('kani.activity.error', { type: 'object', properties: { code: nonEmptyString, message: nonEmptyString }, required: ['code', 'message'], additionalProperties: true }),
    ],
  };

  const attempt = {
    ...schemaHeader('kani-attempt-v1', 'Kani immutable attempt evidence v1'),
    type: 'object',
    properties: {
      schemaVersion: { const: SCHEMA_VERSION }, attemptId: nonEmptyString, studentId: nonEmptyString, activityId: nonEmptyString, activityType, sourceApp,
      subjectId: nonEmptyString, topicId: nonEmptyString, pageId: nonEmptyString, questionId: nonEmptyString, roundId: nonEmptyString,
      skillIds: stringArray, difficulty, correct: { type: 'boolean' }, partialCredit: { type: 'number', minimum: 0, maximum: 1 }, responseTimeMs: nonNegativeNumber,
      hintsUsed: nonNegativeInteger, score: finiteNumber, startedAt: dateTime, completedAt: dateTime,
    },
    required: ['schemaVersion', 'attemptId', 'studentId', 'activityId', 'activityType', 'sourceApp', 'skillIds', 'difficulty', 'completedAt'],
    additionalProperties: true,
  };

  return {
    'kani-content-v1': content,
    'kani-catalog-v1': catalog,
    'kani-activity-v1': activity,
    'kani-attempt-v1': attempt,
  };
}

export const CANONICAL_SOURCE_PATH = 'src/integration/contracts/kaniContracts.js';
export const CANONICAL_SOURCE_GIT_BLOB_SHA = '3a820dfd3b379720e59ee4e17fe92b6fe2c340b9';
export const CERTIFIED_BASELINES = {
  studyHub: '8d07b5070832e43894c36817bc558467270249cb',
  kaniGameApp: 'c48688c0653a1d84f15c35a18b3115112af1fd4e',
};
