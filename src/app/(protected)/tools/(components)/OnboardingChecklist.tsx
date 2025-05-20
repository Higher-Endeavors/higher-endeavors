'use client';

import { useState } from 'react';

export default function OnboardingChecklist() {
  const [isOpen, setIsOpen] = useState(true);

  const checklistItems = [
    {
      id: 1,
      title: "Select User Profile",
      description: "Choose your profile or create a new one to track your progress",
      completed: false
    },
    {
      id: 2,
      title: "Browse Existing Programs",
      description: "Explore saved programs or start from scratch",
      completed: false
    },
    {
      id: 3,
      title: "Set Program Parameters",
      description: "Define your program's focus, periodization, and duration",
      completed: false
    },
    {
      id: 4,
      title: "Add Exercises",
      description: "Select exercises and organize them into groups",
      completed: false
    },
    {
      id: 5,
      title: "Review Session Summary",
      description: "Check total volume, sets, and estimated duration",
      completed: false
    }
  ];

  return (
    <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-slate-800 text-xl font-semibold">Getting Started</h2>
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
        <div className="mt-4 space-y-4">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${item.completed 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300 dark:border-gray-600'}`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}