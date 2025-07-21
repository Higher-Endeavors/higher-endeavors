import React from 'react';
import { ProgramExercisesPlanned, ExerciseSet, ExerciseLibraryItem } from '../types/resistance-training.zod';
import { calculateTimeUnderTension } from '../../lib/calculations/resistanceTrainingCalculations';
import { HiOutlineDotsVertical } from 'react-icons/hi';

interface ExerciseItemActProps {
  exercise: ProgramExercisesPlanned;
  exercises: ExerciseLibraryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onChangeVariation?: (id: number) => void;
  actuals: { [setIdx: number]: { reps: string; load: string } };
  onActualChange: (setIdx: number, field: 'reps' | 'load', value: string) => void;
}

export default function ExerciseItemAct({ exercise, exercises, onEdit, onDelete, onChangeVariation, actuals = {}, onActualChange }: ExerciseItemActProps) {
  // Helper functions copied from ExerciseItemPlan
  const getLoadUnit = (set: any) => set.loadUnit || 'lbs';
  const formatLoad = (load: string, unit?: string) => {
    if (!load || load === '0') return '0';
    if (load.toLowerCase().includes('bw') || load.toLowerCase().includes('band') || load.toLowerCase().includes('kg') || load.toLowerCase().includes('lbs')) {
      return load;
    }
    return `${load} ${unit || 'lbs'}`;
  };
  const getExerciseName = () => {
    const exerciseData = exercises.find(ex => {
      if (exercise.exerciseSource === 'user') {
        return ex.userExerciseLibraryId === exercise.userExerciseLibraryId;
      } else {
        return ex.exerciseLibraryId === exercise.exerciseLibraryId;
      }
    });
    return exerciseData?.name || `Exercise ${exercise.exerciseLibraryId || exercise.userExerciseLibraryId}`;
  };
  const formatNumberWithCommas = (x: number) => x.toLocaleString();
  const getTotalLoad = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'lbs' };
    const units = exercise.plannedSets.map(set => getLoadUnit(set));
    const mostCommonUnit = units.length > 0 ? units[0] : 'lbs';
    const totalValue = exercise.plannedSets.reduce((sum, set) => {
      const reps = set.reps || 0;
      const load = Number(set.load) || 0;
      return sum + (reps * load);
    }, 0);
    return { value: totalValue, unit: mostCommonUnit };
  };
  const getRIR = () => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return null;
    const rir = exercise.plannedSets[0].rir;
    return typeof rir === 'number' ? rir : null;
  };
  const getRPE = () => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return null;
    const rpe = exercise.plannedSets[0].rpe;
    return typeof rpe === 'number' ? rpe : null;
  };

  const [menuOpen, setMenuOpen] = React.useState<{ [key: number]: boolean }>({});
  const getExerciseId = () => exercise.exerciseLibraryId || exercise.userExerciseLibraryId || 0;
  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const closeMenu = () => setMenuOpen({});

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
          <span className="font-medium dark:text-slate-900">{getExerciseName()}</span>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.preventDefault(); toggleMenu(getExerciseId()); }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[getExerciseId()]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen[getExerciseId()] && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    onClick={e => { e.preventDefault(); onEdit(getExerciseId()); closeMenu(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); onDelete(getExerciseId()); closeMenu(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Table header */}
      <div className="grid grid-cols-6 gap-2 mt-3 text-sm font-semibold text-gray-500 dark:text-slate-600">
        <div>Set</div>
        <div>Reps (Planned/Actual)</div>
        <div>Load (Planned/Actual)</div>
        <div>Tempo</div>
        <div>Rest</div>
        <div>Time Under Tension</div>
      </div>
      {/* Table rows */}
      <div className="grid grid-cols-6 gap-2 text-sm dark:text-slate-600">
        {(exercise.plannedSets || []).map((set, setIdx) => {
          const plannedReps = set.reps || 0;
          const plannedLoad = set.load || '';
          const plannedUnit = getLoadUnit(set);
          const actualReps = actuals[setIdx]?.reps ?? '';
          const actualLoad = actuals[setIdx]?.load ?? '';
          return (
            <React.Fragment key={setIdx}>
              <div className="flex items-center">{set.set || setIdx + 1}</div>
              <div className="flex items-center gap-2">
                <span>{plannedReps}</span>
                <input
                  type="number"
                  min={0}
                  className={`w-14 px-1 py-0.5 border rounded ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${actualReps !== '' && Number(actualReps) !== plannedReps ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Actual"
                  value={actualReps}
                  onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span>{formatLoad(plannedLoad, plannedUnit)}</span>
                <input
                  type="text"
                  className={`w-16 px-1 py-0.5 border rounded ml-1 ${actualLoad !== '' && actualLoad !== plannedLoad ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Actual"
                  value={actualLoad}
                  onChange={e => onActualChange(setIdx, 'load', e.target.value)}
                />
              </div>
              <div className="flex items-center">{set.tempo || '2010'}</div>
              <div className="flex items-center">{set.restSec || 0}s</div>
              <div className="flex items-center">{calculateTimeUnderTension(set.reps, set.tempo)} sec.</div>
            </React.Fragment>
          );
        })}
      </div>
      {/* Summary row and notes, as in Plan mode */}
      <div className="mt-3 border-t pt-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm font-medium text-purple-700">
            <div>
              <span className="mr-1">Total Reps:</span>
              <span>{exercise.plannedSets?.reduce((sum, set) => sum + (set.reps || 0), 0)}</span>
            </div>
            <div>
              <span className="mr-1">Total Load:</span>
              <span>
                {formatNumberWithCommas(getTotalLoad().value)} {getTotalLoad().unit}
              </span>
            </div>
            {getRIR() !== null && (
              <div>
                <span className="mr-1">RIR:</span>
                <span>{getRIR()}</span>
              </div>
            )}
            {getRPE() !== null && (
              <div>
                <span className="mr-1">RPE:</span>
                <span>{getRPE()}</span>
              </div>
            )}
          </div>
          {exercise.notes && (
            <div className="text-sm text-gray-600">
              <span>
                <span className="font-medium dark:text-slate-900">Notes: </span>
                <span className="dark:text-slate-900">{exercise.notes}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 