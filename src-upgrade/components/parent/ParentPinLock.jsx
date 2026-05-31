// ParentPinLock.jsx — UPGRADED
// Drop-in replacement for src/components/parent/ParentPinLock.jsx.
// Preserves: 4-digit PIN, sha256 verify, auto-advance, 3-strike lockout,
//            default 1234 seed, sessionStorage 'parent_unlocked' flag.

import React, { useState, useEffect, useRef } from 'react';
import { sha256hex } from '../../utils/cryptoUtils.js';
import { Ico } from '../../lib/Icons.jsx';

const hashPin = sha256hex;

export function ParentPinLock({ onUnlocked }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!localStorage.getItem('parent_pin_hash')) {
      hashPin('1234').then((h) => localStorage.setItem('parent_pin_hash', h));
    }
  }, []);

  useEffect(() => {
    let timer;
    if (lockout > 0) timer = setInterval(() => setLockout((l) => l - 1), 1000);
    return () => clearInterval(timer);
  }, [lockout]);

  const handleChange = (idx, val) => {
    if (lockout > 0) return;
    const ch = val.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[idx] = ch;
    setPin(next);
    if (ch && idx < 3) inputsRef.current[idx + 1]?.focus();
    if (next.every((d) => d !== '')) verifyPin(next.join(''));
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const verifyPin = async (entered) => {
    const hashed = await hashPin(entered);
    const stored = localStorage.getItem('parent_pin_hash');
    if (hashed === stored) {
      sessionStorage.setItem('parent_unlocked', 'true');
      setAttempts(0);
      onUnlocked();
    } else {
      setError('Incorrect PIN');
      setPin(['', '', '', '']);
      inputsRef.current[0]?.focus();
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 3) {
        setLockout(30);
        setAttempts(0);
      }
      setTimeout(() => setError(''), 2000);
    }
  };

  const press = (digit) => {
    const firstEmpty = pin.findIndex((d) => d === '');
    if (firstEmpty === -1) return;
    handleChange(firstEmpty, digit);
  };

  const del = () => {
    const lastFilled = [...pin].reverse().findIndex((d) => d !== '');
    if (lastFilled === -1) return;
    const idx = pin.length - 1 - lastFilled;
    const next = [...pin];
    next[idx] = '';
    setPin(next);
    inputsRef.current[idx]?.focus();
  };

  const reset = () => {
    setPin(['', '', '', '']);
    inputsRef.current[0]?.focus();
  };

  // Decorative grid background
  return (
    <div className="fixed inset-0 bg-paper text-ink flex items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[.18] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <a href="#/" className="sh-btn sh-btn-ghost absolute top-6 left-6 text-[13px]">
        <Ico.ArrowLeft width="16" height="16" /> Back to home
      </a>

      <div className="relative w-[440px] max-w-[92vw] bg-white rounded-[20px] border border-line-2 shadow-[0_18px_48px_rgba(22,24,43,.10)] px-9 pt-10 pb-8 overflow-hidden">
        {/* Top accent strip */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[5px]"
          style={{ background: 'linear-gradient(90deg, var(--color-ink) 0 50%, var(--color-brand) 50% 75%, var(--color-accent) 75%)' }}
        />

        <div className="flex items-center gap-2.5 mb-9">
          <span className="sh-mark" style={{ width: 32, height: 32, fontSize: 20 }}>S</span>
          <span className="font-bold text-[15px] tracking-tight">StudyHub</span>
          <span className="ml-auto text-[11px] text-muted bg-paper-2 px-2 py-1 rounded-md border border-line">
            Parent area
          </span>
        </div>

        <h1 className="serif text-[36px] leading-[1.05] mb-2 tracking-tight">Enter your PIN</h1>
        <p className="text-sm text-ink-3 leading-relaxed mb-7">
          Four digits unlocks authoring tools. Default is{' '}
          <span className="mono bg-paper-2 px-1.5 py-px rounded border border-line">1234</span>.
        </p>

        {/* PIN cells */}
        <div className="flex gap-3 mb-4" aria-label="PIN entry">
          {pin.map((d, i) => {
            const filled = d !== '';
            return (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={lockout > 0}
                aria-label={`PIN digit ${i + 1}`}
                className="flex-1 aspect-square rounded-[14px] text-center focus:outline-none transition"
                style={{
                  background: filled ? 'var(--color-ink)' : '#fff',
                  color: filled ? '#fff' : 'var(--color-ink)',
                  border: '1px solid var(--color-line-2)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 36,
                  boxShadow: '0 1px 2px rgba(22,24,43,.04)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-brand)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-line-2)';
                  e.target.style.boxShadow = '0 1px 2px rgba(22,24,43,.04)';
                }}
              />
            );
          })}
        </div>

        {lockout > 0 ? (
          <div className="text-danger text-sm font-semibold py-2">
            Too many attempts. Try again in {lockout}s.
          </div>
        ) : error ? (
          <div className="text-danger text-sm font-semibold py-2">{error}</div>
        ) : (
          <div className="text-muted text-[12.5px] py-2">
            {attempts > 0 ? `${3 - attempts} attempt${3 - attempts === 1 ? '' : 's'} remaining.` : ' '}
          </div>
        )}

        {/* On-screen keypad — bigger touch targets, parent-friendly */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => press(String(n))}
              disabled={lockout > 0}
              className="py-3.5 bg-paper-2 border border-line rounded-[12px] text-[18px] font-semibold text-ink hover:bg-paper transition disabled:opacity-40"
            >
              {n}
            </button>
          ))}
          <button
            onClick={reset}
            className="py-3.5 text-muted text-[12px] font-semibold"
          >
            Reset
          </button>
          <button
            onClick={() => press('0')}
            disabled={lockout > 0}
            className="py-3.5 bg-paper-2 border border-line rounded-[12px] text-[18px] font-semibold text-ink hover:bg-paper transition disabled:opacity-40"
          >
            0
          </button>
          <button
            onClick={del}
            className="py-3.5 text-muted text-[13px] font-semibold flex items-center justify-center gap-1.5"
          >
            <Ico.ArrowLeft width="14" height="14" /> Del
          </button>
        </div>

        <div className="mt-6 px-3.5 py-3 bg-paper-2 border border-line rounded-[10px] text-[12px] text-ink-3 leading-relaxed">
          <b className="text-ink">Heads up.</b> This PIN prevents accidental access only — it is not encryption.
          Content is stored in plain files.
        </div>
      </div>
    </div>
  );
}
