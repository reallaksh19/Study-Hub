import React, { useEffect, useRef, useState } from 'react';
import { commitImport, rollbackImport } from '../../../../services/importSessionService.js';

export function CommitStep({ session, savePlan, extractToLibrary, onDone, onBack }) {
  const [status, setStatus] = useState('committing'); // 'committing' | 'done' | 'error' | 'rolling_back' | 'rolled_back'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [rollbackReport, setRollbackReport] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    commitImport(session, savePlan, extractToLibrary)
      .then((res) => { setResult(res); setStatus('done'); })
      .catch((err) => { setError(err.message); setStatus('error'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRollback = async () => {
    setStatus('rolling_back');
    try {
      const report = await rollbackImport(session.sessionId);
      setRollbackReport(report);
      setStatus('rolled_back');
    } catch (err) {
      setError(`Rollback failed: ${err.message}`);
      setStatus('error');
    }
  };

  if (status === 'committing') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Saving pages…</p>
      </div>
    );
  }

  if (status === 'rolling_back') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Rolling back…</p>
      </div>
    );
  }

  if (status === 'rolled_back') {
    const r = rollbackReport;
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded p-4">
          <p className="font-semibold text-amber-800 mb-2">Import rolled back</p>
          <ul className="text-sm space-y-1">
            {r.restoredTopicJSON && <li className="text-green-700">&#10003; Restored topic.json</li>}
            {r.deletedPages.map((f) => <li key={f} className="text-green-700">&#10003; Deleted {f}</li>)}
            {r.restoredPages.map((s) => <li key={s} className="text-green-700">&#10003; Restored pages/{s}.json</li>)}
            {r.failures.map((f, i) => <li key={i} className="text-red-600">&#10005; {f.file}: {f.error}</li>)}
          </ul>
        </div>
        <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
          &larr; Start over
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="font-semibold text-red-700">Commit failed</p>
          <p className="text-sm text-red-600 mt-1 font-mono">{error}</p>
          <p className="text-xs text-gray-500 mt-2">Some pages may have been written. Use Rollback to restore the previous state.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
            &larr; Back
          </button>
          <button onClick={handleRollback} className="px-4 py-2 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600">
            Rollback
          </button>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <p className="font-semibold text-green-800">Import complete!</p>
        <p className="text-sm text-green-700 mt-1">
          {result.pagesAdded} page{result.pagesAdded !== 1 ? 's' : ''} added, {result.pagesOverwritten} overwritten.
        </p>
      </div>
      <button
        onClick={() => onDone(result)}
        className="px-6 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700"
      >
        Done &rarr;
      </button>
    </div>
  );
}
