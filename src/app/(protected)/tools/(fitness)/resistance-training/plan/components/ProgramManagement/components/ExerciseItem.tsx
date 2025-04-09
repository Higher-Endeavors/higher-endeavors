/**
 * Exercise Item Component - Casing Conventions
 * 
 * This file follows these casing conventions:
 * 1. snake_case:
 *    - All types/interfaces that map to database structures
 *    - Properties that map to database columns
 *    - Utility functions that work with database-mapped types
 *    - Imported database-related types (e.g., exercise, planned_exercise_set)
 * 
 * 2. camelCase:
 *    - React component names (ExerciseItem)
 *    - React props interfaces (ExerciseItemProps)
 *    - React state variables (menuOpen)
 *    - React event handlers (onEdit, onDelete)
 *    - Component-specific helper functions
 * 
 * This approach aligns with:
 * - Database naming conventions (snake_case)
 * - React/TypeScript conventions (camelCase)
 * - Consistent patterns across the codebase
 */

'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { 
  exercise,
  ExerciseItemProps, 
  MenuState, 
  load_unit
} from '@/app/lib/types/pillars/fitness';
import { 
  calculate_exercise_tut, 
  calculate_set_tut, 
  format_load 
} from '@/app/lib/utils/fitness/resistance-training/calculations';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';

// Helper function to check if exercise has varied or advanced sets
function isVariedExercise(exercise: exercise): boolean {
  return exercise.is_varied_sets || exercise.is_advanced_sets;
}

export function ExerciseItem({ exercise, onEdit, onDelete }: ExerciseItemProps) {
  const { settings: userSettings } = useUserSettings();
  const [menuOpen, setMenuOpen] = useState<Record<number, boolean>>({});

  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  const calculateTotalReps = (): number => {
    if (isVariedExercise(exercise)) {
      return exercise.planned_sets.reduce((total, set) => {
        if (set.sub_sets && set.sub_sets.length > 0) {
          return total + set.sub_sets.reduce((subTotal, subSet) => {
            return subTotal + (Number(subSet.planned_reps) || 0);
          }, 0);
        }
        return total + (Number(set.planned_reps) || 0);
      }, 0);
    }
    
    const sets = Number(exercise.sets) || 0;
    return sets * (Number(exercise.planned_sets[0]?.planned_reps) || 0);
  };

  const calculateTotalLoad = (): string => {
    let total_load = 0;
    const unit = exercise.planned_sets[0]?.load_unit || 'kg';
  
    if (isVariedExercise(exercise)) {
      total_load = exercise.planned_sets.reduce((total, set) => {
        if (set.sub_sets && set.sub_sets.length > 0) {
          return total + set.sub_sets.reduce((subTotal, subSet) => {
            const load = Number(subSet.planned_load) || 0;
            const reps = Number(subSet.planned_reps) || 0;
            return subTotal + (load * reps);
          }, 0);
        }
        const load = Number(set.planned_load) || 0;
        const reps = Number(set.planned_reps) || 0;
        return total + (load * reps);
      }, 0);
    } else {
      const load = Number(exercise.planned_sets[0]?.planned_load) || 0;
      const sets = Number(exercise.sets) || 0;
      const reps = Number(exercise.planned_sets[0]?.planned_reps) || 0;
      total_load = load * sets * reps;
    }
  
    if (typeof total_load !== 'number' || isNaN(total_load)) {
      return 'BW'; // Return bodyweight if load is not a valid number
    }
  
    return `${total_load}${unit}`;
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
          <span className="font-medium dark:text-slate-900">{exercise.name}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(exercise.id);
            }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[exercise.id]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          
          {menuOpen[exercise.id] && (
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
                      onEdit(exercise.id);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(exercise.id);
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
          {isVariedExercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.planned_sets.map((set, idx) => {
                const setNumber = String(set.set_number || idx + 1);
                const reps = String(set.planned_reps || 0);
                const load = format_load(set.planned_load || 0, set.load_unit as load_unit);
                
                if (set.sub_sets && set.sub_sets.length > 0) {
                  const subSetsString = set.sub_sets.map((subSet, subIdx) => {
                    const subReps = String(subSet.planned_reps || 0);
                    const subLoad = format_load(subSet.planned_load || 0, subSet.load_unit as load_unit);
                    return `${subReps} reps @ ${subLoad}${subIdx < (set.sub_sets?.length ?? 0) - 1 ? ', ' : ''}`;
                  }).join('');
                  
                  return (
                    <div key={idx}>
                      <span className="font-medium dark:text-slate-900">Set {setNumber}: {subSetsString}</span>
                    </div>
                  );
                }
                
                return (
                  <div key={idx}>
                    <span className="font-medium dark:text-slate-900">Set {setNumber}: {reps} reps @ {load}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">
              {String(exercise.sets)} × {String(exercise.planned_sets[0]?.planned_reps || 0)}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          {isVariedExercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.planned_sets.map((set, idx) => {
                const setNumber = String(set.set_number || idx + 1);
                const loadDisplay = format_load(set.planned_load || 0, set.load_unit as load_unit);
                return (
                  <div key={idx}>
                    <span className="font-medium dark:text-slate-900">Set {setNumber}: {loadDisplay}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">
              {format_load(exercise.planned_sets[0]?.planned_load || 0, exercise.planned_sets[0]?.load_unit as load_unit)}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          {isVariedExercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.planned_sets.map((set, idx) => {
                const setNumber = String(set.set_number || idx + 1);
                const tempoDisplay = String(set.planned_tempo || '2010');
                return (
                  <div key={idx}>
                    <span className="font-medium dark:text-slate-900">Set {setNumber}: {tempoDisplay}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">
              {String(exercise.planned_sets[0]?.planned_tempo || '2010')}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          {isVariedExercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.planned_sets.map((set, idx) => {
                const setNumber = String(set.set_number || idx + 1);
                const restDisplay = String(set.planned_rest || 0);
                return (
                  <div key={idx}>
                    <span className="font-medium dark:text-slate-900">Set {setNumber}: {restDisplay}s</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">
              {String(exercise.planned_sets[0]?.planned_rest || 0)}s
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          {isVariedExercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.planned_sets.map((set, idx) => {
                const setNumber = String(set.set_number || idx + 1);
                const tutDisplay = calculate_set_tut(set.planned_reps || 0, set.planned_tempo || '2010');
                return (
                  <div key={idx}>
                    <span className="font-medium dark:text-slate-900">Set {setNumber}: {tutDisplay}s</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">
              {`${calculate_exercise_tut(exercise)}s`}
            </p>
          )}
        </div>

        <div className="mt-3 border-t pt-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 text-sm font-medium text-purple-700">
              <div>
                <span className="mr-1">Total Reps:</span>
                <span>{calculateTotalReps()}</span>
              </div>
              <div>
                <span className="mr-1">Total Load:</span>
                <span>{calculateTotalLoad()}</span>
              </div>
            </div>
            {(exercise.planned_sets[0]?.rpe || exercise.planned_sets[0]?.rir || exercise.notes) && (
              <div className="text-sm text-gray-600">
                {exercise.planned_sets[0]?.rpe && <span className="mr-4 dark:text-slate-900">RPE: {exercise.planned_sets[0].rpe}</span>}
                {exercise.planned_sets[0]?.rir && <span className="mr-4 dark:text-slate-900">RIR: {exercise.planned_sets[0].rir}</span>}
                {exercise.notes && (
                  <span>
                    <span className="font-medium dark:text-slate-900">Notes: </span>
                    <span className="dark:text-slate-900">{exercise.notes}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}