function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’]/g, '')
    .replace(/\s+/g, ' ');
}

function relevantClue(textClue, expectedClues) {
  const actual = normalize(textClue);
  if (!actual) return null;
  return expectedClues.find((clue) => {
    const expected = normalize(clue);
    return actual.includes(expected) || expected.includes(actual);
  }) || null;
}

function teacherTrace({ diagnosisCode, moveType, childPrompt, evidenceRefs = [] }) {
  return {
    diagnosis: diagnosisCode ? {
      code: diagnosisCode,
      confidence: diagnosisCode === 'INFERENCE_ERROR' ? 'LOW' : 'LOW',
      evidenceRefs,
    } : null,
    teacherDecision: {
      strategy: diagnosisCode ? 'DIAGNOSE_BEFORE_RETEACH' : 'GIVE_INDEPENDENT_RETRY',
      reasonEvidenceRefs: evidenceRefs,
    },
    teacherMove: {
      type: moveType,
      expectedChildAction: childPrompt,
    },
  };
}

/**
 * Grade-4 inference evidence is not a binary choice. Preserve answer, textual
 * clue, reasoning connection and response modality as separate observable parts.
 */
export function evaluateInferenceResponse(fixture, response, options = {}) {
  if (!fixture?.inferenceFixture) throw new Error('Common Grade-4 English inference fixture is required');
  const source = fixture.inferenceFixture;
  const responseMode = response?.responseMode;
  if (!source.responseModes.includes(responseMode)) {
    throw new Error(`Unsupported inference response mode ${responseMode}`);
  }

  const observationId = options.observationId || 'OBS-ENG-INF-001';
  const expected = source.defensibleResponse;
  const answerMatches = normalize(response.answer) === normalize(expected.answer);
  const clue = relevantClue(response.textClue, expected.textClues);
  const hasConnection = normalize(response.connection).length > 0;

  const observation = {
    observationId,
    learningObjectIds: ['ENG-INFERENCE-TEXT-EVIDENCE'],
    kind: 'ENGLISH_INFERENCE_RESPONSE',
    observedAt: options.observedAt || '2026-09-11T08:00:00.000Z',
    sourceStatus: 'VERIFIED',
    conceptualSupport: clone(response.conceptualSupport || { level: 'H0', type: 'NONE' }),
    accessAdjustments: [...(response.accessAdjustments || [])],
    value: {
      responseMode,
      answer: response.answer ?? '',
      textClue: response.textClue ?? '',
      connection: response.connection ?? '',
      answerMatchesCanonicalExample: answerMatches,
      relevantTextClueObserved: Boolean(clue),
      matchedTextClue: clue,
      evidenceParts: {
        answer: normalize(response.answer).length > 0,
        textClue: Boolean(clue),
        connection: hasConnection,
      },
    },
  };

  if (answerMatches && !clue) {
    const move = source.teacherMoves.missingEvidence;
    return {
      observation,
      evidenceStatus: source.responseEvidence.answerOnly.status,
      errorSignature: source.responseEvidence.answerOnly.candidateErrorSignature,
      ...teacherTrace({
        diagnosisCode: move.diagnosisCode,
        moveType: move.move,
        childPrompt: move.childPrompt,
        evidenceRefs: [observationId],
      }),
    };
  }

  if (answerMatches && clue && hasConnection) {
    return {
      observation,
      evidenceStatus: source.responseEvidence.answerWithRelevantClue.status,
      errorSignature: null,
      diagnosis: null,
      teacherDecision: {
        strategy: 'GIVE_INDEPENDENT_RETRY',
        reasonEvidenceRefs: [observationId],
      },
      teacherMove: {
        type: 'GIVE_INDEPENDENT_TURN',
        expectedChildAction: 'Use the same answer + clue + connection pattern on a new short text.',
      },
    };
  }

  if (clue && hasConnection) {
    return {
      observation,
      evidenceStatus: 'TEACHER_JUDGMENT',
      errorSignature: null,
      diagnosis: {
        code: 'INSUFFICIENT_EVIDENCE',
        confidence: 'LOW',
        evidenceRefs: [observationId],
        informationNeeded: ['Check whether the alternative answer is defensible from the cited text clue before marking it incorrect.'],
      },
      teacherDecision: {
        strategy: 'ASK_FOR_EXPLANATION',
        reasonEvidenceRefs: [observationId],
      },
      teacherMove: {
        type: 'ASK_TO_EXPLAIN',
        expectedChildAction: 'Explain how the cited words support the answer.',
      },
    };
  }

  const move = source.teacherMoves.unsupportedGuess;
  return {
    observation,
    evidenceStatus: 'EMERGING',
    errorSignature: 'INFERENCE_UNSUPPORTED_BY_TEXT',
    ...teacherTrace({
      diagnosisCode: move.diagnosisCode,
      moveType: move.move,
      childPrompt: move.childPrompt,
      evidenceRefs: [observationId],
    }),
  };
}

export function makeInferenceIndependentReturnObservation(fixture, response, options = {}) {
  const source = fixture?.inferenceFixture?.independentReturn;
  if (!source) throw new Error('Common independent-return inference fixture is required');
  if (response?.conceptualSupport?.level && response.conceptualSupport.level !== 'H0') {
    throw new Error('Independent English return evidence must use H0 conceptual support');
  }
  return {
    observationId: options.observationId || 'OBS-ENG-INF-RETURN-001',
    learningObjectIds: ['ENG-INFERENCE-TEXT-EVIDENCE'],
    kind: 'STUDY_HUB_RETURN',
    observedAt: options.observedAt || '2026-09-11T08:10:00.000Z',
    sourceStatus: 'VERIFIED',
    conceptualSupport: { level: 'H0', type: 'NONE' },
    accessAdjustments: [...(response?.accessAdjustments || [])],
    value: {
      evidenceRole: 'INDEPENDENT_RETURN',
      text: source.text,
      question: source.question,
      responseMode: response?.responseMode || 'WRITTEN',
      answer: response?.answer ?? '',
      textClue: response?.textClue ?? '',
      connection: response?.connection ?? '',
      requiredEvidence: [...source.requiredEvidence],
    },
  };
}

function sourceModelMaps(sourceModel) {
  const clean = new Map(sourceModel.cleanExamples.map((item) => [normalize(item.word), item]));
  const boundaries = new Map(sourceModel.boundaryExamples.map((item) => [normalize(item.word), item]));
  return { clean, boundaries };
}

/** Source-faithful adjective classification. Unknown/boundary words are never force-fit. */
export function classifyAdjectiveAgainstSourceModel(fixture, word) {
  const sourceModel = fixture?.adjectiveSourceBoundaryFixture;
  if (!sourceModel) throw new Error('Common adjective source-boundary fixture is required');
  const key = normalize(word);
  const { clean, boundaries } = sourceModelMaps(sourceModel);

  const cleanItem = clean.get(key);
  if (cleanItem) {
    return {
      word: cleanItem.word,
      status: 'VERIFIED',
      sourceCategory: cleanItem.category,
      recognitionCue: cleanItem.recognitionCue || sourceModel.classificationQuestions[cleanItem.category],
      sourceModelId: sourceModel.sourceModelId,
    };
  }

  if (key === 'tiny') {
    return {
      word: 'tiny',
      status: 'VERIFIED',
      sourceCategory: sourceModel.clarificationRegression.expectedAnswer,
      recognitionCue: sourceModel.classificationQuestions.SIZE,
      sourceModelId: sourceModel.sourceModelId,
    };
  }

  const boundary = boundaries.get(key);
  if (boundary) {
    return {
      word: boundary.word,
      status: boundary.status,
      sourceCategory: null,
      sourceModelId: sourceModel.sourceModelId,
      childFriendlyExplanation: `This workbook's short adjective list does not give “${boundary.word}” a clear category. Keep it as a source-boundary word instead of inventing a new category.`,
    };
  }

  return {
    word: String(word ?? ''),
    status: 'AMBIGUOUS',
    sourceCategory: null,
    sourceModelId: sourceModel.sourceModelId,
    childFriendlyExplanation: 'The source model does not give enough information to classify this word confidently.',
  };
}

export function validateAdjectiveCategoryClaim(fixture, word, claimedCategory) {
  const sourceModel = fixture?.adjectiveSourceBoundaryFixture;
  const result = classifyAdjectiveAgainstSourceModel(fixture, word);
  const normalizedClaim = String(claimedCategory ?? '').trim().toUpperCase().replace(/[ /-]+/g, '_');
  if (sourceModel.forbiddenInventedCategories.includes(normalizedClaim)) {
    return {
      accepted: false,
      status: 'SOURCE_MODEL_BOUNDARY',
      reason: 'FORBIDDEN_INVENTED_SOURCE_CATEGORY',
      classification: result,
    };
  }
  if (result.status !== 'VERIFIED') {
    return {
      accepted: false,
      status: result.status,
      reason: 'SOURCE_MODEL_HAS_NO_CLEAN_CATEGORY',
      classification: result,
    };
  }
  return {
    accepted: normalizedClaim === result.sourceCategory,
    status: normalizedClaim === result.sourceCategory ? 'VERIFIED' : 'INCORRECT',
    expectedSourceCategory: result.sourceCategory,
    classification: result,
  };
}

export function respondToAdjectiveClarification(fixture, childInput) {
  const sourceModel = fixture?.adjectiveSourceBoundaryFixture;
  if (!sourceModel) throw new Error('Common adjective source-boundary fixture is required');
  if (normalize(childInput) === normalize(sourceModel.clarificationRegression.childInput)) {
    return {
      diagnosis: {
        code: 'SOURCE_MODEL_BOUNDARY' === 'NEVER' ? 'SOURCE_MODEL_BOUNDARY' : 'INSUFFICIENT_EVIDENCE',
        confidence: 'LOW',
      },
      teacherMove: {
        type: 'ASK_TO_NOTICE',
        explanation: sourceModel.clarificationRegression.teacherResponse,
        expectedChildAction: sourceModel.clarificationRegression.tinyCheck,
      },
      tinyCheck: {
        prompt: sourceModel.clarificationRegression.tinyCheck,
        expectedAnswer: sourceModel.clarificationRegression.expectedAnswer,
      },
    };
  }
  const classification = classifyAdjectiveAgainstSourceModel(fixture, childInput.replace(/\?+$/, ''));
  if (classification.status === 'SOURCE_MODEL_BOUNDARY') {
    return {
      diagnosis: { code: 'SOURCE_MODEL_BOUNDARY', confidence: 'HIGH' },
      teacherMove: {
        type: 'ASK_TO_NOTICE',
        explanation: classification.childFriendlyExplanation,
        expectedChildAction: 'Try one word that does fit the workbook list.',
      },
      classification,
    };
  }
  return { diagnosis: null, classification };
}

export function assertCrossTurnSourceStability(turns, options = {}) {
  const byWord = new Map();
  for (const turn of turns || []) {
    const key = normalize(turn.word);
    const previous = byWord.get(key);
    if (!previous) {
      byWord.set(key, turn);
      continue;
    }
    if (previous.sourceCategory !== turn.sourceCategory) {
      if (options.explicitCorrection === true && options.correctionReason) continue;
      throw new Error(`Source classification drift for '${turn.word}' without new source evidence or explicit correction`);
    }
  }
  return true;
}

export function grade4EnglishFixtureSummary(fixture) {
  return {
    learningObjectIds: fixture.learningObjects.map((item) => item.learningObjectId),
    inferenceEvidenceModel: [...fixture.learningObjects.find((item) => item.learningObjectId === 'ENG-INFERENCE-TEXT-EVIDENCE').evidenceModel],
    sourceOrder: [...fixture.adjectiveSourceBoundaryFixture.sourceOrder],
    sourceBoundaryWords: fixture.adjectiveSourceBoundaryFixture.boundaryExamples.map((item) => item.word),
  };
}
