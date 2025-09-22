'use client';

import { useState } from 'react';
import AddExerciseModal from '(protected)/tools/fitness/resistance-training/modals/AddExerciseModal';
import ExerciseItemPlan from '(protected)/tools/fitness/resistance-training/program/components/ExerciseItemPlan';
import ExerciseItemAct from '(protected)/tools/fitness/resistance-training/program/components/ExerciseItemAct';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { FiCalendar } from 'react-icons/fi';

// NEW: Import for modal/dialog
import { Modal } from 'flowbite-react';
import { saveResistanceSession } from '(protected)/tools/fitness/resistance-training/lib/actions/saveResistanceSession';

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
  actuals: { [programExercisesPlannedId: number]: { [setIdx: number]: { reps: string; load: string; duration?: string } } };
  onActualsChange: (actuals: { [programExercisesPlannedId: number]: { [setIdx: number]: { reps: string; load: string; duration?: string } } }) => void;
  sessionCompleted?: boolean;
  // Session editing props
  sessionEditMode?: boolean;
  editingSessionId?: number | null;
  updatedActuals?: { [programExercisesPlannedId: number]: { [setIdx: number]: { reps: string; load: string; duration?: string } } };
  modifiedFields?: { [programExercisesPlannedId: number]: { [setIdx: number]: { reps: boolean; load: boolean; duration: boolean } } };
  onEditSession?: () => void;
  onCancelSessionEdit?: () => void;
  onEditExerciseSession?: (exerciseId: number) => void;
  onCancelExerciseEdit?: () => void;
  onSessionFieldChange?: (exerciseId: number, setIdx: number, field: 'reps' | 'load' | 'duration', value: string) => void;
  onSaveSessionChanges?: () => void;
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
  actuals,
  onActualsChange,
  sessionCompleted = false,
  // Session editing props
  sessionEditMode = false,
  editingSessionId = null,
  updatedActuals = {},
  modifiedFields = {},
  onEditSession,
  onCancelSessionEdit,
  onEditExerciseSession,
  onCancelExerciseEdit,
  onSessionFieldChange,
  onSaveSessionChanges
}: ExerciseListProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  // Remove local actuals state - use parent state directly
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

  const sortExercisesByPairing = (exercises: ProgramExercisesPlanned[]): ProgramExercisesPlanned[] => {
    return [...exercises].sort((a, b) => {
      const pairingA = a.pairing || '';
      const pairingB = b.pairing || '';
      
      // Custom sorting logic for WU and CD
      const isWU_A = pairingA.toUpperCase() === 'WU';
      const isWU_B = pairingB.toUpperCase() === 'WU';
      const isCD_A = pairingA.toUpperCase() === 'CD';
      const isCD_B = pairingB.toUpperCase() === 'CD';
      
      // WU (Warm-Up) should always be first
      if (isWU_A && !isWU_B) return -1;
      if (!isWU_A && isWU_B) return 1;
      
      // CD (Cool Down) should always be last
      if (isCD_A && !isCD_B) return 1;
      if (!isCD_A && isCD_B) return -1;
      
      // If both are WU or both are CD, sort by the full pairing string
      if ((isWU_A && isWU_B) || (isCD_A && isCD_B)) {
        return pairingA.localeCompare(pairingB);
      }
      
      // For regular pairings (A1, B2, etc.), use the original logic
      const letterA = pairingA.charAt(0).toUpperCase();
      const letterB = pairingB.charAt(0).toUpperCase();
      const numberA = parseInt(pairingA.slice(1)) || 0;
      const numberB = parseInt(pairingB.slice(1)) || 0;
      
      if (letterA !== letterB) {
        return letterA.localeCompare(letterB);
      }
      return numberA - numberB;
    });
  };

  const sortedExercises = sortExercisesByPairing(plannedExercises);

  // Helper function to get display name for pairing groups
  const getGroupDisplayName = (pairing: string | undefined): string => {
    if (!pairing) return '';
    
    const upperPairing = pairing.toUpperCase();
    if (upperPairing === 'WU') return 'Warm-Up';
    if (upperPairing === 'CD') return 'Cool Down';
    
    // For regular pairings (A1, B2, etc.), show "Group" + first letter
    return `Group ${pairing.charAt(0).toUpperCase()}`;
  };

  // NEW: Helper to handle actuals input
  const handleActualChange = (programExercisesPlannedId: number, setIdx: number, field: 'reps' | 'load' | 'duration', value: string) => {
    const newActuals = {
      ...actuals,
      [programExercisesPlannedId]: {
        ...(actuals[programExercisesPlannedId] || {}),
        [setIdx]: {
          ...(actuals[programExercisesPlannedId]?.[setIdx] || { reps: '', load: '', duration: '' }),
          [field]: value
        }
      }
    };
    onActualsChange(newActuals);
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
          load: actual.load === undefined || actual.load === '' ? null : actual.load,
          duration: actual.duration === undefined || actual.duration === '' ? null : Number(actual.duration)
        };
      });
    });
  };

  // NEW: Calculate summary
  const calculateSummary = () => {
    let plannedReps = 0, actualReps = 0, plannedLoad = 0, actualLoad = 0;
    plannedExercises.forEach((exercise) => {
      (exercise.plannedSets || []).forEach((set, setIdx) => {
        const plannedRepsVal = set.reps || 0;
        const plannedLoadVal = Number(set.load) || 0;
        plannedReps += plannedRepsVal;
        plannedLoad += plannedRepsVal * plannedLoadVal;

        const actual = actuals[exercise.programExercisesPlannedId]?.[setIdx] || {};
        const actualRepsVal = actual.reps ? Number(actual.reps) : 0;
        const actualLoadVal = actual.load ? Number(actual.load) : 0;
        actualReps += actualRepsVal;
        actualLoad += actualRepsVal * actualLoadVal;
      });
    });
    return { plannedReps, actualReps, plannedLoad, actualLoad };
  };

  // Helper function to create set object with only fields that have values
  const createSetObject = (set: any, actual: any) => {
    const result: any = { set: set.set };
    
    // Only include fields that have actual values
    if (actual.reps !== undefined && actual.reps !== '') {
      result.reps = Number(actual.reps);
    }
    if (actual.load !== undefined && actual.load !== '') {
      result.load = actual.load;
    }
    if (actual.duration !== undefined && actual.duration !== '') {
      result.duration = Number(actual.duration);
    }
    if (actual.distance !== undefined && actual.distance !== '') {
      result.distance = Number(actual.distance);
    }
    if (actual.rest !== undefined && actual.rest !== '') {
      result.restSec = Number(actual.rest);
    }
    if (actual.rpe !== undefined && actual.rpe !== '') {
      result.rpe = Number(actual.rpe);
    }
    if (actual.rir !== undefined && actual.rir !== '') {
      result.rir = Number(actual.rir);
    }
    
    // Include units and other fields from the planned set if they exist
    if (set.loadUnit) result.loadUnit = set.loadUnit;
    if (set.distanceUnit) result.distanceUnit = set.distanceUnit;
    if (set.durationUnit) result.durationUnit = set.durationUnit;
    if (set.tempo) result.tempo = set.tempo;
    if (set.pace) result.pace = set.pace;
    if (set.speed) result.speed = set.speed;
    if (set.incline) result.incline = set.incline;
    if (set.resistance) result.resistance = set.resistance;
    if (set.rpm) result.rpm = set.rpm;
    if (set.watts) result.watts = set.watts;
    
    return result;
  };

  // NEW: Save actuals handler (calls server action, to be implemented)
  const handleSaveActuals = async () => {
    setSaving(true);
    const exercisesToSave = plannedExercises.map((exercise) => ({
      programExercisesId: exercise.programExercisesPlannedId,
      actualSets: (exercise.plannedSets || []).map((set, setIdx) => {
        const actual = actuals[exercise.programExercisesPlannedId]?.[setIdx] || {};
        return createSetObject(set, actual);
      }),
      // Additional fields for Act-only exercises (when programExercisesPlannedId === 0)
      exerciseSource: exercise.exerciseSource,
      exerciseLibraryId: exercise.exerciseLibraryId,
      userExerciseLibraryId: exercise.userExerciseLibraryId,
      pairing: exercise.pairing,
      notes: exercise.notes,
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
    plannedExercises.forEach((exercise) => {
      (exercise.plannedSets || []).forEach((set, setIdx) => {
        const actual = actuals[exercise.programExercisesPlannedId]?.[setIdx] || {};
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
      {/* Plan/Act Toggle and Session Completed Badge */}
      <div className="flex flex-row items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Exercise List</h2>
          {/* <span
            className="text-gray-600 hover:text-gray-800 cursor-pointer relative"
            aria-label="Open calendar (coming soon)"
            tabIndex={0}
            onClick={() => setShowCalendar((prev) => !prev)}
            onBlur={() => setShowCalendar(false)}
          >
            <FiCalendar size={24} />
            {showCalendar && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4" style={{ minWidth: '16rem' }}>
                <CalendarGrid />
              </div>
            )}
          </span> */}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <span className={mode === 'plan' ? 'font-bold text-purple-700' : 'text-gray-500'}>Plan</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={mode === 'act'} onChange={() => setMode(mode === 'plan' ? 'act' : 'plan')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-purple-600 transition-all"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white border border-gray-300 rounded-full transition-all peer-checked:translate-x-5"></span>
            </label>
            <span className={mode === 'act' ? 'font-bold text-purple-700' : 'text-gray-500'}>Act</span>
          </div>
          {sessionCompleted && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">
              Session Completed
            </span>
          )}
        </div>
      </div>
      {/* Exercise List */}
      <div className="space-y-4">
        {sortedExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No exercises added yet. Click the button below to add exercises to your workout.
          </div>
        ) : (
          sortedExercises.map((exercise, exerciseIdx) => {
            const isFirstInGroup =
              exerciseIdx === 0 ||
              (exercise.pairing?.[0] ?? '') !== (sortedExercises[exerciseIdx - 1].pairing?.[0] ?? '');
            return (
              <div key={`${exercise.exerciseLibraryId}-${exercise.pairing ?? ''}`}
                className="relative"
              >
                {isFirstInGroup && (
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-700">
                      {getGroupDisplayName(exercise.pairing)}
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
                    actuals={actuals[exercise.programExercisesPlannedId] || {}}
                    onActualChange={(setIdx, field, value) => handleActualChange(exercise.programExercisesPlannedId, setIdx, field, value)}
                    readOnly={sessionCompleted && !sessionEditMode}
                    // Session editing props
                    isEditing={sessionEditMode}
                    isCurrentEditing={editingSessionId === exercise.programExercisesPlannedId}
                    onEditSession={onEditExerciseSession}
                    onCancelEdit={onCancelExerciseEdit}
                    onFieldChange={onSessionFieldChange}
                    modifiedFields={modifiedFields[exercise.programExercisesPlannedId] || {}}
                    updatedActuals={updatedActuals[exercise.programExercisesPlannedId] || {}}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Session editing controls */}
      {mode === 'act' && plannedExercises.length > 0 && (
        <div className="flex justify-end mt-6 gap-3">
          {sessionCompleted && !sessionEditMode && (
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={onEditSession}
            >
              Edit Session
            </button>
          )}
          
          {sessionEditMode && (
            <>
              <button
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                onClick={onCancelSessionEdit}
              >
                Cancel All Changes
              </button>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                onClick={onSaveSessionChanges}
                disabled={Object.keys(updatedActuals).length === 0}
              >
                Save All Changes
              </button>
            </>
          )}
          
          {!sessionCompleted && (
            <button
              className="px-6 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition"
              onClick={() => setShowConfirm(true)}
              disabled={saving}
            >
              Complete Session
            </button>
          )}
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