import assert from 'assert';
import { validateSkillGraph, resolveTransitivePrerequisites, topologicalSort } from './skills.js';

export function runTests() {
  console.log('Running skills domain tests...');

  // 1. validateSkillGraph
  const validGraph = [
    { id: 'A', prerequisites: [] },
    { id: 'B', prerequisites: ['A'] },
    { id: 'C', prerequisites: ['B'] }
  ];
  assert.doesNotThrow(() => validateSkillGraph(validGraph), 'Valid graph should not throw');

  const missingRefGraph = [
    { id: 'A', prerequisites: ['X'] }
  ];
  assert.throws(() => validateSkillGraph(missingRefGraph), /Missing prerequisite reference/, 'Missing ref should throw');

  const cycleGraph = [
    { id: 'A', prerequisites: ['B'] },
    { id: 'B', prerequisites: ['C'] },
    { id: 'C', prerequisites: ['A'] }
  ];
  assert.throws(() => validateSkillGraph(cycleGraph), /Cycle detected/, 'Cycle should throw');

  // 2. resolveTransitivePrerequisites
  const library = [
    { id: 'S1', prerequisites: [] },
    { id: 'S2', prerequisites: ['S1'] },
    { id: 'S3', prerequisites: ['S1'] },
    { id: 'S4', prerequisites: ['S2', 'S3'] },
    { id: 'S5', prerequisites: [] } // Unrelated
  ];
  const resolved = resolveTransitivePrerequisites(['S4'], library);
  assert.strictEqual(resolved.length, 4, 'Should resolve exactly 4 skills');
  assert.ok(resolved.find(s => s.id === 'S1'), 'Should include S1');
  assert.ok(resolved.find(s => s.id === 'S2'), 'Should include S2');
  assert.ok(resolved.find(s => s.id === 'S3'), 'Should include S3');
  assert.ok(resolved.find(s => s.id === 'S4'), 'Should include S4');
  assert.ok(!resolved.find(s => s.id === 'S5'), 'Should NOT include unrelated S5');

  // 3. topologicalSort
  // Expected order for resolving S4: S1, then S2 & S3 (S2 before S3 alphabetically), then S4
  const sorted = topologicalSort(resolved);
  assert.strictEqual(sorted[0].id, 'S1');
  assert.strictEqual(sorted[1].id, 'S2');
  assert.strictEqual(sorted[2].id, 'S3');
  assert.strictEqual(sorted[3].id, 'S4');

  // Test deterministic alphabetical sort when no dependencies
  const disjoint = [
    { id: 'Z', prerequisites: [] },
    { id: 'M', prerequisites: [] },
    { id: 'A', prerequisites: [] }
  ];
  const sortedDisjoint = topologicalSort(disjoint);
  assert.strictEqual(sortedDisjoint[0].id, 'A');
  assert.strictEqual(sortedDisjoint[1].id, 'M');
  assert.strictEqual(sortedDisjoint[2].id, 'Z');

  // 4. Cycle regression: a cycle that is reachable through an already-visited
  //    subtree must still be detected (DFS must check recursionStack before visited).
  const sharedNodeCycle = [
    { id: 'root', prerequisites: ['shared'] },
    { id: 'shared', prerequisites: ['leaf'] },
    { id: 'leaf', prerequisites: [] },
    { id: 'entry', prerequisites: ['shared', 'cycleA'] },
    { id: 'cycleA', prerequisites: ['cycleB'] },
    { id: 'cycleB', prerequisites: ['cycleA'] }
  ];
  // 'shared' and 'leaf' are visited first (reachable from 'root'),
  // then 'entry' tries to visit 'shared' (already visited — skip) and 'cycleA'.
  // The cycle between cycleA ↔ cycleB must still be caught.
  assert.throws(() => validateSkillGraph(sharedNodeCycle), /Cycle detected/, 'DFS regression: cycle reachable via fresh path must be detected');

  console.log('skills domain tests passed!');
}

runTests();
