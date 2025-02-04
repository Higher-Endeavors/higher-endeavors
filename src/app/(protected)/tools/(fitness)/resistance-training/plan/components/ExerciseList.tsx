'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsThreeDotsVertical, BsGripVertical } from 'react-icons/bs';
import { Exercise } from '../../shared/types';
import { calculateExerciseTUT } from '../../shared/utils/calculations';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';

interface ExerciseItemProps {
  exercise: Exercise;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface MenuState {
  [key: string]: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, onEdit, onDelete }) => {
  const { settings: userSettings } = useUserSettings();
  const [menuOpen, setMenuOpen] = useState<MenuState>({});

  console.log('Exercise data:', JSON.stringify(exercise, null, 2));

  const formatLoad = (load: string | number, loadUnit?: 'kg' | 'lbs'): string => {
    if (typeof load === 'number') {
      const unit = loadUnit || userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'kg';
      const displayUnit = unit === 'kg' ? 'kgs' : 'lbs';
      return `${load}${displayUnit}`;
    }
    return load; // Return the band color or BW as is
  };

  const calculateTotalReps = (): number => {
    if (exercise.isVariedSets && exercise.setDetails) {
      return exercise.setDetails.reduce((total, set) => {
        if (set.subSets?.length) {
          return total + set.subSets.reduce((subTotal, subSet) => subTotal + subSet.reps, 0);
        }
        return total + set.reps;
      }, 0);
    }
    return exercise.sets * exercise.reps;
  };

  const calculateTotalLoad = (): string => {
    let totalLoad = 0;
    let unit = exercise.loadUnit || userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'kg';

    if (typeof exercise.load !== 'number') {
      return 'N/A'; // Return N/A for band colors or BW
    }

    if (exercise.isVariedSets && exercise.setDetails) {
      totalLoad = exercise.setDetails.reduce((total, set) => {
        if (set.subSets?.length) {
          return total + set.subSets.reduce((subTotal, subSet) => {
            if (typeof subSet.load === 'number') {
              return subTotal + (subSet.load * subSet.reps);
            }
            return subTotal;
          }, 0);
        }
        if (typeof set.load === 'number') {
          return total + (set.load * set.reps);
        }
        return total;
      }, 0);
    } else {
      totalLoad = exercise.load * exercise.sets * exercise.reps;
    }

    const displayUnit = unit === 'kg' ? 'kgs' : 'lbs';
    return `${totalLoad}${displayUnit}`;
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleMenu = (id: string) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <BsGripVertical className="h-5 w-5 text-gray-400 dark:text-slate-600" />
          </div>
          <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
          <span className="font-medium dark:text-slate-900">{exercise.name}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(exercise.id);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <BsThreeDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" />
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
          {exercise.isVariedSets && exercise.setDetails ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => (
                <div key={idx}>
                  <p>Set {set.setNumber}{!set.subSets?.length && `: ${set.reps} reps`}</p>
                  {set.subSets && set.subSets.map((subSet, subIdx) => (
                    <p key={subIdx} className="ml-4 text-sm">
                      → {subSet.reps} reps @ {formatLoad(subSet.load, subSet.loadUnit)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.sets} x {exercise.reps}</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          {exercise.isVariedSets && exercise.setDetails ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => (
                <div key={idx}>
                  <p>{formatLoad(set.load, set.loadUnit)}</p>
                  {set.subSets && set.subSets.map((subSet, subIdx) => (
                    <p key={subIdx} className="ml-4 text-sm">
                      → {formatLoad(subSet.load, subSet.loadUnit)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{formatLoad(exercise.load, exercise.loadUnit)}</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          {exercise.isVariedSets && exercise.setDetails ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => (
                <div key={idx}>
                  <p>{set.tempo}</p>
                  {set.subSets && set.subSets.map((subSet, subIdx) => (
                    <p key={subIdx} className="ml-4 text-sm">
                      → {subSet.tempo}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.tempo}</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          {exercise.isVariedSets && exercise.setDetails ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => (
                <div key={idx}>
                  <p>{set.rest}s</p>
                  {set.subSets && set.subSets.map((subSet, subIdx) => (
                    <p key={subIdx} className="ml-4 text-sm">
                      → {subSet.rest}s
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.rest}s</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          {exercise.isVariedSets && exercise.setDetails ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => {
                const tempoTotal = set.tempo.split('').reduce((sum, char) => {
                  if (char.toLowerCase() === 'x') return sum + 1;
                  return sum + parseInt(char) || 0;
                }, 0);
                const setTUT = tempoTotal * set.reps;
                return (
                  <div key={idx}>
                    <p>{setTUT}s</p>
                    {set.subSets && set.subSets.map((subSet, subIdx) => {
                      const subSetTUT = tempoTotal * subSet.reps;
                      return (
                        <p key={subIdx} className="ml-4 text-sm">
                          → {subSetTUT}s
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{calculateExerciseTUT(exercise)}s</p>
          )}
        </div>
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
          {(exercise.rpe || exercise.rir || exercise.notes) && (
            <div className="text-sm text-gray-600">
              {exercise.rpe && <span className="mr-4 dark:text-slate-900">RPE: {exercise.rpe}</span>}
              {exercise.rir && <span className="mr-4 dark:text-slate-900">RIR: {exercise.rir}</span>}
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
  );
};

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface GroupedExercises {
  [key: string]: Exercise[];
}

export default function ExerciseList({ exercises, onEdit, onDelete }: ExerciseListProps) {
  // Group exercises by their pairing prefix
  const groupedExercises = exercises.reduce((groups: GroupedExercises, exercise) => {
    // For WU and CD, use the full prefix, otherwise just use the first letter
    const groupKey = exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD') 
      ? exercise.pairing.substring(0, 2)  // Take 'WU' or 'CD'
      : exercise.pairing.charAt(0);       // Take just the letter for regular groups
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(exercise);
    return groups;
  }, {});

  const getGroupLabel = (groupKey: string): string => {
    // No need for switch case anymore since we're using the actual group key
    return groupKey;
  };

  return (
    <div className="space-y-4">
      {/* Render all exercises in a flat list for drag and drop */}
      {exercises.map((exercise, index) => {
        // Use the same grouping logic for checking group changes
        const currentGroupKey = exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')
          ? exercise.pairing.substring(0, 2)
          : exercise.pairing.charAt(0);
        
        const previousGroupKey = index > 0 && (
          exercises[index - 1].pairing.startsWith('WU') || exercises[index - 1].pairing.startsWith('CD')
            ? exercises[index - 1].pairing.substring(0, 2)
            : exercises[index - 1].pairing.charAt(0)
        );
        
        const isFirstInGroup = index === 0 || currentGroupKey !== previousGroupKey;

        return (
          <React.Fragment key={exercise.id}>
            {isFirstInGroup && (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">
                  Group {getGroupLabel(currentGroupKey)}
                </h3>
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            <ExerciseItem
              exercise={exercise}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
} 