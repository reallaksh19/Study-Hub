import { readJSON, saveJSON, deleteFile } from './parentApiService.js';
import { buildTopicPath, resolvePageRef, validatePageEntry } from './pageRefService.js';

const PRESERVED_FIELDS = [
  'estimatedMinutes',
  'prerequisitePageIds',
  'relatedPageIds',
  'difficulty',
  'conceptTags'
];

function mergePageEntry(existing, incoming, mode) {
  if (mode === 'append') return existing; // skip on id match

  const preserved = {};
  for (const field of PRESERVED_FIELDS) {
    if (existing[field] !== undefined) {
      preserved[field] = existing[field];
    } else if (incoming[field] !== undefined) {
      preserved[field] = incoming[field];
    }
  }

  if (mode === 'replace') {
    return { ...incoming, ...preserved };
  }

  // merge_metadata: update title + order only
  return { ...existing, title: incoming.title ?? existing.title, order: incoming.order ?? existing.order, ...preserved };
}

export async function loadTopic(subjectId, topicFolder) {
  const path = buildTopicPath(subjectId, topicFolder);
  return readJSON(path);
}

export async function upsertPagesInTopic(subjectId, topicFolder, newPageEntries, mode = 'append') {
  const topicPath = buildTopicPath(subjectId, topicFolder);
  const topic = await readJSON(topicPath);
  const existingPages = Array.isArray(topic.pages) ? topic.pages : [];

  const pageMap = new Map(existingPages.map((p) => [p.id, p]));
  const fileSet = new Set(existingPages.map((p) => p.file));

  for (const incoming of newPageEntries) {
    const existing = pageMap.get(incoming.id);
    const fileCollision = !existing && fileSet.has(incoming.file);

    if (fileCollision) {
      console.warn(`[topicMutationService] File collision for "${incoming.file}" with different id — skipping`);
      continue;
    }

    if (existing) {
      pageMap.set(incoming.id, mergePageEntry(existing, incoming, mode));
    } else {
      pageMap.set(incoming.id, incoming);
      if (incoming.file) fileSet.add(incoming.file);
    }
  }

  const merged = Array.from(pageMap.values());
  merged.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  merged.forEach((p, i) => { p.order = i + 1; });

  await saveJSON(topicPath, { ...topic, pages: merged });
  return { ...topic, pages: merged };
}

export async function reorderPages(subjectId, topicFolder, reorderedPages) {
  const topicPath = buildTopicPath(subjectId, topicFolder);
  const topic = await readJSON(topicPath);
  const updated = reorderedPages.map((p, i) => ({ ...p, order: i + 1 }));
  await saveJSON(topicPath, { ...topic, pages: updated });
  return { ...topic, pages: updated };
}

export async function checkPageDependencies(subjectId, topicFolder, pageId) {
  const topicPath = buildTopicPath(subjectId, topicFolder);
  const topic = await readJSON(topicPath);
  const pages = Array.isArray(topic.pages) ? topic.pages : [];
  const refs = [];

  for (const pageMeta of pages) {
    if (pageMeta.id === pageId) continue;

    const { valid } = validatePageEntry(pageMeta);
    if (!valid) continue;

    let pageData = null;
    try {
      const ref = resolvePageRef(subjectId, topicFolder, pageMeta);
      pageData = await readJSON(ref.fullPath);
    } catch {
      continue;
    }

    if (Array.isArray(pageData?.relatedPageIds) && pageData.relatedPageIds.includes(pageId)) {
      refs.push({ pageId: pageMeta.id, field: 'relatedPageIds', fieldType: 'page' });
    }
    if (Array.isArray(pageData?.prerequisitePageIds) && pageData.prerequisitePageIds.includes(pageId)) {
      refs.push({ pageId: pageMeta.id, field: 'prerequisitePageIds', fieldType: 'page' });
    }
    for (const q of pageData?.questions || []) {
      if (Array.isArray(q.supportPageIds) && q.supportPageIds.includes(pageId)) {
        refs.push({ pageId: pageMeta.id, field: 'supportPageIds', fieldType: 'question' });
        break;
      }
    }
    // Phase 2+ stubs: revisionCardLinks, examDrillRefs — return empty for now
  }

  return { hasDeps: refs.length > 0, refs };
}

export async function deletePage(subjectId, topicFolder, pageEntry, { cleanRefs = false } = {}) {
  const topicPath = buildTopicPath(subjectId, topicFolder);
  const topic = await readJSON(topicPath);

  const { hasDeps, refs } = await checkPageDependencies(subjectId, topicFolder, pageEntry.id);
  if (hasDeps && !cleanRefs) {
    const err = new Error('Page has dependencies');
    err.code = 'DEPENDENCY_ERROR';
    err.refs = refs;
    throw err;
  }

  const report = {
    removedRelatedPageIds: [],
    removedPrerequisitePageIds: [],
    removedQuestionSupportPageIds: [],
    cleanedPageIds: [],
    failures: []
  };

  // Clean refs in other pages
  if (cleanRefs && hasDeps) {
    const pages = Array.isArray(topic.pages) ? topic.pages : [];
    for (const pageMeta of pages) {
      if (pageMeta.id === pageEntry.id) continue;
      const { valid } = validatePageEntry(pageMeta);
      if (!valid) continue;

      let pageData = null;
      let ref = null;
      try {
        ref = resolvePageRef(subjectId, topicFolder, pageMeta);
        pageData = await readJSON(ref.fullPath);
      } catch { continue; }

      let changed = false;

      if (Array.isArray(pageData.relatedPageIds) && pageData.relatedPageIds.includes(pageEntry.id)) {
        pageData.relatedPageIds = pageData.relatedPageIds.filter((id) => id !== pageEntry.id);
        report.removedRelatedPageIds.push(pageMeta.id);
        changed = true;
      }
      if (Array.isArray(pageData.prerequisitePageIds) && pageData.prerequisitePageIds.includes(pageEntry.id)) {
        pageData.prerequisitePageIds = pageData.prerequisitePageIds.filter((id) => id !== pageEntry.id);
        report.removedPrerequisitePageIds.push(pageMeta.id);
        changed = true;
      }
      for (const q of pageData.questions || []) {
        if (Array.isArray(q.supportPageIds) && q.supportPageIds.includes(pageEntry.id)) {
          q.supportPageIds = q.supportPageIds.filter((id) => id !== pageEntry.id);
          report.removedQuestionSupportPageIds.push(pageMeta.id);
          changed = true;
          break;
        }
      }

      if (changed) {
        try {
          await saveJSON(ref.fullPath, pageData);
          report.cleanedPageIds.push(pageMeta.id);
        } catch (err) {
          report.failures.push({ pageId: pageMeta.id, error: err.message });
        }
      }
    }
  }

  // Delete page file
  try {
    const ref = resolvePageRef(subjectId, topicFolder, pageEntry);
    await deleteFile(ref.fullPath);
  } catch (err) {
    report.failures.push({ pageId: pageEntry.id, error: err.message });
  }

  // Update topic.json
  const updatedPages = (Array.isArray(topic.pages) ? topic.pages : [])
    .filter((p) => p.id !== pageEntry.id)
    .map((p, i) => ({ ...p, order: i + 1 }));
  await saveJSON(topicPath, { ...topic, pages: updatedPages });

  // Snapshot for undo
  const snapKey = `page_snap_${pageEntry.id}`;
  try {
    localStorage.setItem(snapKey, JSON.stringify({ prev: pageEntry, timestamp: Date.now(), reason: 'page-delete' }));
  } catch { /* storage full — ignore */ }

  return { success: true, report };
}
