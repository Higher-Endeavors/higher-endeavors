'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { ProgramExercisesPlanned, ExerciseSet, ExerciseLibraryItem } from '../types/resistance-training.zod';
import { calculateTimeUnderTension } from '../../lib/calculations/resistanceTrainingCalculations';

interface ExerciseItemProps {
  exercise: ProgramExercisesPlanned;
  exercises: ExerciseLibraryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onChangeVariation?: (id: number) => void;
}

export default function ExerciseItem({ exercise, exercises, onEdit, onDelete, onChangeVariation }: ExerciseItemProps) {
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Sets x Reps</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.plannedSets?.map((set, idx) => (
              <div key={idx} className={(set as any).subSet ? 'ml-4 text-sm text-gray-600' : ''}>
                <span className="font-medium dark:text-slate-900">
                  {(set as any).subSet ? `Set ${set.set}.${(set as any).subSet}` : `Set ${set.set || idx + 1}`}:
                  {" "}{set.reps || 0} reps
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.plannedSets?.map((set, idx) => (
              <div key={idx} className={(set as any).subSet ? 'ml-4 text-sm text-gray-600' : ''}>
                <span className="font-medium dark:text-slate-900">
                  {formatLoad(set.load || '0', getLoadUnit(set))}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.plannedSets?.map((set, idx) => (
              <div key={idx} className={(set as any).subSet ? 'ml-4 text-sm text-gray-600' : ''}>
                <span className="font-medium dark:text-slate-900">
                  {set.tempo || '2010'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.plannedSets?.map((set, idx) => (
              <div key={idx} className={(set as any).subSet ? 'ml-4 text-sm text-gray-600' : ''}>
                <span className="font-medium dark:text-slate-900">
                  {set.restSec || 0}s
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.plannedSets?.map((set, idx) => (
              <div key={idx} className={(set as any).subSet ? 'ml-4 text-sm text-gray-600' : ''}>
                <span className="font-medium dark:text-slate-900">
                  {calculateTimeUnderTension(set.reps, set.tempo)} sec.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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