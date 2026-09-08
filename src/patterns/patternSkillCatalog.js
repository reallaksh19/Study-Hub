export const PATTERN_SKILL_IDS = Object.freeze({
  OBSERVE_SEQUENCE_ORDER: 'patterns.observe_sequence_order',
  COMPARE_PATTERN_ATTRIBUTES: 'patterns.compare_pattern_attributes',
  RECOGNIZE_REPETITION: 'patterns.recognize_repetition',
  IDENTIFY_REPEATING_UNIT: 'patterns.identify_repeating_unit',
  CONTINUE_REPEATING_PATTERN: 'patterns.continue_repeating_pattern',
  FIND_MISSING_REPEATING_ELEMENT: 'patterns.find_missing_repeating_element',
  RECOGNIZE_GROWING_PATTERN: 'patterns.recognize_growing_pattern',
  DESCRIBE_CONSTANT_CHANGE: 'patterns.describe_constant_change',
  CONTINUE_ADDITIVE_NUMBER_PATTERN: 'patterns.continue_additive_number_pattern',
  IDENTIFY_ALTERNATING_RULE: 'patterns.identify_alternating_rule',
  FIND_MISSING_PATTERN_TERM: 'patterns.find_missing_pattern_term',
  DETECT_INCORRECT_PATTERN_TERM: 'patterns.detect_incorrect_pattern_term',
  SOLVE_MIXED_PATTERN_REASONING: 'patterns.solve_mixed_pattern_reasoning'
});

const PATTERN_TAGS = Object.freeze(['logical-reasoning', 'patterns']);

export const PATTERN_SKILLS = Object.freeze([
  Object.freeze({
    id: PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
    title: 'Observe sequence order',
    prerequisiteSkillIds: Object.freeze([]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES,
    title: 'Compare pattern attributes',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.RECOGNIZE_REPETITION,
    title: 'Recognize repetition',
    prerequisiteSkillIds: Object.freeze([
      PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
      PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES
    ]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT,
    title: 'Identify a repeating unit',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.RECOGNIZE_REPETITION]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
    title: 'Continue a repeating pattern',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
    title: 'Find a missing repeating element',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.RECOGNIZE_GROWING_PATTERN,
    title: 'Recognize a growing pattern',
    prerequisiteSkillIds: Object.freeze([
      PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
      PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES
    ]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.DESCRIBE_CONSTANT_CHANGE,
    title: 'Describe constant change',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.RECOGNIZE_GROWING_PATTERN]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
    title: 'Continue an additive number pattern',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.DESCRIBE_CONSTANT_CHANGE]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
    title: 'Identify an alternating rule',
    prerequisiteSkillIds: Object.freeze([
      PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
      PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN
    ]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
    title: 'Find a missing pattern term',
    prerequisiteSkillIds: Object.freeze([
      PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
      PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
      PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE
    ]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM,
    title: 'Detect an incorrect pattern term',
    prerequisiteSkillIds: Object.freeze([PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM]),
    tags: PATTERN_TAGS
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING,
    title: 'Solve mixed pattern reasoning',
    prerequisiteSkillIds: Object.freeze([
      PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
      PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
      PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM
    ]),
    tags: PATTERN_TAGS
  })
]);

export function getPatternSkillById(id) {
  return PATTERN_SKILLS.find((skill) => skill.id === id) ?? null;
}
