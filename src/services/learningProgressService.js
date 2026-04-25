export const DEFAULT_MASTERY = 0.5;

export function createEmptyLearningState() {
  return {
    topicProgress: {},
    pageProgress: {},
    questionAttempts: {},
    conceptMastery: {},
    revisionQueue: [],
    doubts: [],
    studentTags: []
  };
}

export function normalizeTopicId(topicOrId) {
  return typeof topicOrId === 'string' ? topicOrId : topicOrId?.id;
}

export function getPageProgress(state, pageId) {
  return state.pageProgress?.[pageId] || { read: false, mastery: DEFAULT_MASTERY, attemptCount: 0 };
}

export function getQuestionAttempt(state, questionId) {
  return state.questionAttempts?.[questionId] || { attempts: 0, correctCount: 0, lastCorrect: undefined };
}

export function isPageUnlocked(page, state) {
  const prereqs = page?.prerequisitePageIds || [];
  return prereqs.every((id) => Boolean(getPageProgress(state, id).read));
}

export function getNextRecommendedPage(topic, state) {
  const pages = topic?.pages || [];
  const unreadUnlocked = pages.find((page) => !getPageProgress(state, page.id).read && isPageUnlocked(page, state));
  if (unreadUnlocked) return unreadUnlocked;

  const weakest = pages
    .map((page) => ({ page, mastery: getPageProgress(state, page.id).mastery ?? DEFAULT_MASTERY }))
    .sort((a, b) => a.mastery - b.mastery)[0];

  return weakest?.page || pages[0] || null;
}

export function getResumePageId(topic, state) {
  const topicId = normalizeTopicId(topic);
  const recent = state.topicProgress?.[topicId]?.lastOpenedPageId;
  return recent || getNextRecommendedPage(topic, state)?.id || null;
}

export function calculateTopicStats(topic, state) {
  const pages = topic?.pages || [];
  const totalPages = pages.length;
  const readPages = pages.filter((page) => getPageProgress(state, page.id).read).length;
  const averageMastery = totalPages === 0 ? DEFAULT_MASTERY : pages.reduce((sum, page) => {
    return sum + (getPageProgress(state, page.id).mastery ?? DEFAULT_MASTERY);
  }, 0) / totalPages;

  const revisionNeededCount = pages.filter((page) => getPageProgress(state, page.id).needsRevision).length;

  return {
    totalPages,
    readPages,
    completionPct: totalPages === 0 ? 0 : Math.round((readPages / totalPages) * 100),
    averageMastery,
    revisionNeededCount
  };
}

export function getPageConceptTags(page) {
  const direct = page?.conceptTags || [];
  const questionTags = (page?.questions || []).flatMap((question) => question.conceptTags || []);
  return [...new Set([...direct, ...questionTags])];
}

export function computeNextMastery(previous = DEFAULT_MASTERY, isCorrect) {
  const delta = isCorrect ? 0.08 : -0.12;
  return Math.max(0, Math.min(1, previous + delta));
}

function upsertRevisionEntry(queue, entry) {
  const existing = queue.find((item) => item.type === entry.type && item.id === entry.id && item.reason === entry.reason);
  if (existing) {
    return queue.map((item) => item === existing ? { ...item, priority: Math.max(item.priority, entry.priority), updatedAt: entry.updatedAt } : item);
  }
  return [...queue, entry];
}

export function buildQuestionResultPayload(question, result = {}) {
  const normalizedStatus = result.status || 'submitted';
  return {
    status: normalizedStatus,
    isCorrect: normalizedStatus === 'correct',
    answer: result.answer,
    value: result.value,
    explored: normalizedStatus === 'explored',
    manualNeedsRevision: result.manualNeedsRevision || false
  };
}

export function applyQuestionOutcome(state, { topicId, page, question, result }) {
  const nextState = structuredClone(state);
  const pageId = page.id;
  const questionId = question.id;
  const now = new Date().toISOString();
  const payload = buildQuestionResultPayload(question, result);

  const attempt = getQuestionAttempt(nextState, questionId);
  nextState.questionAttempts[questionId] = {
    attempts: attempt.attempts + 1,
    correctCount: attempt.correctCount + (payload.isCorrect ? 1 : 0),
    lastCorrect: payload.isCorrect,
    lastAttemptAt: now
  };

  const pageProgress = getPageProgress(nextState, pageId);
  const nextPageMastery = payload.explored ? pageProgress.mastery ?? DEFAULT_MASTERY : computeNextMastery(pageProgress.mastery ?? DEFAULT_MASTERY, payload.isCorrect);
  nextState.pageProgress[pageId] = {
    ...pageProgress,
    attemptCount: (pageProgress.attemptCount || 0) + 1,
    quizScore: payload.isCorrect ? ((pageProgress.quizScore || 0) + 1) : (pageProgress.quizScore || 0),
    mastery: nextPageMastery,
    needsRevision: payload.manualNeedsRevision || (!payload.isCorrect && !payload.explored)
  };

  const conceptTags = question.conceptTags?.length ? question.conceptTags : getPageConceptTags(page);
  conceptTags.forEach((tag) => {
    const previous = nextState.conceptMastery[tag]?.mastery ?? DEFAULT_MASTERY;
    nextState.conceptMastery[tag] = {
      mastery: payload.explored ? previous : computeNextMastery(previous, payload.isCorrect),
      evidenceCount: (nextState.conceptMastery[tag]?.evidenceCount || 0) + 1,
      lastUpdatedAt: now
    };

    if (!payload.isCorrect) {
      nextState.revisionQueue = upsertRevisionEntry(nextState.revisionQueue, {
        type: 'concept',
        id: tag,
        reason: 'wrong_answer',
        priority: 8,
        updatedAt: now
      });
    }
  });

  if (!payload.isCorrect && !payload.explored) {
    nextState.revisionQueue = upsertRevisionEntry(nextState.revisionQueue, {
      type: 'page',
      id: pageId,
      reason: 'wrong_answer',
      priority: 10,
      updatedAt: now
    });
  }

  nextState.topicProgress[topicId] = {
    ...(nextState.topicProgress[topicId] || {}),
    started: true,
    completed: false,
    lastOpenedPageId: pageId,
    lastOpenedAt: now
  };

  return nextState;
}

export function markPageRead(state, topicId, pageId) {
  const nextState = structuredClone(state);
  const now = new Date().toISOString();
  nextState.pageProgress[pageId] = {
    ...getPageProgress(nextState, pageId),
    read: true,
    completedAt: now,
    mastery: Math.max(getPageProgress(nextState, pageId).mastery ?? DEFAULT_MASTERY, 0.65)
  };
  nextState.topicProgress[topicId] = {
    ...(nextState.topicProgress[topicId] || {}),
    started: true,
    lastOpenedPageId: pageId,
    lastOpenedAt: now,
    pageOrderVisited: Array.from(new Set([...(nextState.topicProgress[topicId]?.pageOrderVisited || []), pageId]))
  };
  return nextState;
}

export function recordPageOpen(state, topicId, pageId) {
  const nextState = structuredClone(state);
  nextState.topicProgress[topicId] = {
    ...(nextState.topicProgress[topicId] || {}),
    started: true,
    lastOpenedPageId: pageId,
    lastOpenedAt: new Date().toISOString(),
    pageOrderVisited: Array.from(new Set([...(nextState.topicProgress[topicId]?.pageOrderVisited || []), pageId]))
  };
  return nextState;
}

export function getRevisionQueueForTopic(topic, state) {
  const pageIds = new Set((topic?.pages || []).map((page) => page.id));
  return (state.revisionQueue || []).filter((entry) => entry.type !== 'page' || pageIds.has(entry.id));
}

export function addStudentTag(state, { topicId, pageId, pageTitle, note }) {
  const nextState = structuredClone(state);
  const now = new Date().toISOString();
  const nextTag = {
    id: `student-tag-${pageId}`,
    topicId,
    pageId,
    pageTitle: String(pageTitle || pageId),
    note: String(note || ''),
    status: 'open',
    createdAt: now,
    updatedAt: now
  };

  const existingTags = Array.isArray(nextState.studentTags) ? nextState.studentTags : [];
  const withoutPageTag = existingTags.filter((tag) => tag.pageId !== pageId);
  nextState.studentTags = [nextTag, ...withoutPageTag];
  return nextState;
}

export function removeStudentTag(state, { pageId }) {
  const nextState = structuredClone(state);
  const existingTags = Array.isArray(nextState.studentTags) ? nextState.studentTags : [];
  nextState.studentTags = existingTags.filter((tag) => tag.pageId !== pageId);
  return nextState;
}

export function resolveStudentTag(state, { tagId, resolutionNote }) {
  const nextState = structuredClone(state);
  const existingTags = Array.isArray(nextState.studentTags) ? nextState.studentTags : [];
  const now = new Date().toISOString();

  nextState.studentTags = existingTags.map((tag) => {
    if (tag.id !== tagId) return tag;
    return {
      ...tag,
      status: 'closed',
      resolutionNote: String(resolutionNote || ''),
      resolvedAt: now,
      updatedAt: now
    };
  });

  return nextState;
}
