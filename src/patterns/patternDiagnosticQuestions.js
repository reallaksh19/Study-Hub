import { PATTERN_SKILL_IDS } from './patternSkillCatalog.js';

export const PATTERN_DIAGNOSTIC_ACTIVITY_ID = 'patterns.diagnostic.initial';

const CONCEPT_TAGS = Object.freeze(['patterns', 'diagnostic-probe']);

export const PATTERN_DIAGNOSTIC_QUESTIONS = Object.freeze([
  mcq(
    'patterns.probe.observe_sequence_order.1',
    PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
    'In the ordered row circle, triangle, square, star, which item is third?',
    ['circle', 'triangle', 'square', 'star'],
    2,
    'Count positions from the left without looking for a pattern rule.'
  ),
  mcq(
    'patterns.probe.observe_sequence_order.2',
    PATTERN_SKILL_IDS.OBSERVE_SEQUENCE_ORDER,
    'In the ordered list 8, 3, 6, 1, which number comes immediately after 3?',
    ['8', '3', '6', '1'],
    2,
    'Read the list in its given order and locate the item after the named one.'
  ),
  mcq(
    'patterns.probe.compare_pattern_attributes.1',
    PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES,
    'Compare red small circle, red large circle, red small circle. Which attribute changes?',
    ['color', 'shape', 'size', 'position only'],
    2,
    'Notice which features stay fixed and which feature is different.'
  ),
  mcq(
    'patterns.probe.compare_pattern_attributes.2',
    PATTERN_SKILL_IDS.COMPARE_PATTERN_ATTRIBUTES,
    'Compare 2 blue stars, 4 blue stars, 6 blue stars. What changes while color and shape stay the same?',
    ['number of stars', 'color', 'shape', 'nothing'],
    0,
    'Compare the groups by one attribute at a time.'
  ),
  mcq(
    'patterns.probe.recognize_repetition.1',
    PATTERN_SKILL_IDS.RECOGNIZE_REPETITION,
    'Which row repeats the same ordered group?',
    ['A, B, A, B, A, B', 'A, B, C, D, E, F', 'A, A, B, C, D, E', 'A, B, C, B, A, D'],
    0,
    'Look for the same ordered block appearing again and again.'
  ),
  mcq(
    'patterns.probe.recognize_repetition.2',
    PATTERN_SKILL_IDS.RECOGNIZE_REPETITION,
    'Which row shows a recurring three-item structure?',
    ['circle, square, triangle, circle, square, triangle', 'circle, square, triangle, star, heart, diamond', 'circle, circle, square, triangle, star, heart', 'circle, square, circle, triangle, square, star'],
    0,
    'Check whether one three-item block returns in the same order.'
  ),
  mcq(
    'patterns.probe.identify_repeating_unit.1',
    PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT,
    'For red, blue, red, blue, red, blue, what is the smallest repeating unit?',
    ['red', 'red, blue', 'red, blue, red', 'blue, red, blue'],
    1,
    'Find the shortest block that can reproduce the whole row when repeated.'
  ),
  mcq(
    'patterns.probe.identify_repeating_unit.2',
    PATTERN_SKILL_IDS.IDENTIFY_REPEATING_UNIT,
    'For circle, square, triangle, circle, square, triangle, what is the smallest repeating unit?',
    ['circle, square', 'circle, square, triangle', 'square, triangle', 'circle, square, triangle, circle'],
    1,
    'Test the shortest candidate block that repeats without changing order.'
  ),
  mcq(
    'patterns.probe.continue_repeating_pattern.1',
    PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
    'Continue the pattern cat, dog, cat, dog, cat, dog, __.',
    ['cat', 'dog', 'bird', 'fish'],
    0,
    'Identify the repeating block, then follow its order for one more term.'
  ),
  mcq(
    'patterns.probe.continue_repeating_pattern.2',
    PATTERN_SKILL_IDS.CONTINUE_REPEATING_PATTERN,
    'Continue the pattern red, red, blue, red, red, blue, __.',
    ['blue', 'red', 'green', 'yellow'],
    1,
    'Track where the visible repeating block starts again.'
  ),
  mcq(
    'patterns.probe.find_missing_repeating_element.1',
    PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
    'Complete A, B, C, A, __, C, A, B, C.',
    ['A', 'B', 'C', 'D'],
    1,
    'Track the repeating cycle across the blank.'
  ),
  mcq(
    'patterns.probe.find_missing_repeating_element.2',
    PATTERN_SKILL_IDS.FIND_MISSING_REPEATING_ELEMENT,
    'Complete 2, 5, 2, 5, 2, __, 2, 5.',
    ['2', '3', '4', '5'],
    3,
    'Use the terms before and after the blank to preserve the repeating cycle.'
  ),
  mcq(
    'patterns.probe.recognize_growing_pattern.1',
    PATTERN_SKILL_IDS.RECOGNIZE_GROWING_PATTERN,
    'Which row grows steadily instead of repeating a fixed unit?',
    ['2, 4, 6, 8', '2, 4, 2, 4', '3, 3, 3, 3', '1, 2, 1, 2'],
    0,
    'Look for a row that keeps changing in one direction rather than cycling.'
  ),
  mcq(
    'patterns.probe.recognize_growing_pattern.2',
    PATTERN_SKILL_IDS.RECOGNIZE_GROWING_PATTERN,
    'Which sequence shows continued growth rather than returning to earlier terms?',
    ['3, 6, 9, 12', '3, 6, 3, 6', '4, 4, 4, 4', '5, 7, 5, 7'],
    0,
    'Compare whether the sequence keeps increasing or cycles through a fixed block.'
  ),
  numeric(
    'patterns.probe.describe_constant_change.1',
    PATTERN_SKILL_IDS.DESCRIBE_CONSTANT_CHANGE,
    'For 4, 7, 10, 13, how much is added at each step?',
    3,
    'Compare the difference between neighboring numbers.'
  ),
  numeric(
    'patterns.probe.describe_constant_change.2',
    PATTERN_SKILL_IDS.DESCRIBE_CONSTANT_CHANGE,
    'For 6, 11, 16, 21, how much is added at each step?',
    5,
    'Check whether the same difference appears between each adjacent pair.'
  ),
  numeric(
    'patterns.probe.continue_additive_number_pattern.1',
    PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
    'Continue 5, 9, 13, 17, __.',
    21,
    'Find the constant change, then apply it once more.'
  ),
  numeric(
    'patterns.probe.continue_additive_number_pattern.2',
    PATTERN_SKILL_IDS.CONTINUE_ADDITIVE_NUMBER_PATTERN,
    'Continue 12, 18, 24, 30, __.',
    36,
    'Compare consecutive terms and extend the same additive change.'
  ),
  mcq(
    'patterns.probe.identify_alternating_rule.1',
    PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
    'For 2, 10, 4, 20, 6, 30, which description matches the two alternating streams?',
    ['Odd positions increase by 2; even positions increase by 10', 'Every term increases by 8', 'Odd positions double; even positions stay fixed', 'The same two numbers repeat'],
    0,
    'Separate the odd-position terms from the even-position terms before comparing them.'
  ),
  mcq(
    'patterns.probe.identify_alternating_rule.2',
    PATTERN_SKILL_IDS.IDENTIFY_ALTERNATING_RULE,
    'For A, 1, B, 2, C, 3, D, 4, which description matches the two alternating streams?',
    ['Letters advance alphabetically while numbers count upward', 'Letters repeat while numbers double', 'Every term follows one numeric rule', 'The same letter-number pair repeats'],
    0,
    'Read the odd positions as one stream and the even positions as another.'
  ),
  numeric(
    'patterns.probe.find_missing_pattern_term.1',
    PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
    'Complete 3, 6, 5, 10, 7, 14, 9, __.',
    18,
    'Compare each neighboring pair and then compare the first terms of the pairs.'
  ),
  numeric(
    'patterns.probe.find_missing_pattern_term.2',
    PATTERN_SKILL_IDS.FIND_MISSING_PATTERN_TERM,
    'Complete 4, 8, 6, 12, 8, 16, 10, __.',
    20,
    'Look for the relationship inside each pair before filling the final value.'
  ),
  mcq(
    'patterns.probe.detect_incorrect_pattern_term.1',
    PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM,
    'In 5, 10, 15, 21, 25, 30, which term breaks the established +5 pattern?',
    ['15', '21', '25', '30'],
    1,
    'Check each term against the same change from the beginning of the sequence.'
  ),
  mcq(
    'patterns.probe.detect_incorrect_pattern_term.2',
    PATTERN_SKILL_IDS.DETECT_INCORRECT_PATTERN_TERM,
    'In 2, 4, 8, 16, 31, 64, which term breaks the established doubling pattern?',
    ['8', '16', '31', '64'],
    2,
    'Apply the same operation from one term to the next and locate the first mismatch.'
  ),
  numeric(
    'patterns.probe.solve_mixed_pattern_reasoning.1',
    PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING,
    'Continue 2, 5, 10, 13, 26, 29, __.',
    58,
    'Check whether two different operations alternate across successive steps.'
  ),
  numeric(
    'patterns.probe.solve_mixed_pattern_reasoning.2',
    PATTERN_SKILL_IDS.SOLVE_MIXED_PATTERN_REASONING,
    'Continue 3, 6, 7, 14, 15, 30, __.',
    31,
    'Compare alternating transitions rather than forcing one operation onto every step.'
  )
]);

export function getPatternDiagnosticQuestionById(id) {
  return PATTERN_DIAGNOSTIC_QUESTIONS.find((question) => question.id === id) ?? null;
}

function mcq(id, skillId, prompt, options, answerIndex, hint) {
  return Object.freeze({
    ...baseQuestion(id, skillId, 'mcq', prompt, hint),
    options: Object.freeze([...options]),
    answerIndex
  });
}

function numeric(id, skillId, prompt, answer, hint) {
  return Object.freeze({
    ...baseQuestion(id, skillId, 'numeric', prompt, hint),
    answer,
    tolerance: 0
  });
}

function baseQuestion(id, skillId, type, prompt, hint) {
  return {
    schemaVersion: '1.0',
    id,
    type,
    prompt,
    skillIds: Object.freeze([skillId]),
    conceptTags: CONCEPT_TAGS,
    difficulty: 'none',
    hint
  };
}
