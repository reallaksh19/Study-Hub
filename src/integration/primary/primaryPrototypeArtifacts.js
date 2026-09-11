import { fractionMissionResolverArtifact } from './fractions/fractionPrototypeArtifacts.js';
import { englishInferenceMissionResolverArtifact } from './english/englishPrototypeArtifacts.js';

export const primaryMissionResolverArtifact = {
  ...fractionMissionResolverArtifact,
  ...englishInferenceMissionResolverArtifact,
};

export function validatePrimaryMissionResolverArtifact() {
  const opaqueIds = Object.keys(primaryMissionResolverArtifact);
  if (opaqueIds.length < 2) return { success: false, error: 'missing_primary_routes' };
  if (!primaryMissionResolverArtifact.P4FE7K2Q) return { success: false, error: 'fraction_route_missing' };
  if (!primaryMissionResolverArtifact.P4EI7Q2K) return { success: false, error: 'english_route_missing' };

  const serialized = JSON.stringify(primaryMissionResolverArtifact);
  for (const forbidden of [
    'studentId',
    'answerIndex',
    'correctAnswer',
    'masteryState',
    'teacherDecision',
    'teacherMove',
    'childProfile',
    'skillState',
  ]) {
    if (serialized.includes(forbidden)) return { success: false, error: `resolver_contains_${forbidden}` };
  }

  return { success: true };
}
