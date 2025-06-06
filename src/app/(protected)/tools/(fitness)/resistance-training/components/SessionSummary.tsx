'use client';

import { useState } from 'react';

export default function SessionSummary() {
  const [isOpen, setIsOpen] = useState(true);

  // Placeholder data for UI demonstration
  const placeholderSummary = {
    total_load: '10,000 lbs',
    total_sets: '24',
    total_reps: '240',
    total_exercises: '8',
    estimated_duration: '60 min',
    average_intensity: '75%'
  };

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Session Summary</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(placeholderSummary).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-white p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}