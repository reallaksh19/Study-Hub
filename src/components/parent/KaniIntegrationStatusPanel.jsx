import React, { useEffect, useMemo, useState } from 'react';
import { loadKaniIntegrationStatus } from '../../integration/status/integrationStatus.js';

const INITIAL = {
  contractVersion: '1.0',
  catalogUrl: '',
  reachable: false,
  schemaVersion: null,
  publishedAt: null,
  subjects: 0,
  topics: 0,
  pages: 0,
  error: null,
};

export function KaniIntegrationStatusPanel() {
  const [status, setStatus] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const gameUrl = useMemo(() => String(import.meta.env?.VITE_KANI_GAME_URL || '').trim(), []);

  useEffect(() => {
    let cancelled = false;
    loadKaniIntegrationStatus().then((next) => {
      if (!cancelled) {
        setStatus(next);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const stateLabel = loading ? 'Checking…' : status.reachable ? 'Catalog ready' : 'Catalog unavailable';
  const stateTone = loading ? 'var(--color-warn)' : status.reachable ? 'var(--color-success)' : 'var(--color-danger)';

  return (
    <section className="sh-card p-5 mb-6" aria-label="Kani integration status">
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="min-w-[220px]">
          <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.06em]">Kani platform integration</div>
          <h2 className="serif text-[23px] mt-1 mb-1">Content plane status</h2>
          <p className="text-[13px] text-ink-3 m-0 max-w-[620px]">
            Study-Hub publishes canonical learning content. Kani Game App owns learner identity, runtime, attempts and mastery.
          </p>
        </div>
        <div className="rounded-full border border-line-2 bg-white px-3 py-1.5 text-[12px] font-bold" style={{ color: stateTone }}>
          {stateLabel}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mt-4">
        <StatusCell label="Contract" value={`v${status.contractVersion}`} />
        <StatusCell label="Catalog schema" value={status.schemaVersion ? `v${status.schemaVersion}` : '—'} />
        <StatusCell label="Subjects" value={status.subjects} />
        <StatusCell label="Topics" value={status.topics} />
        <StatusCell label="Pages" value={status.pages} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
        <div className="rounded-[10px] bg-paper px-3 py-2.5 border border-line">
          <div className="font-semibold text-ink-2">Static catalog</div>
          <code className="mono text-[11px] break-all text-muted">{status.catalogUrl || 'content/catalog.json'}</code>
          {status.error && <div className="text-danger mt-1">{status.error}</div>}
        </div>
        <div className="rounded-[10px] bg-paper px-3 py-2.5 border border-line">
          <div className="font-semibold text-ink-2">Kani Game App preview</div>
          {gameUrl ? (
            <a className="text-brand break-all" href={gameUrl} target="_blank" rel="noreferrer">{gameUrl}</a>
          ) : (
            <span className="text-muted">Not configured. Set VITE_KANI_GAME_URL for Studio preview links.</span>
          )}
        </div>
      </div>

      <div className="text-[11px] text-muted mt-3">
        Activity bridge contract: <code className="mono">kani-activity-v1</code>. Learner write APIs remain intentionally disabled until authenticated persistence is designed.
      </div>
    </section>
  );
}

function StatusCell({ label, value }) {
  return (
    <div className="rounded-[10px] border border-line-2 bg-white px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.05em] text-muted font-semibold">{label}</div>
      <div className="stat text-[18px] font-semibold mt-0.5">{value}</div>
    </div>
  );
}
