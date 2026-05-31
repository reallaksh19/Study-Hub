// CommandPalette — Cmd-K / Ctrl-K fuzzy launcher across subjects, topics, pages, tagged pages.
//
// Usage:
//   import { CommandPalette } from './components/CommandPalette.jsx';
//   <CommandPalette /> // mount once at root, inside DataProvider + StudyProvider
//
// Pulls subjects + topics from useData(), tagged pages from useStudy().
// All hotkeys: Cmd/Ctrl+K open · ↑/↓ navigate · Enter open · Esc close · /  shortcut to search field.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useStudy } from '../contexts/StudyContext.jsx';
import { getTopicFolder } from '../utils/topicUtils.js';
import { Ico } from '../lib/Icons.jsx';

// Lightweight fuzzy score — substring match weighted by:
// • word-start matches (highest)
// • contiguous run length
// • position (earlier is better)
// Returns 0 when no match.
function fuzzyScore(query, target) {
  if (!query) return 0.001; // include everything when query is empty
  const q = query.toLowerCase();
  const t = (target || '').toLowerCase();
  if (!t) return 0;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 500 - t.length;
  const idx = t.indexOf(q);
  if (idx >= 0) {
    const wordStart = idx === 0 || /\s|-/.test(t[idx - 1]);
    return (wordStart ? 200 : 80) - idx - (t.length - q.length) * 0.1;
  }
  // Per-char subseq match
  let ti = 0, score = 0, run = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const c = q[qi];
    const found = t.indexOf(c, ti);
    if (found === -1) return 0;
    if (found === ti) { run += 1; score += run * 4; }
    else { run = 1; score += 1; }
    ti = found + 1;
  }
  return score;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { subjects = [], topics = [] } = useData();
  const { state: studyState = {} } = useStudy();

  // Build a flat command list from data
  const commands = useMemo(() => {
    const cmds = [];

    // Top-level navigation
    cmds.push({ id: 'nav-dashboard',  kind: 'Action', title: 'Go to Dashboard',     subtitle: 'Parent dashboard', href: '#/parent', icon: <Ico.Compass width="15" height="15" /> });
    cmds.push({ id: 'nav-import',     kind: 'Action', title: 'Import content',      subtitle: 'Paste / HTML / ZIP', href: '#/parent/import', icon: <Ico.Upload width="15" height="15" /> });
    cmds.push({ id: 'nav-organise',   kind: 'Action', title: 'Organise',            subtitle: 'Reorder pages across topics', href: '#/parent/organise', icon: <Ico.Folder width="15" height="15" /> });
    cmds.push({ id: 'nav-scoreboard', kind: 'Action', title: 'Scoreboard',          subtitle: 'Per-topic mastery + exam scores', href: '#/parent/scoreboard', icon: <Ico.Chart width="15" height="15" /> });
    cmds.push({ id: 'nav-tags',       kind: 'Action', title: 'Tagged pages',        subtitle: 'Pages your kid wants help with', href: '#/parent/tags', icon: <Ico.Tag width="15" height="15" /> });
    cmds.push({ id: 'nav-settings',   kind: 'Action', title: 'Settings',            subtitle: 'API key, PIN, account', href: '#/parent/settings', icon: <Ico.Settings width="15" height="15" /> });
    cmds.push({ id: 'nav-student',    kind: 'Action', title: 'Open Student App',    subtitle: 'Switch to student view', href: '/', icon: <Ico.Eye width="15" height="15" /> });

    // Subjects
    subjects.forEach((s) => {
      cmds.push({
        id: `subj-${s.id}`,
        kind: 'Subject',
        title: s.title,
        subtitle: `${topics.filter((t) => t.subjectId === s.id).length} topics`,
        href: `#/parent/subject/${s.id}`,
        icon: <Ico.Layers width="15" height="15" />,
        searchText: s.title,
      });
    });

    // Topics
    topics.forEach((t) => {
      const folder = getTopicFolder(t, t.subjectId);
      const subject = subjects.find((s) => s.id === t.subjectId);
      cmds.push({
        id: `topic-${t.id}`,
        kind: 'Topic',
        title: t.title || folder,
        subtitle: `${subject?.title || t.subjectId} · ${t.pages?.length || 0} pages`,
        href: `#/parent/subject/${t.subjectId}/topic/${folder}`,
        icon: <Ico.Book width="15" height="15" />,
        searchText: `${t.title} ${subject?.title || ''}`,
      });
    });

    // Pages (cap to keep matrix small)
    topics.forEach((t) => {
      const folder = getTopicFolder(t, t.subjectId);
      const subject = subjects.find((s) => s.id === t.subjectId);
      (t.pages || []).forEach((p) => {
        const slug = String(p.file || '').startsWith('pages/')
          ? p.file.slice('pages/'.length).replace(/\.json$/, '')
          : String(p.id || '').split('-').pop();
        cmds.push({
          id: `page-${p.id}`,
          kind: 'Page',
          title: p.title || slug,
          subtitle: `${subject?.title || ''} › ${t.title}`,
          href: `#/parent/subject/${t.subjectId}/topic/${folder}/page/${slug}`,
          icon: <Ico.Bookmark width="15" height="15" />,
          searchText: `${p.title} ${t.title}`,
        });
      });
    });

    // Tagged pages (open ones surface high in results)
    const openTags = (studyState.studentTags || []).filter((t) => t.status !== 'closed');
    openTags.forEach((tag) => {
      const topic = topics.find((t) => t.id === tag.topicId);
      const subject = subjects.find((s) => s.id === topic?.subjectId);
      cmds.push({
        id: `tag-${tag.id}`,
        kind: 'Tagged',
        title: tag.pageTitle || tag.pageId,
        subtitle: `${subject?.title || ''} · tagged by student${tag.note ? ' — ' + String(tag.note).slice(0, 50) : ''}`,
        href: '#/parent/tags',
        icon: <Ico.Tag width="15" height="15" />,
        searchText: `${tag.pageTitle} tagged ${tag.note || ''}`,
        accent: 'var(--color-accent)',
        priority: 3,
      });
    });

    return cmds;
  }, [subjects, topics, studyState.studentTags]);

  // Filter + sort
  const results = useMemo(() => {
    const scored = commands
      .map((c) => ({
        cmd: c,
        score: fuzzyScore(query, c.searchText || c.title) + (c.priority ? c.priority * 10 : 0),
      }))
      .filter((r) => r.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 30).map((r) => r.cmd);
  }, [commands, query]);

  // Group results by kind (ordered)
  const grouped = useMemo(() => {
    const KIND_ORDER = ['Tagged', 'Action', 'Subject', 'Topic', 'Page'];
    const map = {};
    results.forEach((r) => { (map[r.kind] ||= []).push(r); });
    return KIND_ORDER.filter((k) => map[k]?.length > 0).map((k) => ({ kind: k, items: map[k] }));
  }, [results]);

  // Flat array (used by keyboard nav)
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Global Cmd-K listener
  useEffect(() => {
    const onKey = (e) => {
      const isModK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      if (isModK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // "/" shortcut, only when not typing in an input
      if (e.key === '/' && !open) {
        const ae = document.activeElement;
        const isTyping = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
        if (!isTyping) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Body scroll lock + focus + reset
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setQuery('');
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Reset active row when query changes
  useEffect(() => { setActive(0); }, [query]);

  // Scroll active row into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-cmd-idx="${active}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [active, open]);

  const exec = (cmd) => {
    if (!cmd) return;
    setOpen(false);
    if (cmd.href) {
      if (cmd.href.startsWith('#')) window.location.hash = cmd.href.slice(1);
      else window.location.assign(cmd.href);
    }
    cmd.onSelect?.();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape')      { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter')     { e.preventDefault(); exec(flat[active]); }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9997,
        background: 'rgba(22,24,43,.40)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh', paddingLeft: 16, paddingRight: 16,
        animation: 'sh-fade-in 120ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          width: '100%', maxWidth: 600, maxHeight: '70vh',
          borderRadius: 16,
          boxShadow: '0 24px 56px rgba(22,24,43,.18), 0 6px 16px rgba(22,24,43,.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'sh-pop-in 160ms cubic-bezier(.2,.8,.2,1.2)',
        }}
      >
        {/* Input row */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-line)',
          }}
        >
          <Ico.Search width="18" height="18" style={{ color: 'var(--color-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to subject, topic, page…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 16, fontFamily: 'inherit', color: 'var(--color-ink)',
            }}
          />
          <span
            style={{
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              color: 'var(--color-muted)', padding: '2px 7px', borderRadius: 5,
              background: 'var(--color-paper-2)', border: '1px solid var(--color-line)',
            }}
          >
            esc
          </span>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
          {grouped.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13.5 }}>
              No results for <b style={{ color: 'var(--color-ink-2)' }}>"{query}"</b>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.kind} style={{ marginBottom: 4 }}>
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--color-muted)',
                  }}
                >
                  {group.kind === 'Tagged' ? 'Needs your review' : group.kind}
                </div>
                {group.items.map((cmd) => {
                  const idx = flat.indexOf(cmd);
                  const isActive = idx === active;
                  return (
                    <div
                      key={cmd.id}
                      data-cmd-idx={idx}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => exec(cmd)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '9px 12px', borderRadius: 8,
                        background: isActive ? 'var(--color-paper)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                          background: 'var(--color-paper-2)',
                          border: '1px solid var(--color-line)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: cmd.accent || 'var(--color-ink-3)',
                        }}
                      >
                        {cmd.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cmd.title}
                        </div>
                        {cmd.subtitle && (
                          <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 1,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cmd.subtitle}
                          </div>
                        )}
                      </div>
                      {isActive && <Ico.Arrow width="14" height="14" style={{ color: 'var(--color-muted)' }} />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div
          style={{
            borderTop: '1px solid var(--color-line)', padding: '8px 14px',
            display: 'flex', gap: 14, fontSize: 11, color: 'var(--color-muted)',
            background: 'var(--color-paper-2)',
          }}
        >
          <Hint label="↑↓" desc="navigate" />
          <Hint label="↵"  desc="open" />
          <Hint label="esc" desc="close" />
          <span style={{ marginLeft: 'auto' }}>{flat.length} result{flat.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Hint({ label, desc }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 10.5,
          padding: '1px 6px', borderRadius: 4,
          background: '#fff', border: '1px solid var(--color-line)',
          color: 'var(--color-ink-2)',
        }}
      >
        {label}
      </span>
      {desc}
    </span>
  );
}
