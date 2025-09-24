'use client';

import { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import type { PerformanceRecord } from '../lib/performance-records.zod';

interface ExercisePRCardOldProps {
  exerciseName: string;
  records: PerformanceRecord[];
}

export default function ExercisePRCardOld({ exerciseName, records }: ExercisePRCardOldProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group records by load unit for consistent display
  const recordsByUnit = records.reduce((acc, record) => {
    if (!acc[record.loadUnit]) {
      acc[record.loadUnit] = [];
    }
    acc[record.loadUnit].push(record);
    return acc;
  }, {} as { [unit: string]: PerformanceRecord[] });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
      {/* Card Header - Clickable to toggle */}
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
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
          {Object.entries(recordsByUnit).map(([unit, unitRecords]) => (
            <div key={unit} className="mb-4 last:mb-0">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Records ({unit})
              </h4>
              <div className="space-y-2">
                {unitRecords
                  .sort((a, b) => a.repCount - b.repCount)
                  .map((record) => (
                    <div
                      key={`${record.repCount}-${record.maxLoad}`}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-700 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                          {record.repCount} rep{record.repCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {record.maxLoad} {unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(record.date)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                          {record.programName}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
