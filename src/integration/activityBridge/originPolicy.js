export function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return new URL(value, 'http://placeholder.invalid').origin === 'http://placeholder.invalid'
      ? null
      : new URL(value).origin;
  } catch {
    return null;
  }
}

export function deriveAllowedOrigins({ configured = [], assetUrl, currentOrigin } = {}) {
  const origins = new Set();
  for (const value of configured || []) {
    const origin = normalizeOrigin(value);
    if (origin) origins.add(origin);
  }
  if (currentOrigin) {
    const origin = normalizeOrigin(currentOrigin);
    if (origin) origins.add(origin);
  }
  if (assetUrl) {
    try {
      const resolved = new URL(assetUrl, currentOrigin || 'http://placeholder.invalid');
      if (resolved.origin !== 'http://placeholder.invalid') origins.add(resolved.origin);
    } catch {}
  }
  return [...origins];
}

export function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin || !Array.isArray(allowedOrigins) || allowedOrigins.length === 0) return false;
  return allowedOrigins.includes(origin);
}
