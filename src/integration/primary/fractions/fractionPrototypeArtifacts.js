import {
  fractionKaniMission,
  fractionMissionResolver,
  fractionQrLaunch,
} from './fractionEquivalenceJourney.js';

export const FRACTION_CONTENT_PATH = '/primary/fractions/grade4-fraction-equivalence.content.json';
export const FRACTION_MISSION_PATH = `/primary/missions/${fractionKaniMission.missionId}.json`;
export const FRACTION_RETURN_TASK_PATH = '/primary/fractions/return-task.json';
export const FRACTION_DELAYED_TASK_PATH = '/primary/fractions/delayed-retrieval-task.json';

/**
 * Deployment-facing resolver record. This contains routing metadata only.
 * It never carries learner identity, answer truth or pedagogical judgement.
 */
export const fractionMissionResolverArtifact = Object.fromEntries(
  Object.entries(fractionMissionResolver).map(([opaqueId, route]) => [opaqueId, {
    ...route,
    missionPath: FRACTION_MISSION_PATH,
    contentPath: FRACTION_CONTENT_PATH,
    returnTaskPath: FRACTION_RETURN_TASK_PATH,
    delayedRetrievalTaskPath: FRACTION_DELAYED_TASK_PATH,
  }]),
);

export const fractionLaunchArtifact = {
  ...fractionQrLaunch,
  resolverPath: '/primary/missions/resolver.json',
};
