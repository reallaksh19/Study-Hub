import React, { useState } from 'react';

export function ParentSettings() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [message, setMessage] = useState('');

  const handleSaveApiKey = () => {
    localStorage.setItem('geminiApiKey', apiKey.trim());
    setMessage('Settings saved.');
  };

  const handleLockParent = () => {
    sessionStorage.removeItem('parent_unlocked');
    window.location.hash = '#/parent';
    window.location.reload();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage parent-side preferences.</p>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Gemini API key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <div className="flex gap-3">
          <button onClick={handleSaveApiKey} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save settings</button>
          <button onClick={handleLockParent} className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">Lock parent mode</button>
        </div>
        {message && <div className="text-green-700 text-sm font-medium">{message}</div>}
      </div>
    </div>
  );
}
