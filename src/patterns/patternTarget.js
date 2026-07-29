import { PATTERN_SKILL_IDS } from './patternSkillCatalog.js';

/**
 * @typedef {import('../domain/bridge/types.js').TargetDefinition} TargetDefinition
 */

/**
 * IMO Class 4 Patterns Target.
 * Immutable target definition.
 */
export const IMO_CLASS_4_PATTERNS_TARGET = Object.freeze({
  id: 'target.imo_class_4.patterns',
  title: 'IMO Class 4 — Patterns',
  requiredSkills: Object.freeze([
    PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
    PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
    PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
    PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
    PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
    PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM,
    PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING
  ]),
  readinessCriteria: Object.freeze({
    minIndependentCorrect: 8,
    minAccuracy: 0.8,
    minSessions: 2
  }),
  gradeMetadata: Object.freeze({
    competition: 'SOF IMO',
    classLevel: 4,
    section: 'Logical Reasoning',
    topic: 'Patterns',
    sourceCycle: '2025-26'
  })
});

/**
 * Coverage tracing for the Patterns target.
 * Traces target competency to the project-provided scope.
 */
export const PATTERNS_TARGET_COVERAGE = Object.freeze([
  Object.freeze({
    coverageId: 'repeating-pattern-continuation',
    description: 'Continue repeating patterns of various representations',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN
    ])
  }),
  Object.freeze({
    coverageId: 'missing-pattern-elements',
    description: 'Find missing elements in visual and repeating sequences',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
      PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM
    ])
  }),
  Object.freeze({
    coverageId: 'growing-and-additive-patterns',
    description: 'Recognize and continue patterns with additive constant changes',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN
    ])
  }),
  Object.freeze({
    coverageId: 'alternating-and-multi-rule-patterns',
    description: 'Identify patterns with alternating or composite rules',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE
    ])
  }),
  Object.freeze({
    coverageId: 'incorrect-term-detection',
    description: 'Detect incorrect terms violating the pattern rule',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM
    ])
  }),
  Object.freeze({
    coverageId: 'mixed-olympiad-pattern-reasoning',
    description: 'Solve mixed reasoning questions in olympiad style',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING
    ])
  })
]);
