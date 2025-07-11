'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItem from './ExerciseItem';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '../types/resistance-training.zod';
import { FiCalendar } from 'react-icons/fi';

interface ExerciseListProps {
  exercises: ExerciseLibraryItem[] | null;
  isLoading: boolean;
  userId: number;
  plannedExercises: ProgramExercisesPlanned[];
  onEditExercise: (id: number) => void;
  onDeleteExercise: (id: number) => void;
  activeWeek: number; // Added for week filtering
}

export default function ExerciseList({
  exercises,
  isLoading,
  userId,
  plannedExercises,
  onEditExercise,
  onDeleteExercise,
  activeWeek // Added for week filtering
}: ExerciseListProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">Exercise List</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Exercise List</h2>
        <span
          className="text-gray-600 hover:text-gray-800 cursor-pointer relative"
          aria-label="Open calendar (coming soon)"
          tabIndex={0}
          onClick={() => setShowCalendar((prev) => !prev)}
          onBlur={() => setShowCalendar(false)}
        >
          <FiCalendar size={24} />
          {showCalendar && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4" style={{ minWidth: '16rem' }}>
              <CalendarGrid />
            </div>
          )}
        </span>
      </div>
      {/* Exercise List */}
      <div className="space-y-4">
        {plannedExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No exercises added yet. Click the button below to add exercises to your workout.
          </div>
        ) : (
          plannedExercises.map((exercise, index) => {
            const isFirstInGroup =
              index === 0 ||
              (exercise.pairing?.[0] ?? '') !== (plannedExercises[index - 1].pairing?.[0] ?? '');
            return (
              <div key={`${exercise.exerciseLibraryId}-${exercise.pairing ?? ''}`}>
                {isFirstInGroup && (
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-700">
                      Group {exercise.pairing?.[0] ?? ''}
                    </h3>
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
                <ExerciseItem
                  exercise={exercise}
                  exercises={exercises || []}
                  onEdit={onEditExercise}
                  onDelete={onDeleteExercise}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Simple static calendar grid for current month
function CalendarGrid() {
  // Get current month and year
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  // First day of month (0=Sun, 1=Mon...)
  const firstDay = new Date(year, month, 1).getDay();
  // Number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Build grid: pad with blanks for first week
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  // Render
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-900 dark:text-white">{monthNames[month]} {year}</span>
        <span className="text-xs text-gray-400">(static)</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <span key={d} className="font-medium text-gray-500 dark:text-gray-400">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, i) => (
          d ? (
            <span
              key={i}
              className="rounded-full py-1 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer text-gray-900 dark:text-white"
            >
              {d}
            </span>
          ) : (
            <span key={i} />
          )
        ))}
      </div>
    </div>
  );
}