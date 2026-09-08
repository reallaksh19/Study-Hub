import assert from 'node:assert/strict';
import {
  validateSkillLibrary,
  validateTargetDefinition
} from '../bridge/bridgeValidation.js';
import {
  generateBridgePlan,
  resolveRequiredSkillIds,
  topologicallyOrder
} from '../bridge/bridgePlanner.js';
import { PATTERN_SKILLS } from './patternSkillCatalog.js';
import {
  IMO_CLASS_4_PATTERNS_TARGET,
  PATTERNS_TARGET_COVERAGE
} from './patternTarget.js';

const EXPECTED_TARGET_IDS = [
  'patterns.continue_repeating_pattern',
  'patterns.find_missing_repeating_element',
  'patterns.continue_additive_number_pattern',
  'patterns.identify_alternating_rule',
  'patterns.find_missing_pattern_term',
  'patterns.detect_incorrect_pattern_term',
  'patterns.solve_mixed_pattern_reasoning'
];

const EXPECTED_COVERAGE_IDS = [
  'repeating-pattern-continuation',
  'missing-pattern-elements',
  'growing-and-additive-patterns',
  'alternating-and-multi-rule-patterns',
  'incorrect-term-detection',
  'mixed-olympiad-pattern-reasoning'
];

const EXPECTED_EXECUTION_ORDER = [
  'patterns.observe_sequence_order',
  'patterns.compare_pattern_attributes',
  'patterns.recognize_growing_pattern',
  'patterns.describe_constant_change',
  'patterns.continue_additive_number_pattern',
  'patterns.recognize_repetition',
  'patterns.identify_repeating_unit',
  'patterns.continue_repeating_pattern',
  'patterns.find_missing_repeating_element',
  'patterns.identify_alternating_rule',
  'patterns.find_missing_pattern_term',
  'patterns.detect_incorrect_pattern_term',
  'patterns.solve_mixed_pattern_reasoning'
];

const skillMap = validateSkillLibrary(PATTERN_SKILLS);
assert.doesNotThrow(() => validateTargetDefinition(IMO_CLASS_4_PATTERNS_TARGET, skillMap));
assert.deepEqual(IMO_CLASS_4_PATTERNS_TARGET.requiredTargetSkillIds, EXPECTED_TARGET_IDS);
assert.deepEqual(IMO_CLASS_4_PATTERNS_TARGET.readinessCriteria, {
  minIndependentCorrect: 8,
  minAccuracy: 0.8,
  minSessions: 2
});

assert.equal(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET), true);
assert.equal(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET.requiredTargetSkillIds), true);
assert.equal(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET.readinessCriteria), true);
assert.equal(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET.curriculumMetadata), true);

const requiredIds = resolveRequiredSkillIds(
  IMO_CLASS_4_PATTERNS_TARGET.requiredTargetSkillIds,
  skillMap
);
assert.equal(requiredIds.size, 13);
assert.deepEqual(new Set(requiredIds), new Set(PATTERN_SKILLS.map((skill) => skill.id)));
assert.deepEqual(
  topologicallyOrder(requiredIds, skillMap).map((skill) => skill.id),
  EXPECTED_EXECUTION_ORDER
);

assert.equal(Object.isFrozen(PATTERNS_TARGET_COVERAGE), true);
assert.deepEqual(PATTERNS_TARGET_COVERAGE.map((record) => record.coverageId), EXPECTED_COVERAGE_IDS);
PATTERNS_TARGET_COVERAGE.forEach((record) => {
  assert.equal(Object.isFrozen(record), true);
  assert.equal(Object.isFrozen(record.skillIds), true);
  assert.ok(record.description.length > 0);
  record.skillIds.forEach((id) => assert.equal(EXPECTED_TARGET_IDS.includes(id), true));
});
assert.deepEqual(
  new Set(PATTERNS_TARGET_COVERAGE.flatMap((record) => record.skillIds)),
  new Set(EXPECTED_TARGET_IDS)
);

const capacityProfile = Object.freeze({
  instructionLength: 'short',
  maxVisibleItems: 4,
  answerChoiceLoad: 4,
  hintAvailability: 'available',
  preferredRepresentation: 'visual',
  recommendedSessionSize: 4
});
const learnerEvidence = mixedEvidence();
const baselinePlan = generateBridgePlan({
  target: IMO_CLASS_4_PATTERNS_TARGET,
  skillLibrary: PATTERN_SKILLS,
  learnerEvidence,
  capacityProfile
});
const metadataVariant = {
  ...IMO_CLASS_4_PATTERNS_TARGET,
  curriculumMetadata: {
    competition: 'Alternate reporting label',
    classLevel: 9,
    section: 'Different reporting section',
    topic: 'Patterns',
    sourceCycle: 'future-cycle'
  }
};
const variantPlan = generateBridgePlan({
  target: metadataVariant,
  skillLibrary: PATTERN_SKILLS,
  learnerEvidence,
  capacityProfile
});

['units', 'omittedSecureSkillIds', 'summary', 'supportProfile', 'id', 'title'].forEach((key) => {
  assert.deepEqual(variantPlan[key], baselinePlan[key]);
});
assert.doesNotMatch(baselinePlan.id, /grade|class/i);
assert.doesNotMatch(baselinePlan.title, /grade|class/i);

const productionData = JSON.stringify({
  skills: PATTERN_SKILLS,
  target: IMO_CLASS_4_PATTERNS_TARGET,
  coverage: PATTERNS_TARGET_COVERAGE
});
assert.doesNotMatch(productionData, /question|answer|diagnostic|quiz/i);

console.log('patternTarget tests passed');

function mixedEvidence() {
  return {
    skills: {
      'patterns.observe_sequence_order': record('secure', 8, 8),
      'patterns.compare_pattern_attributes': record('independent', 6, 5),
      'patterns.recognize_repetition': record('supported', 5, 2),
      'patterns.identify_repeating_unit': record('not_ready', 4, 1),
      'patterns.continue_repeating_pattern': record('independent', 7, 6),
      'patterns.recognize_growing_pattern': record('secure', 9, 9),
      'patterns.describe_constant_change': record('supported', 5, 3),
      'patterns.continue_additive_number_pattern': record('not_ready', 4, 1),
      'patterns.identify_alternating_rule': record('independent', 6, 5),
      'patterns.detect_incorrect_pattern_term': record('supported', 5, 3),
      'patterns.solve_mixed_pattern_reasoning': record('secure', 8, 8)
    }
  };
}

function record(state, attemptCount, independentCorrect) {
  return { state, attemptCount, independentCorrect };
}
