import { KANI_SCHEMA_VERSION, validateKaniQuestion } from '../../contracts/kaniContracts.js';

export const ENGLISH_INFERENCE_LEARNING_OBJECT_ID = 'ENG-INFERENCE-TEXT-EVIDENCE';
export const ENGLISH_INFERENCE_SKILL_ID = 'skill_inference-text-evidence';
export const ENGLISH_TOPIC_ID = 'topic_grade4-reading-inference';
export const ENGLISH_PAGE_ID = 'page_grade4-reading-inference-primary';

const base = {
  schemaVersion: KANI_SCHEMA_VERSION,
  subjectId: 'english',
  topicId: ENGLISH_TOPIC_ID,
  pageId: ENGLISH_PAGE_ID,
  grade: 'Grade 4',
  skillIds: [ENGLISH_INFERENCE_SKILL_ID],
  conceptTags: ['inference', 'text-evidence'],
  curriculumTags: [],
};

/**
 * Canonical question truth for the Phase-5 inference renderer slice.
 * Kani mission payloads reference IDs only; answer truth stays in content.
 */
export const englishInferenceQuestions = [
  {
    ...base,
    id: 'eng-inference-q-101',
    type: 'mcq',
    difficulty: 'easy',
    cognitiveDemand: 'select a supported inference from one explicit clue',
    prompt: 'Lina zipped her coat and pulled on her woollen hat before stepping outside. What can you infer?',
    options: ['It is probably cold outside.', 'She is going swimming.', 'It is lunchtime.', 'She lost her shoes.'],
    answerIndex: 0,
    hint: 'Use what Lina is wearing as your clue.',
    explanation: 'A coat and woollen hat are clues that the weather is probably cold.',
  },
  {
    ...base,
    id: 'eng-inference-q-102',
    type: 'mcq',
    difficulty: 'easy',
    cognitiveDemand: 'identify the text clue that supports an inference',
    prompt: 'Sam kept looking at the clock and had his school bag beside the door. Which clue best supports the inference that he is waiting to leave?',
    options: ['He kept looking at the clock.', 'His name is Sam.', 'There is a door.', 'The sentence uses the word school.'],
    answerIndex: 0,
    hint: 'Choose the clue that shows what Sam is doing while he waits.',
    explanation: 'Repeatedly looking at the clock is evidence that Sam is waiting for a time to arrive.',
  },
  {
    ...base,
    id: 'eng-inference-q-103',
    type: 'mcq',
    difficulty: 'medium',
    cognitiveDemand: 'connect two clues to infer a likely event',
    prompt: 'The lights flickered. A moment later, thunder shook the windows. What is most likely happening?',
    options: ['A storm is nearby.', 'A birthday party has started.', 'The class is taking a test.', 'Someone is baking bread.'],
    answerIndex: 0,
    hint: 'Connect the flickering lights with the thunder.',
    explanation: 'Flickering lights and thunder together support the inference that a storm is nearby.',
  },
  {
    ...base,
    id: 'eng-inference-q-104',
    type: 'mcq',
    difficulty: 'medium',
    cognitiveDemand: 'identify strongest textual evidence for a character inference',
    prompt: 'Nora read the same line three times, rubbed her eyes, and yawned. Which clue best supports the inference that Nora is tired?',
    options: ['She rubbed her eyes and yawned.', 'Her name is Nora.', 'She was reading.', 'The line appeared three times.'],
    answerIndex: 0,
    hint: 'Find the actions that usually happen when someone is tired.',
    explanation: 'Rubbing her eyes and yawning are the strongest text clues that Nora is tired.',
  },
  {
    ...base,
    id: 'eng-inference-q-105',
    type: 'mcq',
    difficulty: 'medium',
    cognitiveDemand: 'reject an unsupported real-world guess',
    prompt: 'A bowl was empty, and crumbs were scattered beside it. Which inference is best supported by the text?',
    options: ['Someone probably ate the food.', 'The bowl is brand new.', 'The kitchen is blue.', 'A dog certainly broke the bowl.'],
    answerIndex: 0,
    hint: 'Choose the answer that the crumbs and empty bowl actually support.',
    explanation: 'An empty bowl plus crumbs supports the inference that food was eaten; the other choices add unsupported details.',
  },
  {
    ...base,
    id: 'eng-inference-q-106',
    type: 'mcq',
    difficulty: 'medium',
    cognitiveDemand: 'match inference to evidence in a new context',
    prompt: 'The playground was shiny with puddles, and children carried closed umbrellas into class. What can you infer?',
    options: ['It rained recently.', 'It is snowing now.', 'The children are at the beach.', 'The school has no roof.'],
    answerIndex: 0,
    hint: 'Use both the puddles and umbrellas.',
    explanation: 'Puddles and umbrellas together support the inference that it rained recently.',
  },
  {
    ...base,
    id: 'eng-inference-return-q-201',
    type: 'long_answer',
    difficulty: 'medium',
    cognitiveDemand: 'independent inference with text evidence and reasoning connection',
    prompt: 'Arun put his library book into his bag before breakfast. At school, his teacher announced that library books were due that morning. Why did Arun put the book in his bag? Give your answer, one text clue, and explain how the clue supports your answer.',
    modelAnswer: 'Arun put the book in his bag because he needed to return it. The clue is that library books were due that morning. If the book was due, taking it to school would let him return it.',
  },
  {
    ...base,
    id: 'eng-inference-delayed-q-301',
    type: 'long_answer',
    difficulty: 'medium',
    cognitiveDemand: 'delayed retrieval and transfer of answer-clue-connection structure',
    prompt: 'Priya heard the school bus turn the corner, grabbed her lunchbox, and hurried to the gate. What can you infer? Give your answer, one text clue, and the connection between them.',
    modelAnswer: 'Priya was getting ready to leave for school. The clue is that she heard the school bus and hurried to the gate. Those actions fit someone trying to catch the bus.',
  },
];

export const englishInferenceMissionQuestionIds = englishInferenceQuestions
  .filter((question) => /^eng-inference-q-10[1-6]$/.test(question.id))
  .map((question) => question.id);

export const englishInferenceReturnQuestionId = 'eng-inference-return-q-201';
export const englishInferenceDelayedQuestionId = 'eng-inference-delayed-q-301';

export function validateEnglishInferenceContent() {
  const failures = englishInferenceQuestions
    .map((question) => ({ id: question.id, result: validateKaniQuestion(question) }))
    .filter(({ result }) => !result.success);
  return failures.length === 0 ? { success: true } : { success: false, failures };
}
