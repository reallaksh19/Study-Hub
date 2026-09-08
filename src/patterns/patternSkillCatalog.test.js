import assert from 'node:assert/strict';
import { validateSkillLibrary } from '../bridge/bridgeValidation.js';
import {
  PATTERN_SKILL_IDS,
  PATTERN_SKILLS,
  getPatternSkillById
} from './patternSkillCatalog.js';

const EXPECTED_KEYS = [
  'OBSERVE_SEQUENCE_ORDER',
  'COMPARE_PATTERN_ATTRIBUTES',
  'RECOGNIZE_REPETITION',
  'IDENTIFY_REPEATING_UNIT',
  'CONTINUE_REPEATING_PATTERN',
  'FIND_MISSING_REPEATING_ELEMENT',
  'RECOGNIZE_GROWING_PATTERN',
  'DESCRIBE_CONSTANT_CHANGE',
  'CONTINUE_ADDITIVE_NUMBER_PATTERN',
  'IDENTIFY_ALTERNATING_RULE',
  'FIND_MISSING_PATTERN_TERM',
  'DETECT_INCORRECT_PATTERN_TERM',
  'SOLVE_MIXED_PATTERN_REASONING'
];

const EXPECTED_IDS = [
  'patterns.observe_sequence_order',
  'patterns.compare_pattern_attributes',
  'patterns.recognize_repetition',
  'patterns.identify_repeating_unit',
  'patterns.continue_repeating_pattern',
  'patterns.find_missing_repeating_element',
  'patterns.recognize_growing_pattern',
  'patterns.describe_constant_change',
  'patterns.continue_additive_number_pattern',
  'patterns.identify_alternating_rule',
  'patterns.find_missing_pattern_term',
  'patterns.detect_incorrect_pattern_term',
  'patterns.solve_mixed_pattern_reasoning'
];

const EXPECTED_PREREQUISITES = {
  'patterns.observe_sequence_order': [],
  'patterns.compare_pattern_attributes': ['patterns.observe_sequence_order'],
  'patterns.recognize_repetition': [
    'patterns.observe_sequence_order',
    'patterns.compare_pattern_attributes'
  ],
  'patterns.identify_repeating_unit': ['patterns.recognize_repetition'],
  'patterns.continue_repeating_pattern': ['patterns.identify_repeating_unit'],
  'patterns.find_missing_repeating_element': ['patterns.continue_repeating_pattern'],
  'patterns.recognize_growing_pattern': [
    'patterns.observe_sequence_order',
    'patterns.compare_pattern_attributes'
  ],
  'patterns.describe_constant_change': ['patterns.recognize_growing_pattern'],
  'patterns.continue_additive_number_pattern': ['patterns.describe_constant_change'],
  'patterns.identify_alternating_rule': [
    'patterns.continue_repeating_pattern',
    'patterns.continue_additive_number_pattern'
  ],
  'patterns.find_missing_pattern_term': [
    'patterns.find_missing_repeating_element',
    'patterns.continue_additive_number_pattern',
    'patterns.identify_alternating_rule'
  ],
  'patterns.detect_incorrect_pattern_term': ['patterns.find_missing_pattern_term'],
  'patterns.solve_mixed_pattern_reasoning': [
    'patterns.identify_alternating_rule',
    'patterns.find_missing_pattern_term',
    'patterns.detect_incorrect_pattern_term'
  ]
};

assert.deepEqual(Object.keys(PATTERN_SKILL_IDS), EXPECTED_KEYS);
assert.deepEqual(Object.values(PATTERN_SKILL_IDS), EXPECTED_IDS);
assert.equal(PATTERN_SKILLS.length, 13);
assert.deepEqual(PATTERN_SKILLS.map((skill) => skill.id), EXPECTED_IDS);
assert.equal(new Set(EXPECTED_IDS).size, 13);

PATTERN_SKILLS.forEach((skill) => {
  assert.deepEqual(skill.prerequisiteSkillIds, EXPECTED_PREREQUISITES[skill.id]);
  assert.deepEqual(skill.tags, ['logical-reasoning', 'patterns']);
  assert.equal(Object.isFrozen(skill), true);
  assert.equal(Object.isFrozen(skill.prerequisiteSkillIds), true);
  assert.equal(Object.isFrozen(skill.tags), true);
});

const skillMap = validateSkillLibrary(PATTERN_SKILLS);
assert.equal(skillMap.size, 13);
PATTERN_SKILLS.forEach((skill) => {
  skill.prerequisiteSkillIds.forEach((id) => assert.equal(skillMap.has(id), true));
});

const forbiddenLabel = /\b(?:grade|class|imo|remedial|beginner|weak|ability)\b/i;
PATTERN_SKILLS.forEach((skill) => {
  assert.doesNotMatch(skill.id, forbiddenLabel);
  assert.doesNotMatch(skill.title, forbiddenLabel);
});

assert.equal(Object.isFrozen(PATTERN_SKILL_IDS), true);
assert.equal(Object.isFrozen(PATTERN_SKILLS), true);
PATTERN_SKILLS.forEach((skill) => assert.equal(getPatternSkillById(skill.id), skill));
assert.equal(getPatternSkillById('patterns.unknown'), null);
assert.equal(getPatternSkillById(' patterns.observe_sequence_order '), null);
assert.equal(getPatternSkillById('PATTERNS.OBSERVE_SEQUENCE_ORDER'), null);

console.log('patternSkillCatalog tests passed');
