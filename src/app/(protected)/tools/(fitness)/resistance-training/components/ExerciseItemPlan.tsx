'use client';

import React from 'react';
import { ProgramExercisesPlanned, ExerciseLibraryItem } from '../types/resistance-training.zod';
import { calculateTimeUnderTension } from '../../lib/calculations/resistanceTrainingCalculations';
import { HiOutlineDotsVertical } from 'react-icons/hi';

interface ExerciseItemPlanProps {
  exercise: ProgramExercisesPlanned;
  exercises: ExerciseLibraryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onChangeVariation?: (id: number) => void;
}

export default function ExerciseItemPlan({ exercise, exercises, onEdit, onDelete, onChangeVariation }: ExerciseItemPlanProps) {
  // Helper functions
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
      } else if (exercise.exerciseSource === 'cme_library') {
        // For CME activities, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'cme_library';
      } else {
        // For regular library exercises, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'library';
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

  // Helper to check if exercise is a Carry
  const isCarryExercise = (exerciseData?: ExerciseLibraryItem) => exerciseData?.exercise_family === 'Carry';

  // Helper to check if exercise is a Cycling exercise
  const isCyclingExercise = (exerciseData?: ExerciseLibraryItem) => exerciseData?.exercise_family === 'Cycling';

  // Helper to get total duration for Cycling exercises
  const getTotalDuration = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'minutes' };
    const totalValue = exercise.plannedSets.reduce((sum, set) => {
      // For Cycling exercises, duration is stored in the duration field
      return sum + (set.duration || 0);
    }, 0);
    return { value: totalValue, unit: 'minutes' };
  };

  // Helper to get total distance for Carry exercises
  const getTotalDistance = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'yards' };
    const units = exercise.plannedSets.map(set => set.distanceUnit || 'yards');
    const mostCommonUnit = units.length > 0 ? units[0] : 'yards';
    const totalValue = exercise.plannedSets.reduce((sum, set) => sum + (set.distance || 0), 0);
    return { value: totalValue, unit: mostCommonUnit };
  };

  // Helper to determine if Total Load should be shown
  function shouldShowTotalLoad() {
    if (!exercise.plannedSets) return false;
    return exercise.plannedSets.every(set => set.load && !isNaN(Number(set.load)));
  }

  const [menuOpen, setMenuOpen] = React.useState<{ [key: number]: boolean }>({});
  const getExerciseId = () => exercise.exerciseLibraryId || exercise.userExerciseLibraryId || 0;
  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const closeMenu = () => setMenuOpen({});

  const exerciseData = getExerciseNameData();
  const isCarry = isCarryExercise(exerciseData);
  const isCycling = isCyclingExercise(exerciseData);
  const gridColsClass = isCarry ? "md:grid-cols-4" : isCycling ? "md:grid-cols-7" : "md:grid-cols-6";

  // Helper to get the ExerciseLibraryItem for the current exercise
  function getExerciseNameData() {
    return exercises.find(ex => {
      if (exercise.exerciseSource === 'user') {
        return ex.userExerciseLibraryId === exercise.userExerciseLibraryId;
      } else if (exercise.exerciseSource === 'cme_library') {
        // For CME activities, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'cme_library';
      } else {
        // For regular library exercises, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'library';
      }
    });
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
          <span className="font-medium dark:text-slate-900">{getExerciseName()}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(getExerciseId());
            }}
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
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(getExerciseId());
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(getExerciseId());
                      closeMenu();
                    }}
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
      
      {/* Mobile-friendly table layout */}
      <div className="mt-3">
        {/* Desktop table header - hidden on mobile */}
        <div className={`hidden md:grid ${isCarry ? "md:grid-cols-4" : isCycling ? "md:grid-cols-8" : "md:grid-cols-6"} gap-2 text-sm font-semibold text-gray-500 dark:text-slate-600`}>
          <div>Set</div>
          <div className="font-bold">
            {isCarry ? 'Distance' : isCycling ? 'Duration (min)' : 'Reps'}
          </div>
          {isCycling && <div className="font-bold">Distance (mi)</div>}
          {!isCycling && <div className="font-bold">Load</div>}
          {isCycling && <div className="font-bold">Speed (mph)</div>}
          {isCycling && <div className="font-bold">RPM</div>}
          {isCycling && <div className="font-bold">Watts</div>}
          {isCycling && <div className="font-bold">Resistance</div>}
          {!isCarry && !isCycling && <div className="font-bold">Tempo</div>}
          <div className="font-bold">Rest</div>
          {!isCarry && !isCycling && <div className="font-bold">Time Under Tension</div>}
        </div>
        
        {/* Desktop table rows - hidden on mobile */}
        <div className={`hidden md:grid ${isCarry ? "md:grid-cols-4" : isCycling ? "md:grid-cols-8" : "md:grid-cols-6"} gap-2 text-sm dark:text-slate-600`}>
          {(exercise.plannedSets || []).flatMap((set, setIdx) => {
            const exerciseData = getExerciseNameData();
            const isCarry = isCarryExercise(exerciseData);
            const isCycling = isCyclingExercise(exerciseData);
            const plannedReps = set.reps || 0;
            const plannedDistance = set.distance || 0;
            const plannedDistanceUnit = set.distanceUnit || 'yards';
            const plannedLoad = set.load || '';
            const plannedUnit = getLoadUnit(set);
            // For Cycling exercises, get the additional fields from the set
            const speed = set.speed ?? 0;
            const rpm = set.rpm ?? 0;
            const watts = set.watts ?? 0;
            const resistance = set.resistance ?? 0;
            
            return [
              <div key={`${setIdx}-set`} className="flex items-center">{set.set || setIdx + 1}</div>,
              <div key={`${setIdx}-reps`} className="flex items-center">
                {isCarry ? `${plannedDistance} ${plannedDistanceUnit}` : isCycling ? (set.duration || 0) : plannedReps}
              </div>,
              isCycling && <div key={`${setIdx}-distance`} className="flex items-center">{set.distance || '-'}</div>,
              !isCycling && <div key={`${setIdx}-load`} className="flex items-center">{formatLoad(plannedLoad, plannedUnit)}</div>,
              isCycling && <div key={`${setIdx}-speed`} className="flex items-center">{speed || '-'}</div>,
              isCycling && <div key={`${setIdx}-rpm`} className="flex items-center">{rpm || '-'}</div>,
              isCycling && <div key={`${setIdx}-watts`} className="flex items-center">{watts || '-'}</div>,
              isCycling && <div key={`${setIdx}-resistance`} className="flex items-center">{resistance || '-'}</div>,
              !isCarry && !isCycling && <div key={`${setIdx}-tempo`} className="flex items-center">{set.tempo || '2010'}</div>,
              <div key={`${setIdx}-rest`} className="flex items-center">{set.restSec || 0}s</div>,
              !isCarry && !isCycling && <div key={`${setIdx}-tut`} className="flex items-center">{calculateTimeUnderTension(set.reps, set.tempo)} sec.</div>
            ];
          })}
        </div>
        
        {/* Mobile-friendly card layout - shown on mobile */}
        <div className="md:hidden space-y-3">
          {(exercise.plannedSets || []).map((set, setIdx) => {
            const exerciseData = getExerciseNameData();
            const isCarry = isCarryExercise(exerciseData);
            const isCycling = isCyclingExercise(exerciseData);
            const plannedReps = set.reps || 0;
            const plannedDistance = set.distance || 0;
            const plannedDistanceUnit = set.distanceUnit || 'yards';
            const plannedLoad = set.load || '';
            const plannedUnit = getLoadUnit(set);
            return (
              <div key={setIdx} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Set {set.set || setIdx + 1}</span>
                  <span className="text-sm font-bold text-gray-500">{set.restSec || 0}s Rest</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="font-bold text-gray-600 mb-1">
                      {isCarry ? 'Distance' : isCycling ? 'Duration (min)' : 'Reps'}
                    </div>
                    <span className="text-gray-800">
                      {isCarry ? `${plannedDistance} ${plannedDistanceUnit}` : isCycling ? (set.duration || 0) : plannedReps}
                    </span>
                  </div>
                  {!isCycling && (
                    <div>
                      <div className="font-bold text-gray-600 mb-1">Load</div>
                      <span className="text-gray-800">{formatLoad(plannedLoad, plannedUnit)}</span>
                    </div>
                  )}
                </div>
                {isCycling && (
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div>
                      <div className="font-bold text-gray-600 mb-1">Distance (mi)</div>
                      <span className="text-gray-800">{set.distance ?? '-'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 mb-1">Speed (mph)</div>
                      <span className="text-gray-800">{set.speed ?? '-'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 mb-1">RPM</div>
                      <span className="text-gray-800">{set.rpm ?? '-'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 mb-1">Watts</div>
                      <span className="text-gray-800">{set.watts ?? '-'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 mb-1">Resistance</div>
                      <span className="text-gray-800">{set.resistance ?? '-'}</span>
                    </div>
                  </div>
                )}
                {!isCarry && !isCycling && (
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div>
                      <div className="font-bold text-gray-600 mb-1">Tempo</div>
                      <span className="text-gray-800">{set.tempo || '2010'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 mb-1">TUT</div>
                      <span className="text-gray-800">{calculateTimeUnderTension(set.reps, set.tempo)} sec.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary row and notes, as in Plan mode */}
      <div className="mt-3 border-t pt-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium text-purple-700">
            {isCarry ? (
              <div>
                <span className="mr-1">Total Distance:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {getTotalDistance().value} {getTotalDistance().unit}
                </span>
              </div>
            ) : isCycling ? (
              <div>
                <span className="mr-1">Total Duration:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {getTotalDuration().value} {getTotalDuration().unit}
                </span>
              </div>
            ) : (
              <>
                <div>
                  <span className="mr-1">Total Reps:</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {exercise.plannedSets?.reduce((sum, set) => sum + (set.reps || 0), 0)}
                  </span>
                </div>
                {shouldShowTotalLoad() && (
                  <div>
                    <span className="mr-1">Total Load:</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {formatNumberWithCommas(getTotalLoad().value)} {getTotalLoad().unit}
                    </span>
                  </div>
                )}
              </>
            )}
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