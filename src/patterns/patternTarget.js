import { PATTERN_SKILL_IDS } from './patternSkillCatalog.js';

const REQUIRED_TARGET_SKILL_IDS = Object.freeze([
  PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
  PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
  PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
  PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
  PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
  PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM,
  PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING
]);

const READINESS_CRITERIA = Object.freeze({
  minIndependentCorrect: 8,
  minAccuracy: 0.8,
  minSessions: 2
});

const CURRICULUM_METADATA = Object.freeze({
  competition: 'SOF IMO',
  classLevel: 4,
  section: 'Logical Reasoning',
  topic: 'Patterns',
  sourceCycle: '2025-26'
});

export const IMO_CLASS_4_PATTERNS_TARGET = Object.freeze({
  id: 'target.imo_class_4.patterns',
  title: 'IMO Class 4 — Patterns',
  requiredTargetSkillIds: REQUIRED_TARGET_SKILL_IDS,
  readinessCriteria: READINESS_CRITERIA,
  curriculumMetadata: CURRICULUM_METADATA
});

export const PATTERNS_TARGET_COVERAGE = Object.freeze([
  Object.freeze({
    coverageId: 'repeating-pattern-continuation',
    description: 'Continue repeating structures from an identified unit.',
    skillIds: Object.freeze([PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN])
  }),
  Object.freeze({
    coverageId: 'missing-pattern-elements',
    description: 'Resolve missing elements in repeating and combined structures.',
    skillIds: Object.freeze([
      PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
      PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM
    ])
  }),
  Object.freeze({
    coverageId: 'growing-and-additive-patterns',
    description: 'Continue growing number structures with a constant additive change.',
    skillIds: Object.freeze([PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN])
  }),
  Object.freeze({
    coverageId: 'alternating-and-multi-rule-patterns',
    description: 'Identify alternating structure across more than one rule stream.',
    skillIds: Object.freeze([PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE])
  }),
  Object.freeze({
    coverageId: 'incorrect-term-detection',
    description: 'Detect a term that breaks the established pattern structure.',
    skillIds: Object.freeze([PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM])
  }),
  Object.freeze({
    coverageId: 'mixed-olympiad-pattern-reasoning',
    description: 'Combine pattern relationships to solve mixed logical reasoning tasks.',
    skillIds: Object.freeze([PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING])
  })
]);
