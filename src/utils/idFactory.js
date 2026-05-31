export function generateId(type, ...parts) {
  const suffix = Math.random().toString(36).slice(2, 8);
  const partsStr = parts.length > 0 ? `-${parts.join('-')}` : '';
  return `${type}${partsStr}-${suffix}`;
}

export function generateBlockId(pageId, index) {
  return `${pageId}-b${index}`;
}

export function generateClarifierId(pageId, index) {
  return `${pageId}-cl${index}`;
}

export function generateQuestionId(pageId, index) {
  return `${pageId}-q${index}`;
}
