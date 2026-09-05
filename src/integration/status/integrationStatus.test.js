import assert from 'node:assert/strict';
import { resolvePublicUrl, summarizeKaniCatalog, loadKaniIntegrationStatus } from './integrationStatus.js';

const catalog = {
  schemaVersion: '1.0',
  publishedAt: '2026-09-05T14:00:00.000Z',
  sourceApp: 'study-hub',
  subjects: [{ id: 'mathematics', title: 'Mathematics' }],
  topics: [{ id: 'topic_fractions', subjectId: 'mathematics', title: 'Fractions', difficulty: 'medium', conceptTags: [], pageRefs: ['page_fractions'] }],
  pages: [{ id: 'page_fractions', topicId: 'topic_fractions', subjectId: 'mathematics', title: 'Fractions', activityType: 'lesson', contentUrl: '/mathematics/fractions/pages/intro.json', difficulty: 'medium', skillIds: [], conceptTags: [] }]
};

assert.equal(resolvePublicUrl('content/catalog.json', '/Study-Hub/'), '/Study-Hub/content/catalog.json');
assert.deepEqual(summarizeKaniCatalog(catalog), {
  ok: true,
  schemaVersion: '1.0',
  publishedAt: '2026-09-05T14:00:00.000Z',
  subjects: 1,
  topics: 1,
  pages: 1,
  error: null,
});
assert.equal(summarizeKaniCatalog({ ...catalog, schemaVersion: '2.0' }).ok, false);

const okStatus = await loadKaniIntegrationStatus({
  baseUrl: '/Study-Hub/',
  fetchFn: async (url) => {
    assert.equal(url, '/Study-Hub/content/catalog.json');
    return { ok: true, status: 200, json: async () => catalog };
  },
});
assert.equal(okStatus.reachable, true);
assert.equal(okStatus.topics, 1);

const failedStatus = await loadKaniIntegrationStatus({
  baseUrl: '/',
  fetchFn: async () => ({ ok: false, status: 404, json: async () => ({}) }),
});
assert.equal(failedStatus.reachable, false);
assert.match(failedStatus.error, /404/);

console.log('Kani integration status tests passed');
