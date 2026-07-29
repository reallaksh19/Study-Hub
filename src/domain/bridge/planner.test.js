import assert from 'assert';
import { generateBridgePlan } from './planner.js';

export function runTests() {
  console.log('Running planner domain tests...');

  const skillLibrary = [
    { id: 'S1', prerequisites: [] },
    { id: 'S2', prerequisites: ['S1'] },
    { id: 'S3', prerequisites: ['S1'] },
    { id: 'S4', prerequisites: ['S2', 'S3'] }
  ];

  const target = {
    id: 'target-1',
    name: 'Target 1',
    requiredSkills: ['S4']
  };

  const capacityProfile = {
    shortInstructions: true,
    maxVisibleSequenceLength: 3
  };

  // --- Test 1: Long bridge (All Unknown) ---
  // S1, S2, S3, S4 all Unknown → 4 probes + 1 readiness-check for S4
  const evidenceUnknown = { skills: { S1: 'Unknown', S2: 'Unknown', S3: 'Unknown', S4: 'Unknown' } };
  const planLong = generateBridgePlan(target, skillLibrary, evidenceUnknown, capacityProfile);

  assert.strictEqual(planLong.targetId, 'target-1');
  assert.strictEqual(planLong.units.length, 5, 'Long bridge: expected 5 units');

  assert.strictEqual(planLong.units[0].skillId, 'S1');
  assert.strictEqual(planLong.units[0].type, 'probe');
  assert.deepStrictEqual(planLong.units[0].supportProfile, capacityProfile);

  assert.strictEqual(planLong.units[1].skillId, 'S2');
  assert.strictEqual(planLong.units[1].type, 'probe');
  assert.strictEqual(planLong.units[2].skillId, 'S3');
  assert.strictEqual(planLong.units[2].type, 'probe');
  assert.strictEqual(planLong.units[3].skillId, 'S4');
  assert.strictEqual(planLong.units[3].type, 'probe');
  assert.strictEqual(planLong.units[4].type, 'readiness-check');
  assert.strictEqual(planLong.units[4].skillId, 'S4');

  // --- Test 2: Short bridge (All prerequisites Secure, target Not ready) ---
  // Only S4 → instruction + readiness-check
  const evidenceSecure = { skills: { S1: 'Secure', S2: 'Secure', S3: 'Secure', S4: 'Not ready' } };
  const planShort = generateBridgePlan(target, skillLibrary, evidenceSecure, capacityProfile);

  assert.strictEqual(planShort.units.length, 2, 'Short bridge: expected 2 units');
  assert.strictEqual(planShort.units[0].skillId, 'S4');
  assert.strictEqual(planShort.units[0].type, 'instruction');
  assert.strictEqual(planShort.units[1].skillId, 'S4');
  assert.strictEqual(planShort.units[1].type, 'readiness-check');

  // --- Test 3: Zero-unit bridge (everything Secure) ---
  const evidenceAllSecure = { skills: { S1: 'Secure', S2: 'Secure', S3: 'Secure', S4: 'Secure' } };
  const planZero = generateBridgePlan(target, skillLibrary, evidenceAllSecure, capacityProfile);

  assert.strictEqual(planZero.units.length, 0, 'Zero bridge: expected 0 units');

  // --- Test 4: Mixed evidence (Secure, Independent, Supported, Not ready) ---
  // S1 Secure → omit
  // S2 Independent (prerequisite) → omit
  // S3 Supported (prerequisite) → practice
  // S4 Not ready (target) → instruction + readiness-check
  const evidenceMixed = { skills: { S1: 'Secure', S2: 'Independent', S3: 'Supported', S4: 'Not ready' } };
  const planMixed = generateBridgePlan(target, skillLibrary, evidenceMixed, capacityProfile);

  assert.strictEqual(planMixed.units.length, 3, 'Mixed bridge: expected 3 units');
  assert.strictEqual(planMixed.units[0].skillId, 'S3');
  assert.strictEqual(planMixed.units[0].type, 'practice');
  assert.strictEqual(planMixed.units[1].skillId, 'S4');
  assert.strictEqual(planMixed.units[1].type, 'instruction');
  assert.strictEqual(planMixed.units[2].skillId, 'S4');
  assert.strictEqual(planMixed.units[2].type, 'readiness-check');

  // --- Test 5: Determinism — identical inputs produce deeply equal outputs ---
  const planMixed2 = generateBridgePlan(target, skillLibrary, evidenceMixed, capacityProfile);
  assert.deepStrictEqual(planMixed, planMixed2, 'Determinism: identical inputs must produce deeply equal outputs');

  // --- Test 6: Grade/curriculum metadata on target does not affect output ---
  // Extra fields on the target object must be ignored by the planner.
  const targetWithGrade = { ...target, gradeMetadata: 'Grade 4', curriculumRef: 'IMO-2024' };
  const planWithGrade = generateBridgePlan(targetWithGrade, skillLibrary, evidenceMixed, capacityProfile);
  assert.deepStrictEqual(planMixed, planWithGrade, 'Grade invariant: grade metadata must not alter planner output');

  // --- Test 7: Unknown evidence (absent from map) treated as Unknown, not failure ---
  // A learner with no evidence on record should receive probes, not instruction.
  const evidenceEmpty = { skills: {} };
  const planEmpty = generateBridgePlan(target, skillLibrary, evidenceEmpty, capacityProfile);
  const probeUnits = planEmpty.units.filter(u => u.type === 'probe');
  assert.strictEqual(probeUnits.length, 4, 'Unknown-as-absent: all 4 skills should become probes');

  // --- Test 8: Inputs are not mutated ---
  const evidenceSnapshot = JSON.stringify(evidenceMixed);
  const librarySnapshot = JSON.stringify(skillLibrary);
  const targetSnapshot = JSON.stringify(target);
  const profileSnapshot = JSON.stringify(capacityProfile);
  generateBridgePlan(target, skillLibrary, evidenceMixed, capacityProfile);
  assert.strictEqual(JSON.stringify(evidenceMixed), evidenceSnapshot, 'Evidence must not be mutated');
  assert.strictEqual(JSON.stringify(skillLibrary), librarySnapshot, 'Skill library must not be mutated');
  assert.strictEqual(JSON.stringify(target), targetSnapshot, 'Target must not be mutated');
  assert.strictEqual(JSON.stringify(capacityProfile), profileSnapshot, 'CapacityProfile must not be mutated');

  // --- Test 9: Missing prerequisite IN the resolved subgraph throws ---
  // The library itself is fine but a target skill references a skill not in the library.
  const brokenLibrary = [
    { id: 'S1', prerequisites: [] },
    { id: 'S4', prerequisites: ['MISSING_PREREQ'] } // S4 depends on something absent
  ];
  assert.throws(
    () => generateBridgePlan(target, brokenLibrary, evidenceEmpty, capacityProfile),
    /missing/i,
    'Missing prereq in resolved subgraph must throw'
  );

  // --- Test 10: Unreferenced invalid skills in library are NOT rejected ---
  // Skills outside the resolved subgraph must not cause planner failure.
  const libraryWithDangling = [
    ...skillLibrary,
    { id: 'ORPHAN', prerequisites: ['NONEXISTENT'] } // invalid but unreferenced
  ];
  assert.doesNotThrow(
    () => generateBridgePlan(target, libraryWithDangling, evidenceAllSecure, capacityProfile),
    'Unreferenced invalid skills in library must not cause planner to throw'
  );

  console.log('planner domain tests passed!');
}

runTests();
