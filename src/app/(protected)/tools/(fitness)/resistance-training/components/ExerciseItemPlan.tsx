'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { ProgramExercisesPlanned, ExerciseSet, ExerciseLibraryItem } from '../types/resistance-training.zod';
import { calculateTimeUnderTension } from '../../lib/calculations/resistanceTrainingCalculations';

interface ExerciseItemPlanProps {
  exercise: ProgramExercisesPlanned;
  exercises: ExerciseLibraryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onChangeVariation?: (id: number) => void;
}

export default function ExerciseItemPlan({ exercise, exercises, onEdit, onDelete, onChangeVariation }: ExerciseItemPlanProps) {
  const [menuOpen, setMenuOpen] = useState<{ [key: number]: boolean }>({});

  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get the correct exercise ID for this exercise
  const getExerciseId = () => {
    return exercise.exerciseLibraryId || exercise.userExerciseLibraryId || 0;
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  // Helper function to get load unit from a set
  const getLoadUnit = (set: any) => {
    return set.loadUnit || 'lbs'; // Default to lbs if no unit specified
  };

  // Helper function to format load with unit
  const formatLoad = (load: string, unit?: string) => {
    if (!load || load === '0') return '0';
    // If the load already contains a unit (like "BW" or "Red Band"), return as is
    if (load.toLowerCase().includes('bw') || load.toLowerCase().includes('band') || load.toLowerCase().includes('kg') || load.toLowerCase().includes('lbs')) {
      return load;
    }
    // Otherwise, append the unit
    return `${load} ${unit || 'lbs'}`;
  };

  // Get exercise name by looking up the ID in the exercises array
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

  // Calculate total load for this exercise
  const getTotalLoad = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'lbs' };
    
    // Get the most common unit from all sets, defaulting to lbs
    const units = exercise.plannedSets.map(set => getLoadUnit(set));
    const mostCommonUnit = units.length > 0 ? units[0] : 'lbs';
    
    const totalValue = exercise.plannedSets.reduce((sum, set) => {
      const reps = set.reps || 0;
      const load = Number(set.load) || 0;
      return sum + (reps * load);
    }, 0);
    
    return { value: totalValue, unit: mostCommonUnit };
  };

  // Get RIR value from the first set (if available)
  const getRIR = () => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return null;
    const rir = exercise.plannedSets[0].rir;
    return typeof rir === 'number' ? rir : null;
  };

  // Get RPE value from the first set (if available)
  const getRPE = () => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return null;
    const rpe = exercise.plannedSets[0].rpe;
    return typeof rpe === 'number' ? rpe : null;
  };

  const formatNumberWithCommas = (x: number) => x.toLocaleString();

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
              <div 
                className="fixed inset-0 z-10" 
                onClick={closeMenu}
              />
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

      {/* Table header */}
      <div className="grid grid-cols-6 gap-2 mt-3 text-sm font-semibold text-gray-500 dark:text-slate-600">
        <div>Set</div>
        <div>Reps</div>
        <div>Load</div>
        <div>Tempo</div>
        <div>Rest</div>
        <div>Time Under Tension</div>
      </div>
      {/* Table rows */}
      <div className="grid grid-cols-6 gap-2 text-sm dark:text-slate-600">
        {(exercise.plannedSets || []).flatMap((set, setIdx) => {
          const plannedReps = set.reps || 0;
          const plannedLoad = set.load || '';
          const plannedUnit = getLoadUnit(set);
          return [
            <div key={`${setIdx}-set`} className="flex items-center">{set.set || setIdx + 1}</div>,
            <div key={`${setIdx}-reps`} className="flex items-center">{plannedReps}</div>,
            <div key={`${setIdx}-load`} className="flex items-center">{formatLoad(plannedLoad, plannedUnit)}</div>,
            <div key={`${setIdx}-tempo`} className="flex items-center">{set.tempo || '2010'}</div>,
            <div key={`${setIdx}-rest`} className="flex items-center">{set.restSec || 0}s</div>,
            <div key={`${setIdx}-tut`} className="flex items-center">{calculateTimeUnderTension(set.reps, set.tempo)} sec.</div>
          ];
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