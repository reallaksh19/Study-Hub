/**
 * @typedef {import('./types.js').Skill} Skill
 */

/**
 * Validates a skill graph for missing references and cycles.
 * @param {Skill[]} skills - The skill library
 * @throws {Error} if a cycle is detected or a prerequisite is missing
 */
export function validateSkillGraph(skills) {
  const skillMap = new Map();
  skills.forEach(skill => skillMap.set(skill.id, skill));

  // Check for missing references
  skills.forEach(skill => {
    (skill.prerequisites || []).forEach(prereqId => {
      if (!skillMap.has(prereqId)) {
        throw new Error(
          `Missing prerequisite reference: Skill '${skill.id}' requires '${prereqId}', which does not exist.`
        );
      }
    });
  });

  // Check for cycles using iterative DFS with two-colour marking.
  // Correct order: check recursionStack FIRST, then check visited.
  // Checking visited before recursionStack causes already-explored nodes to be
  // silently skipped even when they are part of an active recursion path.
  const visited = new Set();
  const recursionStack = new Set();

  function detectCycle(skillId) {
    if (recursionStack.has(skillId)) {
      throw new Error(`Cycle detected involving skill '${skillId}'`);
    }
    if (visited.has(skillId)) return;

    recursionStack.add(skillId);

    const skill = skillMap.get(skillId);
    (skill.prerequisites || []).forEach(detectCycle);

    recursionStack.delete(skillId);
    visited.add(skillId);
  }

  skills.forEach(skill => detectCycle(skill.id));
}

/**
 * Resolves all transitive prerequisites for a set of target skills.
 * @param {string[]} targetSkillIds - The IDs of the skills required by the target
 * @param {Skill[]} skillLibrary - The full list of available skills
 * @returns {Skill[]} The minimal subset of skills required (subgraph)
 */
export function resolveTransitivePrerequisites(targetSkillIds, skillLibrary) {
  const skillMap = new Map();
  skillLibrary.forEach(skill => skillMap.set(skill.id, skill));

  const requiredSkills = new Map();

  function addSkill(skillId) {
    if (requiredSkills.has(skillId)) return;

    const skill = skillMap.get(skillId);
    if (!skill) {
      throw new Error(`Cannot resolve prerequisite: '${skillId}' is missing from library.`);
    }

    requiredSkills.set(skillId, skill);
    (skill.prerequisites || []).forEach(addSkill);
  }

  targetSkillIds.forEach(addSkill);

  return Array.from(requiredSkills.values());
}

/**
 * Deterministically orders skills such that prerequisites come before the
 * skills that require them. Ties are broken alphabetically by skill ID.
 * @param {Skill[]} skillsSubgraph - The subset of skills to sort
 * @returns {Skill[]} The topologically sorted skills
 */
export function topologicalSort(skillsSubgraph) {
  const sorted = [];
  const visited = new Set();
  const tempMark = new Set();

  const skillMap = new Map();
  skillsSubgraph.forEach(skill => skillMap.set(skill.id, skill));

  // Sort IDs alphabetically to guarantee deterministic traversal order
  const sortedIds = Array.from(skillMap.keys()).sort();

  function visit(skillId) {
    if (visited.has(skillId)) return;
    if (tempMark.has(skillId)) {
      throw new Error(`Cycle detected during topological sort involving '${skillId}'`);
    }

    tempMark.add(skillId);

    const skill = skillMap.get(skillId);

    // Sort prerequisites alphabetically for deterministic visitation
    const prereqs = [...(skill.prerequisites || [])].sort();

    prereqs.forEach(prereqId => {
      // Only visit if it is part of the provided subgraph
      if (skillMap.has(prereqId)) {
        visit(prereqId);
      }
    });

    tempMark.delete(skillId);
    visited.add(skillId);
    sorted.push(skill);
  }

  sortedIds.forEach(visit);

  return sorted;
}
