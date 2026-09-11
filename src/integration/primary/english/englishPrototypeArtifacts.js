import {
  englishInferenceKaniMission,
  englishInferenceMissionResolver,
  englishInferenceQrLaunch,
} from './englishInferenceJourney.js';
import {
  ENGLISH_QR_ASSET_PATH,
  ENGLISH_RETURN_LEARNER_PATH,
  englishInferenceKaniLaunchUrl,
} from './englishInferencePublication.js';

export const ENGLISH_CONTENT_PATH = '/primary/english/grade4-inference-text-evidence.content.json';
export const ENGLISH_MISSION_PATH = `/primary/missions/${englishInferenceKaniMission.missionId}.json`;
export const ENGLISH_RETURN_TASK_PATH = '/primary/english/inference-return-task.json';
export const ENGLISH_DELAYED_TASK_PATH = '/primary/english/inference-delayed-retrieval-task.json';

export const englishInferenceMissionResolverArtifact = Object.fromEntries(
  Object.entries(englishInferenceMissionResolver).map(([opaqueId, route]) => [opaqueId, {
    ...route,
    missionPath: ENGLISH_MISSION_PATH,
    contentPath: ENGLISH_CONTENT_PATH,
    returnTaskPath: ENGLISH_RETURN_TASK_PATH,
    delayedRetrievalTaskPath: ENGLISH_DELAYED_TASK_PATH,
    returnLearnerPath: ENGLISH_RETURN_LEARNER_PATH,
  }]),
);

export const englishInferenceLaunchArtifact = {
  ...englishInferenceQrLaunch,
  resolverPath: '/primary/missions/resolver.json',
  targetUrl: englishInferenceKaniLaunchUrl,
  qrAssetPath: ENGLISH_QR_ASSET_PATH,
  returnLearnerPath: ENGLISH_RETURN_LEARNER_PATH,
};
