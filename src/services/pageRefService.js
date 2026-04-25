import { saveJSON, readJSON, deleteFile } from './parentApiService.js';

export function resolvePageRef(subjectId, topicFolder, pageEntry) {
  if (!pageEntry?.file) throw new Error(`Invalid page entry: missing file field`);
  const slug = pageEntry.file.replace('pages/', '').replace('.json', '');
  if (!slug) throw new Error(`Invalid page entry: cannot derive slug from file "${pageEntry.file}"`);
  return {
    id: pageEntry.id,
    slug,
    file: pageEntry.file,
    fullPath: `${subjectId}/${topicFolder}/${pageEntry.file}`
  };
}

export function validatePageEntry(entry) {
  const errors = [];
  if (!entry?.id) errors.push('missing id');
  if (!entry?.file) errors.push('missing file');
  if (!entry?.title) errors.push('missing title');
  return { valid: errors.length === 0, errors };
}

export function validatePageJSON(page) {
  const errors = [];
  if (!page?.id) errors.push('missing id');
  if (!page?.topicId) errors.push('missing topicId');
  if (!page?.title) errors.push('missing title');
  if (!Array.isArray(page?.blocks)) errors.push('blocks must be an array');
  if (!Array.isArray(page?.clarifiers)) errors.push('clarifiers must be an array');
  if (!Array.isArray(page?.questions)) errors.push('questions must be an array');
  return { valid: errors.length === 0, errors };
}

export const buildPagePath = (subjectId, topicFolder, slug) =>
  `${subjectId}/${topicFolder}/pages/${slug}.json`;

export const buildTopicPath = (subjectId, topicFolder) =>
  `${subjectId}/${topicFolder}/topic.json`;

export { saveJSON, readJSON, deleteFile };
