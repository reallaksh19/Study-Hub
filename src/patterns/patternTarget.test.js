import assert from 'assert';
import { IMO_CLASS_4_PATTERNS_TARGET, PATTERNS_TARGET_COVERAGE } from './patternTarget.js';
import { PATTERN_SKILLS, PATTERN_SKILL_IDS } from './patternSkillCatalog.js';
import { resolveTransitivePrerequisites, topologicalSort } from '../domain/bridge/skills.js';
import { generateBridgePlan } from '../domain/bridge/planner.js';

export function runTests() {
  console.log('Running patternTarget tests...');

  // 1. Target validation passes against PATTERN_SKILLS
  // We resolve the subgraph and check length to ensure all skills are valid
  let resolved;
  assert.doesNotThrow(() => {
    resolved = resolveTransitivePrerequisites(IMO_CLASS_4_PATTERNS_TARGET.requiredSkills, PATTERN_SKILLS);
  }, 'Target validation must pass against PATTERN_SKILLS');

  // 2. Required target IDs exactly match the locked seven IDs and order
  const expectedTargetIds = [
    'patterns.continue_repeating_pattern',
    'patterns.find_missing_repeating_element',
    'patterns.continue_additive_number_pattern',
    'patterns.identify_alternating_rule',
    'patterns.find_missing_pattern_term',
    'patterns.detect_incorrect_pattern_term',
    'patterns.solve_mixed_pattern_reasoning'
  ];
  assert.deepStrictEqual(IMO_CLASS_4_PATTERNS_TARGET.requiredSkills, expectedTargetIds, 'Required target IDs must match exactly');

  // 3. Readiness criteria exactly equal 8, 0.8, and 2
  assert.strictEqual(IMO_CLASS_4_PATTERNS_TARGET.readinessCriteria.minIndependentCorrect, 8);
  assert.strictEqual(IMO_CLASS_4_PATTERNS_TARGET.readinessCriteria.minAccuracy, 0.8);
  assert.strictEqual(IMO_CLASS_4_PATTERNS_TARGET.readinessCriteria.minSessions, 2);

  // 4. Target and nested structures are frozen
  assert.ok(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET), 'Target must be frozen');
  assert.ok(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET.requiredSkills), 'Target required skills must be frozen');
  assert.ok(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET.readinessCriteria), 'Target readiness criteria must be frozen');
  assert.ok(Object.isFrozen(IMO_CLASS_4_PATTERNS_TARGET.gradeMetadata), 'Target metadata must be frozen');

  // 5. Transitive closure of required skills contains all 13 catalog skills
  assert.strictEqual(resolved.length, 13, 'Transitive closure must contain all 13 skills');

  // 6. Topological order exactly matches the locked catalog order
  const sorted = topologicalSort(resolved);
  const expectedCatalogOrder = PATTERN_SKILLS.map(s => s.id);
  assert.deepStrictEqual(sorted.map(s => s.id), expectedCatalogOrder, 'Topological order must match catalog order');

  // 7. All six coverage records exist in exact order
  const expectedCoverageIds = [
    'repeating-pattern-continuation',
    'missing-pattern-elements',
    'growing-and-additive-patterns',
    'alternating-and-multi-rule-patterns',
    'incorrect-term-detection',
    'mixed-olympiad-pattern-reasoning'
  ];
  assert.deepStrictEqual(PATTERNS_TARGET_COVERAGE.map(c => c.coverageId), expectedCoverageIds, 'Coverage records must match exactly');

  // 8. Coverage contains no unknown skill ID (only from requiredSkills)
  const targetSkillSet = new Set(IMO_CLASS_4_PATTERNS_TARGET.requiredSkills);
  PATTERNS_TARGET_COVERAGE.forEach(coverage => {
    coverage.skillIds.forEach(skillId => {
      assert.ok(targetSkillSet.has(skillId), `Coverage skill ${skillId} must be a required target skill`);
    });
  });

  // 9. Every target skill is covered at least once
  const coveredSkills = new Set();
  PATTERNS_TARGET_COVERAGE.forEach(coverage => {
    coverage.skillIds.forEach(id => coveredSkills.add(id));
  });
  IMO_CLASS_4_PATTERNS_TARGET.requiredSkills.forEach(id => {
    assert.ok(coveredSkills.has(id), `Target skill ${id} must be covered at least once`);
  });

  // 10. Curriculum metadata changes do not change generated bridge
  const capacityProfile = { shortInstructions: true, maxVisibleSequenceLength: 5 };
  const learnerEvidence = {
    skills: {
      [PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER]: 'Secure',
      [PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES]: 'Independent',
      [PATTERN_SKILL_IDS.RECOGNIZE_REPETITION]: 'Supported',
      [PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT]: 'Not ready'
      // Rest are Unknown
    }
  };

  const planOriginal = generateBridgePlan(IMO_CLASS_4_PATTERNS_TARGET, PATTERN_SKILLS, learnerEvidence, capacityProfile);

  const modifiedTarget = {
    ...IMO_CLASS_4_PATTERNS_TARGET,
    gradeMetadata: { competition: 'Different', classLevel: 8 }
  };
  const planModified = generateBridgePlan(modifiedTarget, PATTERN_SKILLS, learnerEvidence, capacityProfile);
  
  assert.deepStrictEqual(planModified, planOriginal, 'Metadata changes must not alter the generated bridge plan');

  // 11. Generated bridge identity remains grade-neutral
  const planJson = JSON.stringify(planOriginal);
  const gradeRegex = /grade[ -]?[0-9]|class[ -]?[0-9]|remedial|beginner|weak learner/i;
  assert.ok(!gradeRegex.test(planJson), 'Bridge plan must be completely grade-neutral');

  // 12. No production export contains question content or diagnostic behavior
  PATTERNS_TARGET_COVERAGE.forEach(coverage => {
    assert.ok(typeof coverage.description === 'string' && coverage.description.length > 0, 'Coverage description must be a string');
    const contentRegex = /question|answer|diagnostic|quiz/i;
    assert.ok(!contentRegex.test(coverage.description), 'Coverage description must not contain question/diagnostic content');
  });

  console.log('patternTarget tests passed!');
}

runTests();
