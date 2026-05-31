import { validatePage, validateTopic } from './contentPackSchema.js';

export function runTests() {
  const badPage = {};
  const resBad = validatePage(badPage);
  console.assert(!resBad.success, 'validatePage fails on empty obj');

  const goodPage = { id: 'x', topicId: 'y', title: 'z', blocks: [], clarifiers: [], questions: [] };
  const resGood = validatePage(goodPage);
  console.assert(resGood.success, 'validatePage succeeds on valid obj');

  console.log('contentPackSchema tests passed');
}
runTests();
