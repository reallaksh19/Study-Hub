const STORAGE_KEY = 'study_hub_interactive_results_v1';

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveInteractiveResult(result) {
  if (!result?.pageId) return;
  const store = loadStore();
  const pageBucket = store[result.pageId] || { history: [] };
  const normalized = {
    ...result,
    correctCount: result.correctCount ?? result.score,
    wrongCount: result.wrongCount ?? Math.max(0, (result.total || 0) - (result.score || 0)),
    percentage: result.percentage ?? ((result.total || 0) > 0 ? Math.round(((result.score || 0) / result.total) * 100) : 0),
    completedAt: result.completedAt || new Date().toISOString()
  };
  pageBucket.lastAttempt = normalized;
  pageBucket.history = [normalized, ...(pageBucket.history || [])].slice(0, 20);
  store[result.pageId] = pageBucket;
  saveStore(store);
  return normalized;
}

export function getInteractiveResult(pageId) {
  const store = loadStore();
  return store[pageId]?.lastAttempt || null;
}
