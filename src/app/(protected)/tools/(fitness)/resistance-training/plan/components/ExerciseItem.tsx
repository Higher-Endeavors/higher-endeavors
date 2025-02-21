'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Exercise, ExerciseItemProps, MenuState, LoadUnit } from '@/app/lib/types/pillars/fitness';
import { calculateExerciseTUT, calculateSetTUT, formatLoad } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';

/**
 * Debug Configuration for ExerciseItem
 */
const DEBUG = {
  EXERCISE: false,    // Exercise data processing
  MENU: false        // Menu state changes
};

/**
 * Debugging utilities
 */
const Debug = {
  exercise: (message: string, data?: any) => {
    if (DEBUG.EXERCISE) console.log(`[ExerciseItem:Exercise] ${message}`, data || '');
  },
  menu: (message: string, data?: any) => {
    if (DEBUG.MENU) console.log(`[ExerciseItem:Menu] ${message}`, data || '');
  }
};

export function ExerciseItem({ exercise, onEdit, onDelete }: ExerciseItemProps) {
    const { settings: userSettings } = useUserSettings();
    const [menuOpen, setMenuOpen] = useState<MenuState>({});
  
    const toggleMenu = (id: number) => {
      setMenuOpen(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };
  
    const closeMenu = () => {
      setMenuOpen({});
    };
  
    // Replace console.log with debug utility
    Debug.exercise('Exercise data:', {
      id: exercise.id,
      name: exercise.name,
      isVariedSets: 'setDetails' in exercise,
      isAdvancedSets: 'setDetails' in exercise && exercise.setDetails.some(set => (set.subSets?.length ?? 0) > 0),
      sets: 'setDetails' in exercise ? exercise.setDetails.length : exercise.sets,
      reps: 'setDetails' in exercise ? exercise.setDetails[0]?.plannedReps : exercise.plannedSets?.[0]?.plannedReps,
      load: 'setDetails' in exercise ? exercise.setDetails[0]?.plannedLoad : exercise.plannedSets?.[0]?.plannedLoad,
      loadUnit: 'setDetails' in exercise ? exercise.setDetails[0]?.loadUnit : exercise.plannedSets?.[0]?.loadUnit,
      tempo: 'setDetails' in exercise ? exercise.setDetails[0]?.plannedTempo : exercise.plannedSets?.[0]?.plannedTempo,
      rest: 'setDetails' in exercise ? exercise.setDetails[0]?.plannedRest : exercise.plannedSets?.[0]?.plannedRest,
      setDetails: 'setDetails' in exercise ? exercise.setDetails : undefined,
      fullObject: exercise
    });
  
    const calculateTotalReps = (): number => {
      if ('setDetails' in exercise && Array.isArray(exercise.setDetails)) {
        return exercise.setDetails.reduce((total, set) => {
          if (!set || typeof set !== 'object') return total;
          if (Array.isArray(set.subSets) && set.subSets.length > 0) {
            return total + set.subSets.reduce((subTotal, subSet) => {
              if (!subSet || typeof subSet !== 'object') return subTotal;
              return subTotal + (Number(subSet.plannedReps) || 0);
            }, 0);
          }
          return total + (Number(set.plannedReps) || 0);
        }, 0);
      }
      if (!('setDetails' in exercise)) {  // This is a PlannedExercise
        const sets = Number(exercise.sets) || 0;
        return sets * (Number(exercise.plannedSets?.[0]?.plannedReps) || 0);
      }
      return 0;
    };
  
    const calculateTotalLoad = (): string => {
      let totalLoad = 0;
      const unit = 'setDetails' in exercise ? exercise.setDetails[0]?.loadUnit : exercise.plannedSets?.[0]?.loadUnit || 'kg';
    
      if ('setDetails' in exercise && Array.isArray(exercise.setDetails)) {
        totalLoad = exercise.setDetails.reduce((total, set) => {
          if (!set || typeof set !== 'object') return total;
          if (Array.isArray(set.subSets) && set.subSets.length > 0) {
            return total + set.subSets.reduce((subTotal, subSet) => {
              if (!subSet || typeof subSet !== 'object') return subTotal;
              const load = Number(subSet.plannedLoad) || 0;
              const reps = Number(subSet.plannedReps) || 0;
              return subTotal + (load * reps);
            }, 0);
          }
          const load = Number(set.plannedLoad) || 0;
          const reps = Number(set.plannedReps) || 0;
          return total + (load * reps);
        }, 0);
      } else if (!('setDetails' in exercise)) {
        const load = Number(exercise.plannedSets?.[0]?.plannedLoad) || 0;
        const sets = Number(exercise.sets) || 0;
        const reps = Number(exercise.plannedSets?.[0]?.plannedReps) || 0;
        totalLoad = load * sets * reps;
      }
    
      if (typeof totalLoad !== 'number' || isNaN(totalLoad)) {
        return 'BW'; // Return bodyweight if load is not a valid number
      }
    
      return `${totalLoad}${unit}`;
    };
  
    return (
      <div
        // Remove drag and drop refs and styles
        // ref={setNodeRef}
        // style={style}
        className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Remove drag handle
            <div
              {...attributes}
              {...listeners}
              className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <BsGripVertical className="h-5 w-5 text-gray-400 dark:text-slate-600" />
            </div>
            */}
            <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
            <span className="font-medium dark:text-slate-900">{exercise.name}</span>
          </div>
          <div className="relative">
            <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu(exercise.id as number);
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
            {'setDetails' in exercise ? (
              <div className="font-medium dark:text-slate-900">
                {Array.isArray(exercise.setDetails) && exercise.setDetails.map((set, idx) => {
                  if (!set || typeof set !== 'object') return null;
                  const setNumber = String(set.setNumber || idx + 1);
                  const reps = String(set.plannedReps || 0);
                  const load = formatLoad(set.plannedLoad || 0, set.loadUnit as LoadUnit);
                  
                  if (Array.isArray(set.subSets) && set.subSets.length > 0) {
                    const subSetsString = set.subSets.map((subSet, subIdx) => {
                      if (!subSet || typeof subSet !== 'object') return '';
                      const subReps = String(subSet.plannedReps || 0);
                      const subLoad = formatLoad(subSet.plannedLoad || 0, subSet.loadUnit as LoadUnit);
                      return `${subReps} reps @ ${subLoad}${subIdx < (set.subSets?.length ?? 0) - 1 ? ', ' : ''}`;
                    }).join('');
                    
                    return (
                      <div key={idx}>
                        <p>Set {setNumber}: {subSetsString}</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx}>
                      <p>Set {setNumber}: {reps} reps @ {load}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-medium dark:text-slate-900">
                {String(exercise.sets || 0)} × {String(exercise.plannedSets?.[0]?.plannedReps || 0)}
              </p>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
            {'setDetails' in exercise ? (
              <div className="font-medium dark:text-slate-900">
                {exercise.setDetails.map((set, idx) => {
                  if (!set || typeof set !== 'object') return null;
                  const setNumber = String(set.setNumber || idx + 1);
                  const loadDisplay = formatLoad(set.plannedLoad || 0, set.loadUnit as LoadUnit);
                  return (
                    <div key={idx}>
                      <p>Set {setNumber}: {loadDisplay}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-medium dark:text-slate-900">
                {formatLoad(exercise.plannedSets?.[0]?.plannedLoad || 0, exercise.plannedSets?.[0]?.loadUnit as LoadUnit)}
              </p>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
            {'setDetails' in exercise ? (
              <div className="font-medium dark:text-slate-900">
                {exercise.setDetails.map((set, idx) => {
                  if (!set || typeof set !== 'object') return null;
                  const setNumber = String(set.setNumber || idx + 1);
                  const tempoDisplay = String(set.plannedTempo || '2010');
                  return (
                    <div key={idx}>
                      <p>Set {setNumber}: {tempoDisplay}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-medium dark:text-slate-900">
                {String(exercise.plannedSets?.[0]?.plannedTempo || '2010')}
              </p>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
            {'setDetails' in exercise ? (
              <div className="font-medium dark:text-slate-900">
                {exercise.setDetails.map((set, idx) => {
                  if (!set || typeof set !== 'object') return null;
                  const setNumber = String(set.setNumber || idx + 1);
                  const restDisplay = String(set.plannedRest || 0);
                  return (
                    <div key={idx}>
                      <p>Set {setNumber}: {restDisplay}s</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-medium dark:text-slate-900">
                {String(exercise.plannedSets?.[0]?.plannedRest || 0)}s
              </p>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
            {'setDetails' in exercise ? (
              <div className="font-medium dark:text-slate-900">
                {exercise.setDetails.map((set, idx) => {
                  if (!set || typeof set !== 'object') return null;
                  const setNumber = String(set.setNumber || idx + 1);
                  const tutDisplay = calculateSetTUT(set.plannedReps || 0, set.plannedTempo || '2010');
                  return (
                    <div key={idx}>
                      <p>Set {setNumber}: {tutDisplay}s</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-medium dark:text-slate-900">
                {`${calculateExerciseTUT(exercise)}s`}
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
              {('setDetails' in exercise ? 
                (exercise.setDetails[0]?.rpe || exercise.setDetails[0]?.rir || exercise.notes) :
                (exercise.plannedSets?.[0]?.rpe || exercise.plannedSets?.[0]?.rir || exercise.notes)
              ) && (
                <div className="text-sm text-gray-600">
                  {'setDetails' in exercise ? (
                    <>
                      {exercise.setDetails[0]?.rpe && <span className="mr-4 dark:text-slate-900">RPE: {exercise.setDetails[0].rpe}</span>}
                      {exercise.setDetails[0]?.rir && <span className="mr-4 dark:text-slate-900">RIR: {exercise.setDetails[0].rir}</span>}
                    </>
                  ) : (
                    <>
                      {exercise.plannedSets?.[0]?.rpe && <span className="mr-4 dark:text-slate-900">RPE: {exercise.plannedSets[0].rpe}</span>}
                      {exercise.plannedSets?.[0]?.rir && <span className="mr-4 dark:text-slate-900">RIR: {exercise.plannedSets[0].rir}</span>}
                    </>
                  )}
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