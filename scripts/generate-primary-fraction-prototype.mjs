import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fractionEquivalenceQuestions,
} from '../src/integration/primary/fractions/fractionEquivalenceContent.js';
import {
  fractionDelayedRetrievalTask,
  fractionEpisodeProjection,
  fractionExperienceManifest,
  fractionKaniMission,
  fractionMissionResolver,
  fractionPrototypeScopeBasis,
  fractionQrLaunch,
  fractionReturnTask,
} from '../src/integration/primary/fractions/fractionEquivalenceJourney.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;

const outputs = new Map([
  ['public/primary/fractions/grade4-fraction-equivalence.content.json', {
    schemaVersion: '1.0',
    id: 'page_grade4-fractions-primary-equivalence',
    topicId: 'topic_grade4-fractions',
    subjectId: 'mathematics',
    title: 'Grade 4 Fraction Equivalence — Primary Vertical Slice',
    pageKind: 'lesson',
    grade: 'Grade 4',
    difficulty: 'mixed',
    skillIds: ['skill_fraction-equivalence'],
    conceptTags: ['equivalent-fractions', 'primary-phase3'],
    questions: fractionEquivalenceQuestions,
  }],
  ['public/primary/fractions/episode-projection.json', fractionEpisodeProjection],
  ['public/primary/fractions/experience-manifest.json', fractionExperienceManifest],
  ['public/primary/fractions/scope-basis.json', fractionPrototypeScopeBasis],
  ['public/primary/fractions/return-task.json', fractionReturnTask],
  ['public/primary/fractions/delayed-retrieval-task.json', fractionDelayedRetrievalTask],
  ['public/primary/missions/KM-G4-FRAC-EQUIV-001.json', fractionKaniMission],
  ['public/primary/missions/resolver.json', fractionMissionResolver],
  ['public/primary/missions/P4FE7K2Q.launch.json', fractionQrLaunch],
]);

const mismatches = [];
for (const [relativePath, value] of outputs) {
  const target = path.join(root, relativePath);
  const expected = stable(value);
  if (checkOnly) {
    let actual = null;
    try {
      actual = await readFile(target, 'utf8');
    } catch {
      // handled below
    }
    if (actual !== expected) mismatches.push(relativePath);
    continue;
  }

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, expected, 'utf8');
}

if (checkOnly && mismatches.length) {
  throw new Error(`Primary fraction prototype artifacts are stale: ${mismatches.join(', ')}`);
}

console.log(checkOnly
  ? 'Primary fraction prototype artifacts match canonical fixture.'
  : `Generated ${outputs.size} Primary fraction prototype artifacts.`);
