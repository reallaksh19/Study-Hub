import fs from 'node:fs';
import path from 'node:path';
import { buildKaniCatalog } from '../catalog/buildCatalog.js';

function resolveCatalogContentPath(publicDir, contentUrl) {
  const segments = String(contentUrl || '')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
  const resolved = path.resolve(publicDir, ...segments);
  const relative = path.relative(publicDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Catalog content path escapes public directory');
  return resolved;
}

export function createDomainContentService({ publicDir, cacheMs = 1000 } = {}) {
  if (!publicDir) throw new Error('publicDir is required');
  let cache = null;
  let cacheAt = 0;

  function getCatalog({ force = false } = {}) {
    const now = Date.now();
    if (!force && cache && now - cacheAt < cacheMs) return cache;
    cache = buildKaniCatalog({ publicDir, publishedAt: new Date(now).toISOString() });
    cacheAt = now;
    return cache;
  }

  return {
    getCatalog,
    getSubjects() {
      return getCatalog().subjects;
    },
    getTopics(subjectId) {
      const topics = getCatalog().topics;
      return subjectId ? topics.filter((topic) => topic.subjectId === subjectId) : topics;
    },
    getTopic(topicId) {
      return getCatalog().topics.find((topic) => topic.id === topicId) || null;
    },
    getPageMeta(pageId) {
      return getCatalog().pages.find((page) => page.id === pageId) || null;
    },
    getPage(pageId) {
      const pageMeta = this.getPageMeta(pageId);
      if (!pageMeta) return null;
      const filePath = resolveCatalogContentPath(publicDir, pageMeta.contentUrl);
      if (!fs.existsSync(filePath)) throw new Error(`Catalog page file missing: ${pageMeta.contentUrl}`);
      return {
        meta: pageMeta,
        content: JSON.parse(fs.readFileSync(filePath, 'utf8'))
      };
    }
  };
}
