import { ingestPrimaryEvidenceEnvelope } from '../teacherRuntime/primaryTeacherRuntimeIngestion.js';
import {
  classifyAdjectiveAgainstSourceModel,
  evaluateInferenceResponse,
  respondToAdjectiveClarification,
} from './grade4EnglishVerticalSlice.js';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function correctnessCount(attempts) {
  return (attempts || []).filter((attempt) => attempt.correct === true).length;
}

/**
 * Study-Hub orchestration over Common-owned English semantics. Kani remains a raw
 * evidence producer: game accuracy alone never establishes inference-with-evidence.
 */
export function runEnglishTeacherRuntimeFromEvidenceEnvelope(envelope, fixture, options = {}) {
  if (!fixture?.inferenceFixture) throw new Error('Common Grade-4 English Phase-5 fixture is required');
  const ingested = ingestPrimaryEvidenceEnvelope(envelope);
  const attempts = ingested.attempts.filter((attempt) =>
    attempt.primaryEvidence?.learningObjectIds?.includes('ENG-INFERENCE-TEXT-EVIDENCE'));
  const independentReturn = ingested.nonGameObservations.find((observation) =>
    observation.learningObjectIds?.includes('ENG-INFERENCE-TEXT-EVIDENCE')
      && observation.value?.evidenceRole === 'INDEPENDENT_RETURN');

  const acquisition = attempts.length >= 4
    ? (correctnessCount(attempts) >= Math.ceil(attempts.length * 0.75) ? 'DEVELOPING' : 'EMERGING')
    : 'NOT_OBSERVED';

  if (!independentReturn) {
    return {
      transportMetadata: ingested.transportMetadata,
      learningObjectId: 'ENG-INFERENCE-TEXT-EVIDENCE',
      observations: ingested.observations,
      learningEvidence: {
        acquisition,
        independentUse: 'NOT_YET_TESTED',
        delayedRetention: 'NOT_YET_TESTED',
        transfer: 'NOT_YET_TESTED',
        stretch: 'NOT_YET_TESTED',
      },
      diagnosis: {
        code: 'INSUFFICIENT_EVIDENCE',
        confidence: 'HIGH',
        informationNeeded: ['A fresh non-game response with answer + text clue + connection at H0.'],
      },
      teacherDecision: {
        strategy: 'GIVE_INDEPENDENT_RETRY',
        rationale: 'Game selection evidence does not yet show independent inference with textual evidence.',
      },
      teacherMove: {
        type: 'GIVE_INDEPENDENT_TURN',
        expectedChildAction: 'Complete the non-game return with an answer, one text clue, and the connection.',
      },
    };
  }

  if (independentReturn.conceptualSupport?.level !== 'H0') {
    throw new Error('English independent return evidence must use H0 conceptual support');
  }

  const evaluated = evaluateInferenceResponse(fixture, {
    responseMode: independentReturn.value?.responseMode,
    answer: independentReturn.value?.answer,
    textClue: independentReturn.value?.textClue,
    connection: independentReturn.value?.connection,
    conceptualSupport: independentReturn.conceptualSupport,
    accessAdjustments: independentReturn.accessAdjustments || [],
  }, {
    observationId: independentReturn.observationId,
    observedAt: independentReturn.observedAt,
  });

  const independentUse = evaluated.evidenceStatus === 'DEVELOPING' ? 'DEVELOPING' : 'EMERGING';
  const successfulIndependentReturn = evaluated.diagnosis == null
    && evaluated.evidenceStatus === 'DEVELOPING';

  return {
    transportMetadata: ingested.transportMetadata,
    learningObjectId: 'ENG-INFERENCE-TEXT-EVIDENCE',
    observations: ingested.observations,
    evaluatedReturn: evaluated,
    learningEvidence: {
      acquisition,
      independentUse,
      delayedRetention: 'NOT_YET_TESTED',
      transfer: 'NOT_YET_TESTED',
      stretch: 'NOT_YET_TESTED',
    },
    diagnosis: successfulIndependentReturn ? null : clone(evaluated.diagnosis),
    teacherDecision: successfulIndependentReturn
      ? {
        strategy: 'SCHEDULE_RETRIEVAL',
        reasonEvidenceRefs: [independentReturn.observationId],
        rationale: 'Independent answer + clue + connection is visible now, but delayed retention has not been tested.',
      }
      : clone(evaluated.teacherDecision),
    teacherMove: successfulIndependentReturn
      ? {
        type: 'SCHEDULE_RETRIEVAL',
        expectedChildAction: `Try a fresh inference-with-evidence text ${options.earliestDays || 3}–${options.latestDays || 7} days later.`,
      }
      : clone(evaluated.teacherMove),
  };
}

/**
 * Permanent repeated-clarification regression. Two failed turns through the same
 * verbal source-question route force a materially different representation.
 */
export function replayRepeatedAdjectiveConfusion(fixture, {
  word = 'large',
  sameRouteFailures = 0,
} = {}) {
  const classification = classifyAdjectiveAgainstSourceModel(fixture, word);

  if (classification.status === 'SOURCE_MODEL_BOUNDARY' || classification.status === 'AMBIGUOUS') {
    return {
      diagnosis: {
        code: classification.status === 'SOURCE_MODEL_BOUNDARY' ? 'SOURCE_MODEL_BOUNDARY' : 'INSUFFICIENT_EVIDENCE',
        confidence: classification.status === 'SOURCE_MODEL_BOUNDARY' ? 'HIGH' : 'LOW',
      },
      teacherDecision: {
        strategy: 'DIAGNOSE_BEFORE_RETEACH',
        rationale: 'The supplied source model does not provide a clean category; do not invent one.',
      },
      teacherMove: {
        type: 'ASK_TO_NOTICE',
        expectedChildAction: 'Use one adjective that clearly fits the workbook list, then keep this word marked as a source boundary.',
        explanation: classification.childFriendlyExplanation,
      },
      classification,
    };
  }

  if (sameRouteFailures < 2) {
    if (String(word).trim().toLowerCase() === 'large') {
      const firstRoute = respondToAdjectiveClarification(fixture, 'Large?');
      return {
        ...firstRoute,
        teacherDecision: {
          strategy: 'ASK_FOR_EXPLANATION',
          rationale: 'Use the workbook recognition question once, then require a tiny check for understanding.',
        },
        routeSignature: 'VERBAL_SOURCE_QUESTION:HOW_BIG_OR_SMALL',
      };
    }
    return {
      diagnosis: { code: 'INSUFFICIENT_EVIDENCE', confidence: 'LOW' },
      teacherDecision: {
        strategy: 'ASK_FOR_EXPLANATION',
        rationale: 'Use the workbook classification question and ask for one child response.',
      },
      teacherMove: {
        type: 'ASK_TO_NOTICE',
        explanation: classification.recognitionCue,
        expectedChildAction: `Say which workbook category “${word}” belongs to and why.`,
      },
      routeSignature: 'VERBAL_SOURCE_QUESTION',
      classification,
    };
  }

  return {
    diagnosis: {
      code: 'INSUFFICIENT_EVIDENCE',
      confidence: 'MEDIUM',
      evidencePattern: 'TWO_SAME_ROUTE_FAILURES',
    },
    teacherDecision: {
      strategy: 'CHANGE_REPRESENTATION',
      rationale: 'Two unsuccessful turns through the same verbal classification route require a different teaching dimension.',
    },
    teacherMove: {
      type: 'COMPARE',
      variation: {
        dimension: 'EXAMPLE_NON_EXAMPLE_CONTRAST',
        from: 'VERBAL_SOURCE_QUESTION',
        to: 'WORD_PAIR_SORT',
      },
      explanation: 'Let’s sort instead of repeating the rule. LARGE and TINY answer “How big or small?” OLD and NEW answer “How old or new?”',
      expectedChildAction: 'Point to the pair that belongs under SIZE, then classify “small” using the same question.',
      followUpRequirement: 'INDEPENDENT_RETRY_AFTER_REPAIR',
    },
    routeSignature: 'WORD_PAIR_SORT:SIZE_VS_AGE',
    classification,
  };
}

/** A synthetic, no-personal-data plan that is ready to hand to supervised gate #50. */
export function buildEnglishObservationReadyPlan(fixture) {
  if (!fixture?.adjectiveSourceBoundaryFixture || !fixture?.inferenceFixture) {
    throw new Error('Common Grade-4 English Phase-5 fixture is required');
  }
  return {
    planId: 'OBS-READY-G4-ENGLISH-PHASE5-001',
    grade: 4,
    subject: 'ENGLISH',
    containsRealChildData: false,
    inferenceJourney: {
      learningObjectId: 'ENG-INFERENCE-TEXT-EVIDENCE',
      missionToken: 'P4EI7Q2K',
      missionId: 'KM-G4-ENG-INFERENCE-001',
      timerPolicy: 'OFF',
      gameEvidenceMeaning: 'RECENT_PRACTICE_NOT_MASTERY',
      returnPath: '/primary/english/inference-return.html',
      returnRequiredEvidence: ['ANSWER', 'TEXT_CLUE', 'CONNECTION'],
      responseModeChoice: ['ORAL', 'WRITTEN'],
      conceptualSupportAtReturn: 'H0',
      delayedRetrieval: { status: 'NOT_YET_TESTED', earliestDays: 3, latestDays: 7 },
    },
    adjectiveBoundaryJourney: {
      learningObjectId: 'ENG-ADJECTIVE-ORDER-RECOGNITION',
      sourceModelId: fixture.adjectiveSourceBoundaryFixture.sourceModelId,
      sourceOrder: [...fixture.adjectiveSourceBoundaryFixture.sourceOrder],
      firstClarification: clone(fixture.adjectiveSourceBoundaryFixture.clarificationRegression),
      boundaryWord: 'heavy',
      repeatedConfusionPolicy: 'TWO_SAME_ROUTE_FAILURES_REQUIRE_VARIATION',
    },
    supervisedObservationChecks: [
      'Does the learner rush through the game because it feels scored?',
      'Does the learner return to the non-game task without resistance?',
      'Can the learner give a text clue and connection, not only an answer?',
      'Does oral response reveal understanding that writing load may hide?',
      'Does the Large → SIZE cue transfer to tiny/small?',
      'Does the tutor keep heavy as SOURCE_MODEL_BOUNDARY instead of inventing a category?',
      'After repeated confusion, does the changed route help more than repeating the same wording?',
    ],
  };
}
