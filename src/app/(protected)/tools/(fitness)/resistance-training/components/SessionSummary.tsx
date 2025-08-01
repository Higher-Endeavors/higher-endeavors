'use client';

import { useState } from 'react';
import { ProgramExercisesPlanned } from '../types/resistance-training.zod';
import { calculateSessionStats } from '../../lib/calculations/resistanceTrainingCalculations';

interface SessionSummaryProps {
  exercises: ProgramExercisesPlanned[];
  preferredLoadUnit?: 'lbs' | 'kg';
  mode?: 'plan' | 'act';
  actuals?: { reps: number | null; load: string | null; duration?: number | null; }[][]; // [exerciseIdx][setIdx]
}

function formatNumberWithCommas(x: number): string {
  return x.toLocaleString();
}

// Helper to calculate percentage difference and determine color class
function getDeviationColor(actual: number, planned: number): string {
  if (planned === 0) return '';
  const percentageDiff = ((actual - planned) / planned) * 100;
  
  if (percentageDiff === 0) return ''; // No color for exact matches
  if (percentageDiff > 0) return 'bg-green-100 border-green-300 text-green-800'; // Green for exceeding planned
  if (percentageDiff >= -19) return 'bg-yellow-100 border-yellow-300 text-yellow-800'; // Yellow for 1-19% less
  return 'bg-red-100 border-red-300 text-red-800'; // Red for ≤20% less
}

function sumActuals(exercises: ProgramExercisesPlanned[], loadUnit: string, actuals?: { reps: number | null; load: string | null; duration?: number | null; }[][]) {
  let totalSets = 0, totalReps = 0, totalLoad = 0;
  exercises.forEach((exercise, exerciseIdx) => {
    const sets = exercise.plannedSets || [];
    sets.forEach((set, setIdx) => {
      totalSets++;
      // Always use planned for planned, but for actuals, only use if valid
      let reps = 0;
      let load = 0;
      if (actuals && actuals[exerciseIdx] && actuals[exerciseIdx][setIdx]) {
        const actual = actuals[exerciseIdx][setIdx];
        reps = (actual.reps !== null && actual.reps !== undefined) ? actual.reps : 0;
        load = (actual.load !== null && actual.load !== undefined && actual.load !== '') ? Number(actual.load) : 0;
      } else if ((exercise as any).actualSets && (exercise as any).actualSets[setIdx]) {
        // Fallback to actualSets on exercise if present
        const actual = (exercise as any).actualSets[setIdx];
        reps = (actual && actual.reps !== null && actual.reps !== undefined) ? actual.reps : 0;
        load = (actual && actual.load !== null && actual.load !== undefined && actual.load !== '') ? Number(actual.load) : 0;
      }
      totalReps += reps || 0;
      totalLoad += (reps || 0) * (load || 0);
    });
  });
  return { totalSets, totalReps, totalLoad };
}

export default function SessionSummary({ exercises, preferredLoadUnit, mode = 'plan', actuals }: SessionSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const loadUnit = preferredLoadUnit || 'lbs';
  const sessionStats = calculateSessionStats(exercises, loadUnit);
  const planned = {
    totalExercises: sessionStats.totalExercises,
    totalSets: sessionStats.totalSets,
    totalReps: sessionStats.totalReps,
    totalLoad: sessionStats.totalLoad,
    estimatedDuration: sessionStats.estimatedDuration,
  };
  const actual = mode === 'act' ? sumActuals(exercises, loadUnit, actuals) : null;

  const summaryData = mode === 'act' ? {
    'Estimated Duration': { value: planned.estimatedDuration, color: '' },
    'Total Exercises': { value: planned.totalExercises.toString(), color: '' },
    'Total Sets': { 
      value: `${planned.totalSets} / ${actual?.totalSets ?? 0}`, 
      color: getDeviationColor(actual?.totalSets ?? 0, planned.totalSets)
    },
    'Total Reps': { 
      value: `${planned.totalReps} / ${actual?.totalReps ?? 0}`, 
      color: getDeviationColor(actual?.totalReps ?? 0, planned.totalReps)
    },
    'Total Load': { 
      value: `${formatNumberWithCommas(Math.round(planned.totalLoad))} / ${formatNumberWithCommas(Math.round(actual?.totalLoad ?? 0))} ${loadUnit}`, 
      color: getDeviationColor(actual?.totalLoad ?? 0, planned.totalLoad)
    },
  } : {
    'Estimated Duration': { value: planned.estimatedDuration, color: '' },
    'Total Exercises': { value: planned.totalExercises.toString(), color: '' },
    'Total Sets': { value: planned.totalSets.toString(), color: '' },
    'Total Reps': { value: planned.totalReps.toString(), color: '' },
    'Total Load': { 
      value: planned.totalLoad > 0 ? `${formatNumberWithCommas(Math.round(planned.totalLoad))} ${loadUnit}` : `0 ${loadUnit}`, 
      color: '' 
    },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(summaryData).map(([key, data]) => (
              <div key={key} className="bg-white dark:bg-white p-3 sm:p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {key}
                </p>
                <p className={`text-base sm:text-lg font-semibold ${data.color ? `${data.color} px-2 py-1 rounded-full inline-block` : 'text-gray-900 dark:text-slate-900'}`}>
                  {data.value || '0'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}