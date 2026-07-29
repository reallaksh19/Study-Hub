/**
 * @typedef {import('./types.js').TargetDefinition} TargetDefinition
 * @typedef {import('./types.js').Skill} Skill
 * @typedef {import('./types.js').LearnerEvidence} LearnerEvidence
 * @typedef {import('./types.js').CapacityProfile} CapacityProfile
 * @typedef {import('./types.js').BridgePlan} BridgePlan
 * @typedef {import('./types.js').BridgeUnit} BridgeUnit
 */

import { validateSkillGraph, resolveTransitivePrerequisites, topologicalSort } from './skills.js';

/**
 * Maps a single skill's evidence state to the appropriate bridge unit type.
 * Returns null if the skill should be omitted from the bridge.
 *
 * Evidence states:
 *   Secure      → omit (no bridge needed)
 *   Independent → omit for prerequisites; runtime handles target-level check
 *   Supported   → practice (capacity adaptations applied, skill is understood)
 *   Not ready   → instruction (direct teaching required)
 *   Unknown     → probe (evidence must be gathered before teaching decisions)
 *
 * @param {string} evidence
 * @param {boolean} isTargetSkill
 * @returns {'probe' | 'instruction' | 'practice' | null}
 */
function evidenceToUnitType(evidence, isTargetSkill) {
  switch (evidence) {
    case 'Secure':      return null;
    case 'Independent': return null; // readiness-check appended separately for target skills
    case 'Supported':   return 'practice';
    case 'Not ready':   return 'instruction';
    case 'Unknown':     return 'probe';
    default:            return 'probe'; // treat unrecognised evidence as Unknown
  }
}

/**
 * Returns true if a readiness-check unit should be appended for this skill.
 * A readiness check is added for every non-Secure target skill so entry into
 * the target module is always evidence-gated.
 *
 * @param {string} evidence
 * @param {boolean} isTargetSkill
 * @returns {boolean}
 */
function needsReadinessCheck(evidence, isTargetSkill) {
  return isTargetSkill && evidence !== 'Secure';
}

/**
 * Generates a learner-specific bridge plan deterministically.
 *
 * The plan is produced by:
 *  1. Validating the referenced skill subgraph for structural integrity.
 *  2. Resolving all transitive prerequisites for the target's required skills.
 *  3. Topologically sorting the resolved subgraph (prerequisites before dependants,
 *     alphabetical tiebreak for determinism).
 *  4. Mapping each skill's evidence state to a bridge unit type and appending it.
 *  5. Appending a readiness-check unit for every non-Secure target skill.
 *
 * Invariants:
 *  - Secure skills are omitted entirely.
 *  - Unknown skills receive a probe, not instruction.
 *  - Grade/curriculum metadata on the target is ignored by the planner.
 *  - Caller-owned inputs are never mutated.
 *  - Identical inputs produce deeply equal output.
 *
 * @param {TargetDefinition} target
 * @param {Skill[]} skillLibrary
 * @param {LearnerEvidence} learnerEvidence
 * @param {CapacityProfile} capacityProfile
 * @returns {BridgePlan}
 */
export function generateBridgePlan(target, skillLibrary, learnerEvidence, capacityProfile) {
  // 1. Resolve the subgraph required for this target (prerequisites + target skills)
  const requiredSkills = resolveTransitivePrerequisites(target.requiredSkills, skillLibrary);

  // 2. Validate only the resolved subgraph — unreferenced skills in the library
  //    are out of scope and must not cause rejection.
  validateSkillGraph(requiredSkills);

  // 3. Topological sort: prerequisites first, alphabetical tiebreak
  const sortedSkills = topologicalSort(requiredSkills);

  const targetSkillSet = new Set(target.requiredSkills);
  /** @type {BridgeUnit[]} */
  const units = [];

  // 4. First pass: bridge instruction/probe/practice units
  sortedSkills.forEach(skill => {
    const evidence = learnerEvidence.skills[skill.id] || 'Unknown';
    const isTargetSkill = targetSkillSet.has(skill.id);
    const unitType = evidenceToUnitType(evidence, isTargetSkill);

    if (unitType !== null) {
      units.push({
        skillId: skill.id,
        type: unitType,
        supportProfile: { ...capacityProfile }
      });
    }
  });

  // 5. Second pass: append readiness-check for every non-Secure target skill.
  //    Done in sorted order for deterministic output.
  sortedSkills.forEach(skill => {
    const evidence = learnerEvidence.skills[skill.id] || 'Unknown';
    const isTargetSkill = targetSkillSet.has(skill.id);

    if (needsReadinessCheck(evidence, isTargetSkill)) {
      units.push({
        skillId: skill.id,
        type: 'readiness-check',
        supportProfile: { ...capacityProfile }
      });
    }
  });

  return {
    targetId: target.id,
    units
  };
}
