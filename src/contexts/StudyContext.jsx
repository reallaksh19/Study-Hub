import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createEmptyLearningState,
  markPageRead,
  recordPageOpen,
  applyQuestionOutcome,
  getResumePageId,
  calculateTopicStats,
  getRevisionQueueForTopic,
  addStudentTag,
  removeStudentTag,
  resolveStudentTag
} from '../services/learningProgressService.js';

const STORAGE_KEY = 'study_hub_learning_state_v1';
const StudyContext = createContext(null);

function ensureMockVectorTag(state) {
  const existingTags = Array.isArray(state.studentTags) ? state.studentTags : [];
  const hasVectorIntroTag = existingTags.some((tag) => tag.pageId === 'physics-vectors-intro');
  if (hasVectorIntroTag) return state;

  return addStudentTag(state, {
    topicId: 'physics-vectors',
    pageId: 'physics-vectors-intro',
    pageTitle: 'Introduction to Vectors',
    note: 'Mock: child tagged this page for parent review.'
  });
}

function loadInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return ensureMockVectorTag(createEmptyLearningState());
    const mergedState = { ...createEmptyLearningState(), ...JSON.parse(stored) };
    return ensureMockVectorTag(mergedState);
  } catch (error) {
    console.warn('Failed to load student learning state', error);
    return ensureMockVectorTag(createEmptyLearningState());
  }
}

export function StudyProvider({ children }) {
  const [state, setState] = useState(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({
    state,
    markPageRead: (topicId, pageId) => setState((prev) => markPageRead(prev, topicId, pageId)),
    recordPageOpen: (topicId, pageId) => setState((prev) => recordPageOpen(prev, topicId, pageId)),
    recordQuestionOutcome: ({ topicId, page, question, result }) => setState((prev) => applyQuestionOutcome(prev, { topicId, page, question, result })),
    addPageRevision: (pageId, reason = 'manual') => setState((prev) => ({
      ...prev,
      revisionQueue: [
        ...prev.revisionQueue.filter((entry) => !(entry.type === 'page' && entry.id === pageId && entry.reason === reason)),
        { type: 'page', id: pageId, reason, priority: 7, updatedAt: new Date().toISOString() }
      ]
    })),
    addDoubt: ({ pageId, conceptId, note }) => setState((prev) => ({
      ...prev,
      doubts: [
        { pageId, conceptId, note, createdAt: new Date().toISOString() },
        ...(prev.doubts || [])
      ].slice(0, 50)
    })),
    addStudentTag: ({ topicId, pageId, pageTitle, note }) => setState((prev) => addStudentTag(prev, { topicId, pageId, pageTitle, note })),
    removeStudentTag: ({ pageId }) => setState((prev) => removeStudentTag(prev, { pageId })),
    resolveStudentTag: ({ tagId, resolutionNote }) => setState((prev) => resolveStudentTag(prev, { tagId, resolutionNote })),
    getResumePageId: (topic) => getResumePageId(topic, state),
    getTopicStats: (topic) => calculateTopicStats(topic, state),
    getRevisionQueueForTopic: (topic) => getRevisionQueueForTopic(topic, state),
    resetLearningState: () => setState(createEmptyLearningState())
  }), [state]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used inside StudyProvider');
  return context;
}
