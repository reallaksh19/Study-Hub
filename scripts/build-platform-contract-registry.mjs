import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_SOURCE_GIT_BLOB_SHA,
  CANONICAL_SOURCE_PATH,
  CERTIFIED_BASELINES,
  CONTRACT_IDS,
  SCHEMA_VERSION,
  getContractSchemas,
} from './platformContractSchemas.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const stableSchemaJson = (value) => `${JSON.stringify(value)}\n`;
const gitBlobSha = (bytes) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

const fixtureIndex = {
  manifestVersion: '1.0',
  fixtures: {
    'kani-content-v1': { valid: ['integration/fixtures/valid/kani-content-v1.json'], invalid: ['integration/fixtures/invalid/kani-content-v1.json'] },
    'kani-catalog-v1': { valid: ['integration/fixtures/valid/kani-catalog-v1.json'], invalid: ['integration/fixtures/invalid/kani-catalog-v1.json'] },
    'kani-activity-v1': { valid: ['integration/fixtures/valid/kani-activity-v1.json'], invalid: ['integration/fixtures/invalid/kani-activity-v1.json'] },
    'kani-attempt-v1': { valid: ['integration/fixtures/valid/kani-attempt-v1.json'], invalid: ['integration/fixtures/invalid/kani-attempt-v1.json'] },
  },
};

async function expectedFiles() {
  const schemas = getContractSchemas();
  const files = {};
  const contracts = {};
  for (const id of CONTRACT_IDS) {
    const rel = `integration/contracts/${id}.schema.json`;
    const text = stableSchemaJson(schemas[id]);
    files[rel] = text;
    contracts[id] = { major: 1, schemaVersion: SCHEMA_VERSION, schemaPath: rel, sha256: sha256(text) };
  }
  const manifest = {
    manifestVersion: '1.0',
    contractAuthority: 'reallaksh19/Study-Hub',
    contractSource: { path: CANONICAL_SOURCE_PATH, gitBlobSha: CANONICAL_SOURCE_GIT_BLOB_SHA },
    owners: { content: 'reallaksh19/Study-Hub', learnerRuntime: 'reallaksh19/Kani-Game-App', worksheetAuthoring: null },
    worksheetOnboarding: { status: 'unresolved', governingIssue: 13, rule: 'Do not guess the authoritative Worksheet repository.' },
    certifiedBaselines: CERTIFIED_BASELINES,
    productionGates: { learn: true, practice: false, authenticatedSync: false },
    contracts,
    fixtureIndex: 'integration/fixtures/index.json',
  };
  files['integration/fixtures/index.json'] = stableJson(fixtureIndex);
  files['integration/platform-manifest.json'] = stableJson(manifest);
  return files;
}

async function verifyCanonicalSource() {
  const source = await readFile(path.join(root, CANONICAL_SOURCE_PATH));
  const actual = gitBlobSha(source);
  if (actual !== CANONICAL_SOURCE_GIT_BLOB_SHA) {
    throw new Error(`Canonical contract source drift: ${CANONICAL_SOURCE_PATH} is ${actual}, registry expects ${CANONICAL_SOURCE_GIT_BLOB_SHA}. Update contracts and registry deliberately in one PR.`);
  }
}

async function run() {
  if (check) await verifyCanonicalSource();
  const files = await expectedFiles();
  const mismatches = [];
  for (const [rel, expected] of Object.entries(files)) {
    const abs = path.join(root, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    if (check) {
      let actual = null;
      try { actual = await readFile(abs, 'utf8'); } catch { /* missing */ }
      if (actual !== expected) mismatches.push(rel);
    } else {
      await writeFile(abs, expected);
    }
  }
  if (mismatches.length) {
    throw new Error(`Platform contract registry drift: ${mismatches.join(', ')}. Run npm run build:platform-contracts and commit deterministic outputs.`);
  }
  console.log(check ? 'Platform contract registry is deterministic and source-locked.' : 'Platform contract registry generated.');
}
await run();
