import React, { useState } from 'react';
import { RightSidebar } from '../StudyGuide/RightSidebar.jsx';

export function MobileHelpDrawer(props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 lg:hidden z-40 px-4 py-3 rounded-full bg-blue-600 text-white shadow-lg font-semibold"
      >
        Need help?
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Help for this page</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500">Close</button>
            </div>
            <RightSidebar {...props} />
          </div>
        </div>
      )}
    </>
  );
}
