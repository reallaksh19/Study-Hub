import createDOMPurify from 'dompurify';

export function sanitizeSvg(svgString) {
  let DOMPurify;
  if (typeof window !== 'undefined') {
    DOMPurify = createDOMPurify(window);
  } else {
    DOMPurify = createDOMPurify();
  }
  return DOMPurify.sanitize(svgString, { USE_PROFILES: { svg: true, svgFilters: true } });
}

export function isSvgSafe(svgString) {
  return sanitizeSvg(svgString) === svgString;
}
