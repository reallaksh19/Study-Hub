import fs from 'node:fs';
import path from 'node:path';
import { KANI_SCHEMA_VERSION, KaniCatalogSchema } from '../contracts/kaniContracts.js';

const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard', 'mixed', 'none']);
const ALLOWED_ACTIVITY_TYPES = new Set(['lesson', 'worksheet', 'quiz', 'game', 'brain', 'challenge', 'interactive']);

function readJson(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read ${filePath}: ${error.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }
}

function normalizeDifficulty(value, sourcePath) {
  if (value == null || value === '') return 'none';
  const normalized = String(value).trim().toLowerCase();
  if (!ALLOWED_DIFFICULTIES.has(normalized)) {
    throw new Error(`Invalid difficulty "${value}" in ${sourcePath}`);
  }
  return normalized;
}

function normalizeActivityType(value) {
  if (!value) return 'lesson';
  const normalized = String(value).trim().toLowerCase().replace(/\s+/g, '_');
  if (ALLOWED_ACTIVITY_TYPES.has(normalized)) return normalized;
  if (normalized === 'study_guide' || normalized === 'worked_example' || normalized === 'article' || normalized === 'revision') return 'lesson';
  if (normalized === 'assessment') return 'quiz';
  if (normalized === 'handout' || normalized === 'resource_bundle') return 'worksheet';
  if (normalized === 'video_lesson') return 'lesson';
  return 'interactive';
}

function encodeWebPath(parts) {
  return `/${parts.flatMap((part) => String(part).split(/[\\/]/)).filter(Boolean).map(encodeURIComponent).join('/')}`;
}

function listDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function safeResolveWithin(baseDir, relativePath) {
  const resolved = path.resolve(baseDir, relativePath);
  const relative = path.relative(baseDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Page reference escapes topic directory: ${relativePath}`);
  }
  return resolved;
}

function optionalArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return [...new Set(value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()))];
  }
  return [];
}

function sortCatalog(catalog) {
  catalog.subjects.sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  catalog.topics.sort((a, b) => a.subjectId.localeCompare(b.subjectId) || (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  catalog.pages.sort((a, b) => a.topicId.localeCompare(b.topicId) || (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  return catalog;
}

export function buildKaniCatalog({ publicDir, publishedAt = '1970-01-01T00:00:00.000Z' }) {
  if (!publicDir || !fs.existsSync(publicDir)) throw new Error(`Public directory does not exist: ${publicDir}`);

  const subjectsById = new Map();
  const topicIds = new Set();
  const pageIds = new Set();
  const topics = [];
  const pages = [];

  for (const subjectFolder of listDirectories(publicDir)) {
    if (subjectFolder === 'content' || subjectFolder === 'uploads') continue;
    const subjectDir = path.join(publicDir, subjectFolder);
    const topicFolders = listDirectories(subjectDir).filter((topicFolder) => fs.existsSync(path.join(subjectDir, topicFolder, 'topic.json')));
    if (topicFolders.length === 0) continue;

    const subjectFile = path.join(subjectDir, 'subject.json');
    const subjectMeta = fs.existsSync(subjectFile) ? readJson(subjectFile) : null;
    let inferredSubjectId = subjectMeta?.id ? String(subjectMeta.id).trim().toLowerCase() : '';

    for (const topicFolder of topicFolders) {
      const topicPath = path.join(subjectDir, topicFolder, 'topic.json');
      const topic = readJson(topicPath);
      if (!topic?.id || !topic?.subjectId || !topic?.title || !Array.isArray(topic.pages)) {
        throw new Error(`Invalid topic metadata in ${topicPath}: id, subjectId, title and pages[] are required`);
      }

      const subjectId = String(topic.subjectId).trim().toLowerCase();
      if (inferredSubjectId && inferredSubjectId !== subjectId) {
        throw new Error(`Subject id mismatch in ${topicPath}: expected ${inferredSubjectId}, got ${subjectId}`);
      }
      inferredSubjectId = subjectId;

      if (topicIds.has(topic.id)) throw new Error(`Duplicate topic id "${topic.id}" found at ${topicPath}`);
      topicIds.add(topic.id);

      const topicPageRefs = [];
      for (const pageRef of topic.pages) {
        if (!pageRef?.id || !pageRef?.file || !pageRef?.title) {
          throw new Error(`Invalid page reference in ${topicPath}: id, file and title are required`);
        }
        const topicDir = path.dirname(topicPath);
        const pagePath = safeResolveWithin(topicDir, pageRef.file);
        if (!fs.existsSync(pagePath)) throw new Error(`Broken page reference in ${topicPath}: ${pageRef.file}`);
        const page = readJson(pagePath);
        const pageId = String(page.id || pageRef.id).trim();
        if (!pageId) throw new Error(`Page file ${pagePath} has no stable id`);
        if (page.id && page.id !== pageRef.id) throw new Error(`Page id mismatch in ${pagePath}: ref=${pageRef.id}, file=${page.id}`);
        if (pageIds.has(pageId)) throw new Error(`Duplicate page id "${pageId}" found at ${pagePath}`);
        pageIds.add(pageId);
        topicPageRefs.push(pageId);

        pages.push({
          id: pageId,
          topicId: String(topic.id),
          subjectId,
          title: String(page.title || pageRef.title),
          activityType: normalizeActivityType(page.pageKind || pageRef.pageKind),
          contentUrl: encodeWebPath([subjectFolder, topicFolder, pageRef.file]),
          ...(page.grade || pageRef.grade || topic.grade ? { grade: String(page.grade || pageRef.grade || topic.grade) } : {}),
          difficulty: normalizeDifficulty(page.difficulty ?? pageRef.difficulty ?? topic.difficulty, pagePath),
          skillIds: optionalArray(page.skillIds, pageRef.skillIds),
          conceptTags: optionalArray(page.conceptTags, pageRef.conceptTags, topic.conceptTags, topic.tags),
          ...(Number.isFinite(pageRef.order) ? { order: pageRef.order } : {})
        });
      }

      topics.push({
        id: String(topic.id),
        subjectId,
        title: String(topic.title),
        ...(topic.grade ? { grade: String(topic.grade) } : {}),
        difficulty: normalizeDifficulty(topic.difficulty, topicPath),
        conceptTags: optionalArray(topic.conceptTags, topic.tags),
        pageRefs: topicPageRefs,
        ...(Number.isFinite(topic.order) ? { order: topic.order } : {})
      });
    }

    if (!inferredSubjectId) continue;
    const candidate = {
      id: inferredSubjectId,
      title: String(subjectMeta?.title || subjectFolder),
      ...(subjectMeta?.grade ? { grade: String(subjectMeta.grade) } : {}),
      ...(Number.isFinite(subjectMeta?.order) ? { order: subjectMeta.order } : {})
    };
    const existing = subjectsById.get(inferredSubjectId);
    if (existing && existing.title !== candidate.title && subjectMeta?.title) {
      throw new Error(`Conflicting subject metadata for id "${inferredSubjectId}"`);
    }
    if (!existing || subjectMeta) subjectsById.set(inferredSubjectId, candidate);
  }

  const catalog = sortCatalog({
    schemaVersion: KANI_SCHEMA_VERSION,
    publishedAt,
    sourceApp: 'study-hub',
    subjects: [...subjectsById.values()],
    topics,
    pages
  });

  const validated = KaniCatalogSchema.safeParse(catalog);
  if (!validated.success) {
    throw new Error(`Generated catalog failed schema validation: ${validated.error.toString()}`);
  }
  return validated.data;
}
