import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import { generateBlockId } from './idFactory.js';

function markdownToBlocks(markdownString) {
  const processor = unified().use(remarkParse).use(remarkMath);
  const tree = processor.parse(markdownString);

  const blocks = [];

  tree.children.forEach((node, index) => {
    const id = generateBlockId('paste', index);

    if (node.type === 'heading') {
      const text = markdownString.slice(node.position.start.offset + node.depth + 1, node.position.end.offset).trim();
      blocks.push({
        id,
        type: 'heading',
        data: { text, level: node.depth }
      });
    } else if (node.type === 'paragraph') {
      // Check if it's purely math display
      if (node.children.length === 1 && node.children[0].type === 'inlineMath') {
        const mathNode = node.children[0];
        // if the original text was $$...$$ it should be an equation
        const rawText = markdownString.slice(node.position.start.offset, node.position.end.offset);
        if (rawText.startsWith('$$') && rawText.endsWith('$$')) {
          blocks.push({
            id,
            type: 'equation',
            data: { latex: mathNode.value, displayMode: true }
          });
          return;
        }
      }

      const isImage = node.children.length === 1 && node.children[0].type === 'image';
      if (isImage) {
        const imageNode = node.children[0];
        blocks.push({
          id,
          type: 'image',
          data: { src: imageNode.url, alt: imageNode.alt }
        });
        return;
      }

      const text = markdownString.slice(node.position.start.offset, node.position.end.offset);
      blocks.push({
        id,
        type: 'paragraph',
        data: { text }
      });
    } else if (node.type === 'math') {
      blocks.push({
        id,
        type: 'equation',
        data: { latex: node.value, displayMode: true }
      });
    } else if (node.type === 'list') {
      const items = node.children.map(listItem => {
        // simple extraction - bypass the list formatting
        const textNodes = listItem.children;
        if (textNodes.length > 0 && textNodes[0].type === 'paragraph') {
           return markdownString.slice(textNodes[0].position.start.offset, textNodes[0].position.end.offset);
        }
        return '';
      });
      blocks.push({
        id,
        type: 'bullets',
        data: { items: items.filter(Boolean) }
      });
    } else if (node.type === 'code' && node.lang === 'mermaid') {
      blocks.push({
        id,
        type: 'mermaid',
        data: { code: node.value }
      });
    } else {
      const text = markdownString.slice(node.position.start.offset, node.position.end.offset);
      blocks.push({
        id,
        type: 'paragraph',
        data: { text }
      });
    }
  });

  return blocks;
}

export { markdownToBlocks };
