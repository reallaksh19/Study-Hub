import assert from 'assert';
import { PATTERN_SKILL_IDS, PATTERN_SKILLS, getPatternSkillById } from './patternSkillCatalog.js';
import { validateSkillGraph } from '../domain/bridge/skills.js';

export function runTests() {
  console.log('Running patternSkillCatalog tests...');

  // 1. Exactly 13 IDs and 13 skills exist
  const idKeys = Object.keys(PATTERN_SKILL_IDS);
  assert.strictEqual(idKeys.length, 13, 'Expected exactly 13 skill IDs');
  assert.strictEqual(PATTERN_SKILLS.length, 13, 'Expected exactly 13 skills in catalog');

  // 2. Exact locked ID order is preserved
  const expectedOrder = [
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
  const actualIds = PATTERN_SKILLS.map(s => s.id);
  assert.deepStrictEqual(actualIds, expectedOrder, 'Skill IDs must match exactly the locked order');

  // 3. Every skill has exact locked prerequisites
  const expectedPrereqs = {
    'patterns.observe_sequence_order': [],
    'patterns.compare_pattern_attributes': ['patterns.observe_sequence_order'],
    'patterns.recognize_repetition': ['patterns.observe_sequence_order', 'patterns.compare_pattern_attributes'],
    'patterns.identify_repeating_unit': ['patterns.recognize_repetition'],
    'patterns.continue_repeating_pattern': ['patterns.identify_repeating_unit'],
    'patterns.find_missing_repeating_element': ['patterns.continue_repeating_pattern'],
    'patterns.recognize_growing_pattern': ['patterns.observe_sequence_order', 'patterns.compare_pattern_attributes'],
    'patterns.describe_constant_change': ['patterns.recognize_growing_pattern'],
    'patterns.continue_additive_number_pattern': ['patterns.describe_constant_change'],
    'patterns.identify_alternating_rule': ['patterns.continue_repeating_pattern', 'patterns.continue_additive_number_pattern'],
    'patterns.find_missing_pattern_term': ['patterns.find_missing_repeating_element', 'patterns.continue_additive_number_pattern', 'patterns.identify_alternating_rule'],
    'patterns.detect_incorrect_pattern_term': ['patterns.find_missing_pattern_term'],
    'patterns.solve_mixed_pattern_reasoning': ['patterns.identify_alternating_rule', 'patterns.find_missing_pattern_term', 'patterns.detect_incorrect_pattern_term']
  };
  PATTERN_SKILLS.forEach(skill => {
    assert.deepStrictEqual(skill.prerequisites, expectedPrereqs[skill.id], `Prerequisites mismatch for ${skill.id}`);
  });

  // 4. Graph validation passes
  assert.doesNotThrow(() => validateSkillGraph(PATTERN_SKILLS), 'Catalog graph validation must pass');

  // 5. Duplicate IDs do not exist
  const uniqueIds = new Set(actualIds);
  assert.strictEqual(uniqueIds.size, PATTERN_SKILLS.length, 'No duplicate IDs permitted');

  // 6. Every prerequisite resolves to a catalog skill
  const allIds = new Set(Object.values(PATTERN_SKILL_IDS));
  PATTERN_SKILLS.forEach(skill => {
    skill.prerequisites.forEach(prereq => {
      assert.ok(allIds.has(prereq), `Prerequisite ${prereq} must exist in the catalog`);
    });
  });

  // 7. Graph is acyclic
  // (Tested indirectly by 4, validateSkillGraph detects cycles)
  
  // 8. Every title and ID is grade-neutral
  PATTERN_SKILLS.forEach(skill => {
    const gradeRegex = /grade[ -]?[0-9]|class[ -]?[0-9]|remedial|beginner|weak learner/i;
    assert.ok(!gradeRegex.test(skill.id), `ID ${skill.id} must be grade-neutral`);
    assert.ok(!gradeRegex.test(skill.title), `Title "${skill.title}" must be grade-neutral`);
  });

  // 9. Every skill and nested array is frozen
  assert.ok(Object.isFrozen(PATTERN_SKILLS), 'PATTERN_SKILLS must be frozen');
  PATTERN_SKILLS.forEach(skill => {
    assert.ok(Object.isFrozen(skill), `Skill ${skill.id} must be frozen`);
    assert.ok(Object.isFrozen(skill.prerequisites), `Skill ${skill.id} prerequisites must be frozen`);
    if (skill.tags) {
      assert.ok(Object.isFrozen(skill.tags), `Skill ${skill.id} tags must be frozen`);
    }
  });

  // 10. Exact lookup returns canonical object, unknown returns null
  const firstSkill = PATTERN_SKILLS[0];
  assert.strictEqual(getPatternSkillById(firstSkill.id), firstSkill, 'Lookup must return canonical reference');
  assert.strictEqual(getPatternSkillById('unknown.skill'), null, 'Unknown lookup must return null');

  console.log('patternSkillCatalog tests passed!');
}

runTests();
