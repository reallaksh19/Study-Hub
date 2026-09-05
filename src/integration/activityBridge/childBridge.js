import { KANI_SCHEMA_VERSION } from '../contracts/kaniContracts.js';
import { parseKaniActivityMessage } from './messageValidator.js';
import { isAllowedOrigin } from './originPolicy.js';

export function createKaniChildBridge({ activityId, launchId, parentWindow, targetOrigin, allowedHostOrigins }) {
  if (!activityId || !launchId) throw new Error('activityId and launchId are required');
  if (!parentWindow?.postMessage) throw new Error('Parent window is unavailable');
  if (!targetOrigin || targetOrigin === '*') throw new Error('An explicit targetOrigin is required');

  const post = (type, payload) => {
    parentWindow.postMessage({
      schemaVersion: KANI_SCHEMA_VERSION,
      type,
      launchId,
      activityId,
      ...(payload === undefined ? {} : { payload })
    }, targetOrigin);
  };

  return {
    postReady: () => post('kani.activity.ready'),
    postStarted: ({ studentId, startedAt = new Date().toISOString() }) => post('kani.activity.started', { studentId, startedAt }),
    postCompleted: (payload) => post('kani.activity.completed', payload),
    postCancelled: ({ studentId, cancelledAt = new Date().toISOString() } = {}) => post('kani.activity.cancelled', { ...(studentId ? { studentId } : {}), cancelledAt }),
    postError: ({ code, message }) => post('kani.activity.error', { code, message }),
    acceptLaunchEvent(event) {
      if (!isAllowedOrigin(event?.origin, allowedHostOrigins)) return { accepted: false, reason: 'origin_not_allowed' };
      if (event.source !== parentWindow) return { accepted: false, reason: 'source_mismatch' };
      let message;
      try {
        message = parseKaniActivityMessage(event.data);
      } catch {
        return { accepted: false, reason: 'invalid_message' };
      }
      if (message.type !== 'kani.activity.launch') return { accepted: false, reason: 'not_launch' };
      if (message.activityId !== activityId || message.launchId !== launchId) return { accepted: false, reason: 'context_mismatch' };
      return { accepted: true, message };
    }
  };
}
