// Placeholder to show Dashboard updates
import React from 'react';

export function Dashboard() {
  return (
    <div className="dashboard p-6 max-w-6xl mx-auto">
      {/* Continue Studying Section */}
      <div className="continue-studying mb-8 bg-white border rounded p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Continue Studying</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Physics · Gravity</div>
            <div className="font-bold">Next: Projectile Motion</div>
            <div className="w-64 h-2 bg-gray-200 rounded mt-2">
              <div className="w-1/2 h-full bg-blue-500 rounded"></div>
            </div>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Resume →
          </button>
        </div>
      </div>

      {/* Subject Cards... */}
    </div>
  );
}
