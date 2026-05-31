import { readJSON, saveJSON, deleteFile } from './parentApiService.js';
import { buildTopicPath } from './pageRefService.js';
import { savePage } from './pageMutationService.js';
import { upsertPagesInTopic, loadTopic } from './topicMutationService.js';
import { slugify } from '../utils/slugify.js';
import { sha256hex } from '../utils/cryptoUtils.js';

// ─── Content hashing ──────────────────────────────────────────────────────────

async function contentHash(blocks = []) {
  const normalized = blocks
    .map((b) => `${b.type}:${JSON.stringify(b.data ?? {})}`)
    .join('|');
  return sha256hex(normalized);
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const IDB_NAME = 'study-hub-import';
const IDB_STORE = 'sessions';

let _dbPromise = null;
function openIDB() {
  if (!_dbPromise) {
    _dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(IDB_STORE, { keyPath: 'sessionId' });
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }
  return _dbPromise;
}

async function idbPut(record) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(record);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function idbGet(sessionId) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(sessionId);
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function idbDelete(sessionId) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(sessionId);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ─── Session storage keys ─────────────────────────────────────────────────────

const ACTIVE_SESSION_KEY = 'active_import_session_id';
const HISTORY_KEY = 'import_history';
const HISTORY_MAX = 20;

const sessionMetaKey = (id) => `import_session_${id}`;
const sessionDataKey = (id) => `import_data_${id}`;

function isLarge(rawText, parsedPages) {
  return rawText.length > 10000 || parsedPages.length > 10;
}

// ─── Session lifecycle ────────────────────────────────────────────────────────

export async function createImportSession(subjectId, topicFolder, rawText, parsedPages, mode) {
  const sessionId = crypto.randomUUID();
  const rawHash = await sha256hex(rawText);
  const large = isLarge(rawText, parsedPages);

  const meta = { sessionId, subjectId, topicFolder, parseMode: mode, step: 'stage', rawHash, manualEditCount: 0, large };
  sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  sessionStorage.setItem(sessionMetaKey(sessionId), JSON.stringify(meta));

  if (large) {
    await idbPut({ sessionId, rawText, parsedPages });
  } else {
    sessionStorage.setItem(sessionDataKey(sessionId), JSON.stringify({ rawText, parsedPages }));
  }

  return { ...meta, parsedPages };
}

export function updateSessionMeta(sessionId, updates) {
  const raw = sessionStorage.getItem(sessionMetaKey(sessionId));
  if (!raw) return;
  sessionStorage.setItem(sessionMetaKey(sessionId), JSON.stringify({ ...JSON.parse(raw), ...updates }));
}

export async function recoverSession() {
  const sessionId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
  if (!sessionId) return null;

  const metaRaw = sessionStorage.getItem(sessionMetaKey(sessionId));
  if (!metaRaw) return null;
  const meta = JSON.parse(metaRaw);

  let data;
  if (meta.large) {
    data = await idbGet(sessionId).catch(() => null);
  } else {
    const dataRaw = sessionStorage.getItem(sessionDataKey(sessionId));
    data = dataRaw ? JSON.parse(dataRaw) : null;
  }

  if (!data) return null;
  return { ...meta, rawText: data.rawText, parsedPages: data.parsedPages };
}

export async function clearImportSession(sessionId) {
  sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  sessionStorage.removeItem(sessionMetaKey(sessionId));
  sessionStorage.removeItem(sessionDataKey(sessionId));
  await idbDelete(sessionId).catch(() => {});
}

// ─── Conflict detection ───────────────────────────────────────────────────────

export async function detectConflicts(parsedPages, subjectId, topicFolder) {
  let existingPages = [];
  try {
    const topic = await loadTopic(subjectId, topicFolder);
    existingPages = Array.isArray(topic?.pages) ? topic.pages : [];
  } catch { /* topic doesn't exist yet — all pages are new */ }

  const fileMap = new Map(existingPages.map((p) => [p.file, p]));

  return Promise.all(parsedPages.map(async (parsed) => {
    const titleSlug = slugify(parsed.title || 'untitled');
    const file = `pages/${titleSlug}.json`;
    const existing = fileMap.get(file);

    if (!existing) {
      return { slug: titleSlug, file, status: 'new', suggestedAction: 'create', parsedPage: parsed };
    }

    let existingHash = '';
    try {
      const existingData = await readJSON(`${subjectId}/${topicFolder}/${file}`);
      existingHash = await contentHash(existingData?.blocks ?? []);
    } catch { /* page file unreadable — treat as conflict */ }

    const parsedHash = await contentHash(parsed.blocks ?? []);
    const isDuplicate = existingHash && existingHash === parsedHash;

    return {
      slug: titleSlug, file,
      status: isDuplicate ? 'duplicate' : 'conflict',
      suggestedAction: isDuplicate ? 'skip' : 'overwrite',
      parsedPage: parsed,
      existingEntry: existing
    };
  }));
}

// ─── Save plan ────────────────────────────────────────────────────────────────

export function computeSavePlan(conflicts, conflictResolutions, subjectId, topicFolder) {
  return conflicts.map((c, i) => {
    const action = conflictResolutions?.get(c.slug) ?? c.suggestedAction;
    const slug = action === 'create-copy' ? `${c.slug}-copy` : c.slug;
    const pageEntry = {
      id: `${subjectId}-${topicFolder}-${slug}`,
      file: `pages/${slug}.json`,
      title: c.parsedPage.title,
      order: i + 1,
      estimatedMinutes: c.parsedPage.estimatedMinutes || 0
    };
    return { slug, action, pageEntry, parsedPage: c.parsedPage, originalSlug: c.slug };
  });
}

// ─── Commit ───────────────────────────────────────────────────────────────────

function buildPageJSON(planEntry, subjectId, topicFolder, sessionId) {
  const { pageEntry, parsedPage } = planEntry;
  const page = {
    id: pageEntry.id,
    topicId: `${subjectId}-${topicFolder}`,
    title: parsedPage.title,
    blocks: parsedPage.blocks || [],
    clarifiers: parsedPage.clarifiers || [],
    questions: parsedPage.questions || [],
    attachments: [],
    importedFrom: 'content-importer',
    importSessionId: sessionId
  };
  if (parsedPage.difficulty) page.difficulty = parsedPage.difficulty;
  if (parsedPage.estimatedMinutes) page.estimatedMinutes = parsedPage.estimatedMinutes;
  if (parsedPage.conceptTags?.length) page.conceptTags = parsedPage.conceptTags;
  return page;
}

export async function commitImport(session, savePlan, extractToLibrary = false) {
  const { subjectId, topicFolder, sessionId } = session;

  const toWrite = savePlan.filter((e) => e.action !== 'skip');
  const toOverwrite = savePlan.filter((e) => e.action === 'overwrite');
  const toCreate = savePlan.filter((e) => e.action === 'create' || e.action === 'create-copy');

  // Pre-commit snapshot — read all concurrently
  let topicJSON = { pages: [] };
  try { topicJSON = await loadTopic(subjectId, topicFolder); } catch { /* first import */ }

  const overwriteSnapshots = await Promise.all(
    toOverwrite.map((e) =>
      readJSON(`${subjectId}/${topicFolder}/${e.pageEntry.file}`).catch(() => null)
    )
  );
  const overwrittenPages = Object.fromEntries(
    toOverwrite.map((e, i) => [e.slug, overwriteSnapshots[i]]).filter(([, v]) => v != null)
  );
  const createdPageFiles = toCreate.map((e) => e.pageEntry.file);

  const snapKey = `import_snapshot_${sessionId}`;
  try {
    localStorage.setItem(snapKey, JSON.stringify({
      topicJSON, overwrittenPages, createdPageFiles, timestamp: Date.now(), subjectId, topicFolder
    }));
  } catch { /* storage full — proceed without snapshot */ }

  // Write page files — stop on first failure
  const written = [];
  for (const entry of toWrite) {
    const pageJSON = buildPageJSON(entry, subjectId, topicFolder, sessionId);
    await savePage(subjectId, topicFolder, entry.pageEntry, pageJSON, { snapshot: false });
    written.push(entry.slug);
  }

  if (toWrite.length > 0) {
    await upsertPagesInTopic(subjectId, topicFolder, toWrite.map((e) => e.pageEntry), 'replace');
  }

  if (extractToLibrary) {
    console.info('[importSession] Question library extraction is planned for Phase 1.5.');
  }

  recordImportHistory({
    sessionId, timestamp: Date.now(), parseMode: session.parseMode,
    subjectId, topicFolder,
    pagesAdded: toCreate.length, pagesOverwritten: toOverwrite.length,
    rawHash: session.rawHash, manualEdits: session.manualEditCount || 0
  });

  await clearImportSession(sessionId);
  return { written, pagesAdded: toCreate.length, pagesOverwritten: toOverwrite.length, snapKey };
}

// ─── Rollback ─────────────────────────────────────────────────────────────────

export async function rollbackImport(sessionId) {
  const snapKey = `import_snapshot_${sessionId}`;
  const snapRaw = localStorage.getItem(snapKey);
  if (!snapRaw) throw new Error('No rollback snapshot found for this import session.');

  const snap = JSON.parse(snapRaw);
  const { subjectId, topicFolder } = snap;
  const report = { restoredTopicJSON: false, restoredPages: [], deletedPages: [], failures: [] };

  try {
    await saveJSON(buildTopicPath(subjectId, topicFolder), snap.topicJSON);
    report.restoredTopicJSON = true;
  } catch (err) {
    report.failures.push({ file: 'topic.json', error: err.message });
  }

  await Promise.all(
    Object.entries(snap.overwrittenPages || {}).map(async ([slug, pageData]) => {
      const filePath = `${subjectId}/${topicFolder}/pages/${slug}.json`;
      try {
        await saveJSON(filePath, pageData);
        report.restoredPages.push(slug);
      } catch (err) {
        report.failures.push({ file: filePath, error: err.message });
      }
    })
  );

  await Promise.all(
    (snap.createdPageFiles || []).map(async (file) => {
      const filePath = `${subjectId}/${topicFolder}/${file}`;
      try {
        await deleteFile(filePath);
        report.deletedPages.push(file);
      } catch (err) {
        report.failures.push({ file: filePath, error: err.message });
      }
    })
  );

  localStorage.removeItem(snapKey);
  return report;
}

// ─── Import history ───────────────────────────────────────────────────────────

export function recordImportHistory(entry) {
  let history = [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    history = raw ? JSON.parse(raw) : [];
  } catch { history = []; }
  history.unshift(entry);
  if (history.length > HISTORY_MAX) history.length = HISTORY_MAX;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* storage full */ }
}

export function getImportHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function checkDuplicateImport(rawHash, subjectId, topicFolder) {
  return getImportHistory().find(
    (h) => h.rawHash === rawHash && h.subjectId === subjectId && h.topicFolder === topicFolder
  ) ?? null;
}
