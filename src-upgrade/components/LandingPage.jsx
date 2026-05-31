// LandingPage.jsx — UPGRADED
// Drop-in replacement for src/components/LandingPage.jsx.
// Same routes (#/parent, #/student), refined visual treatment.

import React from 'react';
import { Ico } from '../lib/Icons.jsx';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink relative overflow-hidden">
      {/* Subtle paper-noise overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(rgba(22,24,43,.025) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-14 py-5 border-b border-line">
        <span className="sh-logo text-[18px]">
          <span className="sh-mark">S</span>
          StudyHub
        </span>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-ink-3">
          <a href="#features">How it works</a>
          <a href="#parents">For parents</a>
          <a href="#curriculum">Curriculum</a>
        </nav>
        <a href="#/parent" className="sh-btn sh-btn-ghost text-[13px]">Sign in</a>
      </header>

      {/* Hero */}
      <main
        id="features"
        className="relative z-10 grid lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-16 px-6 sm:px-14 pt-12 lg:pt-16 pb-8 items-center max-w-[1400px] mx-auto"
      >
        <div>
          <div className="sh-chip mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Grade 8 · Personalised curriculum
          </div>

          <h1 className="serif text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight mb-5">
            A study hub built<br />
            for <em className="italic text-brand">one</em> kid.
          </h1>
          <p className="text-base sm:text-[17px] leading-relaxed text-ink-3 max-w-[480px] mb-9">
            Lessons, clarifiers and quizzes that you author — paced and unlocked for your child.
            No accounts, no ads, no algorithms.
          </p>

          {/* Role cards — replaces the two flat buttons */}
          <div className="grid grid-cols-2 gap-3 max-w-[560px]">
            <a
              href="#/student"
              className="group block rounded-[20px] bg-ink text-white p-5 pt-5 shadow-[0_4px_14px_rgba(22,24,43,.06)] transition hover:brightness-110 no-underline"
            >
              <div className="flex justify-between items-start mb-12">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
                  For your child
                </span>
                <Ico.Arrow width="18" height="18" className="text-white" />
              </div>
              <div className="serif text-[30px] leading-[1.05]">
                Student<br />Login
              </div>
              <div className="text-[13px] text-white/60 mt-2">
                Resume where you left off →
              </div>
            </a>

            <a
              href="#/parent"
              className="group block rounded-[20px] bg-white text-ink p-5 pt-5 shadow-[0_4px_14px_rgba(22,24,43,.06)] border border-line-2 transition hover:bg-paper-2 no-underline"
            >
              <div className="flex justify-between items-start mb-12">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  For you
                </span>
                <Ico.Arrow width="18" height="18" />
              </div>
              <div className="serif text-[30px] leading-[1.05]">
                Parent<br />Portal
              </div>
              <div className="text-[13px] text-muted mt-2">
                4-digit PIN · Author content
              </div>
            </a>
          </div>
        </div>

        {/* Decorative card stack on the right */}
        <HeroStack />
      </main>

      {/* Footnote strip */}
      <div className="relative z-10 flex flex-wrap gap-x-12 gap-y-2 px-6 sm:px-14 py-5 border-t border-line text-[13px] text-muted max-w-[1400px] mx-auto">
        <span><b className="text-ink-2">3 subjects</b> · Physics · Maths · Biology</span>
        <span><b className="text-ink-2">147 pages</b> authored this term</span>
        <span><b className="text-ink-2">Mastery 78%</b> across topics</span>
      </div>
    </div>
  );
}

function HeroStack() {
  return (
    <div className="relative h-[520px] hidden lg:block">
      {/* Background card */}
      <div
        aria-hidden
        className="absolute rounded-[24px] border border-line"
        style={{ left: 60, top: 36, width: 380, height: 440, background: 'var(--color-violet-soft)', transform: 'rotate(-6deg)' }}
      />
      {/* Mid card — page preview */}
      <div
        className="absolute rounded-[24px] bg-white border border-line-2"
        style={{ left: 30, top: 64, width: 380, height: 440, transform: 'rotate(-2.5deg)', boxShadow: '0 18px 48px rgba(22,24,43,.10), 0 4px 12px rgba(22,24,43,.05)' }}
      >
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E5C5C5' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E5DDC5' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#C5DDE5' }} />
          </div>
          <div className="text-[12px] text-muted mb-2">Physics · Gravity</div>
          <div className="serif text-2xl leading-[1.15]">Projectile<br />motion</div>
          <div className="mt-3 p-3 rounded-[12px] border border-line bg-paper-2 text-[13px] leading-relaxed text-ink-3">
            A projectile is any object thrown into the air with a velocity. Once released, only gravity acts on it.
          </div>
          <div
            className="mt-3 px-3 py-2.5 rounded-[10px] text-[12.5px] flex gap-2"
            style={{ background: 'var(--color-warn-soft)', border: '1px solid #F0E0AE', color: 'var(--color-warn)' }}
          >
            <span>⚠</span> Common slip: confusing velocity with speed.
          </div>
        </div>
      </div>
      {/* Foreground quiz card */}
      <div
        className="absolute rounded-[20px] bg-ink text-white p-5 border border-ink-2"
        style={{ left: 130, top: 240, width: 320, height: 240, transform: 'rotate(4deg)', boxShadow: '0 18px 48px rgba(22,24,43,.10), 0 4px 12px rgba(22,24,43,.05)' }}
      >
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-[11px] uppercase tracking-[0.08em] text-white/55">Quiz · Q3 of 6</span>
          <span className="text-[11px] text-white/55">00:42</span>
        </div>
        <div className="serif text-[18px] leading-tight mb-3.5">
          At max height, what is the vertical velocity?
        </div>
        <div className="grid gap-2">
          {['Equal to g', 'Zero', 'Twice initial'].map((l, i) => {
            const ok = i === 1;
            return (
              <div
                key={i}
                className="px-3 py-2 rounded-[10px] text-[13px] flex items-center gap-2.5"
                style={{
                  background: ok ? 'var(--color-success-soft)' : 'rgba(255,255,255,.06)',
                  border: ok ? '1px solid #95D2B3' : '1px solid rgba(255,255,255,.1)',
                  color: ok ? 'var(--color-success)' : 'rgba(255,255,255,.85)',
                  fontWeight: ok ? 700 : 500,
                }}
              >
                <span className="font-bold opacity-70 text-[11px]">{String.fromCharCode(65 + i)}</span>
                {l}
                {ok && <Ico.Check width="14" height="14" className="ml-auto" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
