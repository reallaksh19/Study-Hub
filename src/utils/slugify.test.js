import { slugify } from './slugify.js';

export function runTests() {
  console.assert(slugify("Components of a Vector!") === "components-of-a-vector", 'slugify 1');
  console.assert(slugify("Newton's 2nd Law") === "newtons-2nd-law", 'slugify 2');
  console.log('slugify tests passed');
}
runTests();
