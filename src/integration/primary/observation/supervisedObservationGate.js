const FORBIDDEN_PERSONAL_KEYS = new Set([
  'name', 'childName', 'fullName', 'dateOfBirth', 'dob', 'address', 'email', 'phone',
  'school', 'studentId', 'medical', 'diagnosis', 'disability', 'religion', 'race',
  'ethnicity', 'political', 'password', 'accountId',
]);

const OBSERVATION_STATES = new Set(['OBSERVED', 'NOT_OBSERVED', 'AMBIGUOUS', 'NOT_APPLICABLE']);
const GATE_STATUSES = new Set(['IN_PROGRESS', 'PASS', 'BLOCKED']);

function isRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function findForbiddenKey(value, path = []) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const found = findForbiddenKey(value[i], [...path, String(i)]);
      if (found) return found;
    }
    return null;
  }
  if (!isRecord(value)) return null;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PERSONAL_KEYS.has(key)) return [...path, key].join('.');
    const found = findForbiddenKey(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

function requireBoolean(value, path) {
  if (typeof value !== 'boolean') throw new Error(`${path} must be boolean`);
}

function requireString(value, path) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${path} must be a non-empty string`);
  return value.trim();
}

function requireState(value, path) {
  if (!OBSERVATION_STATES.has(value)) {
    throw new Error(`${path} must be one of ${[...OBSERVATION_STATES].join(', ')}`);
  }
}

function validateFinding(finding, index) {
  if (!isRecord(finding)) throw new Error(`findings[${index}] must be an object`);
  const severity = requireString(finding.severity, `findings[${index}].severity`).toUpperCase();
  if (!['LOW', 'MEDIUM', 'HIGH', 'BLOCKER'].includes(severity)) throw new Error(`findings[${index}].severity is unsupported`);
  const status = requireString(finding.status, `findings[${index}].status`).toUpperCase();
  if (!['OPEN', 'REMEDIATED', 'ACCEPTED_FOR_NEXT_TEST'].includes(status)) throw new Error(`findings[${index}].status is unsupported`);
  requireString(finding.observation, `findings[${index}].observation`);
  requireString(finding.remediation, `findings[${index}].remediation`);
  return { severity, status };
}

/**
 * Validate the minimal, privacy-bounded evidence packet for Study-Hub #50.
 * This is a product observation gate, not a clinical/research instrument.
 */
export function validateSupervisedObservationRecord(record) {
  if (!isRecord(record)) throw new Error('observation record must be an object');
  const forbidden = findForbiddenKey(record);
  if (forbidden) throw new Error(`observation record contains forbidden personal/sensitive field: ${forbidden}`);

  if (record.schemaVersion !== '1.0') throw new Error('schemaVersion must equal 1.0');
  requireString(record.observationId, 'observationId');
  requireBoolean(record.guardianSupervised, 'guardianSupervised');
  if (record.guardianSupervised !== true) throw new Error('guardianSupervised must be true');
  if (record.grade !== 4) throw new Error('grade must equal 4 for this gate');
  if (!Array.isArray(record.experiences) || record.experiences.length === 0) throw new Error('experiences must contain at least one experience id');

  const checks = record.interactionChecks;
  if (!isRecord(checks)) throw new Error('interactionChecks must be an object');
  for (const key of [
    'studyHubOrPrintAttempted',
    'qrRushing',
    'returnedToNonGameTask',
    'gameClarifiedOrPractisedTarget',
    'hintsPreservedThinking',
    'mechanicsCausedCarelessResponding',
    'instructionsUnderstoodWithoutRepeatedTranslation',
    'independentReturnProducedInterpretableEvidence',
  ]) {
    requireState(checks[key], `interactionChecks.${key}`);
  }

  const delayed = record.delayedRetrieval;
  if (!isRecord(delayed)) throw new Error('delayedRetrieval must be an object');
  if (!['NOT_YET_TESTED', 'COMPLETED'].includes(delayed.status)) throw new Error('delayedRetrieval.status must be NOT_YET_TESTED or COMPLETED');
  if (delayed.status === 'COMPLETED') {
    if (!Number.isInteger(delayed.daysAfterInitial) || delayed.daysAfterInitial < 3 || delayed.daysAfterInitial > 7) {
      throw new Error('completed delayed retrieval must occur 3–7 days after the initial observation');
    }
    requireString(delayed.result, 'delayedRetrieval.result');
  }

  const findings = Array.isArray(record.findings) ? record.findings : [];
  const normalizedFindings = findings.map(validateFinding);
  const unresolvedBlocker = normalizedFindings.some((finding) => finding.severity === 'BLOCKER' && finding.status === 'OPEN');

  const interpretation = record.interpretation;
  if (!isRecord(interpretation)) throw new Error('interpretation must be an object');
  if (!GATE_STATUSES.has(interpretation.gateStatus)) throw new Error('interpretation.gateStatus must be IN_PROGRESS, PASS or BLOCKED');
  requireBoolean(interpretation.generalEffectivenessClaim, 'interpretation.generalEffectivenessClaim');
  requireBoolean(interpretation.durableChildTraitClaim, 'interpretation.durableChildTraitClaim');
  if (interpretation.generalEffectivenessClaim !== false) throw new Error('one-child gate must not make a general effectiveness claim');
  if (interpretation.durableChildTraitClaim !== false) throw new Error('one-session evidence must not become a durable child trait claim');

  if (interpretation.gateStatus === 'PASS') {
    if (delayed.status !== 'COMPLETED') throw new Error('gate cannot PASS before delayed retrieval is completed');
    if (checks.independentReturnProducedInterpretableEvidence !== 'OBSERVED') {
      throw new Error('gate cannot PASS without interpretable independent-return evidence');
    }
    if (checks.returnedToNonGameTask !== 'OBSERVED') throw new Error('gate cannot PASS unless return-to-learning was observed');
    if (unresolvedBlocker) throw new Error('gate cannot PASS with an unresolved BLOCKER finding');
  }

  return {
    success: true,
    gateStatus: interpretation.gateStatus,
    delayedRetrievalStatus: delayed.status,
    findingCount: findings.length,
    unresolvedBlocker,
  };
}

export function makeBlankSupervisedObservationRecord() {
  return {
    schemaVersion: '1.0',
    observationId: 'OBS-GATE-PRIMARY-001',
    guardianSupervised: true,
    grade: 4,
    experiences: ['MATH-FRACTION-EQUIVALENCE', 'ENGLISH-INFERENCE-INVESTIGATOR'],
    interactionChecks: {
      studyHubOrPrintAttempted: 'AMBIGUOUS',
      qrRushing: 'AMBIGUOUS',
      returnedToNonGameTask: 'AMBIGUOUS',
      gameClarifiedOrPractisedTarget: 'AMBIGUOUS',
      hintsPreservedThinking: 'AMBIGUOUS',
      mechanicsCausedCarelessResponding: 'AMBIGUOUS',
      instructionsUnderstoodWithoutRepeatedTranslation: 'AMBIGUOUS',
      independentReturnProducedInterpretableEvidence: 'AMBIGUOUS',
    },
    delayedRetrieval: {
      status: 'NOT_YET_TESTED',
    },
    findings: [],
    interpretation: {
      gateStatus: 'IN_PROGRESS',
      generalEffectivenessClaim: false,
      durableChildTraitClaim: false,
    },
  };
}
