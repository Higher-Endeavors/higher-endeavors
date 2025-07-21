'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItemPlan from './ExerciseItemPlan';
import ExerciseItemAct from './ExerciseItemAct';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '../types/resistance-training.zod';
import { FiCalendar } from 'react-icons/fi';

// NEW: Import for modal/dialog
import { Modal } from 'flowbite-react';
import { saveResistanceSession } from '../lib/actions/saveResistanceSession';

interface ExerciseListProps {
  exercises: ExerciseLibraryItem[] | null;
  isLoading: boolean;
  userId: number;
  plannedExercises: ProgramExercisesPlanned[];
  onEditExercise: (id: number) => void;
  onDeleteExercise: (id: number) => void;
  activeWeek: number; // Added for week filtering
  onChangeVariation?: (id: number) => void;
  mode: 'plan' | 'act';
  setMode: (mode: 'plan' | 'act') => void;
  resistanceProgramId?: number;
  onActualsChange?: (actuals: { [exerciseIdx: number]: { [setIdx: number]: { reps: string; load: string } } }) => void;
}

export default function ExerciseList({
  exercises,
  isLoading,
  userId,
  plannedExercises,
  onEditExercise,
  onDeleteExercise,
  activeWeek,
  onChangeVariation,
  mode,
  setMode,
  resistanceProgramId,
  onActualsChange
}: ExerciseListProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  // NEW: Actuals state (array of arrays: [exerciseIdx][setIdx])
  const [actuals, setActuals] = useState<{ [exerciseIdx: number]: { [setIdx: number]: { reps: string; load: string } } }>({});
  // NEW: Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  // Removed summary modal state

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

  // NEW: Helper to handle actuals input
  const handleActualChange = (exerciseIdx: number, setIdx: number, field: 'reps' | 'load', value: string) => {
    setActuals(prev => {
      const newActuals = {
        ...prev,
        [exerciseIdx]: {
          ...(prev[exerciseIdx] || {}),
          [setIdx]: {
            ...(prev[exerciseIdx]?.[setIdx] || { reps: '', load: '' }),
            [field]: value
          }
        }
      };
      // Call the callback to notify parent of actuals change
      onActualsChange?.(newActuals);
      return newActuals;
    });
  };

  // NEW: Gather actuals for saving
  const gatherActualSets = () => {
    return plannedExercises.map((exercise, exerciseIdx) => {
      const sets = exercise.plannedSets || [];
      return sets.map((set, setIdx) => {
        const actual = actuals[exerciseIdx]?.[setIdx] || {};
        return {
          ...set,
          reps: actual.reps === undefined || actual.reps === '' ? null : Number(actual.reps),
          load: actual.load === undefined || actual.load === '' ? null : actual.load
        };
      });
    });
  };

  // NEW: Calculate summary
  const calculateSummary = () => {
    let plannedReps = 0, actualReps = 0, plannedLoad = 0, actualLoad = 0;
    plannedExercises.forEach((exercise, exerciseIdx) => {
      (exercise.plannedSets || []).forEach((set, setIdx) => {
        const plannedRepsVal = set.reps || 0;
        const plannedLoadVal = Number(set.load) || 0;
        plannedReps += plannedRepsVal;
        plannedLoad += plannedRepsVal * plannedLoadVal;

        const actual = actuals[exerciseIdx]?.[setIdx] || {};
        const actualRepsVal = actual.reps ? Number(actual.reps) : 0;
        const actualLoadVal = actual.load ? Number(actual.load) : 0;
        actualReps += actualRepsVal;
        actualLoad += actualRepsVal * actualLoadVal;
      });
    });
    return { plannedReps, actualReps, plannedLoad, actualLoad };
  };

  // NEW: Save actuals handler (calls server action, to be implemented)
  const handleSaveActuals = async () => {
    setSaving(true);
    const exercisesToSave = plannedExercises.map((exercise, exerciseIdx) => ({
      programExercisesId: exercise.programExercisesPlannedId,
      actualSets: (exercise.plannedSets || []).map((set, setIdx) => {
        const actual = actuals[exerciseIdx]?.[setIdx] || {};
        return {
          ...set,
          reps: actual.reps === undefined || actual.reps === '' ? null : Number(actual.reps),
          load: actual.load === undefined || actual.load === '' ? null : actual.load
        };
      })
    }));
    let result: any = { success: false, error: '' };
    if (resistanceProgramId) {
      result = await saveResistanceSession({
        userId,
        resistanceProgramId,
        week: activeWeek,
        date: '', // Not used for now
        exercises: exercisesToSave
      });
    } else {
      result.error = 'No program selected.';
    }
    setSaving(false);
    setShowConfirm(false);
    if (!result.success) {
      alert('Error saving session: ' + (result.error || 'Unknown error'));
    }
  };

  // NEW: Background color for Act mode
  const containerClass = mode === 'act'
    ? 'bg-purple-50 dark:bg-purple-100 rounded-lg shadow p-6 mb-4 relative'
    : 'bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4 relative';

  // Helper to calculate running actual load tally
  const calculateActualLoadTally = () => {
    let actualLoad = 0;
    plannedExercises.forEach((exercise, exerciseIdx) => {
      (exercise.plannedSets || []).forEach((set, setIdx) => {
        const actual = actuals[exerciseIdx]?.[setIdx] || {};
        const actualRepsVal = actual.reps ? Number(actual.reps) : 0;
        const actualLoadVal = actual.load ? Number(actual.load) : 0;
        if (actual.reps && actual.load) {
          actualLoad += actualRepsVal * actualLoadVal;
        }
      });
    });
    return actualLoad;
  };

  // Helper to calculate planned load tally
  const calculatePlannedLoadTally = () => {
    let plannedLoad = 0;
    plannedExercises.forEach((exercise) => {
      (exercise.plannedSets || []).forEach((set) => {
        const plannedRepsVal = set.reps || 0;
        const plannedLoadVal = Number(set.load) || 0;
        plannedLoad += plannedRepsVal * plannedLoadVal;
      });
    });
    return plannedLoad;
  };

  return (
    <div className={containerClass}>
      {/* Plan/Act Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Exercise List</h2>
        <div className="flex items-center gap-4">
          <span className={mode === 'plan' ? 'font-bold text-purple-700' : 'text-gray-500'}>Plan</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={mode === 'act'} onChange={() => setMode(mode === 'plan' ? 'act' : 'plan')} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-purple-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white border border-gray-300 rounded-full transition-all peer-checked:translate-x-5"></span>
          </label>
          <span className={mode === 'act' ? 'font-bold text-purple-700' : 'text-gray-500'}>Act</span>
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
      </div>
      {/* Exercise List */}
      <div className="space-y-4">
        {plannedExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No exercises added yet. Click the button below to add exercises to your workout.
          </div>
        ) : (
          plannedExercises.map((exercise, exerciseIdx) => {
            const isFirstInGroup =
              exerciseIdx === 0 ||
              (exercise.pairing?.[0] ?? '') !== (plannedExercises[exerciseIdx - 1].pairing?.[0] ?? '');
            return (
              <div key={`${exercise.exerciseLibraryId}-${exercise.pairing ?? ''}`}
                className="relative"
              >
                {isFirstInGroup && (
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-700">
                      Group {exercise.pairing?.[0] ?? ''}
                    </h3>
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
                {/* Plan Mode: show ExerciseItem as before */}
                {mode === 'plan' ? (
                  <ExerciseItemPlan
                    exercise={exercise}
                    exercises={exercises || []}
                    onEdit={onEditExercise}
                    onDelete={onDeleteExercise}
                    onChangeVariation={onChangeVariation}
                  />
                ) : (
                  <ExerciseItemAct
                    exercise={exercise}
                    exercises={exercises || []}
                    onEdit={onEditExercise}
                    onDelete={onDeleteExercise}
                    onChangeVariation={onChangeVariation}
                    actuals={actuals[exerciseIdx] || {}}
                    onActualChange={(setIdx, field, value) => handleActualChange(exerciseIdx, setIdx, field, value)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Complete Session button in Act mode */}
      {mode === 'act' && plannedExercises.length > 0 && (
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition"
            onClick={() => setShowConfirm(true)}
            disabled={saving}
          >
            Complete Session
          </button>
        </div>
      )}
      {/* Confirmation Dialog */}
      <Modal show={showConfirm} onClose={() => setShowConfirm(false)} size="md">
        <Modal.Header className="dark:text-slate-900">Complete Session</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-100">
              Are you sure you want to complete and save this Training Session? This will record your actuals for all sets.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-900 bg-gray-100 dark:bg-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActuals}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-700 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Complete Session'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
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