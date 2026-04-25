import React, { useState, useEffect } from 'react';
import { sha256hex } from '../../utils/cryptoUtils.js';

const hashPin = sha256hex;

export function ParentPinLock({ onUnlocked }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // initialize default hash if not present
    if (!localStorage.getItem('parent_pin_hash')) {
      hashPin('1234').then(h => localStorage.setItem('parent_pin_hash', h));
    }
  }, []);

  useEffect(() => {
    let timer;
    if (lockout > 0) {
      timer = setInterval(() => setLockout(l => l - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [lockout]);

  const handleChange = (idx, val) => {
    if (lockout > 0) return;
    const newPin = [...pin];
    newPin[idx] = val.slice(-1);
    setPin(newPin);

    // Auto-advance logic could go here

    if (newPin.every(d => d !== '')) {
      verifyPin(newPin.join(''));
    }
  };

  const verifyPin = async (enteredPin) => {
    const hashed = await hashPin(enteredPin);
    const stored = localStorage.getItem('parent_pin_hash');

    if (hashed === stored) {
      sessionStorage.setItem('parent_unlocked', 'true');
      setAttempts(0);
      onUnlocked();
    } else {
      setError('Incorrect PIN');
      setPin(['', '', '', '']);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockout(30);
        setAttempts(0);
      }
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-indigo-900 flex items-center justify-center text-white flex-col">
      <h2 className="text-3xl font-bold mb-8">Parent Access</h2>

      {lockout > 0 ? (
        <div className="text-red-400 text-xl">Locked out. Try again in {lockout}s</div>
      ) : (
        <div className="flex gap-4 mb-4">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              type="password"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-16 h-16 text-center text-3xl text-black rounded"
              maxLength={1}
            />
          ))}
        </div>
      )}

      {error && <div className="text-red-400 mt-2 font-bold animate-bounce">{error}</div>}

      <p className="mt-8 text-indigo-300 max-w-sm text-center text-sm">
        This PIN prevents accidental access only. It is not a security feature — content is stored in plain files. Do not use sensitive passwords.
      </p>
    </div>
  );
}
