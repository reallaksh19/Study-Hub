import { KANI_SCHEMA_VERSION } from '../contracts/kaniContracts.js';
import { parseKaniActivityMessage } from './messageValidator.js';
import { isAllowedOrigin } from './originPolicy.js';

function makeLaunchId() {
  if (globalThis.crypto?.randomUUID) return `launch_${globalThis.crypto.randomUUID()}`;
  return `launch_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function createKaniHostSession({
  launchId = makeLaunchId(),
  activityId,
  studentId,
  activityType,
  subjectId,
  topicId,
  pageId,
  skillIds = [],
  difficulty = 'none'
}) {
  if (!activityId || !studentId || !activityType) throw new Error('activityId, studentId and activityType are required');
  return {
    launchId,
    activityId,
    launchMessage: {
      schemaVersion: KANI_SCHEMA_VERSION,
      type: 'kani.activity.launch',
      launchId,
      activityId,
      payload: {
        studentId,
        activityType,
        ...(subjectId ? { subjectId } : {}),
        ...(topicId ? { topicId } : {}),
        ...(pageId ? { pageId } : {}),
        skillIds,
        difficulty
      }
    }
  };
}

export function postKaniLaunch(targetWindow, targetOrigin, session) {
  if (!targetWindow?.postMessage) throw new Error('Target window is unavailable');
  if (!targetOrigin || targetOrigin === '*') throw new Error('An explicit targetOrigin is required');
  targetWindow.postMessage(session.launchMessage, targetOrigin);
}

export function acceptKaniHostEvent({ event, session, allowedOrigins, sourceWindow }) {
  if (!event || !session) return { accepted: false, reason: 'missing_context' };
  if (!isAllowedOrigin(event.origin, allowedOrigins)) return { accepted: false, reason: 'origin_not_allowed' };
  if (sourceWindow && event.source !== sourceWindow) return { accepted: false, reason: 'source_mismatch' };

  let message;
  try {
    message = parseKaniActivityMessage(event.data);
  } catch {
    return { accepted: false, reason: 'invalid_message' };
  }
  if (message.launchId !== session.launchId) return { accepted: false, reason: 'launch_mismatch' };
  if (message.activityId !== session.activityId) return { accepted: false, reason: 'activity_mismatch' };
  if (message.type === 'kani.activity.launch') return { accepted: false, reason: 'unexpected_launch_from_child' };
  return { accepted: true, message };
}

export function completionToAttemptSummary(message) {
  if (message?.type !== 'kani.activity.completed') throw new Error('Completion event required');
  return {
    schemaVersion: KANI_SCHEMA_VERSION,
    attemptId: message.payload.attemptId,
    studentId: message.payload.studentId,
    activityId: message.activityId,
    activityType: message.payload.activityType,
    sourceApp: 'game-app',
    skillIds: message.payload.skillIds || [],
    difficulty: message.payload.difficulty || 'none',
    score: message.payload.score,
    partialCredit: typeof message.payload.accuracy === 'number' ? message.payload.accuracy : undefined,
    completedAt: message.payload.completedAt
  };
}
