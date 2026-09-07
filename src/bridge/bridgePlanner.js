import {
  DEFAULT_EXIT_CRITERIA,
  REASON_CODES,
  createPlanIdentity,
  createPlanSummary,
  selectSupportProfile
} from './bridgeModel.js';
import { validateBridgeInput } from './bridgeValidation.js';

export function generateBridgePlan({ target, skillLibrary, learnerEvidence, capacityProfile }) {
  const skillMap = validateBridgeInput({ target, skillLibrary, learnerEvidence, capacityProfile });
  const requiredIds = resolveRequiredSkillIds(target.requiredTargetSkillIds, skillMap);
  const orderedSkills = topologicallyOrder(requiredIds, skillMap);
  const selectedSupport = selectSupportProfile(capacityProfile);
  const omittedSecureSkillIds = [];
  const bridgeUnits = [];

  orderedSkills.forEach((skill) => {
    const evidence = evidenceFor(skill.id, learnerEvidence);
    if (evidence.state === 'secure') omittedSecureSkillIds.push(skill.id);
    const unit = createBridgeUnit(skill, evidence, capacityProfile);
    if (unit) bridgeUnits.push(unit);
  });

  const units = appendReadinessChecks(bridgeUnits, target, capacityProfile, skillMap);
  return buildPlan(target, units, omittedSecureSkillIds, selectedSupport);
}

export function resolveRequiredSkillIds(targetSkillIds, skillMap) {
  const required = new Set();

  function addWithPrerequisites(skillId) {
    if (required.has(skillId)) return;
    const skill = skillMap.get(skillId);
    skill.prerequisiteSkillIds.forEach(addWithPrerequisites);
    required.add(skillId);
  }

  [...targetSkillIds].sort().forEach(addWithPrerequisites);
  return required;
}

export function topologicallyOrder(requiredIds, skillMap) {
  const ordered = [];
  const visited = new Set();

  function visit(skillId) {
    if (visited.has(skillId) || !requiredIds.has(skillId)) return;
    [...skillMap.get(skillId).prerequisiteSkillIds].sort().forEach(visit);
    visited.add(skillId);
    ordered.push(skillMap.get(skillId));
  }

  [...requiredIds].sort().forEach(visit);
  return ordered;
}

function createBridgeUnit(skill, evidence, capacityProfile) {
  const supportProfile = selectSupportProfile(capacityProfile, skill.defaultSupport);
  if (evidence.state === 'unknown') {
    return unit(skill.id, 'probe', REASON_CODES.UNKNOWN_EVIDENCE, supportProfile, probeCriteria());
  }
  if (evidence.state === 'not_ready') {
    return unit(skill.id, 'instruction', REASON_CODES.DEMONSTRATED_GAP, supportProfile, bridgeCriteria());
  }
  if (evidence.state === 'supported') {
    return unit(skill.id, 'practice', REASON_CODES.SUPPORTED_NEEDS_INDEPENDENCE, supportProfile, bridgeCriteria());
  }
  return null;
}

function appendReadinessChecks(bridgeUnits, target, capacityProfile, skillMap) {
  const hasBridgeWork = bridgeUnits.some((item) => item.unitType === 'instruction' || item.unitType === 'practice');
  if (!hasBridgeWork) return bridgeUnits;

  const checks = [...target.requiredTargetSkillIds].sort().map((skillId) => {
    const support = selectSupportProfile(capacityProfile, skillMap.get(skillId).defaultSupport);
    return unit(
      skillId,
      'readiness_check',
      REASON_CODES.VERIFY_TARGET_AFTER_BRIDGE,
      support,
      { ...target.readinessCriteria }
    );
  });
  return [...bridgeUnits, ...checks];
}

function evidenceFor(skillId, learnerEvidence) {
  return learnerEvidence.skills[skillId] ?? {
    state: 'unknown',
    attemptCount: 0,
    independentCorrect: 0
  };
}

function unit(skillId, unitType, reasonCode, supportProfile, exitCriteria) {
  return {
    skillId,
    unitType,
    reasonCode,
    supportProfile: { ...supportProfile },
    exitCriteria: { ...exitCriteria }
  };
}

function probeCriteria() {
  return { requiredEvidenceState: 'independent', minAttempts: 1 };
}

function bridgeCriteria() {
  return { ...DEFAULT_EXIT_CRITERIA };
}

function buildPlan(target, units, omittedSecureSkillIds, supportProfile) {
  const identity = createPlanIdentity(target.id);
  return {
    ...identity,
    targetId: target.id,
    supportProfile: { ...supportProfile },
    units,
    omittedSecureSkillIds: [...omittedSecureSkillIds].sort(),
    summary: createPlanSummary(units)
  };
}
