import assert from 'node:assert/strict';
import { createKaniHostSession, acceptKaniHostEvent, completionToAttemptSummary, postKaniLaunch } from './hostBridge.js';
import { createKaniChildBridge } from './childBridge.js';

const session = createKaniHostSession({
  launchId: 'launch_test',
  activityId: 'activity_fraction_frenzy',
  studentId: 'student_1',
  activityType: 'game',
  topicId: 'topic_fractions',
  skillIds: ['skill_compare_fractions'],
  difficulty: 'medium'
});

const sourceWindow = { postMessage() {} };
const completedMessage = {
  schemaVersion: '1.0',
  type: 'kani.activity.completed',
  launchId: 'launch_test',
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
    completedAt: '2026-09-05T14:00:00.000Z'
  }
};

{
  const result = acceptKaniHostEvent({
    event: { origin: 'https://game.example', source: sourceWindow, data: completedMessage },
    session,
    allowedOrigins: ['https://game.example'],
    sourceWindow
  });
  assert.equal(result.accepted, true);
  assert.equal(result.message.type, 'kani.activity.completed');
  const attempt = completionToAttemptSummary(result.message);
  assert.equal(attempt.studentId, 'student_1');
  assert.equal(attempt.partialCredit, 0.8);
}

{
  const result = acceptKaniHostEvent({
    event: { origin: 'https://evil.example', source: sourceWindow, data: completedMessage },
    session,
    allowedOrigins: ['https://game.example'],
    sourceWindow
  });
  assert.deepEqual(result, { accepted: false, reason: 'origin_not_allowed' });
}

{
  const result = acceptKaniHostEvent({
    event: { origin: 'https://game.example', source: sourceWindow, data: { nope: true } },
    session,
    allowedOrigins: ['https://game.example'],
    sourceWindow
  });
  assert.deepEqual(result, { accepted: false, reason: 'invalid_message' });
}

{
  const result = acceptKaniHostEvent({
    event: { origin: 'https://game.example', source: sourceWindow, data: { ...completedMessage, launchId: 'wrong' } },
    session,
    allowedOrigins: ['https://game.example'],
    sourceWindow
  });
  assert.deepEqual(result, { accepted: false, reason: 'launch_mismatch' });
}

{
  const result = acceptKaniHostEvent({
    event: { origin: 'https://game.example', source: sourceWindow, data: { ...completedMessage, activityId: 'wrong' } },
    session,
    allowedOrigins: ['https://game.example'],
    sourceWindow
  });
  assert.deepEqual(result, { accepted: false, reason: 'activity_mismatch' });
}

{
  let posted = null;
  const target = { postMessage(message, origin) { posted = { message, origin }; } };
  postKaniLaunch(target, 'https://game.example', session);
  assert.equal(posted.origin, 'https://game.example');
  assert.equal(posted.message.type, 'kani.activity.launch');
  assert.throws(() => postKaniLaunch(target, '*', session), /explicit targetOrigin/);
}

{
  const sent = [];
  const parentWindow = { postMessage(message, origin) { sent.push({ message, origin }); } };
  const child = createKaniChildBridge({
    activityId: 'activity_fraction_frenzy',
    launchId: 'launch_test',
    parentWindow,
    targetOrigin: 'https://study.example',
    allowedHostOrigins: ['https://study.example']
  });
  child.postReady();
  assert.equal(sent[0].message.type, 'kani.activity.ready');
  assert.equal(sent[0].origin, 'https://study.example');

  const accepted = child.acceptLaunchEvent({
    origin: 'https://study.example',
    source: parentWindow,
    data: session.launchMessage
  });
  assert.equal(accepted.accepted, true);
}

console.log('Kani activity bridge tests passed');
