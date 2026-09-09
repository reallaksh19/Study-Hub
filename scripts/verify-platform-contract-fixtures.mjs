import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  KaniPageContentSchema,
  KaniCatalogSchema,
  KaniActivityMessageSchema,
  KaniAttemptSchema,
} from '../src/integration/contracts/kaniContracts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(await readFile(path.join(root, 'integration/fixtures/index.json'), 'utf8'));
const schemas = {
  'kani-content-v1': KaniPageContentSchema,
  'kani-catalog-v1': KaniCatalogSchema,
  'kani-activity-v1': KaniActivityMessageSchema,
  'kani-attempt-v1': KaniAttemptSchema,
};

for (const [id, fixtureSet] of Object.entries(index.fixtures)) {
  const schema = schemas[id];
  if (!schema) throw new Error(`Unknown contract fixture set: ${id}`);
  for (const rel of fixtureSet.valid) {
    const value = JSON.parse(await readFile(path.join(root, rel), 'utf8'));
    const parsed = schema.safeParse(value);
    if (!parsed.success) throw new Error(`${id} valid fixture rejected: ${rel}: ${parsed.error.message}`);
  }
  for (const rel of fixtureSet.invalid) {
    const value = JSON.parse(await readFile(path.join(root, rel), 'utf8'));
    if (schema.safeParse(value).success) throw new Error(`${id} invalid fixture unexpectedly accepted: ${rel}`);
  }
}
console.log('Platform contract fixtures match current runtime validators.');
