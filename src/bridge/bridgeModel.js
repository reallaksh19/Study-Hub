export const EVIDENCE_STATES = Object.freeze([
  'unknown',
  'not_ready',
  'supported',
  'independent',
  'secure'
]);

export const BRIDGE_UNIT_TYPES = Object.freeze([
  'probe',
  'instruction',
  'practice',
  'readiness_check'
]);

export const REASON_CODES = Object.freeze({
  UNKNOWN_EVIDENCE: 'unknown_evidence',
  DEMONSTRATED_GAP: 'demonstrated_gap',
  SUPPORTED_NEEDS_INDEPENDENCE: 'supported_needs_independence',
  VERIFY_TARGET_AFTER_BRIDGE: 'verify_target_after_bridge'
});

export const SUPPORT_KEYS = Object.freeze([
  'instructionLength',
  'maxVisibleItems',
  'answerChoiceLoad',
  'hintAvailability',
  'preferredRepresentation',
  'recommendedSessionSize'
]);

export const DEFAULT_EXIT_CRITERIA = Object.freeze({
  minIndependentCorrect: 3,
  minAccuracy: 0.8,
  minSessions: 1
});

export function createPlanIdentity(targetId) {
  return {
    id: `bridge-${stableHash(targetId)}`,
    title: 'Learner bridge plan'
  };
}

export function createPlanSummary(units) {
  const summary = {
    probeCount: 0,
    instructionCount: 0,
    practiceCount: 0,
    readinessCheckCount: 0,
    totalUnits: units.length
  };

  units.forEach((unit) => {
    if (unit.unitType === 'probe') summary.probeCount += 1;
    if (unit.unitType === 'instruction') summary.instructionCount += 1;
    if (unit.unitType === 'practice') summary.practiceCount += 1;
    if (unit.unitType === 'readiness_check') summary.readinessCheckCount += 1;
  });

  return summary;
}

export function selectSupportProfile(capacityProfile, defaultSupport = {}) {
  const selected = {};
  SUPPORT_KEYS.forEach((key) => {
    const value = capacityProfile[key] ?? defaultSupport[key];
    if (value !== undefined) selected[key] = value;
  });
  return selected;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
