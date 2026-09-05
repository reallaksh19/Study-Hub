import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildKaniCatalog } from './buildCatalog.js';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kani-catalog-'));
  const publicDir = path.join(root, 'public');
  writeJson(path.join(publicDir, 'Mathematics', 'subject.json'), {
    id: 'mathematics', title: 'Mathematics', order: 1
  });
  writeJson(path.join(publicDir, 'Mathematics', 'fractions', 'topic.json'), {
    id: 'math-fractions',
    subjectId: 'mathematics',
    title: 'Fractions',
    difficulty: 'medium',
    pages: [
      { id: 'math-fractions-intro', file: 'pages/intro.json', title: 'Introduction', order: 1 },
      { id: 'math-fractions-compare', file: 'pages/compare.json', title: 'Compare fractions', order: 2 }
    ]
  });
  writeJson(path.join(publicDir, 'Mathematics', 'fractions', 'pages', 'intro.json'), {
    id: 'math-fractions-intro',
    topicId: 'math-fractions',
    title: 'Introduction',
    pageKind: 'lesson',
    difficulty: 'easy',
    conceptTags: ['fraction-basics'],
    blocks: [], clarifiers: [], questions: []
  });
  writeJson(path.join(publicDir, 'Mathematics', 'fractions', 'pages', 'compare.json'), {
    id: 'math-fractions-compare',
    topicId: 'math-fractions',
    title: 'Compare fractions',
    pageKind: 'worksheet',
    difficulty: 'medium',
    skillIds: ['compare-fractions'],
    blocks: [], clarifiers: [], questions: []
  });
  return { root, publicDir };
}

{
  const { root, publicDir } = makeFixture();
  try {
    const fixedTime = '2026-09-05T13:50:00.000Z';
    const first = buildKaniCatalog({ publicDir, publishedAt: fixedTime });
    const second = buildKaniCatalog({ publicDir, publishedAt: fixedTime });
    assert.deepEqual(first, second, 'catalog generation should be deterministic for the same inputs');
    assert.equal(first.subjects.length, 1);
    assert.equal(first.topics.length, 1);
    assert.equal(first.pages.length, 2);
    assert.deepEqual(first.topics[0].pageRefs, ['math-fractions-intro', 'math-fractions-compare']);
    assert.equal(first.pages[1].activityType, 'worksheet');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

{
  const { root, publicDir } = makeFixture();
  try {
    const topicPath = path.join(publicDir, 'Mathematics', 'fractions', 'topic.json');
    const topic = JSON.parse(fs.readFileSync(topicPath, 'utf8'));
    topic.pages.push({ id: 'missing-page', file: 'pages/missing.json', title: 'Missing' });
    writeJson(topicPath, topic);
    assert.throws(() => buildKaniCatalog({ publicDir }), /Broken page reference/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

{
  const { root, publicDir } = makeFixture();
  try {
    writeJson(path.join(publicDir, 'Mathematics', 'duplicate', 'topic.json'), {
      id: 'math-fractions',
      subjectId: 'mathematics',
      title: 'Duplicate fractions',
      difficulty: 'easy',
      pages: []
    });
    assert.throws(() => buildKaniCatalog({ publicDir }), /Duplicate topic id/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

console.log('Kani catalog builder tests passed');
