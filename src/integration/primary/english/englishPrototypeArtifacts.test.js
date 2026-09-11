import assert from 'node:assert/strict';
import {
  ENGLISH_CONTENT_PATH,
  ENGLISH_DELAYED_TASK_PATH,
  ENGLISH_MISSION_PATH,
  ENGLISH_RETURN_TASK_PATH,
  englishInferenceLaunchArtifact,
  englishInferenceMissionResolverArtifact,
} from './englishPrototypeArtifacts.js';
import {
  ENGLISH_QR_ASSET_PATH,
  ENGLISH_RETURN_LEARNER_PATH,
  buildEnglishInferenceReturnPageHtml,
  englishInferenceKaniLaunchUrl,
} from './englishInferencePublication.js';

const opaqueId = englishInferenceLaunchArtifact.opaqueId;
const route = englishInferenceMissionResolverArtifact[opaqueId];

assert.ok(route, 'English opaque launch token must resolve');
assert.equal(route.missionId, 'KM-G4-ENG-INFERENCE-001');
assert.equal(route.renderer, 'inference-investigator');
assert.equal(route.missionPath, ENGLISH_MISSION_PATH);
assert.equal(route.contentPath, ENGLISH_CONTENT_PATH);
assert.equal(route.returnTaskPath, ENGLISH_RETURN_TASK_PATH);
assert.equal(route.delayedRetrievalTaskPath, ENGLISH_DELAYED_TASK_PATH);
assert.equal(route.returnLearnerPath, ENGLISH_RETURN_LEARNER_PATH);
assert.equal(englishInferenceLaunchArtifact.resolverPath, '/primary/missions/resolver.json');
assert.equal(englishInferenceLaunchArtifact.targetUrl, englishInferenceKaniLaunchUrl);
assert.equal(englishInferenceLaunchArtifact.qrAssetPath, ENGLISH_QR_ASSET_PATH);
assert.equal(englishInferenceLaunchArtifact.returnLearnerPath, ENGLISH_RETURN_LEARNER_PATH);
assert.match(englishInferenceLaunchArtifact.targetUrl, /#\/primary\/m\/P4EI7Q2K$/);

const resolverPayload = JSON.stringify(englishInferenceMissionResolverArtifact);
for (const forbidden of ['studentId', 'answerIndex', 'correctAnswer', 'masteryState', 'teacherDecision']) {
  assert.equal(resolverPayload.includes(forbidden), false, `English resolver must not contain ${forbidden}`);
}

for (const artifactPath of [route.missionPath, route.contentPath, route.returnTaskPath, route.delayedRetrievalTaskPath, route.returnLearnerPath]) {
  assert.match(artifactPath, /^\/primary\//, `${artifactPath} must remain a Primary deployment artifact path`);
}

const returnHtml = buildEnglishInferenceReturnPageHtml();
assert.match(returnHtml, /Inference Investigator/);
assert.match(returnHtml, /ANSWER \+ TEXT CLUE \+ CONNECTION/);
assert.match(returnHtml, /How will you respond\?/);
assert.match(returnHtml, /value="WRITTEN"/);
assert.match(returnHtml, /value="ORAL"/);
assert.match(returnHtml, /My text clue/);
assert.match(returnHtml, /My connection/);
assert.match(returnHtml, /NOT_YET_TESTED/);
assert.match(returnHtml, /3–7 days later/);
assert.equal(returnHtml.includes('Arun put the book in his bag because he needed to return it.'), false, 'return page must not expose the model answer');
assert.equal(returnHtml.includes('mastery claim'), true, 'return page should explicitly avoid mastery semantics');

console.log('Primary English inference artifact routing and return publication passed.');
