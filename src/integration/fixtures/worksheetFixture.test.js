import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { KaniPageContentSchema } from '../contracts/kaniContracts.js';

const fixtureUrl = new URL('./worksheet-origin-content-v1.json', import.meta.url);
const fixture = JSON.parse(fs.readFileSync(fileURLToPath(fixtureUrl), 'utf8'));
const parsed = KaniPageContentSchema.parse(fixture);

assert.equal(parsed.pageKind, 'worksheet');
assert.equal(parsed.questions.length, 5);
assert.deepEqual(parsed.questions.map((question) => question.type), [
  'mcq',
  'true_false',
  'fill_in_blank',
  'short_answer',
  'multi_select',
]);
assert.equal(new Set(parsed.questions.map((question) => question.id)).size, parsed.questions.length);
assert.ok(parsed.questions.every((question) => question.id && question.skillIds.length > 0));

console.log('Worksheet-origin Kani fixture tests passed');
