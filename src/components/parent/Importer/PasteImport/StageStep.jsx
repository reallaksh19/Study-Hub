import React, { useEffect, useState } from 'react';
import { detectConflicts, checkDuplicateImport } from '../../../../services/importSessionService.js';

const ACTION_LABELS = {
  create: 'Create new',
  overwrite: 'Overwrite',
  skip: 'Skip',
  'create-copy': 'Create copy'
};

const STATUS_BADGE = {
  new: { label: 'New', cls: 'bg-green-100 text-green-700' },
  conflict: { label: 'Conflict', cls: 'bg-amber-100 text-amber-700' },
  duplicate: { label: 'Duplicate', cls: 'bg-gray-100 text-gray-500' }
};

export function StageStep({ parsedPages, subjectId, topicFolder, rawHash, onDone, onBack }) {
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState([]);
  const [resolutions, setResolutions] = useState(new Map());
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const dupe = checkDuplicateImport(rawHash, subjectId, topicFolder);
    if (dupe) setDuplicateWarning(dupe);

    detectConflicts(parsedPages, subjectId, topicFolder)
      .then((results) => {
        if (cancelled) return;
        setConflicts(results);
        const map = new Map(results.map((c) => [c.slug, c.suggestedAction]));
        setResolutions(map);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setResolution = (slug, action) => {
    setResolutions((prev) => new Map([...prev, [slug, action]]));
  };

  const activeCount = conflicts.filter((c) => (resolutions.get(c.slug) ?? c.suggestedAction) !== 'skip').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Checking for conflicts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">{error}</div>
        <button onClick={onBack} className="text-sm text-gray-600 hover:underline">&larr; Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {duplicateWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
          This content was already imported on {new Date(duplicateWarning.timestamp).toLocaleString()} — you may be re-importing identical text.
        </div>
      )}

      <p className="text-sm text-gray-600">
        Review how each parsed page maps to the existing topic. Adjust actions as needed.
      </p>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Page title</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 w-28">Status</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 w-36">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {conflicts.map((c) => {
              const action = resolutions.get(c.slug) ?? c.suggestedAction;
              const badge = STATUS_BADGE[c.status] || STATUS_BADGE.new;
              return (
                <tr key={c.slug} className={action === 'skip' ? 'opacity-50' : ''}>
                  <td className="px-3 py-2">
                    <span className="font-medium text-gray-800">{c.parsedPage.title}</span>
                    <span className="text-xs text-gray-400 ml-2 font-mono">{c.slug}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={action}
                      onChange={(e) => setResolution(c.slug, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-indigo-500"
                    >
                      {c.status === 'new' && <option value="create">Create new</option>}
                      {c.status !== 'new' && (
                        <>
                          <option value="overwrite">Overwrite</option>
                          <option value="skip">Skip</option>
                          <option value="create-copy">Create copy</option>
                        </>
                      )}
                      {c.status === 'new' && <option value="skip">Skip</option>}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 justify-between pt-2 border-t border-gray-100">
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
          &larr; Back
        </button>
        <button
          onClick={() => onDone(conflicts, resolutions)}
          disabled={activeCount === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40"
        >
          Preview &amp; edit ({activeCount} page{activeCount !== 1 ? 's' : ''}) &rarr;
        </button>
      </div>
    </div>
  );
}
