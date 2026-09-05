import assert from 'node:assert/strict';
import {
  KANI_SCHEMA_VERSION,
  validateKaniActivityMessage,
  validateKaniAttempt,
  validateKaniCatalog,
  validateKaniQuestion
} from './kaniContracts.js';

const now = '2026-09-05T13:50:00.000Z';

const validQuestion = {
  schemaVersion: KANI_SCHEMA_VERSION,
  id: 'question_fraction_1',
  type: 'mcq',
  prompt: 'Which fraction is greatest?',
  options: ['1/4', '1/2', '1/3', '1/5'],
  answerIndex: 1,
  subjectId: 'subject_math',
  topicId: 'topic_fractions',
  difficulty: 'medium',
  skillIds: ['skill_compare_fractions']
};
assert.equal(validateKaniQuestion(validQuestion).success, true, 'valid MCQ should pass');
assert.equal(validateKaniQuestion({ ...validQuestion, answerIndex: 9 }).success, false, 'out-of-range MCQ answer should fail');
assert.equal(validateKaniQuestion({ ...validQuestion, schemaVersion: '2.0' }).success, false, 'unsupported schema version should fail');

const validCatalog = {
  schemaVersion: KANI_SCHEMA_VERSION,
  publishedAt: now,
  sourceApp: 'study-hub',
  subjects: [{ id: 'subject_math', title: 'Mathematics', order: 1 }],
  topics: [{
    id: 'topic_fractions',
    subjectId: 'subject_math',
    title: 'Fractions',
    difficulty: 'medium',
    conceptTags: ['fractions'],
    pageRefs: ['page_fraction_intro']
  }],
  pages: [{
    id: 'page_fraction_intro',
    topicId: 'topic_fractions',
    subjectId: 'subject_math',
    title: 'Fractions introduction',
    activityType: 'lesson',
    contentUrl: '/Mathematics/fractions/pages/intro.json',
    difficulty: 'medium',
    skillIds: [],
    conceptTags: ['fractions']
  }]
};
assert.equal(validateKaniCatalog(validCatalog).success, true, 'valid catalog should pass');
assert.equal(validateKaniCatalog({ ...validCatalog, sourceApp: 'game-app' }).success, false, 'catalog source must be Study-Hub');

const validCompletedEvent = {
  schemaVersion: KANI_SCHEMA_VERSION,
  type: 'kani.activity.completed',
  launchId: 'launch_1',
  activityId: 'activity_fraction_frenzy',
  payload: {
    studentId: 'student_1',
    attemptId: 'attempt_1',
    activityType: 'game',
    correct: 8,
    total: 10,
    accuracy: 0.8,
    score: 82,
    durationSeconds: 120,
    difficulty: 'medium',
    skillIds: ['skill_compare_fractions'],
    completedAt: now
  }
};
assert.equal(validateKaniActivityMessage(validCompletedEvent).success, true, 'valid activity completion should pass');
assert.equal(validateKaniActivityMessage({ ...validCompletedEvent, launchId: '' }).success, false, 'missing launch id should fail');

const validAttempt = {
  schemaVersion: KANI_SCHEMA_VERSION,
  attemptId: 'attempt_1',
  studentId: 'student_1',
  activityId: 'activity_fraction_frenzy',
  activityType: 'game',
  sourceApp: 'game-app',
  skillIds: ['skill_compare_fractions'],
  difficulty: 'medium',
  partialCredit: 0.8,
  score: 82,
  completedAt: now
};
assert.equal(validateKaniAttempt(validAttempt).success, true, 'valid attempt should pass');
assert.equal(validateKaniAttempt({ ...validAttempt, studentId: '' }).success, false, 'empty student id should fail');
assert.equal(validateKaniAttempt({ ...validAttempt, partialCredit: 1.2 }).success, false, 'partial credit above 1 should fail');
assert.equal(validateKaniAttempt({ ...validAttempt, completedAt: 'yesterday' }).success, false, 'invalid timestamp should fail');

console.log('Kani integration contract tests passed');
