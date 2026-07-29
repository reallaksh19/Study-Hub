/**
 * @typedef {import('../domain/bridge/types.js').Skill} Skill
 */

/**
 * Exact ordered list of Pattern skill IDs.
 */
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

/**
 * The canonical catalog of Pattern skills.
 * All skills and their nested arrays are deeply frozen to guarantee immutability.
 * @type {readonly Skill[]}
 */
export const PATTERN_SKILLS = Object.freeze([
  Object.freeze({
    id: PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
    title: 'Observe sequence order',
    prerequisites: Object.freeze([]), // Note: using 'prerequisites' per M001 contract
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES,
    title: 'Compare pattern attributes',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.RECOGNIZE_REPETITION,
    title: 'Recognize repetition',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
      PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT,
    title: 'Identify repeating unit',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.RECOGNIZE_REPETITION
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
    title: 'Continue repeating pattern',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
    title: 'Find missing repeating element',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.RECOGNIZE_GROWING_PATTERN,
    title: 'Recognize growing pattern',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
      PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.DESCRIBE_CONSTANT_CHANGE,
    title: 'Describe constant change',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.RECOGNIZE_GROWING_PATTERN
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
    title: 'Continue additive number pattern',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.DESCRIBE_CONSTANT_CHANGE
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
    title: 'Identify alternating rule',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
      PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
    title: 'Find missing pattern term',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
      PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
      PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM,
    title: 'Detect incorrect pattern term',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  }),
  Object.freeze({
    id: PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING,
    title: 'Solve mixed pattern reasoning',
    prerequisites: Object.freeze([
      PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
      PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
      PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM
    ]),
    tags: Object.freeze(['logical-reasoning', 'patterns'])
  })
]);

// Build a frozen map for O(1) lookups without mutating during runtime.
const skillMap = Object.freeze(
  new Map(PATTERN_SKILLS.map(skill => [skill.id, skill]))
);

/**
 * Retrieves the exact canonical skill object for a given ID.
 * Returns null if the ID is unknown.
 * Does not perform alias resolution or mutation.
 *
 * @param {string} id - The exact skill ID.
 * @returns {Skill | null}
 */
export function getPatternSkillById(id) {
  return skillMap.get(id) || null;
}
