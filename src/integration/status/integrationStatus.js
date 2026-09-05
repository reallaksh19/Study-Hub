import { KANI_SCHEMA_VERSION, KaniCatalogSchema } from '../contracts/kaniContracts.js';

function trimSlashes(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

export function resolvePublicUrl(pathname, baseUrl = '/') {
  const cleanPath = trimSlashes(pathname);
  const cleanBase = String(baseUrl || '/').replace(/\/+$/, '');
  return `${cleanBase || ''}/${cleanPath}`.replace(/\/+/g, '/');
}

export function summarizeKaniCatalog(value) {
  const parsed = KaniCatalogSchema.safeParse(value);
  if (!parsed.success) {
    return {
      ok: false,
      schemaVersion: null,
      publishedAt: null,
      subjects: 0,
      topics: 0,
      pages: 0,
      error: 'Catalog failed kani-catalog-v1 validation',
    };
  }
  const catalog = parsed.data;
  return {
    ok: true,
    schemaVersion: catalog.schemaVersion,
    publishedAt: catalog.publishedAt,
    subjects: catalog.subjects.length,
    topics: catalog.topics.length,
    pages: catalog.pages.length,
    error: null,
  };
}

export async function loadKaniIntegrationStatus({ fetchFn = fetch, baseUrl, catalogPath = 'content/catalog.json' } = {}) {
  const runtimeBase = baseUrl ?? import.meta.env?.BASE_URL ?? '/';
  const url = resolvePublicUrl(catalogPath, runtimeBase);
  try {
    const response = await fetchFn(url, { cache: 'no-cache' });
    if (!response.ok) {
      return {
        contractVersion: KANI_SCHEMA_VERSION,
        catalogUrl: url,
        reachable: false,
        schemaVersion: null,
        publishedAt: null,
        subjects: 0,
        topics: 0,
        pages: 0,
        error: `Catalog request failed (${response.status})`,
      };
    }
    const summary = summarizeKaniCatalog(await response.json());
    return {
      contractVersion: KANI_SCHEMA_VERSION,
      catalogUrl: url,
      reachable: summary.ok,
      ...summary,
    };
  } catch (error) {
    return {
      contractVersion: KANI_SCHEMA_VERSION,
      catalogUrl: url,
      reachable: false,
      schemaVersion: null,
      publishedAt: null,
      subjects: 0,
      topics: 0,
      pages: 0,
      error: error instanceof Error ? error.message : 'Catalog request failed',
    };
  }
}
