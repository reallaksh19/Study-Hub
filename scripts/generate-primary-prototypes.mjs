import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fractionEquivalenceQuestions } from '../src/integration/primary/fractions/fractionEquivalenceContent.js';
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
} from '../src/integration/primary/fractions/fractionPrototypeArtifacts.js';
import { buildFractionReturnPageHtml } from '../src/integration/primary/fractions/fractionPhase3Publication.js';
import { englishInferenceQuestions } from '../src/integration/primary/english/englishInferenceContent.js';
import {
  englishInferenceDelayedRetrievalTask,
  englishInferenceEpisodeProjection,
  englishInferenceExperienceManifest,
  englishInferenceKaniMission,
  englishInferenceScopeBasis,
  englishInferenceReturnTask,
} from '../src/integration/primary/english/englishInferenceJourney.js';
import {
  englishInferenceLaunchArtifact,
} from '../src/integration/primary/english/englishPrototypeArtifacts.js';
import { buildEnglishInferenceReturnPageHtml } from '../src/integration/primary/english/englishInferencePublication.js';
import {
  buildEnglishDelayedRetrievalPageHtml,
  buildFractionDelayedRetrievalPageHtml,
} from '../src/integration/primary/observation/delayedRetrievalPublication.js';
import {
  primaryMissionResolverArtifact,
  validatePrimaryMissionResolverArtifact,
} from '../src/integration/primary/primaryPrototypeArtifacts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;

if (!validatePrimaryMissionResolverArtifact().success) {
  throw new Error('Combined Primary mission resolver is invalid');
}

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
  ['public/primary/missions/P4FE7K2Q.launch.json', fractionLaunchArtifact],

  ['public/primary/english/grade4-inference-text-evidence.content.json', {
    schemaVersion: '1.0',
    id: 'page_grade4-reading-inference-primary',
    topicId: 'topic_grade4-reading-inference',
    subjectId: 'english',
    title: 'Grade 4 Inference + Text Evidence — Primary Vertical Slice',
    pageKind: 'lesson',
    grade: 'Grade 4',
    difficulty: 'mixed',
    skillIds: ['skill_inference-text-evidence'],
    conceptTags: ['inference', 'text-evidence', 'primary-phase5'],
    questions: englishInferenceQuestions,
  }],
  ['public/primary/english/inference-episode-projection.json', englishInferenceEpisodeProjection],
  ['public/primary/english/inference-experience-manifest.json', englishInferenceExperienceManifest],
  ['public/primary/english/inference-scope-basis.json', englishInferenceScopeBasis],
  ['public/primary/english/inference-return-task.json', englishInferenceReturnTask],
  ['public/primary/english/inference-delayed-retrieval-task.json', englishInferenceDelayedRetrievalTask],
  ['public/primary/missions/KM-G4-ENG-INFERENCE-001.json', englishInferenceKaniMission],
  ['public/primary/missions/P4EI7Q2K.launch.json', englishInferenceLaunchArtifact],

  ['public/primary/missions/resolver.json', primaryMissionResolverArtifact],
]);

const textOutputs = new Map([
  ['public/primary/return.html', `${buildFractionReturnPageHtml()}\n`],
  ['public/primary/english/inference-return.html', `${buildEnglishInferenceReturnPageHtml()}\n`],
  ['public/primary/fractions/delayed-retrieval.html', `${buildFractionDelayedRetrievalPageHtml()}\n`],
  ['public/primary/english/inference-delayed-retrieval.html', `${buildEnglishDelayedRetrievalPageHtml()}\n`],
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

for (const [qrRelativePath, token] of [
  ['public/primary/fractions/P4FE7K2Q-qr.svg', 'P4FE7K2Q'],
  ['public/primary/english/P4EI7Q2K-qr.svg', 'P4EI7Q2K'],
]) {
  try {
    const qr = await readFile(path.join(root, qrRelativePath), 'utf8');
    if (!qr.includes('<svg') || !qr.includes(token)) mismatches.push(qrRelativePath);
  } catch {
    mismatches.push(qrRelativePath);
  }
}

if (mismatches.length) {
  throw new Error(`Primary prototype artifacts are stale or incomplete: ${mismatches.join(', ')}`);
}

console.log(checkOnly
  ? 'Primary Math + English prototype artifacts match canonical fixtures.'
  : `Generated ${jsonOutputs.size + textOutputs.size} Primary Math + English artifacts and verified printable QRs.`);
