import assert from 'node:assert/strict';
import {
  primaryMissionResolverArtifact,
  validatePrimaryMissionResolverArtifact,
} from './primaryPrototypeArtifacts.js';

assert.equal(validatePrimaryMissionResolverArtifact().success, true);
assert.ok(primaryMissionResolverArtifact.P4FE7K2Q, 'fraction route must remain published');
assert.ok(primaryMissionResolverArtifact.P4EI7Q2K, 'English inference route must be published');
assert.equal(primaryMissionResolverArtifact.P4FE7K2Q.missionId, 'KM-G4-FRAC-EQUIV-001');
assert.equal(primaryMissionResolverArtifact.P4EI7Q2K.missionId, 'KM-G4-ENG-INFERENCE-001');
assert.equal(primaryMissionResolverArtifact.P4FE7K2Q.renderer, 'fraction-frenzy');
assert.equal(primaryMissionResolverArtifact.P4EI7Q2K.renderer, 'inference-investigator');

const serialized = JSON.stringify(primaryMissionResolverArtifact);
for (const forbidden of ['studentId', 'answerIndex', 'correctAnswer', 'masteryState', 'teacherDecision', 'teacherMove', 'childProfile', 'skillState']) {
  assert.equal(serialized.includes(forbidden), false, `combined resolver must not contain ${forbidden}`);
}

for (const route of Object.values(primaryMissionResolverArtifact)) {
  assert.match(route.missionPath, /^\/primary\/missions\//);
  assert.match(route.contentPath, /^\/primary\//);
  assert.match(route.returnTaskPath, /^\/primary\//);
  assert.match(route.delayedRetrievalTaskPath, /^\/primary\//);
  assert.match(route.returnLearnerPath, /^\/primary\//);
}

console.log('Combined Primary mission resolver preserves Math + English routing.');
