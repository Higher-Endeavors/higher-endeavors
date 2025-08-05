'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';

export default function ProgramBrowser() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Saved Programs</h2>
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
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Search programs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
            />

            <div className="grid grid-cols-2 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900">
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>

              <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium mb-2">No Saved Programs</p>
            <p className="text-sm text-center">Create your first Resistance Training Program to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}