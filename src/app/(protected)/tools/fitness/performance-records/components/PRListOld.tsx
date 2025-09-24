'use client';

import { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import PRItemOld from "./PRItemOld";
import type { ExercisePerformanceRecords } from '../lib/performance-records.zod';
import type { StructuralBalanceImbalance } from '../lib/hooks/useStructuralBalanceAnalysis';

interface PRListOldProps {
  records: ExercisePerformanceRecords;
  imbalances?: { [exerciseName: string]: StructuralBalanceImbalance[] };
  isLoading?: boolean;
  error?: string | null;
}

export default function PRListOld({ records, imbalances = {}, isLoading, error }: PRListOldProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (exerciseName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseName)) {
        newSet.delete(exerciseName);
      } else {
        newSet.add(exerciseName);
      }
      return newSet;
    });
  };
  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600 dark:text-slate-600">Loading performance records...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600 dark:text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!records || Object.keys(records).length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600 dark:text-slate-600">No performance records found. Start logging your workouts to see your personal records!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      {Object.entries(records).map(([exerciseName, exerciseRecords]) => {
        const isExpanded = expandedSections.has(exerciseName);
        const exerciseImbalances = imbalances[exerciseName] || [];
        
        return (
          <section key={exerciseName} className="mb-8">
            <div 
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => toggleSection(exerciseName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">
                    {exerciseName}
                  </h2>
                  {exerciseImbalances.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                        {exerciseImbalances.length} imbalance{exerciseImbalances.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-lg">
                        {exerciseImbalances.some(i => i.severity === 'red') ? '🚨' : '⚠️'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {exerciseRecords.length} record{exerciseRecords.length !== 1 ? 's' : ''}
                  </span>
                  <div className="ml-2">
                    {isExpanded ? (
                      <HiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <HiChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {exerciseRecords.map((record, index) => (
                  <PRItemOld 
                    key={`${exerciseName}-${record.repCount}-${index}`} 
                    record={record} 
                    exerciseName={exerciseName}
                    imbalances={exerciseImbalances}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
