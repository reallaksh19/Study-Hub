import assert from 'node:assert/strict';
import {
  englishInferenceDelayedQuestionId,
  englishInferenceQuestions,
} from '../english/englishInferenceContent.js';
import {
  fractionDelayedQuestionId,
  fractionEquivalenceQuestions,
} from '../fractions/fractionEquivalenceContent.js';
import {
  ENGLISH_DELAYED_RETRIEVAL_LEARNER_PATH,
  FRACTION_DELAYED_RETRIEVAL_LEARNER_PATH,
  buildEnglishDelayedRetrievalPageHtml,
  buildFractionDelayedRetrievalPageHtml,
} from './delayedRetrievalPublication.js';

const mathQuestion = fractionEquivalenceQuestions.find((item) => item.id === fractionDelayedQuestionId);
const englishQuestion = englishInferenceQuestions.find((item) => item.id === englishInferenceDelayedQuestionId);
const mathHtml = buildFractionDelayedRetrievalPageHtml();
const englishHtml = buildEnglishDelayedRetrievalPageHtml();

assert.equal(FRACTION_DELAYED_RETRIEVAL_LEARNER_PATH, '/primary/fractions/delayed-retrieval.html');
assert.equal(ENGLISH_DELAYED_RETRIEVAL_LEARNER_PATH, '/primary/english/inference-delayed-retrieval.html');

assert.ok(mathQuestion);
assert.ok(englishQuestion);
assert.match(mathHtml, new RegExp(mathQuestion.prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(englishHtml, new RegExp(englishQuestion.prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(mathHtml, /use this only 3–7 days after/i);
assert.match(englishHtml, /use this only 3–7 days after/i);
assert.match(mathHtml, /do not turn one item into a mastery claim/i);
assert.match(englishHtml, /Observer judgement required/i);
assert.match(englishHtml, /not automatically “correct”/i);

// Learner-facing pages must not disclose canonical model explanations/answers as visible feedback.
assert.equal(mathHtml.includes(mathQuestion.explanation), false);
assert.equal(englishHtml.includes(englishQuestion.modelAnswer), false);

// Operational pages stay local-only; observation/result data is not submitted anywhere.
for (const html of [mathHtml, englishHtml]) {
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'sendBeacon(', '<form action=', 'localStorage.', 'sessionStorage.']) {
    assert.equal(html.includes(forbidden), false, `delayed retrieval page must not contain ${forbidden}`);
  }
}

console.log('Gate #50 canonical delayed-retrieval learner pages passed.');
