import assert from 'node:assert/strict';
import { generateBridgePlan } from './bridgePlanner.js';

const skillLibrary = [
  skill('observe'),
  skill('repeat', ['observe']),
  skill('unit', ['repeat']),
  skill('continue', ['unit'])
];
const target = targetDefinition();
const capacityProfile = supportProfile();

const allSecure = evidence({
  observe: 'secure', repeat: 'secure', unit: 'secure', continue: 'secure'
});
const noBridge = generate(allSecure);
assert.equal(noBridge.units.length, 0);
assert.deepEqual(noBridge.omittedSecureSkillIds, ['continue', 'observe', 'repeat', 'unit']);

const minimal = generate(evidence({
  observe: 'secure', repeat: 'secure', unit: 'not_ready', continue: 'independent'
}));
assert.deepEqual(unitPairs(minimal), [
  ['unit', 'instruction'],
  ['continue', 'readiness_check']
]);

const extended = generate(evidence({
  observe: 'not_ready', repeat: 'supported', unit: 'not_ready', continue: 'independent'
}));
assert.deepEqual(unitPairs(extended), [
  ['observe', 'instruction'],
  ['repeat', 'practice'],
  ['unit', 'instruction'],
  ['continue', 'readiness_check']
]);

const unknown = generate(evidence({
  observe: 'secure', repeat: 'unknown', unit: 'unknown', continue: 'independent'
}));
assert.deepEqual(unitPairs(unknown), [
  ['repeat', 'probe'],
  ['unit', 'probe']
]);
assert.equal(unknown.summary.instructionCount, 0);

const capacityOnly = generate(evidence({
  observe: 'independent', repeat: 'independent', unit: 'independent', continue: 'independent'
}));
assert.equal(capacityOnly.units.length, 0);
assert.deepEqual(capacityOnly.supportProfile, capacityProfile);

const withMetadata = generateBridgePlan({
  target: { ...target, curriculumMetadata: { grade: 4, board: 'IMO' } },
  skillLibrary,
  learnerEvidence: extendedEvidence(),
  capacityProfile
});
const withoutMetadata = generateBridgePlan({
  target: { ...target, curriculumMetadata: undefined },
  skillLibrary,
  learnerEvidence: extendedEvidence(),
  capacityProfile
});
assert.deepEqual(withMetadata, withoutMetadata);

assert.deepEqual(generate(extendedEvidence()), generate(extendedEvidence()));
assertInputsRemainUnchanged();
assert.doesNotMatch(generate(allSecure).title, /grade|class|\b[1-9]0?\b/i);
assert.doesNotMatch(generate(allSecure).id, /grade|class/i);

console.log('bridgePlanner tests passed');

function generate(learnerEvidence) {
  return generateBridgePlan({ target, skillLibrary, learnerEvidence, capacityProfile });
}

function skill(id, prerequisiteSkillIds = []) {
  return { id, title: id, prerequisiteSkillIds, tags: ['patterns'] };
}

function targetDefinition() {
  return {
    id: 'imo-class-4-patterns',
    title: 'IMO Class 4 Patterns',
    requiredTargetSkillIds: ['continue'],
    readinessCriteria: { minIndependentCorrect: 4, minAccuracy: 0.8, minSessions: 2 }
  };
}

function supportProfile() {
  return {
    instructionLength: 'short',
    maxVisibleItems: 4,
    answerChoiceLoad: 3,
    hintAvailability: 'available',
    preferredRepresentation: 'visual',
    recommendedSessionSize: 4
  };
}

function evidence(states) {
  const skills = {};
  Object.entries(states).forEach(([id, state]) => {
    skills[id] = { state, attemptCount: state === 'unknown' ? 0 : 3, independentCorrect: 2 };
  });
  return { skills };
}

function extendedEvidence() {
  return evidence({
    observe: 'not_ready', repeat: 'supported', unit: 'not_ready', continue: 'independent'
  });
}

function unitPairs(plan) {
  return plan.units.map((unit) => [unit.skillId, unit.unitType]);
}

function assertInputsRemainUnchanged() {
  const learnerEvidence = extendedEvidence();
  const snapshots = [target, skillLibrary, learnerEvidence, capacityProfile].map((value) => JSON.stringify(value));
  generateBridgePlan({ target, skillLibrary, learnerEvidence, capacityProfile });
  [target, skillLibrary, learnerEvidence, capacityProfile].forEach((value, index) => {
    assert.equal(JSON.stringify(value), snapshots[index]);
  });
}
