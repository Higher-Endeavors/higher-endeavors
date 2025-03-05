/**
 * Week Tabs Component - Casing Conventions
 * 
 * This file follows these casing conventions:
 * 1. snake_case:
 *    - All types/interfaces that map to database structures
 *    - Properties that map to database columns
 *    - Utility functions that work with database-mapped types
 * 
 * 2. camelCase:
 *    - React component names (WeekTabs)
 *    - React props interfaces (WeekTabsProps)
 *    - React state variables
 *    - React event handlers (onWeekChange)
 *    - Component-specific helper functions
 * 
 * This approach aligns with:
 * - Database naming conventions (snake_case)
 * - React/TypeScript conventions (camelCase)
 * - Consistent patterns across the codebase
 */

import React from 'react';

/**
 * Props interface for the WeekTabs component
 * Using camelCase as these are React-specific props
 */
interface WeekTabsProps {
  activeWeek: number;
  programLength: number;
  onWeekChange: (weekNumber: number) => void;
}

export default function WeekTabs({ activeWeek, programLength, onWeekChange }: WeekTabsProps) {
  return (
    <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-4" aria-label="Week selection">
        {Array.from(
          { length: programLength },
          (_, i) => i + 1
        ).map((week) => (
          <button
            key={week}
            onClick={() => onWeekChange(week)}
            className={`
              whitespace-nowrap pb-4 px-4 border-b-2 font-medium text-sm
              ${activeWeek === week
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }
            `}
          >
            Week {week}
          </button>
        ))}
      </nav>
    </div>
  );
}