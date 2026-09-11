import assert from 'node:assert/strict';
import {
  makeBlankSupervisedObservationRecord,
  validateSupervisedObservationRecord,
} from './supervisedObservationGate.js';

const blank = makeBlankSupervisedObservationRecord();
const blankResult = validateSupervisedObservationRecord(blank);
assert.equal(blankResult.success, true);
assert.equal(blankResult.gateStatus, 'IN_PROGRESS');
assert.equal(blankResult.delayedRetrievalStatus, 'NOT_YET_TESTED');

// A real-child gate cannot pass before the delayed 3–7 day check.
const prematurePass = structuredClone(blank);
prematurePass.interactionChecks.returnedToNonGameTask = 'OBSERVED';
prematurePass.interactionChecks.independentReturnProducedInterpretableEvidence = 'OBSERVED';
prematurePass.interpretation.gateStatus = 'PASS';
assert.throws(
  () => validateSupervisedObservationRecord(prematurePass),
  /cannot PASS before delayed retrieval/i,
);

// A passing gate requires return-to-learning, interpretable independent evidence,
// a completed 3–7 day retrieval check, and no unresolved blocker.
const passing = structuredClone(blank);
for (const key of Object.keys(passing.interactionChecks)) passing.interactionChecks[key] = 'OBSERVED';
passing.interactionChecks.qrRushing = 'NOT_OBSERVED';
passing.interactionChecks.mechanicsCausedCarelessResponding = 'NOT_OBSERVED';
passing.delayedRetrieval = {
  status: 'COMPLETED',
  daysAfterInitial: 4,
  result: 'Fresh retrieval completed; result recorded separately from immediate performance.',
};
passing.findings = [{
  severity: 'MEDIUM',
  status: 'REMEDIATED',
  observation: 'Learner initially looked for the game button before reading the instruction card.',
  remediation: 'Move the short learner action above the QR and keep the QR visually secondary.',
}];
passing.interpretation.gateStatus = 'PASS';
const passingResult = validateSupervisedObservationRecord(passing);
assert.equal(passingResult.gateStatus, 'PASS');
assert.equal(passingResult.unresolvedBlocker, false);

// Unresolved blocker prevents PASS.
const blockedPass = structuredClone(passing);
blockedPass.findings = [{
  severity: 'BLOCKER',
  status: 'OPEN',
  observation: 'Learner refused to return to the non-game task.',
  remediation: 'Redesign the completion/return transition and rerun the gate.',
}];
assert.throws(
  () => validateSupervisedObservationRecord(blockedPass),
  /unresolved BLOCKER/i,
);

// Privacy guard: do not store direct identifiers or sensitive profile fields.
for (const forbidden of [
  { childName: 'Example Child' },
  { studentId: 'student-123' },
  { school: 'Example School' },
  { medical: 'anything' },
  { diagnosis: 'anything' },
]) {
  const record = { ...structuredClone(blank), participant: forbidden };
  assert.throws(
    () => validateSupervisedObservationRecord(record),
    /forbidden personal\/sensitive field/i,
  );
}

// Interpretation guard: one observation cannot become efficacy or durable-trait evidence.
const overclaim = structuredClone(blank);
overclaim.interpretation.generalEffectivenessClaim = true;
assert.throws(() => validateSupervisedObservationRecord(overclaim), /general effectiveness claim/i);
const traitClaim = structuredClone(blank);
traitClaim.interpretation.durableChildTraitClaim = true;
assert.throws(() => validateSupervisedObservationRecord(traitClaim), /durable child trait/i);

console.log('Supervised Primary real-child observation gate invariants passed.');
