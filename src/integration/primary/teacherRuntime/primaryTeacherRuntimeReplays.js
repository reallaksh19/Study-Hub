import {
  buildCurrentLearningState,
  buildSkillState,
  decideTeacherMove,
  diagnosePrimaryEvidence,
  observationsFromWorkEvidence,
  runNotebookTeacherReplay,
} from './primaryTeacherRuntime.js';

const DEFAULT_TIME = '2026-09-11T08:00:00.000Z';
const HINT_LEVEL = { H0: 0, H1: 1, H2: 2, H3: 3, H4: 4, H5: 5 };

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function correctness(observation) {
  if (typeof observation?.value?.correct === 'boolean') return observation.value.correct ? 'CORRECT' : 'INCORRECT';
  return observation?.value?.correctness
    || observation?.mathematicalWorkEvidence?.finalResponse?.correctness
    || 'NOT_SCORED';
}

function isCorrect(observation) {
  return correctness(observation) === 'CORRECT';
}

function isIncorrect(observation) {
  return correctness(observation) === 'INCORRECT';
}

function asObservation(raw, learningObjectId, index = 0) {
  return {
    observationId: raw.observationId || `OBS-SYN-${index + 1}`,
    learningObjectIds: [...(raw.learningObjectIds || [learningObjectId])],
    kind: raw.kind || 'SYNTHETIC_REPLAY',
    value: {
      correctness: raw.correctness || 'NOT_SCORED',
      routeSignature: raw.routeSignature || `SYNTHETIC:${index + 1}`,
      evidenceRole: raw.evidenceRole || 'PRACTICE',
      ...(raw.errorSignature ? { errorSignature: raw.errorSignature } : {}),
      ...(raw.responseKind ? { responseKind: raw.responseKind } : {}),
      ...(raw.selfCorrected === true ? { selfCorrected: true } : {}),
      ...(raw.languageLoad ? { languageLoad: raw.languageLoad } : {}),
    },
    observedAt: raw.observedAt || new Date(Date.parse(DEFAULT_TIME) + index * 60_000).toISOString(),
    conceptualSupport: clone(raw.conceptualSupport || { level: 'H0', type: 'NONE' }),
    accessAdjustments: [...(raw.accessAdjustments || [])],
    sourceStatus: 'VERIFIED',
  };
}

function buildObservations(scenario) {
  if (scenario.workEvidence) {
    return observationsFromWorkEvidence([scenario.workEvidence], {
      observedAt: DEFAULT_TIME,
      sourceStatus: 'VERIFIED',
    });
  }
  return (scenario.observations || []).map((item, index) => asObservation(item, scenario.learningObjectId, index));
}

function inferDelayedRetention(observations, explicitStatus) {
  if (explicitStatus) return explicitStatus;
  const delayed = observations.filter((item) => item.value?.evidenceRole === 'DELAYED_RETRIEVAL');
  if (!delayed.length) return 'NOT_YET_TESTED';
  return delayed.some(isCorrect) ? 'DEVELOPING' : 'EMERGING';
}

function strengthenReadModel(skillState, observations) {
  const independent = observations.filter((item) => item.value?.evidenceRole === 'INDEPENDENT_RETURN');
  const independentSuccess = independent.filter(isCorrect);
  const independentFailure = independent.filter(isIncorrect);
  const unsupportedIndependent = independentSuccess.filter((item) => item.conceptualSupport?.level === 'H0');
  if (unsupportedIndependent.length >= 3 && independentFailure.length === 0) {
    skillState.learningEvidence.independentUse = 'SECURE';
    skillState.priorIndependentEvidence.status = 'SECURE';
  }
  if (observations.length >= 3 && observations.filter(isIncorrect).length === 0) {
    skillState.learningEvidence.acquisition = 'SECURE';
  }
  return skillState;
}

function languageContrastDiagnosis(observations) {
  const highLanguageFailure = observations.find((item) => item.value?.languageLoad === 'HIGH' && isIncorrect(item));
  const reducedLanguageSuccess = observations.find((item) =>
    item.value?.languageLoad === 'LOW'
      && isCorrect(item)
      && item.accessAdjustments?.includes('REDUCED_LANGUAGE'));
  if (!highLanguageFailure || !reducedLanguageSuccess) return null;
  return {
    diagnosisId: 'DX-LANGUAGE-CONTRAST',
    code: 'LANGUAGE_COMPREHENSION_ERROR',
    confidence: 'MEDIUM',
    evidenceRefs: [highLanguageFailure.observationId, reducedLanguageSuccess.observationId],
    informationNeeded: ['Check the same mathematical target again without increasing conceptual support.'],
  };
}

function conceptContrastDiagnosis(observations) {
  const failures = observations.filter(isIncorrect);
  if (failures.length < 2) return null;
  const signatures = new Set(failures.map((item) => item.value?.errorSignature).filter(Boolean));
  const routes = new Set(failures.map((item) => item.value?.routeSignature).filter(Boolean));
  if (signatures.size !== 1 || routes.size < 2) return null;
  const [errorSignature] = [...signatures];
  return {
    diagnosisId: 'DX-CONCEPT-CONTRAST',
    code: 'CONCEPTUAL_MISCONCEPTION',
    confidence: 'MEDIUM',
    evidenceRefs: failures.map((item) => item.observationId),
    errorSignature,
    informationNeeded: ['Can the learner distinguish an equivalent example from a non-equivalent example after a representation change?'],
  };
}

function delayedRetrievalDiagnosis(observations) {
  const latest = observations.at(-1);
  if (!latest || latest.value?.evidenceRole !== 'DELAYED_RETRIEVAL' || !isIncorrect(latest)) return null;
  const priorIndependentSuccess = observations
    .slice(0, -1)
    .find((item) => item.value?.evidenceRole === 'INDEPENDENT_RETURN' && isCorrect(item));
  if (!priorIndependentSuccess) return null;
  return {
    diagnosisId: 'DX-DELAYED-RETRIEVAL-FAILURE',
    code: 'MEMORY_RETRIEVAL_FAILURE',
    confidence: 'MEDIUM',
    evidenceRefs: [priorIndependentSuccess.observationId, latest.observationId],
    informationNeeded: ['Can a short retrieval cue restore the idea without reteaching the whole concept?'],
  };
}

function diagnoseScenario(observations) {
  return delayedRetrievalDiagnosis(observations)
    || languageContrastDiagnosis(observations)
    || conceptContrastDiagnosis(observations)
    || diagnosePrimaryEvidence({ observations })[0]
    || null;
}

function repeatedDontKnowCount(observations) {
  return observations.filter((item) => item.value?.responseKind === 'DONT_KNOW').length;
}

function fastIndependentReady(skillState, observations) {
  if (skillState.learningEvidence.delayedRetention !== 'SECURE') return false;
  const independent = observations.filter((item) => item.value?.evidenceRole === 'INDEPENDENT_RETURN');
  return independent.length >= 3
    && independent.every(isCorrect)
    && independent.every((item) => item.conceptualSupport?.level === 'H0');
}

function supportFadeReady(observations) {
  const successes = observations.filter(isCorrect);
  if (successes.length < 2) return false;
  const previous = successes.at(-2)?.conceptualSupport?.level || 'H0';
  const latest = successes.at(-1)?.conceptualSupport?.level || 'H0';
  return HINT_LEVEL[previous] > HINT_LEVEL[latest] && HINT_LEVEL[latest] > 0;
}

function feedback(acknowledgement, nextAction) {
  return {
    acknowledgement,
    nextAction,
    policy: 'PRESERVE_CORRECT_THINKING_AND_REQUEST_NEXT_OBSERVABLE_ACTION',
  };
}

function decideExtended({ diagnosis, skillState, currentLearningState, observations, requiredNextProbe }) {
  if (currentLearningState.learnerReportedFatigue) {
    return decideTeacherMove({ diagnosis, skillState, currentLearningState, requiredNextProbe });
  }

  if (supportFadeReady(observations)) {
    return {
      decision: {
        decisionId: 'DEC-FADE-SUPPORT',
        strategy: 'FADE_SUPPORT',
        reasonEvidenceRefs: observations.filter(isCorrect).slice(-2).map((item) => item.observationId),
        rationale: 'Success has continued while conceptual support decreased, so the next turn should remove another layer of help.',
      },
      move: {
        moveId: 'MOVE-FADE-SUPPORT',
        type: 'FADE_SUPPORT',
        expectedChildAction: 'Try one fresh item with H0 conceptual support.',
        feedback: feedback('You kept the idea working with less help.', 'Try the next one without a hint.'),
      },
    };
  }

  const dontKnowCount = repeatedDontKnowCount(observations);
  if (dontKnowCount >= 2) {
    return {
      decision: {
        decisionId: 'DEC-CHANGE-ROUTE-AFTER-DONT-KNOW',
        strategy: 'CHANGE_REPRESENTATION',
        reasonEvidenceRefs: observations.filter((item) => item.value?.responseKind === 'DONT_KNOW').map((item) => item.observationId),
        rationale: 'Repeated no-response through the same verbal/symbolic route requires a materially different route rather than another identical prompt.',
      },
      move: {
        moveId: 'MOVE-CHANGE-ROUTE-AFTER-DONT-KNOW',
        type: 'CHANGE_REPRESENTATION',
        expectedChildAction: 'Choose or use a visual model, then point to one thing you notice before explaining.',
        variation: { dimension: 'REPRESENTATION', from: 'SYMBOLIC_VERBAL', to: 'VISUAL_OR_CONCRETE' },
        feedback: feedback('We will change the way the idea is shown.', 'Use the picture first; words can come after.'),
      },
    };
  }

  if (diagnosis?.code === 'CONCEPTUAL_MISCONCEPTION') {
    return {
      decision: {
        decisionId: 'DEC-CHANGE-REPRESENTATION-CONCEPT',
        strategy: 'CHANGE_REPRESENTATION',
        reasonEvidenceRefs: diagnosis.evidenceRefs,
        rationale: 'The same conceptual error survived more than one representation, so the next move should make the invariant visible rather than repeat the explanation.',
      },
      move: {
        moveId: 'MOVE-CONCEPT-COMPARE',
        type: 'CHANGE_REPRESENTATION',
        expectedChildAction: 'Compare one equivalent and one non-equivalent example and point to what stays the same.',
        followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
        feedback: feedback('The same idea is getting mixed up in more than one form.', 'Compare these two pictures and tell me what must stay the same.'),
      },
    };
  }

  if (diagnosis?.code === 'MEMORY_RETRIEVAL_FAILURE') {
    return {
      decision: {
        decisionId: 'DEC-RETRIEVE-BEFORE-RETEACH',
        strategy: 'REPAIR_PREREQUISITE',
        reasonEvidenceRefs: diagnosis.evidenceRefs,
        rationale: 'Earlier independent success exists, so delayed failure first calls for a small retrieval cue rather than treating the idea as never learned.',
      },
      move: {
        moveId: 'MOVE-RETRIEVE-PRIOR-KNOWLEDGE',
        type: 'RETRIEVE_PRIOR_KNOWLEDGE',
        expectedChildAction: 'Use one short cue to reconstruct the idea, then attempt a fresh delayed item independently.',
        followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
        feedback: feedback('You used this idea independently before.', 'Use one small cue to bring it back, then try a fresh one.'),
      },
    };
  }

  if (diagnosis?.code === 'TASK_INTERPRETATION_ERROR' && diagnosis.errorSignature?.startsWith('UNIT_')) {
    return {
      decision: {
        decisionId: 'DEC-QUANTITY-UNIT-REPRESENTATION',
        strategy: 'CHANGE_REPRESENTATION',
        reasonEvidenceRefs: diagnosis.evidenceRefs,
        rationale: 'The arithmetic alone hides a missing grouped-unit relationship, so expose the quantity-unit chain before any calculation reteach.',
      },
      move: {
        moveId: 'MOVE-SHOW-UNIT-CHAIN',
        type: 'CHANGE_REPRESENTATION',
        expectedChildAction: 'Build the chain quantity → unit → conversion → rate → unknown, then choose the operations.',
        followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
        feedback: feedback('Your multiplication step is visible, but one unit link is missing.', 'Show how dozens become eggs before using the price per egg.'),
      },
    };
  }

  if (!diagnosis && fastIndependentReady(skillState, observations)) {
    return {
      decision: {
        decisionId: 'DEC-BOUNDED-TRANSFER-CHOICE',
        strategy: 'EXTEND_TO_TRANSFER',
        reasonEvidenceRefs: observations.slice(-3).map((item) => item.observationId),
        rationale: 'Repeated unsupported independent success plus secure delayed evidence justifies transfer rather than more same-form practice.',
      },
      move: {
        moveId: 'MOVE-BOUNDED-TRANSFER-CHOICE',
        type: 'OFFER_BOUNDED_CHOICE',
        expectedChildAction: 'Choose one transfer route: explain with a drawing or solve a new-context problem; both must use the same target idea.',
        choices: ['DRAW_AND_EXPLAIN', 'NEW_CONTEXT_PROBLEM'],
        feedback: feedback('You have shown the idea independently in several forms.', 'Choose how you want to stretch it: draw and explain, or solve a new-context problem.'),
      },
    };
  }

  return decideTeacherMove({ diagnosis, skillState, currentLearningState, requiredNextProbe });
}

function bumpConfidence(value) {
  if (value === 'LOW') return 'MEDIUM';
  if (value === 'MEDIUM') return 'HIGH';
  return 'HIGH';
}

function outcomeMatches(rule, results) {
  return Object.entries(rule.when || {}).every(([itemId, expected]) => results[itemId] === expected);
}

export function applyDiagnosticProbeOutcome(diagnosticFixture, results) {
  const hypotheses = clone(diagnosticFixture.competingHypotheses || []);
  const probe = diagnosticFixture.diagnosticProbe;
  if (!probe) throw new Error('DiagnosticProbe is required');
  if (hypotheses.length < 2) throw new Error('DiagnosticProbe requires competing hypotheses');
  const hypothesisIds = new Set(hypotheses.map((item) => item.hypothesisId));
  for (const id of probe.hypothesisIds || []) {
    if (!hypothesisIds.has(id)) throw new Error(`DiagnosticProbe references unknown hypothesis ${id}`);
  }
  const matchedRule = (probe.outcomeRules || []).find((rule) => outcomeMatches(rule, results));
  if (!matchedRule) throw new Error('No DiagnosticProbe outcome rule matches the supplied results');

  if (matchedRule.increasesHypothesis) {
    const target = hypotheses.find((item) => item.hypothesisId === matchedRule.increasesHypothesis);
    if (!target) throw new Error('Outcome rule increases an unknown hypothesis');
    target.confidence = bumpConfidence(target.confidence);
    return {
      probeId: probe.probeId,
      manipulatedFeature: clone(probe.manipulatedFeature),
      controlledLoad: clone(probe.controlledLoad),
      results: clone(results),
      matchedRule: clone(matchedRule),
      updatedHypotheses: hypotheses,
      teacherDecision: {
        decisionId: 'DEC-PROBE-CONFIRMED-NARROW-REPAIR',
        strategy: 'MODEL_ONE_STEP',
        reasonEvidenceRefs: target.evidenceRefs,
        rationale: 'The controlled probe increased one narrow hypothesis, so repair that mechanism only.',
      },
      teacherMove: {
        moveId: 'MOVE-PROBE-CONFIRMED-NARROW-REPAIR',
        type: 'MODEL',
        expectedChildAction: 'After one brief model of the confirmed mechanism, complete a new independent item.',
        followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
      },
    };
  }

  if (matchedRule.keepOpen) {
    return {
      probeId: probe.probeId,
      manipulatedFeature: clone(probe.manipulatedFeature),
      controlledLoad: clone(probe.controlledLoad),
      results: clone(results),
      matchedRule: clone(matchedRule),
      updatedHypotheses: hypotheses,
      teacherDecision: {
        decisionId: 'DEC-PROBE-KEEP-HYPOTHESES-OPEN',
        strategy: 'DIAGNOSE_BEFORE_RETEACH',
        reasonEvidenceRefs: [...new Set(hypotheses.flatMap((item) => item.evidenceRefs || []))],
        rationale: 'The probe did not discriminate the competing explanations; collect one smaller prerequisite observation.',
        evidenceStillNeeded: clone(matchedRule.informationNeeded || []),
      },
      teacherMove: {
        moveId: 'MOVE-PROBE-CHECK-PREREQUISITE',
        type: 'RETRIEVE_PRIOR_KNOWLEDGE',
        expectedChildAction: 'Complete one small fact-retrieval or place-value check before another diagnostic decision.',
      },
    };
  }

  return {
    probeId: probe.probeId,
    manipulatedFeature: clone(probe.manipulatedFeature),
    controlledLoad: clone(probe.controlledLoad),
    results: clone(results),
    matchedRule: clone(matchedRule),
    updatedHypotheses: hypotheses,
    teacherDecision: {
      decisionId: 'DEC-PROBE-CONSIDER-LAPSE-OR-REPAIR',
      strategy: 'GIVE_INDEPENDENT_RETRY',
      reasonEvidenceRefs: [...new Set(hypotheses.flatMap((item) => item.evidenceRefs || []))],
      rationale: 'The controlled probe succeeded, so a fresh independent item is more informative than immediate reteaching.',
    },
    teacherMove: {
      moveId: 'MOVE-PROBE-INDEPENDENT-RETRY',
      type: 'GIVE_INDEPENDENT_TURN',
      expectedChildAction: 'Try one fresh item independently.',
    },
  };
}

function runStandardScenario(scenario, observationsOverride) {
  const observations = observationsOverride || buildObservations(scenario);
  const delayedRetention = inferDelayedRetention(observations, scenario.delayedRetention);
  const skillState = strengthenReadModel(buildSkillState({
    learningObjectId: scenario.learningObjectId,
    observations,
    delayedRetention,
  }), observations);
  const currentLearningState = buildCurrentLearningState({
    sessionId: `SESSION-${scenario.scenarioId}`,
    learningObjectIds: [scenario.learningObjectId],
    observations,
    learnerReportedFatigue: scenario.learnerReportedFatigue === true,
  });
  currentLearningState.repeatedDontKnow = repeatedDontKnowCount(observations);
  const diagnosis = diagnoseScenario(observations);
  const next = decideExtended({
    diagnosis,
    skillState,
    currentLearningState,
    observations,
  });
  return {
    scenarioId: scenario.scenarioId,
    observations,
    skillState,
    currentLearningState,
    diagnoses: diagnosis ? [diagnosis] : [],
    teacherDecision: next.decision,
    teacherMove: next.move,
  };
}

export function runSyntheticReplayScenario(scenario, dependencies = {}) {
  if (scenario.mode === 'COMMON_NOTEBOOK_AND_DIAGNOSTIC') {
    if (!dependencies.notebookFixture || !dependencies.diagnosticFixture) {
      throw new Error('Notebook and diagnostic Common fixtures are required for scenario G');
    }
    const notebookReplay = runNotebookTeacherReplay(dependencies.notebookFixture, {
      sessionId: `SESSION-${scenario.scenarioId}`,
    });
    const probeOutcome = applyDiagnosticProbeOutcome(dependencies.diagnosticFixture, scenario.probeResults || {});
    return {
      scenarioId: scenario.scenarioId,
      notebookReplay,
      probeOutcome,
      diagnoses: notebookReplay.diagnoses,
      teacherDecision: probeOutcome.teacherDecision,
      teacherMove: probeOutcome.teacherMove,
    };
  }

  if (scenario.scenarioId === 'F_DELAYED_RETENTION' && scenario.delayedObservation) {
    const immediate = runStandardScenario(scenario);
    const delayedRaw = scenario.delayedObservation;
    const delayedObservation = asObservation(delayedRaw, scenario.learningObjectId, (scenario.observations || []).length);
    const delayed = runStandardScenario(scenario, [...immediate.observations, delayedObservation]);
    return {
      scenarioId: scenario.scenarioId,
      immediate,
      delayed,
      observations: delayed.observations,
      skillState: delayed.skillState,
      currentLearningState: delayed.currentLearningState,
      diagnoses: delayed.diagnoses,
      teacherDecision: delayed.teacherDecision,
      teacherMove: delayed.teacherMove,
    };
  }

  return runStandardScenario(scenario);
}

export function runSyntheticReplayMatrix(fixture, dependencies = {}) {
  if (!fixture || fixture.fixtureVersion !== '1.0') throw new Error('Synthetic replay fixture v1 is required');
  return {
    fixtureVersion: fixture.fixtureVersion,
    scenarios: (fixture.scenarios || []).map((scenario) => runSyntheticReplayScenario(scenario, dependencies)),
    supportFading: runStandardScenario({
      scenarioId: 'AUX_SUPPORT_FADING',
      ...fixture.auxiliaryReplays.supportFading,
    }),
    stopRule: runStandardScenario({
      scenarioId: 'AUX_STOP_RULE',
      ...fixture.auxiliaryReplays.stopRule,
    }),
  };
}

export function replayGoldenProjection(matrix) {
  const scenarios = {};
  for (const replay of matrix.scenarios || []) {
    if (replay.scenarioId === 'F_DELAYED_RETENTION') {
      scenarios[replay.scenarioId] = {
        immediate: {
          delayedRetention: replay.immediate.skillState.learningEvidence.delayedRetention,
          decisionStrategy: replay.immediate.teacherDecision.strategy,
          moveType: replay.immediate.teacherMove.type,
        },
        delayed: {
          diagnosisCode: replay.delayed.diagnoses[0]?.code || null,
          delayedRetention: replay.delayed.skillState.learningEvidence.delayedRetention,
          decisionStrategy: replay.delayed.teacherDecision.strategy,
          moveType: replay.delayed.teacherMove.type,
        },
      };
      continue;
    }
    if (replay.scenarioId === 'G_NOTEBOOK_CONTRAST_PROBE') {
      const increased = replay.probeOutcome.matchedRule.increasesHypothesis || null;
      scenarios[replay.scenarioId] = {
        diagnosisCode: replay.notebookReplay.diagnoses[0]?.code || null,
        errorSignature: replay.notebookReplay.diagnoses[0]?.errorSignature || null,
        probeId: replay.probeOutcome.probeId,
        increasedHypothesis: increased,
        decisionStrategy: replay.teacherDecision.strategy,
        moveType: replay.teacherMove.type,
      };
      continue;
    }
    scenarios[replay.scenarioId] = {
      diagnosisCode: replay.diagnoses[0]?.code || null,
      errorSignature: replay.diagnoses[0]?.errorSignature || null,
      independentUse: replay.skillState.learningEvidence.independentUse,
      delayedRetention: replay.skillState.learningEvidence.delayedRetention,
      decisionStrategy: replay.teacherDecision.strategy,
      moveType: replay.teacherMove.type,
    };
  }
  return {
    scenarios,
    supportFading: {
      decisionStrategy: matrix.supportFading.teacherDecision.strategy,
      moveType: matrix.supportFading.teacherMove.type,
    },
    stopRule: {
      decisionStrategy: matrix.stopRule.teacherDecision.strategy,
      moveType: matrix.stopRule.teacherMove.type,
    },
  };
}
