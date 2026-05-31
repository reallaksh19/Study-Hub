// Skeleton loaders — drop-in shimmering placeholders that match the upgraded
// chrome (rounded corners, paper background, design tokens).
//
// Usage:
//   import { SubjectGridSkeleton, TopicListSkeleton, PageListSkeleton, StudyGuideSkeleton } from './lib/Skeletons.jsx';
//   {loadingState === 'loading' ? <SubjectGridSkeleton/> : <ParentDashboard ... />}

import React from 'react';

// Base primitive
export function Skel({ w, h, br = 8, style }) {
  return (
    <span
      aria-hidden
      className="sh-skel"
      style={{
        display: 'inline-block',
        width: typeof w === 'number' ? `${w}px` : (w ?? '100%'),
        height: typeof h === 'number' ? `${h}px` : h,
        borderRadius: br,
        ...style,
      }}
    />
  );
}

// ─── Subject card (Parent dashboard) ─────────────────────────────────────────

export function SubjectCardSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-line-2)',
        borderRadius: 20,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--color-line-2)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Skel w={42} h={42} br={11} />
        <div style={{ flex: 1 }}>
          <Skel w="60%" h={20} br={6} />
          <div style={{ marginTop: 6 }}><Skel w="40%" h={12} br={4} /></div>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <Skel h={6} br={999} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        <Skel h={48} br={10} />
        <Skel h={48} br={10} />
        <Skel h={48} br={10} />
      </div>
      <Skel h={40} br={10} />
    </div>
  );
}

export function SubjectGridSkeleton({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => <SubjectCardSkeleton key={i} />)}
    </div>
  );
}

// ─── Topic row (Subject view) ────────────────────────────────────────────────

export function TopicRowSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-line-2)',
        borderRadius: 14,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderLeft: '3px solid var(--color-line-2)',
      }}
    >
      <Skel w={36} h={36} br={9} />
      <div style={{ flex: 1 }}>
        <Skel w="50%" h={18} br={6} />
        <div style={{ marginTop: 6 }}><Skel w="30%" h={12} br={4} /></div>
      </div>
      <Skel w={70} h={30} br={8} />
      <Skel w={90} h={30} br={8} />
    </div>
  );
}

export function TopicListSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => <TopicRowSkeleton key={i} />)}
    </div>
  );
}

// ─── Page row (Topic home) ───────────────────────────────────────────────────

export function PageRowSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-line-2)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <Skel w={22} h={12} br={4} />
      <Skel w={32} h={32} br={9} />
      <div style={{ flex: 1 }}>
        <Skel w={64} h={10} br={3} />
        <div style={{ marginTop: 6 }}><Skel w="60%" h={16} br={5} /></div>
        <div style={{ marginTop: 6 }}><Skel w="40%" h={11} br={4} /></div>
      </div>
      <Skel w={100} h={6} br={999} />
      <Skel w={70} h={30} br={8} />
    </div>
  );
}

export function PageListSkeleton({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => <PageRowSkeleton key={i} />)}
    </div>
  );
}

// ─── Study guide (article) ───────────────────────────────────────────────────

export function StudyGuideSkeleton() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 40px 64px' }}>
      <Skel w={140} h={12} br={4} />
      <div style={{ marginTop: 14 }}><Skel w="80%" h={46} br={8} /></div>
      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
        <Skel w={120} h={28} br={8} />
        <Skel w={90} h={28} br={8} />
      </div>
      <div style={{ marginTop: 24 }}>
        <Skel h={18} br={6} />
        <div style={{ marginTop: 8 }}><Skel h={18} br={6} /></div>
        <div style={{ marginTop: 8 }}><Skel w="80%" h={18} br={6} /></div>
      </div>
      <div style={{ marginTop: 28, padding: 24, borderRadius: 14, border: '1px solid var(--color-line-2)' }}>
        <Skel h={140} br={10} />
        <div style={{ marginTop: 14 }}><Skel w="40%" h={16} br={5} /></div>
        <div style={{ marginTop: 6 }}><Skel h={14} br={5} /></div>
        <div style={{ marginTop: 6 }}><Skel w="70%" h={14} br={5} /></div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Skel h={18} br={6} />
        <div style={{ marginTop: 8 }}><Skel w="90%" h={18} br={6} /></div>
      </div>
    </div>
  );
}

// ─── Study guide TOC (sidebar) ───────────────────────────────────────────────

export function StudyGuideTocSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <Skel w={18} h={18} br={999} />
          <div style={{ flex: 1 }}><Skel w={`${60 + (i % 3) * 10}%`} h={13} br={4} /></div>
        </div>
      ))}
    </div>
  );
}

// ─── Full Topic Home shell (for first paint) ────────────────────────────────

export function TopicHomeSkeleton() {
  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh' }}>
      <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--color-line)' }}>
        <Skel w={120} h={16} br={5} />
      </div>
      <div style={{ padding: '28px 32px 40px', maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--color-line-2)',
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 24,
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
          }}
        >
          <div style={{ padding: '32px 32px 28px' }}>
            <Skel w={120} h={12} br={4} />
            <div style={{ marginTop: 10 }}><Skel w="70%" h={42} br={8} /></div>
            <div style={{ marginTop: 14 }}><Skel h={14} br={5} /></div>
            <div style={{ marginTop: 6 }}><Skel w="80%" h={14} br={5} /></div>
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <Skel w={180} h={40} br={10} />
              <Skel w={120} h={40} br={10} />
            </div>
          </div>
          <div style={{ background: 'var(--color-paper-2)', borderLeft: '1px solid var(--color-line)', padding: 32 }}>
            <Skel w={100} h={11} br={3} />
            <div style={{ marginTop: 14, display: 'flex', gap: 14 }}>
              <Skel w={98} h={98} br={999} />
              <div style={{ flex: 1 }}>
                <Skel w="80%" h={20} br={6} />
                <div style={{ marginTop: 6 }}><Skel w="50%" h={12} br={4} /></div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Skel h={56} br={10} />
              <Skel h={56} br={10} />
              <Skel h={56} br={10} />
              <Skel h={56} br={10} />
            </div>
          </div>
        </div>
        <PageListSkeleton count={5} />
      </div>
    </div>
  );
}

// ─── Inject shimmer keyframes once (idempotent) ─────────────────────────────

if (typeof document !== 'undefined' && !document.getElementById('__sh_skeleton_keyframes')) {
  const style = document.createElement('style');
  style.id = '__sh_skeleton_keyframes';
  style.textContent = `
    .sh-skel {
      background: linear-gradient(90deg,
        color-mix(in oklab, var(--color-paper) 70%, transparent) 0%,
        color-mix(in oklab, var(--color-line-2) 60%, transparent) 50%,
        color-mix(in oklab, var(--color-paper) 70%, transparent) 100%
      );
      background-size: 200% 100%;
      animation: sh-skel-shimmer 1.4s ease-in-out infinite;
    }
    @keyframes sh-skel-shimmer {
      0%   { background-position: 100% 50%; }
      100% { background-position: -100% 50%; }
    }
    @media (prefers-reduced-motion: reduce) {
      .sh-skel { animation: none; background: var(--color-line); opacity: .5; }
    }
  `;
  document.head.appendChild(style);
}
