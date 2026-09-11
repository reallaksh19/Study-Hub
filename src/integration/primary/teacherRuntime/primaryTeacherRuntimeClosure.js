import {
  buildCurrentLearningState,
  buildSkillState,
  decideTeacherMove,
} from './primaryTeacherRuntime.js';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function correctness(observation) {
  if (typeof observation?.value?.correct === 'boolean') return observation.value.correct ? 'CORRECT' : 'INCORRECT';
  return observation?.value?.correctness || 'NOT_SCORED';
}

/**
 * Verify the required child turn after a repair. This records only in-session
 * independent verification. It deliberately does not declare durable mastery or retention.
 */
export function verifyIndependentRetryAfterRepair({
  learningObjectId,
  priorObservations = [],
  retryObservation,
  sessionId = 'SESSION-PHASE4-REPAIR-VERIFY-001',
}) {
  if (!learningObjectId) throw new Error('learningObjectId is required');
  if (!retryObservation?.observationId) throw new Error('retryObservation.observationId is required');
  if (!retryObservation.learningObjectIds?.includes(learningObjectId)) {
    throw new Error('retryObservation must reference the repaired learning object');
  }
  if (retryObservation.value?.evidenceRole !== 'INDEPENDENT_RETRY_AFTER_REPAIR') {
    throw new Error('retryObservation must be labelled INDEPENDENT_RETRY_AFTER_REPAIR');
  }
  if (retryObservation.conceptualSupport?.level !== 'H0') {
    throw new Error('repair verification must use H0 conceptual support');
  }

  const observations = [...priorObservations.map(clone), clone(retryObservation)]
    .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));
  const retryCorrectness = correctness(retryObservation);
  const verificationStatus = retryCorrectness === 'CORRECT'
    ? 'CONFIRMED_IN_SESSION'
    : 'NOT_CONFIRMED';

  // Treat the fresh unsupported retry as independent-use evidence for this session,
  // while keeping delayed retention explicitly untested.
  const projected = observations.map((observation) => {
    if (observation.observationId !== retryObservation.observationId) return observation;
    return {
      ...observation,
      value: {
        ...observation.value,
        evidenceRole: 'INDEPENDENT_RETURN',
      },
    };
  });

  const skillState = buildSkillState({
    learningObjectId,
    observations: projected,
    delayedRetention: 'NOT_YET_TESTED',
  });
  const currentLearningState = buildCurrentLearningState({
    sessionId,
    learningObjectIds: [learningObjectId],
    observations,
  });

  let next;
  if (verificationStatus === 'CONFIRMED_IN_SESSION') {
    next = decideTeacherMove({
      diagnosis: null,
      skillState,
      currentLearningState: {
        ...currentLearningState,
        sameRouteFailures: 0,
      },
    });
  } else {
    next = {
      decision: {
        decisionId: 'DEC-REPAIR-NOT-CONFIRMED',
        strategy: 'DIAGNOSE_BEFORE_RETEACH',
        reasonEvidenceRefs: [retryObservation.observationId],
        rationale: 'The fresh unsupported retry did not confirm the repair; keep the mechanism under review rather than claiming success.',
      },
      move: {
        moveId: 'MOVE-REPAIR-NOT-CONFIRMED',
        type: 'ASK_TO_SHOW',
        expectedChildAction: 'Show the repaired mechanism on one smaller fresh item.',
      },
    };
  }

  return {
    learningObjectId,
    verificationStatus,
    verificationObservationRef: retryObservation.observationId,
    durability: 'NOT_ESTABLISHED',
    skillState,
    currentLearningState,
    teacherDecision: next.decision,
    teacherMove: next.move,
  };
}
