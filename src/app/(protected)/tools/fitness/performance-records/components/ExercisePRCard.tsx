'use client';

import { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import type { PerformanceRecord } from '../lib/performance-records.zod';

interface ExercisePRCardProps {
  exerciseName: string;
  records: PerformanceRecord[];
}

export default function ExercisePRCard({ exerciseName, records }: ExercisePRCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
      {/* Card Header - Clickable to toggle */}
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-300 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {exerciseName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {records.length} personal record{records.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {isExpanded ? (
              <HiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <HiChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Card Body - Collapsible */}
      {isExpanded && (
        <div className="p-6">
          <div className="space-y-4">
            {records
              .sort((a, b) => a.repCount - b.repCount)
              .map((record, index) => (
                <div key={`${record.repCount}-${record.maxLoad}-${index}`} className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
                  {/* Top row: Reps and Load */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-900 font-semibold">
                      {record.repCount} rep{record.repCount !== 1 ? 's' : ''}
                    </span>
                    <span className="font-medium dark:text-slate-900">
                      {record.maxLoad} {record.loadUnit}
                    </span>
                  </div>
                  {/* Bottom row: Date and Program */}
                  <div className="mt-3 border-t pt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-slate-600">
                      {formatDate(record.date)}
                    </span>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium dark:text-slate-900">Program: </span>
                      <span className="dark:text-slate-900">{record.programName}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
