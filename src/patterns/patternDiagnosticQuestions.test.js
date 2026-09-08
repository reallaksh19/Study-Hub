import assert from 'node:assert/strict';
import { validateKaniQuestion } from '../integration/contracts/kaniContracts.js';
import { PATTERN_SKILLS } from './patternSkillCatalog.js';
import {
  PATTERN_DIAGNOSTIC_ACTIVITY_ID,
  PATTERN_DIAGNOSTIC_QUESTIONS,
  getPatternDiagnosticQuestionById
} from './patternDiagnosticQuestions.js';

const EXPECTED_SLUGS = [
  'observe_sequence_order',
  'compare_pattern_attributes',
  'recognize_repetition',
  'identify_repeating_unit',
  'continue_repeating_pattern',
  'find_missing_repeating_element',
  'recognize_growing_pattern',
  'describe_constant_change',
  'continue_additive_number_pattern',
  'identify_alternating_rule',
  'find_missing_pattern_term',
  'detect_incorrect_pattern_term',
  'solve_mixed_pattern_reasoning'
];

const EXPECTED_IDS = EXPECTED_SLUGS.flatMap((slug) => [
  `patterns.probe.${slug}.1`,
  `patterns.probe.${slug}.2`
]);
const ALLOWED_TYPES = new Set(['mcq', 'numeric', 'sequence_order']);
const FORBIDDEN_TYPES = new Set(['long_answer', 'diagram_label', 'interactive_external']);

assert.equal(PATTERN_DIAGNOSTIC_ACTIVITY_ID, 'patterns.diagnostic.initial');
assert.equal(PATTERN_DIAGNOSTIC_QUESTIONS.length, 26);
assert.deepEqual(PATTERN_DIAGNOSTIC_QUESTIONS.map((question) => question.id), EXPECTED_IDS);
assert.equal(new Set(EXPECTED_IDS).size, 26);
assert.equal(Object.isFrozen(PATTERN_DIAGNOSTIC_QUESTIONS), true);

PATTERN_SKILLS.forEach((skill, skillIndex) => {
  const pair = PATTERN_DIAGNOSTIC_QUESTIONS.slice(skillIndex * 2, skillIndex * 2 + 2);
  assert.equal(pair.length, 2);
  pair.forEach((question) => assert.deepEqual(question.skillIds, [skill.id]));
});

PATTERN_DIAGNOSTIC_QUESTIONS.forEach((question) => {
  const validation = validateKaniQuestion(question);
  assert.equal(validation.success, true, validation.success ? '' : validation.error.message);
  assert.equal(question.schemaVersion, '1.0');
  assert.equal(ALLOWED_TYPES.has(question.type), true);
  assert.equal(FORBIDDEN_TYPES.has(question.type), false);
  assert.equal(question.difficulty, 'none');
  assert.deepEqual(question.conceptTags, ['patterns', 'diagnostic-probe']);
  assert.equal(question.skillIds.length, 1);
  assert.equal(PATTERN_SKILLS.some((skill) => skill.id === question.skillIds[0]), true);
  assert.equal(typeof question.hint, 'string');
  assert.ok(question.hint.trim().length > 0);
  assert.equal(Object.isFrozen(question), true);
  assert.equal(Object.isFrozen(question.skillIds), true);
  assert.equal(Object.isFrozen(question.conceptTags), true);
  if (question.options) assert.equal(Object.isFrozen(question.options), true);
  if (question.items) assert.equal(Object.isFrozen(question.items), true);
  if (question.correctOrder) assert.equal(Object.isFrozen(question.correctOrder), true);
});

PATTERN_DIAGNOSTIC_QUESTIONS.forEach((question) => {
  assert.equal(getPatternDiagnosticQuestionById(question.id), question);
});
assert.equal(getPatternDiagnosticQuestionById('patterns.probe.unknown.1'), null);
assert.equal(getPatternDiagnosticQuestionById(' patterns.probe.observe_sequence_order.1 '), null);
assert.equal(getPatternDiagnosticQuestionById('PATTERNS.PROBE.OBSERVE_SEQUENCE_ORDER.1'), null);

const forbiddenIdLabel = /grade|class|imo|remedial|beginner|weak|ability/i;
PATTERN_DIAGNOSTIC_QUESTIONS.forEach((question) => {
  assert.doesNotMatch(question.id, forbiddenIdLabel);
});

console.log('patternDiagnosticQuestions tests passed');
