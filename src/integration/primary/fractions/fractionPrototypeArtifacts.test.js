import assert from 'node:assert/strict';
import {
  FRACTION_CONTENT_PATH,
  FRACTION_DELAYED_TASK_PATH,
  FRACTION_MISSION_PATH,
  FRACTION_RETURN_TASK_PATH,
  fractionLaunchArtifact,
  fractionMissionResolverArtifact,
} from './fractionPrototypeArtifacts.js';

const opaqueId = fractionLaunchArtifact.opaqueId;
const route = fractionMissionResolverArtifact[opaqueId];

assert.ok(route, 'opaque launch token must resolve');
assert.equal(route.missionId, 'KM-G4-FRAC-EQUIV-001');
assert.equal(route.renderer, 'fraction-frenzy');
assert.equal(route.missionPath, FRACTION_MISSION_PATH);
assert.equal(route.contentPath, FRACTION_CONTENT_PATH);
assert.equal(route.returnTaskPath, FRACTION_RETURN_TASK_PATH);
assert.equal(route.delayedRetrievalTaskPath, FRACTION_DELAYED_TASK_PATH);
assert.equal(fractionLaunchArtifact.resolverPath, '/primary/missions/resolver.json');

const resolverPayload = JSON.stringify(fractionMissionResolverArtifact);
for (const forbidden of ['studentId', 'answerIndex', 'correctAnswer', 'masteryState', 'teacherDecision']) {
  assert.equal(resolverPayload.includes(forbidden), false, `resolver must not contain ${forbidden}`);
}

for (const path of [route.missionPath, route.contentPath, route.returnTaskPath, route.delayedRetrievalTaskPath]) {
  assert.match(path, /^\/primary\//, `${path} must remain a Primary deployment artifact path`);
}

console.log('Primary fraction mission artifact routing passed.');
