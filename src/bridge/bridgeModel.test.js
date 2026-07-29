import assert from 'node:assert/strict';
import {
  createPlanIdentity,
  createPlanSummary,
  selectSupportProfile
} from './bridgeModel.js';
import {
  validateBridgeInput,
  validateSkillLibrary
} from './bridgeValidation.js';

const capacityProfile = {
  instructionLength: 'short',
  maxVisibleItems: 4,
  answerChoiceLoad: 3,
  hintAvailability: 'available',
  preferredRepresentation: 'visual',
  recommendedSessionSize: 4
};

const readinessCriteria = {
  minIndependentCorrect: 4,
  minAccuracy: 0.8,
  minSessions: 2
};

const skills = [
  skill('patterns.observe'),
  skill('patterns.repeat', ['patterns.observe'])
];

assert.deepEqual(createPlanIdentity('target-a'), createPlanIdentity('target-a'));
assert.equal(createPlanIdentity('target-grade-10').title, 'Learner bridge plan');
assert.doesNotMatch(createPlanIdentity('target-grade-10').id, /grade|class|10/i);

const summary = createPlanSummary([
  { unitType: 'probe' },
  { unitType: 'instruction' },
  { unitType: 'practice' },
  { unitType: 'readiness_check' }
]);
assert.deepEqual(summary, {
  probeCount: 1,
  instructionCount: 1,
  practiceCount: 1,
  readinessCheckCount: 1,
  totalUnits: 4
});

const selected = selectSupportProfile(capacityProfile, { maxVisibleItems: 9 });
assert.deepEqual(selected, capacityProfile);

assert.throws(
  () => validateSkillLibrary([skill('same'), skill('same')]),
  /duplicate_skill_id/
);
assert.throws(
  () => validateSkillLibrary([skill('broken', ['missing'])]),
  /missing_prerequisite/
);
assert.throws(
  () => validateSkillLibrary([skill('a', ['b']), skill('b', ['a'])]),
  /cycle/
);

const target = {
  id: 'imo-patterns-target',
  title: 'IMO Patterns',
  requiredTargetSkillIds: ['patterns.repeat'],
  readinessCriteria,
  curriculumMetadata: { grade: 4 }
};
const learnerEvidence = {
  skills: {
    'patterns.observe': { state: 'secure', attemptCount: 5, independentCorrect: 5 },
    'patterns.repeat': { state: 'unknown', attemptCount: 0 }
  }
};
assert.doesNotThrow(() => validateBridgeInput({ target, skillLibrary: skills, learnerEvidence, capacityProfile }));

assert.throws(
  () => validateBridgeInput({
    target,
    skillLibrary: skills,
    learnerEvidence: { skills: { 'patterns.repeat': { state: 'guess', attemptCount: 1 } } },
    capacityProfile
  }),
  /invalid_enum/
);

console.log('bridgeModel tests passed');

function skill(id, prerequisiteSkillIds = []) {
  return { id, title: id, prerequisiteSkillIds, tags: ['patterns'] };
}
