import React from 'react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8" aria-hidden="true">
              <span className="absolute left-0 top-0 w-5 h-5 bg-emerald-400 border border-indigo-200 rounded-sm" />
              <span className="absolute left-2 top-1.5 w-5 h-5 bg-fuchsia-400 border border-indigo-200 rounded-sm" />
              <span className="absolute left-4 top-3 w-5 h-5 bg-sky-400 border border-indigo-200 rounded-sm" />
            </div>
            <span className="font-bold text-2xl text-indigo-900 tracking-tight">StudyHub</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium">Features</a>
          </nav>
        </div>
      </header>

      <main id="features" className="min-h-[calc(100vh-81px)] flex items-center justify-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#/parent"
            className="px-8 py-3 text-indigo-600 font-bold border-2 border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors text-center"
          >
            Parent Portal
          </a>
          <a
            href="#/student"
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-center"
          >
            Student Login
          </a>
        </div>
      </main>
    </div>
  );
}
