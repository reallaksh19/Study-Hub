import { markdownToBlocks } from './markdownToBlocks.js';

export function runTests() {
  const blocks1 = markdownToBlocks('## Heading\nParagraph text');
  console.assert(blocks1.length === 2, 'markdownToBlocks length 2');
  console.assert(blocks1[0].type === 'heading', 'heading block');
  console.assert(blocks1[0].data.level === 2, 'heading level 2');
  console.assert(blocks1[0].data.text === 'Heading', 'heading text');

  const blocks2 = markdownToBlocks('$$F=ma$$');
  console.assert(blocks2.length === 1, 'math length 1');
  console.assert(blocks2[0].type === 'equation', 'equation block');
  console.assert(blocks2[0].data.latex === 'F=ma', 'equation latex');
  console.assert(blocks2[0].data.displayMode === true, 'equation displayMode');

  const blocks3 = markdownToBlocks('- item1\n- item2');
  console.assert(blocks3.length === 1, 'list length 1');
  console.assert(blocks3[0].type === 'bullets', 'bullets block');
  console.assert(blocks3[0].data.items[0] === 'item1', 'bullet 1');
  console.assert(blocks3[0].data.items[1] === 'item2', 'bullet 2');

  console.log('markdownToBlocks tests passed');
}
runTests();
