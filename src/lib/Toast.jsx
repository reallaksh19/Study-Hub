// Toast + Confirm — drops every native alert() / confirm() / prompt() in the
// upgrade with portal-based UI that respects the existing design tokens.
//
// Usage:
//   1. Wrap your <App/> with <ToastProvider>.
//   2. const toast = useToast();   toast.show('Saved.', { variant: 'success' });
//   3. const confirm = useConfirm(); const ok = await confirm({ title, body, variant: 'danger', typeToConfirm: 'Physics' });

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Ico } from './Icons.jsx';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const resolverRef = useRef(null);

  const show = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const toast = {
      id,
      message,
      variant: opts.variant || 'default', // 'default' | 'success' | 'error' | 'info'
      duration: opts.duration ?? 3500,
      action: opts.action || null,
    };
    setToasts((t) => [...t, toast]);
    if (toast.duration > 0) {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), toast.duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setConfirmState({
        title: opts.title || 'Are you sure?',
        body: opts.body || '',
        confirmLabel: opts.confirmLabel || 'Confirm',
        cancelLabel: opts.cancelLabel || 'Cancel',
        variant: opts.variant || 'default', // 'default' | 'danger'
        typeToConfirm: opts.typeToConfirm || null,
      });
    });
  }, []);

  const closeConfirm = (value) => {
    setConfirmState(null);
    resolverRef.current?.(value);
    resolverRef.current = null;
  };

  return (
    <ToastCtx.Provider value={{ show, dismiss, confirm }}>
      {children}
      {ReactDOM.createPortal(
        <>
          <ToastStack toasts={toasts} dismiss={dismiss} />
          {confirmState && <ConfirmDialog {...confirmState} onClose={closeConfirm} />}
        </>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return { show: ctx.show, dismiss: ctx.dismiss };
}

export function useConfirm() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useConfirm must be used inside <ToastProvider>');
  return ctx.confirm;
}

// ─── Stack ───────────────────────────────────────────────────────────────────

function ToastStack({ toasts, dismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
    </div>
  );
}

const VARIANT_STYLE = {
  default: { bg: 'var(--color-ink)',          fg: '#fff',                  accent: 'var(--color-brand)',   icon: null },
  success: { bg: '#fff',                       fg: 'var(--color-ink)',     accent: 'var(--color-success)', icon: 'check' },
  error:   { bg: '#fff',                       fg: 'var(--color-ink)',     accent: 'var(--color-danger)',  icon: 'close' },
  info:    { bg: '#fff',                       fg: 'var(--color-ink)',     accent: 'var(--color-brand)',   icon: 'info' },
};

function ToastCard({ toast, onDismiss }) {
  const s = VARIANT_STYLE[toast.variant] || VARIANT_STYLE.default;
  const isLight = toast.variant !== 'default';
  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        minWidth: 280,
        maxWidth: 420,
        background: s.bg,
        color: s.fg,
        borderRadius: 12,
        border: isLight ? `1px solid var(--color-line-2)` : `1px solid var(--color-ink-2)`,
        boxShadow: '0 18px 48px rgba(22,24,43,.12), 0 4px 12px rgba(22,24,43,.06)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontSize: 13.5,
        lineHeight: 1.4,
        position: 'relative',
        overflow: 'hidden',
        animation: 'sh-toast-in 200ms ease-out',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.accent,
        }}
      />
      {s.icon && (
        <span
          style={{
            width: 22, height: 22, borderRadius: 6,
            background: s.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {s.icon === 'check' && <Ico.Check width="13" height="13" />}
          {s.icon === 'close' && <Ico.Close width="13" height="13" />}
          {s.icon === 'info'  && <span style={{ fontSize: 11, fontWeight: 700 }}>i</span>}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: s.icon ? 0 : 8 }}>
        <div style={{ fontWeight: 500 }}>{toast.message}</div>
      </div>
      {toast.action && (
        <button
          onClick={() => { toast.action.onClick?.(); onDismiss(); }}
          style={{
            background: 'transparent',
            border: 'none', cursor: 'pointer',
            color: s.accent, fontWeight: 600, fontSize: 12.5,
            padding: '2px 6px', borderRadius: 6,
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: isLight ? 'var(--color-muted)' : 'rgba(255,255,255,.55)',
          padding: 2, display: 'flex',
        }}
        aria-label="Dismiss"
      >
        <Ico.Close width="14" height="14" />
      </button>
    </div>
  );
}

// ─── Confirm dialog ──────────────────────────────────────────────────────────

function ConfirmDialog({ title, body, confirmLabel, cancelLabel, variant, typeToConfirm, onClose }) {
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (typeToConfirm ? inputRef : confirmRef).current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose(false);
      if (e.key === 'Enter' && (!typeToConfirm || typed === typeToConfirm)) onClose(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [typeToConfirm, typed, onClose]);

  const isDanger = variant === 'danger';
  const confirmDisabled = typeToConfirm && typed !== typeToConfirm;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(22,24,43,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'sh-fade-in 150ms ease-out',
      }}
      onClick={() => onClose(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%',
          boxShadow: '0 24px 56px rgba(22,24,43,.18), 0 6px 16px rgba(22,24,43,.08)',
          padding: '24px 26px',
          animation: 'sh-pop-in 180ms cubic-bezier(.2,.8,.2,1.2)',
        }}
      >
        <h2
          className="serif"
          style={{ fontSize: 22, margin: 0, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 8 }}
        >
          {title}
        </h2>
        {body && (
          <p style={{ fontSize: 14, color: 'var(--color-ink-3)', margin: 0, lineHeight: 1.55, marginBottom: typeToConfirm ? 14 : 22 }}>
            {body}
          </p>
        )}

        {typeToConfirm && (
          <>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 6 }}>
              Type <b style={{ color: 'var(--color-ink)' }}>{typeToConfirm}</b> to confirm:
            </div>
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--color-line-2)',
                borderRadius: 9,
                fontSize: 14,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                outline: 'none',
                marginBottom: 18,
                background: 'var(--color-paper-2)',
              }}
              placeholder={typeToConfirm}
            />
          </>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={() => onClose(false)}
            className="sh-btn sh-btn-secondary"
            style={{ fontSize: 13 }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            disabled={confirmDisabled}
            onClick={() => onClose(true)}
            className="sh-btn"
            style={{
              fontSize: 13,
              background: isDanger ? 'var(--color-danger)' : 'var(--color-ink)',
              color: '#fff',
              opacity: confirmDisabled ? 0.5 : 1,
              cursor: confirmDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Inject the tiny CSS keyframes once (idempotent). Avoids needing to touch index.css.
if (typeof document !== 'undefined' && !document.getElementById('__sh_toast_keyframes')) {
  const style = document.createElement('style');
  style.id = '__sh_toast_keyframes';
  style.textContent = `
    @keyframes sh-toast-in { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
    @keyframes sh-fade-in  { from { opacity:0; } to { opacity:1; } }
    @keyframes sh-pop-in   { from { opacity:0; transform: scale(.96); } to { opacity:1; transform: scale(1); } }
  `;
  document.head.appendChild(style);
}
