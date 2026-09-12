import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlUrl = new URL('../../../../public/primary/observation/resume.html', import.meta.url);
const html = await readFile(htmlUrl, 'utf8');

assert.match(html, /Resume an observation/);
assert.match(html, /type="file"/);
assert.match(html, /FileReader/);
assert.match(html, /readAsText/);
assert.match(html, /schemaVersion !== '1\.0'/);
assert.match(html, /guardianSupervised !== true/);
assert.match(html, /MATH-FRACTION-EQUIVALENCE/);
assert.match(html, /ENGLISH-INFERENCE-INVESTIGATOR/);
assert.match(html, /structuredClone\(record\)/);
assert.match(html, /not inserted into the observation record/);
assert.match(html, /\.\.\/fractions\/delayed-retrieval\.html/);
assert.match(html, /\.\.\/english\/inference-delayed-retrieval\.html/);
assert.match(html, /Do not rehearse these items before the valid window/);
assert.match(html, /Completed delayed retrieval must be 3–7 days/);
assert.match(html, /Gate cannot PASS before delayed retrieval is completed/);
assert.match(html, /Gate cannot PASS unless return-to-learning was observed/);
assert.match(html, /Gate cannot PASS without interpretable independent-return evidence/);
assert.match(html, /Gate cannot PASS with an unresolved BLOCKER/);
assert.match(html, /generalEffectivenessClaim = false/);
assert.match(html, /durableChildTraitClaim = false/);
assert.match(html, /new Blob/);
assert.match(html, /URL\.createObjectURL/);

for (const forbidden of [
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon(',
  '<form action=',
  'localStorage.',
  'sessionStorage.',
]) {
  assert.equal(html.includes(forbidden), false, `resume page must not contain ${forbidden}`);
}

for (const key of ['childName', 'school', 'studentId', 'medical', 'diagnosis']) {
  assert.equal(html.includes(`'${key}'`), true, `resume import privacy guard must reject ${key}`);
}

console.log('Supervised observation resume page local continuity, privacy and gate invariants passed.');
