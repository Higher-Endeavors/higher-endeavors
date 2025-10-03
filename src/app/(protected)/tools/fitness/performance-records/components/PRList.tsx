'use client';

import { useMemo, useState } from 'react';
import ExercisePRCard from './ExercisePRCard';
import type { ExercisePerformanceRecords } from '../lib/performance-records.zod';
import type { StructuralBalanceImbalance } from '../lib/hooks/useStructuralBalanceAnalysis';


interface PRListProps {
  records: ExercisePerformanceRecords;
  imbalances?: { [exerciseName: string]: StructuralBalanceImbalance[] };
  isLoading?: boolean;
  error?: string | null;
}

export default function PRList({ records, imbalances = {}, isLoading, error }: PRListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImbalancesOnly, setShowImbalancesOnly] = useState(false);

  const filteredExercises = useMemo(() => {
    const normalizedRecords = records ?? {};
    const normalizedImbalances = imbalances ?? {};
    const normalizedTerm = searchTerm.trim().toLowerCase();

    const entries = Object.entries(normalizedRecords).map(([exerciseName, exerciseRecords]) => {
      const exerciseImbalances = normalizedImbalances[exerciseName] || [];
      const maxDeviation = exerciseImbalances.reduce((maxValue, imbalance) => {
        return Math.max(maxValue, imbalance.deviation);
      }, 0);

      return {
        exerciseName,
        exerciseRecords,
        exerciseImbalances,
        maxDeviation
      };
    });

    const filteredBySearch = normalizedTerm
      ? entries.filter((entry) => entry.exerciseName.toLowerCase().includes(normalizedTerm))
      : entries;

    const filteredByImbalance = showImbalancesOnly
      ? filteredBySearch.filter((entry) => entry.exerciseImbalances.length > 0)
      : filteredBySearch;

    const sortedEntries = [...filteredByImbalance].sort((a, b) => {
      if (showImbalancesOnly) {
        if (b.maxDeviation !== a.maxDeviation) {
          return b.maxDeviation - a.maxDeviation;
        }

        return a.exerciseName.localeCompare(b.exerciseName);
      }

      return a.exerciseName.localeCompare(b.exerciseName);
    });

    return sortedEntries;
  }, [records, imbalances, searchTerm, showImbalancesOnly]);

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

  const hasNoMatches = filteredExercises.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="md:max-w-sm w-full">
          <label htmlFor="exercise-search" className="sr-only">
            Search exercises
          </label>
          <input
            id="exercise-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search exercises"
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-200 dark:text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="show-imbalances-only"
            type="checkbox"
            checked={showImbalancesOnly}
            onChange={(event) => setShowImbalancesOnly(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-200"
          />
          <label htmlFor="show-imbalances-only" className="text-sm text-gray-700 dark:text-slate-400">
            Show only imbalanced exercises
          </label>
        </div>
      </div>

      {hasNoMatches ? (
        <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6">
          <div className="text-gray-600 dark:text-slate-600 text-center">
            {showImbalancesOnly
              ? 'No imbalanced exercises match your filters.'
              : `No exercises match "${searchTerm.trim()}".`}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredExercises.map(({ exerciseName, exerciseRecords, exerciseImbalances }) => (
            <ExercisePRCard
              key={exerciseName}
              exerciseName={exerciseName}
              records={exerciseRecords}
              imbalances={exerciseImbalances}
            />
          ))}
        </div>
      )}
    </div>
  );
}