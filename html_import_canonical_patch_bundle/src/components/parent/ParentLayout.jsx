import React from 'react';

export function ParentLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-indigo-700">
          Parent Dashboard
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#/parent" className="block p-2 rounded hover:bg-indigo-700">🏠 Dashboard</a>
          <a href="#/parent/subjects" className="block p-2 rounded hover:bg-indigo-700">📚 Subjects</a>
          <a href="#/parent/import-html" className="block p-2 rounded hover:bg-indigo-700">🧩 HTML Import</a>
          <a href="#/parent/settings" className="block p-2 rounded hover:bg-indigo-700">⚙ Settings</a>
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <a href="/" className="block p-2 text-center border border-indigo-400 rounded hover:bg-indigo-700">
            ← Back to Student App
          </a>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {/* Breadcrumb would go here */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
