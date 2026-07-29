import { EVIDENCE_STATES, SUPPORT_KEYS } from './bridgeModel.js';

const SUPPORT_ENUMS = Object.freeze({
  instructionLength: ['short', 'standard'],
  hintAvailability: ['available', 'on_request', 'disabled'],
  preferredRepresentation: ['visual', 'numeric', 'verbal', 'mixed']
});

export function validateBridgeInput({ target, skillLibrary, learnerEvidence, capacityProfile }) {
  const skillMap = validateSkillLibrary(skillLibrary);
  validateTargetDefinition(target, skillMap);
  validateLearnerEvidence(learnerEvidence);
  validateCapacityProfile(capacityProfile);
  return skillMap;
}

export function validateSkillLibrary(skillLibrary) {
  assertArray(skillLibrary, 'skillLibrary');
  const skillMap = new Map();

  skillLibrary.forEach((skill, index) => {
    validateSkillDefinition(skill, index);
    if (skillMap.has(skill.id)) fail('duplicate_skill_id', skill.id);
    skillMap.set(skill.id, skill);
  });

  validatePrerequisiteReferences(skillMap);
  validateAcyclicGraph(skillMap);
  return skillMap;
}

export function validateTargetDefinition(target, skillMap) {
  assertObject(target, 'target');
  assertText(target.id, 'target.id');
  assertText(target.title, 'target.title');
  assertStringArray(target.requiredTargetSkillIds, 'target.requiredTargetSkillIds', true);
  validateReadinessCriteria(target.readinessCriteria, 'target.readinessCriteria');

  target.requiredTargetSkillIds.forEach((skillId) => {
    if (!skillMap.has(skillId)) fail('missing_target_skill', skillId);
  });
}

export function validateLearnerEvidence(learnerEvidence) {
  assertObject(learnerEvidence, 'learnerEvidence');
  assertObject(learnerEvidence.skills, 'learnerEvidence.skills');

  Object.entries(learnerEvidence.skills).forEach(([skillId, evidence]) => {
    assertText(skillId, 'learnerEvidence skill id');
    validateEvidenceRecord(evidence, skillId);
  });
}

export function validateCapacityProfile(profile) {
  assertObject(profile, 'capacityProfile');
  Object.keys(profile).forEach((key) => {
    if (!SUPPORT_KEYS.includes(key)) fail('unknown_capacity_field', key);
  });

  validateEnum(profile.instructionLength, SUPPORT_ENUMS.instructionLength, 'instructionLength');
  validateInteger(profile.maxVisibleItems, 1, 50, 'maxVisibleItems');
  validateInteger(profile.answerChoiceLoad, 2, 8, 'answerChoiceLoad');
  validateEnum(profile.hintAvailability, SUPPORT_ENUMS.hintAvailability, 'hintAvailability');
  validateEnum(profile.preferredRepresentation, SUPPORT_ENUMS.preferredRepresentation, 'preferredRepresentation');
  validateInteger(profile.recommendedSessionSize, 1, 50, 'recommendedSessionSize');
}

function validateSkillDefinition(skill, index) {
  assertObject(skill, `skillLibrary[${index}]`);
  assertText(skill.id, `skillLibrary[${index}].id`);
  assertText(skill.title, `skillLibrary[${index}].title`);
  assertStringArray(skill.prerequisiteSkillIds, `${skill.id}.prerequisiteSkillIds`);
  if (skill.tags !== undefined) assertStringArray(skill.tags, `${skill.id}.tags`);
  if (skill.defaultSupport !== undefined) validatePartialSupport(skill.defaultSupport, skill.id);
}

function validateEvidenceRecord(evidence, skillId) {
  assertObject(evidence, `evidence:${skillId}`);
  validateEnum(evidence.state, EVIDENCE_STATES, `evidence:${skillId}.state`);
  validateNonNegativeInteger(evidence.attemptCount, `evidence:${skillId}.attemptCount`);
  if (evidence.independentCorrect !== undefined) {
    validateNonNegativeInteger(evidence.independentCorrect, `evidence:${skillId}.independentCorrect`);
  }
  if (evidence.lastObservedAt !== undefined && Number.isNaN(Date.parse(evidence.lastObservedAt))) {
    fail('invalid_recency', skillId);
  }
}

function validatePrerequisiteReferences(skillMap) {
  skillMap.forEach((skill) => {
    skill.prerequisiteSkillIds.forEach((prerequisiteId) => {
      if (!skillMap.has(prerequisiteId)) {
        fail('missing_prerequisite', `${skill.id}->${prerequisiteId}`);
      }
    });
  });
}

function validateAcyclicGraph(skillMap) {
  const visited = new Set();
  const active = new Set();
  const orderedIds = [...skillMap.keys()].sort();
  orderedIds.forEach((skillId) => visitSkill(skillId, skillMap, visited, active));
}

function visitSkill(skillId, skillMap, visited, active) {
  if (active.has(skillId)) fail('cycle', skillId);
  if (visited.has(skillId)) return;

  active.add(skillId);
  [...skillMap.get(skillId).prerequisiteSkillIds]
    .sort()
    .forEach((id) => visitSkill(id, skillMap, visited, active));
  active.delete(skillId);
  visited.add(skillId);
}

function validateReadinessCriteria(criteria, path) {
  assertObject(criteria, path);
  validateInteger(criteria.minIndependentCorrect, 1, 100, `${path}.minIndependentCorrect`);
  validateNumber(criteria.minAccuracy, 0, 1, `${path}.minAccuracy`);
  validateInteger(criteria.minSessions, 1, 100, `${path}.minSessions`);
}

function validatePartialSupport(support, skillId) {
  assertObject(support, `${skillId}.defaultSupport`);
  const probe = {
    instructionLength: support.instructionLength ?? 'standard',
    maxVisibleItems: support.maxVisibleItems ?? 6,
    answerChoiceLoad: support.answerChoiceLoad ?? 4,
    hintAvailability: support.hintAvailability ?? 'on_request',
    preferredRepresentation: support.preferredRepresentation ?? 'mixed',
    recommendedSessionSize: support.recommendedSessionSize ?? 5
  };
  validateCapacityProfile(probe);
}

function validateEnum(value, allowed, path) {
  if (!allowed.includes(value)) fail('invalid_enum', `${path}:${String(value)}`);
}

function validateInteger(value, minimum, maximum, path) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    fail('invalid_integer', path);
  }
}

function validateNonNegativeInteger(value, path) {
  if (!Number.isInteger(value) || value < 0) fail('invalid_integer', path);
}

function validateNumber(value, minimum, maximum, path) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    fail('invalid_number', path);
  }
}

function assertObject(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid_object', path);
}

function assertArray(value, path) {
  if (!Array.isArray(value)) fail('invalid_array', path);
}

function assertStringArray(value, path, requireValue = false) {
  assertArray(value, path);
  if (requireValue && value.length === 0) fail('empty_array', path);
  value.forEach((item) => assertText(item, path));
}

function assertText(value, path) {
  if (typeof value !== 'string' || value.trim() === '') fail('invalid_text', path);
}

function fail(code, detail) {
  throw new Error(`BRIDGE_VALIDATION:${code}:${detail}`);
}
