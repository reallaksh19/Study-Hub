import { readJSON, saveJSON } from './parentApiService.js';
import { resolvePageRef, validatePageEntry, validatePageJSON, buildPagePath } from './pageRefService.js';
import { slugify } from '../utils/slugify.js';
import { generateBlockId, generateClarifierId, generateQuestionId } from '../utils/idFactory.js';

// Per-page write queue: ensures no out-of-order writes for the same page
const writeQueues = new Map(); // pageId → Promise

function enqueueWrite(pageId, writeFn) {
  const prev = writeQueues.get(pageId) ?? Promise.resolve();
  const next = prev.then(writeFn).catch(console.error);
  writeQueues.set(pageId, next);
  return next;
}

// Debounce timers per pageId
const debounceTimers = new Map();

function debounceWrite(pageId, writeFn, ms = 400) {
  if (debounceTimers.has(pageId)) {
    clearTimeout(debounceTimers.get(pageId));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      debounceTimers.delete(pageId);
      enqueueWrite(pageId, writeFn).then(resolve).catch(reject);
    }, ms);
    debounceTimers.set(pageId, timer);
  });
}

// Flush any pending debounced write for a page (call on page switch)
export function flushPendingWrite(pageId) {
  if (debounceTimers.has(pageId)) {
    clearTimeout(debounceTimers.get(pageId));
    debounceTimers.delete(pageId);
  }
}

export function buildBlankPage(subjectId, topicFolder, title) {
  const slug = slugify(title);
  const pageId = `${subjectId}-${topicFolder}-${slug}`;
  return {
    id: pageId,
    topicId: `${subjectId}-${topicFolder}`,
    title,
    blocks: [],
    clarifiers: [],
    questions: [],
    attachments: []
  };
}

export function buildPageEntry(subjectId, topicFolder, title, order = 1) {
  const slug = slugify(title);
  return {
    id: `${subjectId}-${topicFolder}-${slug}`,
    file: `pages/${slug}.json`,
    title,
    order,
    estimatedMinutes: 0
  };
}

export function assignIds(page, slug) {
  return {
    ...page,
    blocks: (page.blocks || []).map((b, i) => ({ ...b, id: generateBlockId(slug, i) })),
    clarifiers: (page.clarifiers || []).map((c, i) => ({ ...c, id: generateClarifierId(slug, i) })),
    questions: (page.questions || []).map((q, i) => ({ ...q, id: generateQuestionId(slug, i) }))
  };
}

export async function loadPage(subjectId, topicFolder, pageEntry) {
  const { valid, errors } = validatePageEntry(pageEntry);
  if (!valid) throw new Error(`Invalid page entry: ${errors.join(', ')}`);

  const ref = resolvePageRef(subjectId, topicFolder, pageEntry);
  const data = await readJSON(ref.fullPath);

  // Ensure canonical shape
  return {
    blocks: [],
    clarifiers: [],
    questions: [],
    attachments: [],
    ...data
  };
}

export async function savePage(subjectId, topicFolder, pageEntry, pageData, options = {}) {
  const { snapshot = false, reason = '' } = options;
  const { valid: entryValid, errors: entryErrors } = validatePageEntry(pageEntry);
  if (!entryValid) throw new Error(`Invalid page entry: ${entryErrors.join(', ')}`);

  const normalized = {
    blocks: [],
    clarifiers: [],
    questions: [],
    attachments: [],
    ...pageData
  };

  const { valid: pageValid, errors: pageErrors } = validatePageJSON(normalized);
  if (!pageValid) throw new Error(`Invalid page data: ${pageErrors.join(', ')}`);

  if (snapshot) {
    try {
      const ref = resolvePageRef(subjectId, topicFolder, pageEntry);
      const prev = await readJSON(ref.fullPath).catch(() => null);
      if (prev) {
        localStorage.setItem(
          `page_snap_${pageEntry.id}`,
          JSON.stringify({ prev, timestamp: Date.now(), reason })
        );
      }
    } catch { /* storage full */ }
  }

  const ref = resolvePageRef(subjectId, topicFolder, pageEntry);
  return enqueueWrite(pageEntry.id, () => saveJSON(ref.fullPath, normalized));
}

export function reorderBlocks(subjectId, topicFolder, pageEntry, blocks) {
  return debounceWrite(pageEntry.id, async () => {
    const current = await loadPage(subjectId, topicFolder, pageEntry);
    await saveJSON(
      resolvePageRef(subjectId, topicFolder, pageEntry).fullPath,
      { ...current, blocks }
    );
  });
}

export function reorderQuestions(subjectId, topicFolder, pageEntry, questions) {
  return debounceWrite(pageEntry.id, async () => {
    const current = await loadPage(subjectId, topicFolder, pageEntry);
    await saveJSON(
      resolvePageRef(subjectId, topicFolder, pageEntry).fullPath,
      { ...current, questions }
    );
  });
}

export function reorderClarifiers(subjectId, topicFolder, pageEntry, clarifiers) {
  return debounceWrite(pageEntry.id, async () => {
    const current = await loadPage(subjectId, topicFolder, pageEntry);
    await saveJSON(
      resolvePageRef(subjectId, topicFolder, pageEntry).fullPath,
      { ...current, clarifiers }
    );
  });
}

export async function deleteBlock(subjectId, topicFolder, pageEntry, blockId) {
  return savePage(
    subjectId,
    topicFolder,
    pageEntry,
    await loadPage(subjectId, topicFolder, pageEntry).then((p) => ({
      ...p,
      blocks: p.blocks.filter((b) => b.id !== blockId)
    })),
    { snapshot: true, reason: 'block-delete' }
  );
}

export async function deleteQuestion(subjectId, topicFolder, pageEntry, questionId) {
  return savePage(
    subjectId,
    topicFolder,
    pageEntry,
    await loadPage(subjectId, topicFolder, pageEntry).then((p) => ({
      ...p,
      questions: p.questions.filter((q) => q.id !== questionId)
    })),
    { snapshot: true, reason: 'question-delete' }
  );
}

export async function deleteClarifier(subjectId, topicFolder, pageEntry, clarifierId) {
  return savePage(
    subjectId,
    topicFolder,
    pageEntry,
    await loadPage(subjectId, topicFolder, pageEntry).then((p) => ({
      ...p,
      clarifiers: p.clarifiers.filter((c) => c.id !== clarifierId)
    })),
    { snapshot: true, reason: 'clarifier-delete' }
  );
}

export async function createPage(subjectId, topicFolder, title) {
  const page = buildBlankPage(subjectId, topicFolder, title);
  const slug = slugify(title);
  await saveJSON(buildPagePath(subjectId, topicFolder, slug), page);
  return { page, entry: buildPageEntry(subjectId, topicFolder, title) };
}
