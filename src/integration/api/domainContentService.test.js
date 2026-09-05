import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDomainContentService } from './domainContentService.js';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kani-domain-api-'));
const publicDir = path.join(root, 'public');
try {
  writeJson(path.join(publicDir, 'Mathematics', 'subject.json'), { id: 'mathematics', title: 'Mathematics' });
  writeJson(path.join(publicDir, 'Mathematics', 'fractions', 'topic.json'), {
    id: 'math-fractions',
    subjectId: 'mathematics',
    title: 'Fractions',
    difficulty: 'medium',
    pages: [{ id: 'page-fractions-intro', file: 'pages/intro.json', title: 'Intro' }]
  });
  writeJson(path.join(publicDir, 'Mathematics', 'fractions', 'pages', 'intro.json'), {
    id: 'page-fractions-intro',
    topicId: 'math-fractions',
    title: 'Intro',
    difficulty: 'easy',
    blocks: [], clarifiers: [], questions: []
  });

  const service = createDomainContentService({ publicDir, cacheMs: 60_000 });
  assert.equal(service.getSubjects()[0].id, 'mathematics');
  assert.equal(service.getTopics('mathematics')[0].id, 'math-fractions');
  assert.equal(service.getTopic('math-fractions').title, 'Fractions');
  assert.equal(service.getPage('page-fractions-intro').content.title, 'Intro');
  assert.equal(service.getPage('missing'), null);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Kani domain content service tests passed');
