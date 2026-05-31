import { generateId, generateBlockId, generateClarifierId, generateQuestionId } from './idFactory.js';

export function runTests() {
  const blockId = generateId('block', 'physics', 'gravity', 'deep-dive');
  console.assert(blockId.startsWith('block-physics-gravity-deep-dive-'), 'generateId format');
  console.assert(generateBlockId('physics-gravity-deep-dive', 3) === 'physics-gravity-deep-dive-b3', 'generateBlockId');
  console.assert(generateClarifierId('page1', 1) === 'page1-cl1', 'generateClarifierId');
  console.assert(generateQuestionId('page1', 1) === 'page1-q1', 'generateQuestionId');
  console.log('idFactory tests passed');
}
runTests();
