import { KANI_SCHEMA_VERSION, validateKaniQuestion } from '../../contracts/kaniContracts.js';

export const FRACTION_LEARNING_OBJECT_ID = 'MATH-FRAC-EQUIVALENCE';
export const FRACTION_SKILL_ID = 'skill_fraction-equivalence';
export const FRACTION_TOPIC_ID = 'topic_grade4-fractions';
export const FRACTION_PAGE_ID = 'page_grade4-fractions-primary-equivalence';

const base = {
  schemaVersion: KANI_SCHEMA_VERSION,
  subjectId: 'mathematics',
  topicId: FRACTION_TOPIC_ID,
  pageId: FRACTION_PAGE_ID,
  grade: 'Grade 4',
  skillIds: [FRACTION_SKILL_ID],
  conceptTags: ['equivalent-fractions'],
  curriculumTags: [],
};

/**
 * Canonical question truth for the Phase-3 prototype.
 * Mission/QR payloads may reference these IDs but must never copy answer truth.
 */
export const fractionEquivalenceQuestions = [
  {
    ...base,
    id: 'fraction-equiv-q-101',
    type: 'true_false',
    difficulty: 'easy',
    cognitiveDemand: 'recognise equivalent quantities from partition descriptions',
    prompt: 'One rectangle has 1 of 2 equal parts shaded. Another has 2 of 4 equal parts shaded. Do they show the same amount?',
    answer: true,
    hint: 'Compare the shaded amount, not just the number of pieces.',
    explanation: 'Both pictures show one half of the whole, so 1/2 and 2/4 are equivalent.',
  },
  {
    ...base,
    id: 'fraction-equiv-q-102',
    type: 'mcq',
    difficulty: 'easy',
    cognitiveDemand: 'recognise equivalent fraction',
    prompt: 'Which fraction shows the same amount as 2/3?',
    options: ['3/4', '4/6', '4/5', '2/6'],
    answerIndex: 1,
    hint: 'Ask what happens if each third is split into 2 equal smaller parts.',
    explanation: 'Splitting each third into 2 parts gives 4 shaded sixths, so 2/3 = 4/6.',
  },
  {
    ...base,
    id: 'fraction-equiv-q-103',
    type: 'fill_in_blank',
    difficulty: 'medium',
    cognitiveDemand: 'complete equivalent fraction',
    prompt: 'Complete: 3/6 = __/2',
    acceptedAnswers: [1, '1'],
    caseSensitive: false,
    hint: 'Think about how much of the whole 3 out of 6 parts cover.',
    explanation: 'Three of six equal parts cover half the whole, so 3/6 = 1/2.',
  },
  {
    ...base,
    id: 'fraction-equiv-q-104',
    type: 'multi_select',
    difficulty: 'medium',
    cognitiveDemand: 'classify several equivalent fractions',
    prompt: 'Select every fraction that is equal to 1/2.',
    options: ['2/4', '3/6', '4/8', '3/5'],
    answerIndexes: [0, 1, 2],
    hint: 'For each choice, ask whether the numerator is exactly half the denominator.',
    explanation: '2/4, 3/6 and 4/8 each show one half. 3/5 does not.',
  },
  {
    ...base,
    id: 'fraction-equiv-q-105',
    type: 'true_false',
    difficulty: 'medium',
    cognitiveDemand: 'compare two non-unit equivalent fractions',
    prompt: '2/4 and 3/6 show the same amount of a whole.',
    answer: true,
    hint: 'Try showing each fraction as one half.',
    explanation: 'Both fractions simplify to one half, so they are equivalent.',
  },
  {
    ...base,
    id: 'fraction-equiv-q-106',
    type: 'mcq',
    difficulty: 'medium',
    cognitiveDemand: 'transfer equivalence to a familiar context',
    prompt: 'Asha eats 1/2 of a pizza. Ben eats 4 of 8 equal slices of an identical pizza. Who ate more?',
    options: ['Asha', 'Ben', 'They ate the same amount', 'There is not enough information'],
    answerIndex: 2,
    hint: 'Compare 1/2 with 4/8.',
    explanation: 'Four out of eight equal slices is one half, so they ate the same amount.',
  },
  {
    ...base,
    id: 'fraction-equiv-return-q-201',
    type: 'long_answer',
    difficulty: 'medium',
    cognitiveDemand: 'independent transfer and explanation',
    prompt: 'Riya colours 4/6 of a strip. Omar colours 2/3 of an equal strip. Do they colour the same amount? Explain with words or a quick drawing.',
    modelAnswer: 'Yes. 4/6 and 2/3 are equivalent because each third can be split into two sixths; 2 thirds then become 4 sixths.',
  },
  {
    ...base,
    id: 'fraction-equiv-delayed-q-301',
    type: 'mcq',
    difficulty: 'medium',
    cognitiveDemand: 'delayed retrieval in a fresh number structure',
    prompt: 'Which fraction is equivalent to 3/4?',
    options: ['4/5', '5/8', '6/8', '6/10'],
    answerIndex: 2,
    explanation: 'Multiplying both numerator and denominator of 3/4 by 2 gives 6/8.',
  },
];

export const fractionMissionQuestionIds = fractionEquivalenceQuestions
  .filter((question) => /^fraction-equiv-q-10[1-6]$/.test(question.id))
  .map((question) => question.id);

export const fractionReturnQuestionId = 'fraction-equiv-return-q-201';
export const fractionDelayedQuestionId = 'fraction-equiv-delayed-q-301';

export function validateFractionEquivalenceContent() {
  const failures = fractionEquivalenceQuestions
    .map((question) => ({ id: question.id, result: validateKaniQuestion(question) }))
    .filter(({ result }) => !result.success);
  return failures.length === 0 ? { success: true } : { success: false, failures };
}
