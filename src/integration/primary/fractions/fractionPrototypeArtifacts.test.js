import assert from 'node:assert/strict';
import {
  FRACTION_CONTENT_PATH,
  FRACTION_DELAYED_TASK_PATH,
  FRACTION_MISSION_PATH,
  FRACTION_RETURN_TASK_PATH,
  fractionLaunchArtifact,
  fractionMissionResolverArtifact,
} from './fractionPrototypeArtifacts.js';
import {
  FRACTION_QR_ASSET_PATH,
  FRACTION_RETURN_LEARNER_PATH,
  buildFractionReturnPageHtml,
  fractionKaniLaunchUrl,
} from './fractionPhase3Publication.js';

const opaqueId = fractionLaunchArtifact.opaqueId;
const route = fractionMissionResolverArtifact[opaqueId];

assert.ok(route, 'opaque launch token must resolve');
assert.equal(route.missionId, 'KM-G4-FRAC-EQUIV-001');
assert.equal(route.renderer, 'fraction-frenzy');
assert.equal(route.missionPath, FRACTION_MISSION_PATH);
assert.equal(route.contentPath, FRACTION_CONTENT_PATH);
assert.equal(route.returnTaskPath, FRACTION_RETURN_TASK_PATH);
assert.equal(route.delayedRetrievalTaskPath, FRACTION_DELAYED_TASK_PATH);
assert.equal(route.returnLearnerPath, FRACTION_RETURN_LEARNER_PATH);
assert.equal(fractionLaunchArtifact.resolverPath, '/primary/missions/resolver.json');
assert.equal(fractionLaunchArtifact.targetUrl, fractionKaniLaunchUrl);
assert.equal(fractionLaunchArtifact.qrAssetPath, FRACTION_QR_ASSET_PATH);
assert.equal(fractionLaunchArtifact.returnLearnerPath, FRACTION_RETURN_LEARNER_PATH);
assert.match(fractionLaunchArtifact.targetUrl, /#\/primary\/m\/P4FE7K2Q$/);

const resolverPayload = JSON.stringify(fractionMissionResolverArtifact);
for (const forbidden of ['studentId', 'answerIndex', 'correctAnswer', 'masteryState', 'teacherDecision']) {
  assert.equal(resolverPayload.includes(forbidden), false, `resolver must not contain ${forbidden}`);
}

const launchPayload = JSON.stringify(fractionLaunchArtifact);
for (const forbidden of ['studentId', 'answerIndex', 'correctAnswer', 'masteryState', 'teacherDecision']) {
  assert.equal(launchPayload.includes(forbidden), false, `launch artifact must not contain ${forbidden}`);
}

for (const artifactPath of [route.missionPath, route.contentPath, route.returnTaskPath, route.delayedRetrievalTaskPath, route.returnLearnerPath]) {
  assert.match(artifactPath, /^\/primary\//, `${artifactPath} must remain a Primary deployment artifact path`);
}

const returnHtml = buildFractionReturnPageHtml();
assert.match(returnHtml, /Back from the game/);
assert.match(returnHtml, /Riya colours 4\/6 of a strip/);
assert.match(returnHtml, /NOT_YET_TESTED/);
assert.match(returnHtml, /3–7 days later/);
assert.equal(returnHtml.includes('each third can be split into two sixths'), false, 'return page must not expose the model answer');
assert.equal(returnHtml.includes('mastery claim'), true, 'return page should explicitly avoid mastery semantics');

console.log('Primary fraction mission artifact routing and return publication passed.');
