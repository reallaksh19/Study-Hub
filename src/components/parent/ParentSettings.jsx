// ParentSettings.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentSettings.jsx.
// Preserves: Gemini API key save (localStorage geminiApiKey), Lock parent mode.

import React, { useState } from 'react';
import { Ico } from '../../lib/Icons.jsx';
import { useConfirm, useToast } from '../../lib/Toast.jsx';

export function ParentSettings() {
  const confirm = useConfirm();
  const toast = useToast();
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');

  const handleSaveApiKey = () => {
    localStorage.setItem('geminiApiKey', apiKey.trim());
    toast.show('Settings saved.', { variant: 'success' });
  };

  const handleLockParent = () => {
    sessionStorage.removeItem('parent_unlocked');
    window.location.hash = '#/parent';
    window.location.reload();
  };

  const handleResetPin = async () => {
    const ok = await confirm({
      title: 'Reset parent PIN?',
      body: 'This clears the current PIN and re-seeds the default 1234 on the next lock screen.',
      confirmLabel: 'Reset PIN',
      variant: 'danger',
    });
    if (!ok) return;
    localStorage.removeItem('parent_pin_hash');
    toast.show('PIN cleared. Next lock screen will re-seed 1234.', { variant: 'success' });
  };

  return (
    <div className="max-w-[680px]">
      <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.05em] mb-1.5">
        Parent-side preferences
      </div>
      <h1 className="serif text-[34px] tracking-tight m-0 mb-6 leading-[1.05]">Settings</h1>

      <Section title="AI tutor" desc="Used for inline 'explain differently' and clarifier suggestions.">
        <label className="block text-[12px] text-ink-2 font-semibold mb-1.5">Gemini API key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
          className="w-full px-3 py-2.5 bg-white border border-line-2 rounded-[9px] text-[13.5px] mono outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <div className="text-[11.5px] text-muted mt-1.5">
          Stored only on this device. Leave empty to disable AI features.
        </div>
        <div className="flex gap-2.5 mt-4">
          <button onClick={handleSaveApiKey} className="sh-btn sh-btn-primary text-[13px]">
            Save settings
          </button>
        </div>
      </Section>

      <Section title="Parent PIN" desc="Prevents accidental entry into authoring tools. Not a security feature.">
        <div className="flex gap-2.5 items-center flex-wrap">
          <button
            onClick={() => toast.show('PIN change flow is coming next. Use reset for now.', { variant: 'info' })}
            className="sh-btn sh-btn-secondary text-[13px]"
          >
            Change PIN
          </button>
          <button
            onClick={handleResetPin}
            className="sh-btn sh-btn-secondary text-[13px]"
          >
            Reset to 1234
          </button>
        </div>
      </Section>

      <Section title="Account">
        <div className="flex gap-2.5 items-center flex-wrap">
          <a href="#/parent/import" className="sh-btn sh-btn-secondary text-[13px] no-underline">
            Export everything (.zip)
          </a>
          <button
            onClick={handleLockParent}
            className="sh-btn sh-btn-secondary text-[13px] ml-auto"
          >
            <Ico.Lock width="14" height="14" /> Lock parent mode
          </button>
        </div>
      </Section>

      <div className="text-[12px] text-muted mt-2">
        v3.2.0 · backend connected
      </div>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="bg-white border border-line-2 rounded-[14px] px-6 py-5 mb-4">
      <div className="mb-3.5">
        <h2 className="serif text-[20px] m-0 leading-tight">{title}</h2>
        {desc && <p className="text-[13px] text-ink-3 m-0 mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
