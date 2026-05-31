// MobileHelpDrawer.jsx — UPGRADED
// Preserves: open state, RightSidebar reuse, lg:hidden affordance, backdrop close.

import React, { useState, useEffect } from 'react';
import { RightSidebar } from '../StudyGuide/RightSidebar.jsx';
import { Ico } from '../../lib/Icons.jsx';

export function MobileHelpDrawer(props) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 lg:hidden z-40 px-4 py-3 rounded-full shadow-[0_4px_14px_rgba(22,24,43,.18)] inline-flex items-center gap-2 transition hover:brightness-110"
        style={{ background: 'var(--color-ink)', color: '#fff', fontSize: 13.5, fontWeight: 600 }}
      >
        <Ico.Hint width="16" height="16" />
        Need help?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(22,24,43,.45)' }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-[20px] bg-white shadow-[0_-18px_48px_rgba(22,24,43,.18)] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 bg-white pt-2 pb-3 border-b border-line">
              <div className="w-9 h-1 rounded-full bg-line-2 mx-auto mb-3" />
              <div className="flex items-center justify-between px-5">
                <h3 className="serif text-[20px] m-0 leading-tight">Help for this page</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink-3)' }}
                >
                  <Ico.Close width="15" height="15" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              <RightSidebar {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
