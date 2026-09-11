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
  fractionPrototypeScopeBasis,
  fractionReturnTask,
} from '../src/integration/primary/fractions/fractionEquivalenceJourney.js';
import {
  fractionLaunchArtifact,
  fractionMissionResolverArtifact,
} from '../src/integration/primary/fractions/fractionPrototypeArtifacts.js';
import {
  buildFractionReturnPageHtml,
} from '../src/integration/primary/fractions/fractionPhase3Publication.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;

const jsonOutputs = new Map([
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
  ['public/primary/missions/resolver.json', fractionMissionResolverArtifact],
  ['public/primary/missions/P4FE7K2Q.launch.json', fractionLaunchArtifact],
]);

const textOutputs = new Map([
  ['public/primary/return.html', `${buildFractionReturnPageHtml()}\n`],
]);

const mismatches = [];
async function writeOrCheck(relativePath, expected) {
  const target = path.join(root, relativePath);
  if (checkOnly) {
    let actual = null;
    try {
      actual = await readFile(target, 'utf8');
    } catch {
      // handled below
    }
    if (actual !== expected) mismatches.push(relativePath);
    return;
  }

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, expected, 'utf8');
}

for (const [relativePath, value] of jsonOutputs) {
  await writeOrCheck(relativePath, stable(value));
}
for (const [relativePath, value] of textOutputs) {
  await writeOrCheck(relativePath, value);
}

const qrRelativePath = 'public/primary/fractions/P4FE7K2Q-qr.svg';
try {
  const qr = await readFile(path.join(root, qrRelativePath), 'utf8');
  if (!qr.includes('<svg') || !qr.includes('P4FE7K2Q')) mismatches.push(qrRelativePath);
} catch {
  mismatches.push(qrRelativePath);
}

if (mismatches.length) {
  throw new Error(`Primary fraction prototype artifacts are stale or incomplete: ${mismatches.join(', ')}`);
}

console.log(checkOnly
  ? 'Primary fraction prototype artifacts match canonical fixture.'
  : `Generated ${jsonOutputs.size + textOutputs.size} Primary fraction prototype artifacts and verified printable QR.`);
