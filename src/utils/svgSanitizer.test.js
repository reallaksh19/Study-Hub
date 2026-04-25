import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeSvg(svgString) {
  return DOMPurify.sanitize(svgString, { USE_PROFILES: { svg: true, svgFilters: true } });
}

function isSvgSafe(svgString) {
  return sanitizeSvg(svgString) === svgString;
}

export function runTests() {
  const unsafe = '<svg><script>alert(1)</script><circle/></svg>';
  const safe = '<svg><circle r="5"/></svg>';

  console.assert(!sanitizeSvg(unsafe).includes('<script'), 'sanitizeSvg strips script');
  console.assert(sanitizeSvg(safe).includes('<circle'), 'sanitizeSvg keeps safe elements');
  console.assert(isSvgSafe('<svg><circle r="5"></circle></svg>') === true, 'isSvgSafe true');
  console.assert(isSvgSafe(unsafe) === false, 'isSvgSafe false');
  console.log('svgSanitizer tests passed');
}
runTests();
