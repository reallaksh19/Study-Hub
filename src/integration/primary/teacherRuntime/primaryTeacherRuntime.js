const DEFAULT_REPLAY_TIME = '2026-09-11T00:00:00.000Z';

const SUCCESS_VALUES = new Set(['CORRECT', true]);
const UNSUCCESSFUL_VALUES = new Set(['INCORRECT', false]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function observationCorrectness(observation) {
  const value = observation?.value || {};
  if (typeof value.correct === 'boolean') return value.correct ? 'CORRECT' : 'INCORRECT';
  return value.correctness || value.finalResponse?.correctness || value.mathematicalWorkEvidence?.finalResponse?.correctness || 'NOT_SCORED';
}

function isSuccessful(observation) {
  return SUCCESS_VALUES.has(observationCorrectness(observation));
}

function isUnsuccessful(observation) {
  return UNSUCCESSFUL_VALUES.has(observationCorrectness(observation));
}

function conceptualSupportFromEvidence(primaryEvidence = {}) {
  return primaryEvidence.conceptualSupport || { level: 'H0', type: 'NONE' };
}

function accessAdjustmentsFromEvidence(primaryEvidence = {}) {
  return Array.isArray(primaryEvidence.accessAdjustments) ? [...primaryEvidence.accessAdjustments] : [];
}

function routeSignatureFromObservation(observation) {
  if (observation?.value?.routeSignature) return observation.value.routeSignature;
  if (observation?.mathematicalWorkEvidence) {
    const work = observation.mathematicalWorkEvidence;
    const operation = work.selectedOperation || 'NOT_OBSERVED';
    const hasWrittenAlgorithm = (work.workSteps || []).some((step) =>
      ['PARTIAL_QUOTIENT', 'SUBTRACTION', 'BRING_DOWN', 'PLACE_VALUE_WRITE'].includes(step.kind));
    return `WORK_TRACE:${operation}:${hasWrittenAlgorithm ? 'WRITTEN_ALGORITHM' : 'OTHER'}`;
  }
  const representation = observation?.representation?.type || 'NONE';
  const responseMode = observation?.value?.responseMode || 'UNKNOWN';
  return `APP:${representation}:${responseMode}`;
}

function evidenceConfidence(count) {
  if (count >= 5) return 'HIGH';
  if (count >= 2) return 'MEDIUM';
  return 'LOW';
}

function learningObjectMatches(observation, learningObjectId) {
  return (observation.learningObjectIds || []).includes(learningObjectId);
}

/**
 * Project immutable Kani attempt evidence into a Common-shaped Observation.
 * This adapter never emits diagnosis, judgement, mastery or next action into the attempt.
 */
export function observationFromKaniAttempt(attempt, options = {}) {
  if (!attempt || !attempt.attemptId) throw new Error('Kani attempt with attemptId is required');
  const primaryEvidence = attempt.primaryEvidence || {};
  const learningObjectIds = primaryEvidence.learningObjectIds || options.learningObjectIds || [];
  if (!learningObjectIds.length) throw new Error('Primary observation requires at least one learningObjectId');

  return {
    observationId: `OBS-${attempt.attemptId}`,
    learningObjectIds: [...learningObjectIds],
    kind: 'KANI_ATTEMPT',
    value: {
      attemptId: attempt.attemptId,
      questionId: attempt.questionId,
      correct: attempt.correct,
      partialCredit: attempt.partialCredit,
      responseTimeMs: attempt.responseTimeMs,
      responseMode: primaryEvidence.responseMode || 'SELECT',
      selfCorrected: primaryEvidence.selfCorrected === true,
      evidenceRole: options.evidenceRole || 'PRACTICE',
      routeSignature: `KANI:${primaryEvidence.representation?.type || 'NONE'}:${primaryEvidence.responseMode || 'SELECT'}`,
    },
    observedAt: attempt.completedAt,
    conceptualSupport: conceptualSupportFromEvidence(primaryEvidence),
    accessAdjustments: accessAdjustmentsFromEvidence(primaryEvidence),
    ...(primaryEvidence.representation ? { representation: clone(primaryEvidence.representation) } : {}),
    sourceStatus: 'VERIFIED',
  };
}

/** Preserve Common MathematicalWorkEvidence before any diagnosis is formed. */
export function observationsFromWorkEvidence(workEvidence, options = {}) {
  const observedAt = options.observedAt || DEFAULT_REPLAY_TIME;
  return (workEvidence || []).map((work) => ({
    observationId: `OBS-${work.workEvidenceId}`,
    learningObjectIds: [...(work.learningObjectIds || [])],
    kind: 'MATHEMATICAL_WORK',
    value: {
      correctness: work.finalResponse?.correctness || 'NOT_SCORED',
      selectedOperation: work.selectedOperation || 'NOT_OBSERVED',
      evidenceRole: 'SOURCE_WORK',
      routeSignature: routeSignatureFromObservation({ mathematicalWorkEvidence: work }),
    },
    observedAt: work.observedAt || observedAt,
    conceptualSupport: { level: 'H0', type: 'NONE' },
    accessAdjustments: [],
    mathematicalWorkEvidence: clone(work),
    sourceStatus: options.sourceStatus || 'VERIFIED',
  }));
}

export function buildSkillState({
  learningObjectId,
  observations,
  delayedRetention = 'NOT_YET_TESTED',
  transfer = 'NOT_YET_TESTED',
  stretch = 'NOT_YET_TESTED',
}) {
  const relevant = (observations || []).filter((observation) => learningObjectMatches(observation, learningObjectId));
  const successful = relevant.filter(isSuccessful);
  const unsuccessful = relevant.filter(isUnsuccessful);
  const independent = relevant.filter((observation) => observation.value?.evidenceRole === 'INDEPENDENT_RETURN');
  const independentSuccess = independent.filter(isSuccessful);
  const conceptualSupportObserved = relevant.some((observation) => observation.conceptualSupport?.level !== 'H0');
  const confidence = evidenceConfidence(relevant.length);

  const acquisition = successful.length > 0 ? 'DEVELOPING' : (relevant.length ? 'EMERGING' : 'NOT_OBSERVED');
  const independentUse = independentSuccess.length > 0 ? 'DEVELOPING' : (independent.length ? 'EMERGING' : 'NOT_OBSERVED');

  return {
    learningObjectId,
    learningEvidence: {
      acquisition,
      independentUse,
      delayedRetention,
      transfer,
      stretch,
    },
    evidenceRefs: relevant.map((observation) => observation.observationId),
    confidence,
    recentEvidence: {
      observationRefs: relevant.map((observation) => observation.observationId),
      successCount: successful.length,
      unsuccessfulCount: unsuccessful.length,
    },
    priorIndependentEvidence: {
      status: independentUse,
      observationRefs: independent.map((observation) => observation.observationId),
    },
    retentionEvidence: {
      status: delayedRetention,
      observationRefs: relevant.filter((observation) => observation.value?.evidenceRole === 'DELAYED_RETRIEVAL').map((observation) => observation.observationId),
    },
    transferEvidence: {
      status: transfer,
      observationRefs: relevant.filter((observation) => observation.value?.evidenceRole === 'TRANSFER').map((observation) => observation.observationId),
    },
    supportDependency: conceptualSupportObserved ? 'OBSERVED_WITH_CONCEPTUAL_SUPPORT' : 'NOT_OBSERVED',
    evidenceConfidence: confidence,
  };
}

export function buildCurrentLearningState({
  sessionId,
  learningObjectIds,
  observations,
  learnerReportedFatigue = false,
}) {
  const relevant = (observations || []).filter((observation) =>
    (observation.learningObjectIds || []).some((id) => learningObjectIds.includes(id)));
  const unsuccessful = relevant.filter(isUnsuccessful);
  const successes = relevant.filter(isSuccessful);
  const latest = relevant[relevant.length - 1];
  const routeCounts = new Map();
  for (const observation of unsuccessful) {
    const signature = routeSignatureFromObservation(observation);
    routeCounts.set(signature, (routeCounts.get(signature) || 0) + 1);
  }
  const sameRouteFailures = Math.max(0, ...routeCounts.values());
  const questionIds = relevant.map((observation) => observation.value?.questionId).filter(Boolean);
  const repeatedQuestion = new Set(questionIds).size < questionIds.length;

  const sessionSignals = [];
  if (unsuccessful.length >= 2) sessionSignals.push('REPEATED_ERRORS');
  if (sameRouteFailures >= 2) sessionSignals.push('SAME_ROUTE_FAILURE_REQUIRES_VARIATION');
  if (learnerReportedFatigue) sessionSignals.push('LEARNER_REPORTED_FATIGUE');

  return {
    sessionId,
    learningObjectIds: [...learningObjectIds],
    conceptualSupport: latest?.conceptualSupport || { level: 'H0', type: 'NONE' },
    accessAdjustments: latest?.accessAdjustments || [],
    ...(latest?.representation ? { representation: clone(latest.representation) } : {}),
    recentObservationRefs: relevant.map((observation) => observation.observationId),
    sessionSignals,
    repeatedErrors: unsuccessful.length,
    repeatedQuestion,
    sameRouteFailures,
    recentSuccesses: successes.map((observation) => observation.observationId),
    learnerReportedFatigue,
    lastRouteSignature: latest ? routeSignatureFromObservation(latest) : null,
  };
}

function diagnosisFromWorkObservation(observation, index) {
  const work = observation.mathematicalWorkEvidence;
  const signature = work?.candidateErrorSignatures?.[0];
  if (!signature) return null;
  let code = 'INSUFFICIENT_EVIDENCE';
  if (signature.startsWith('DIV_')) code = 'PROCEDURAL_ERROR';
  if (signature.includes('WRONG_OPERATION') || signature.startsWith('UNIT_')) code = 'TASK_INTERPRETATION_ERROR';
  return {
    diagnosisId: `DX-WORK-${index + 1}`,
    code,
    confidence: 'LOW',
    evidenceRefs: [observation.observationId],
    errorSignature: signature,
    informationNeeded: ['Confirm the smallest mechanism implicated by the observed work before reteaching broadly.'],
  };
}

/**
 * Generate bounded hypotheses. Contrast sets supplied by Common take precedence
 * over generic final-answer interpretation.
 */
export function diagnosePrimaryEvidence({ observations, contrastSets = [] }) {
  const observationByWorkId = new Map();
  for (const observation of observations || []) {
    const workId = observation.mathematicalWorkEvidence?.workEvidenceId;
    if (workId) observationByWorkId.set(workId, observation);
  }

  const diagnoses = [];
  for (const contrast of contrastSets) {
    const hypothesis = contrast.boundedHypothesis;
    if (!hypothesis) continue;
    const evidenceRefs = (contrast.evidenceRefs || [])
      .map((ref) => observationByWorkId.get(ref)?.observationId)
      .filter(Boolean);
    if (!evidenceRefs.length) continue;
    diagnoses.push({
      diagnosisId: `DX-${contrast.contrastSetId}`,
      code: hypothesis.diagnosisCode,
      confidence: hypothesis.confidence,
      evidenceRefs,
      errorSignature: hypothesis.errorSignature,
      informationNeeded: [...(hypothesis.informationNeeded || [])],
      contrastSetId: contrast.contrastSetId,
      contrastDimension: contrast.contrastDimension,
    });
  }
  if (diagnoses.length) return diagnoses;

  const workDiagnoses = (observations || [])
    .map(diagnosisFromWorkObservation)
    .filter(Boolean);
  if (workDiagnoses.length) return workDiagnoses;

  const latest = observations?.[observations.length - 1];
  if (!latest || !isUnsuccessful(latest)) return [];
  const prior = (observations || []).slice(0, -1);
  const priorSuccesses = prior.filter(isSuccessful);
  if (priorSuccesses.length >= 2 && latest.value?.selfCorrected === true) {
    return [{
      diagnosisId: 'DX-POSSIBLE-LAPSE',
      code: 'PERFORMANCE_LAPSE',
      confidence: 'MEDIUM',
      evidenceRefs: [...priorSuccesses.slice(-2), latest].map((observation) => observation.observationId),
      informationNeeded: ['Can the learner solve one fresh independent item without added conceptual support?'],
    }];
  }

  return [{
    diagnosisId: 'DX-INSUFFICIENT-EVIDENCE',
    code: 'INSUFFICIENT_EVIDENCE',
    confidence: 'LOW',
    evidenceRefs: [latest.observationId],
    informationNeeded: ['Ask for a small observable step that distinguishes concept, procedure, language and task-interpretation causes.'],
  }];
}

function teacherVoice(acknowledgement, nextAction) {
  return {
    acknowledgement,
    nextAction,
    policy: 'PRESERVE_CORRECT_THINKING_AND_REQUEST_NEXT_OBSERVABLE_ACTION',
  };
}

export function decideTeacherMove({
  diagnosis,
  skillState,
  currentLearningState,
  requiredNextProbe,
}) {
  const reasonRefs = diagnosis?.evidenceRefs?.length
    ? diagnosis.evidenceRefs
    : skillState.evidenceRefs.slice(-1);

  if (currentLearningState.learnerReportedFatigue) {
    return {
      decision: {
        decisionId: 'DEC-END-SESSION',
        strategy: 'END_EPISODE',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'Learner-reported fatigue is a valid stop signal; session state is not promoted into a durable trait.',
      },
      move: {
        moveId: 'MOVE-END-SESSION',
        type: 'END_SESSION',
        expectedChildAction: 'Stop the learning episode without penalty.',
        feedback: teacherVoice('You have done enough useful work for this session.', 'We will continue from the evidence already saved.'),
      },
    };
  }

  if (currentLearningState.sameRouteFailures >= 2) {
    const probe = requiredNextProbe?.example || 'Show only the next step using a changed task structure.';
    return {
      decision: {
        decisionId: 'DEC-VARY-AFTER-SAME-ROUTE-FAILURE',
        strategy: 'DIAGNOSE_BEFORE_RETEACH',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'Two unsuccessful attempts through substantially the same route require a meaningful variation before more teaching.',
        evidenceStillNeeded: diagnosis?.informationNeeded || [],
      },
      move: {
        moveId: 'MOVE-SMALLEST-DISCRIMINATING-PROBE',
        type: 'ASK_TO_SHOW',
        expectedChildAction: probe,
        variation: {
          dimension: 'TASK_STRUCTURE',
          from: 'FULL_ROUTE',
          to: 'ONE_MECHANISM_AT_A_TIME',
        },
        followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
        feedback: teacherVoice('Some earlier steps were usable, so we will not restart the whole topic.', 'Show just the next step so we can locate the exact break.'),
      },
    };
  }

  if (!diagnosis) {
    if (skillState.learningEvidence.independentUse !== 'NOT_OBSERVED'
      && skillState.learningEvidence.delayedRetention === 'NOT_YET_TESTED') {
      return {
        decision: {
          decisionId: 'DEC-SCHEDULE-RETRIEVAL',
          strategy: 'SCHEDULE_RETRIEVAL',
          reasonEvidenceRefs: reasonRefs,
          rationale: 'Immediate independent evidence does not establish delayed retention.',
        },
        move: {
          moveId: 'MOVE-SCHEDULE-RETRIEVAL',
          type: 'SCHEDULE_RETRIEVAL',
          expectedChildAction: 'Return for a fresh retrieval item after the planned delay.',
          feedback: teacherVoice('You completed an independent turn now.', 'A later retrieval check will tell us what stayed available.'),
        },
      };
    }
    return {
      decision: {
        decisionId: 'DEC-EXTEND-TRANSFER',
        strategy: 'EXTEND_TO_TRANSFER',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'Recent evidence does not require repair; use a fresh context rather than repetitive drill.',
      },
      move: {
        moveId: 'MOVE-EXTEND',
        type: 'EXTEND',
        expectedChildAction: 'Solve or explain a fresh transfer item.',
        feedback: teacherVoice('The recent work is usable.', 'Try the same idea in a new context.'),
      },
    };
  }

  if (diagnosis.code === 'PERFORMANCE_LAPSE') {
    return {
      decision: {
        decisionId: 'DEC-INDEPENDENT-RETRY',
        strategy: 'GIVE_INDEPENDENT_RETRY',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'Prior success and self-correction make broad reteaching disproportionate to the evidence.',
      },
      move: {
        moveId: 'MOVE-INDEPENDENT-RETRY',
        type: 'GIVE_INDEPENDENT_TURN',
        expectedChildAction: 'Try one fresh item independently.',
        feedback: teacherVoice('Your earlier work shows this route has worked before.', 'Try one fresh example without extra help.'),
      },
    };
  }

  if (diagnosis.code === 'LANGUAGE_COMPREHENSION_ERROR') {
    return {
      decision: {
        decisionId: 'DEC-REDUCE-ACCESS-LOAD',
        strategy: 'REDUCE_ACCESS_LOAD',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'Language access is varied without counting it as conceptual mathematical help.',
      },
      move: {
        moveId: 'MOVE-REDUCE-LANGUAGE',
        type: 'REDUCE_LANGUAGE',
        expectedChildAction: 'Respond to the same underlying target with reduced language load.',
        feedback: teacherVoice('The mathematics and the wording are separate evidence.', 'Try the same idea with shorter wording.'),
      },
    };
  }

  if (diagnosis.code === 'INSUFFICIENT_EVIDENCE') {
    return {
      decision: {
        decisionId: 'DEC-PROBE-FIRST',
        strategy: 'DIAGNOSE_BEFORE_RETEACH',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'A wrong answer alone is not enough evidence for a reteach decision.',
        evidenceStillNeeded: diagnosis.informationNeeded || [],
      },
      move: {
        moveId: 'MOVE-ASK-TO-SHOW',
        type: 'ASK_TO_SHOW',
        expectedChildAction: 'Show one small step or representation that exposes the reasoning used.',
        feedback: teacherVoice('The answer tells us something went wrong, but not yet what.', 'Show one small step so the next help matches the actual need.'),
      },
    };
  }

  if (diagnosis.code === 'PROCEDURAL_ERROR' && diagnosis.errorSignature) {
    return {
      decision: {
        decisionId: 'DEC-NARROW-PROCEDURAL-PROBE',
        strategy: 'DIAGNOSE_BEFORE_RETEACH',
        reasonEvidenceRefs: reasonRefs,
        rationale: 'The work trace supports a narrow mechanism hypothesis; confirm it before broad procedural reteaching.',
        evidenceStillNeeded: diagnosis.informationNeeded || [],
      },
      move: {
        moveId: 'MOVE-NARROW-PROCEDURAL-PROBE',
        type: 'ASK_TO_SHOW',
        expectedChildAction: requiredNextProbe?.example || 'Show the next step only.',
        followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
        feedback: teacherVoice('Several algorithm steps were correct.', 'Show only the suspected step so we can repair that mechanism if needed.'),
      },
    };
  }

  return {
    decision: {
      decisionId: 'DEC-ASK-FOR-EXPLANATION',
      strategy: 'ASK_FOR_EXPLANATION',
      reasonEvidenceRefs: reasonRefs,
      rationale: 'Use observable child thinking before selecting a stronger intervention.',
    },
    move: {
      moveId: 'MOVE-ASK-TO-EXPLAIN',
      type: 'ASK_TO_EXPLAIN',
      expectedChildAction: 'Explain or show the reasoning used.',
      feedback: teacherVoice('There is useful evidence in the work already.', 'Explain the step you chose so we can decide what to change.'),
    },
  };
}

export function runFractionTeacherReplay({
  attempts,
  independentReturnObservation,
  learningObjectId = 'MATH-FRAC-EQUIVALENCE',
  sessionId = 'SESSION-PHASE4-FRACTION-001',
  delayedRetention = 'NOT_YET_TESTED',
}) {
  const observations = (attempts || []).map((attempt) => observationFromKaniAttempt(attempt));
  if (independentReturnObservation) observations.push(clone(independentReturnObservation));
  observations.sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));
  const skillState = buildSkillState({ learningObjectId, observations, delayedRetention });
  const currentLearningState = buildCurrentLearningState({
    sessionId,
    learningObjectIds: [learningObjectId],
    observations,
  });
  const diagnoses = diagnosePrimaryEvidence({ observations });
  const next = decideTeacherMove({
    diagnosis: diagnoses[0],
    skillState,
    currentLearningState,
  });
  return {
    semanticAuthority: 'reallaksh19/Common',
    semanticVersion: '1.0',
    observations,
    skillState,
    currentLearningState,
    diagnoses,
    teacherDecision: next.decision,
    teacherMove: next.move,
  };
}

export function runNotebookTeacherReplay(fixture, options = {}) {
  if (!fixture || fixture.fixtureId !== 'PRIMARY-MATH-NOTEBOOK-DIVISION-REPLAY-001') {
    throw new Error('Pinned Common division notebook replay fixture is required');
  }
  const observations = observationsFromWorkEvidence(fixture.workEvidence, {
    observedAt: options.observedAt || DEFAULT_REPLAY_TIME,
    sourceStatus: fixture.sourceContext?.sourceStatus || 'VERIFIED',
  });
  const contrast = fixture.contrastSets?.[0];
  const learningObjectId = contrast?.targetLearningObjectId || 'DIV-M6.6';
  const skillState = buildSkillState({ learningObjectId, observations });
  const currentLearningState = buildCurrentLearningState({
    sessionId: options.sessionId || 'SESSION-PHASE4-NOTEBOOK-001',
    learningObjectIds: [learningObjectId],
    observations,
  });
  const diagnoses = diagnosePrimaryEvidence({
    observations,
    contrastSets: fixture.contrastSets || [],
  });
  const next = decideTeacherMove({
    diagnosis: diagnoses[0],
    skillState,
    currentLearningState,
    requiredNextProbe: fixture.requiredNextProbe,
  });

  const strengthEvidenceRefs = (fixture.workEvidence || [])
    .filter((work) => work.finalResponse?.correctness === 'CORRECT'
      || (work.workSteps || []).filter((step) => step.status === 'CORRECT').length >= 2)
    .map((work) => work.workEvidenceId);
  const childProducedStrategyRefs = (fixture.workEvidence || [])
    .filter((work) => (work.strategySupports || []).some((support) => support.role === 'CHILD_PRODUCED'))
    .map((work) => work.workEvidenceId);
  const quantityStructureRefs = (fixture.workEvidence || [])
    .filter((work) => work.quantityStructure)
    .map((work) => work.workEvidenceId);

  return {
    semanticAuthority: 'reallaksh19/Common',
    semanticVersion: fixture.schemaVersion,
    sourceFixtureId: fixture.fixtureId,
    observations,
    skillState,
    currentLearningState: {
      ...currentLearningState,
      strengthEvidenceRefs,
      childProducedStrategyRefs,
      quantityStructureRefs,
    },
    diagnoses,
    teacherDecision: next.decision,
    teacherMove: next.move,
    falsifiers: [...(fixture.falsifiers || [])],
  };
}
