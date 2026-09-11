import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlUrl = new URL('../../../../public/primary/observation/index.html', import.meta.url);
const html = await readFile(htmlUrl, 'utf8');

assert.match(html, /Gate #50/);
assert.match(html, /No data is sent anywhere/);
assert.match(html, /P4FE7K2Q/);
assert.match(html, /P4EI7Q2K/);
assert.match(html, /MATH-FRACTION-EQUIVALENCE/);
assert.match(html, /ENGLISH-INFERENCE-INVESTIGATOR/);
assert.match(html, /returnedToNonGameTask/);
assert.match(html, /independentReturnProducedInterpretableEvidence/);
assert.match(html, /NOT_YET_TESTED/);
assert.match(html, /Completed delayed retrieval must be 3–7 days/);
assert.match(html, /Gate cannot PASS before delayed retrieval is completed/);
assert.match(html, /Gate cannot PASS with an unresolved BLOCKER/);
assert.match(html, /generalEffectivenessClaim:\s*false/);
assert.match(html, /durableChildTraitClaim:\s*false/);
assert.match(html, /new Blob/);
assert.match(html, /URL\.createObjectURL/);

// The delayed-retrieval handoff must use the canonical fresh tasks and remain locked outside the window.
assert.match(html, /id="initial-session-date"/);
assert.match(html, /not included in exported JSON/);
assert.match(html, /\.\.\/fractions\/delayed-retrieval\.html/);
assert.match(html, /\.\.\/english\/inference-delayed-retrieval\.html/);
assert.match(html, /setDelayedLinksUnlocked/);
assert.match(html, /daysAfter >= 3 && daysAfter <= 7/);
assert.match(html, /Do not rehearse them during the initial session/);
assert.match(html, /plan a valid rerun rather than backfilling retention evidence/);

// The capture page must remain local-only: no network submission path or telemetry API.
for (const forbidden of [
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon(',
  '<form action=',
  'localStorage.',
  'sessionStorage.',
]) {
  assert.equal(html.includes(forbidden), false, `capture page must not contain ${forbidden}`);
}

// Privacy guidance should explicitly reject direct identifiers/sensitive profile data.
for (const phrase of ['child’s name', 'school', 'student ID', 'address', 'medical information', 'diagnosis']) {
  assert.equal(html.includes(phrase), true, `privacy notice must mention ${phrase}`);
}

console.log('Supervised observation capture page privacy, delayed-window handoff and gate invariants passed.');
