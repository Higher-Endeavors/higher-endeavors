'use client';

import React, { useState } from 'react';
// Commenting out DnD imports
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { Exercise, PlannedExerciseSet, PlannedExerciseSubSet } from '@/app/lib/types/pillars/fitness';
import { formatLoad } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { calculateExerciseTUT, calculateSetTUT, formatLoad } from '@/app/lib/utils/fitness/resistance-training/calculations';
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

  // Detailed debug logging
  console.log('Exercise data (detailed):', {
    id: exercise.id,
    name: exercise.name,
    isVariedSets: exercise.isVariedSets,
    isAdvancedSets: exercise.isAdvancedSets,
    sets: exercise.sets,
    reps: exercise.reps,
    load: exercise.load,
    loadUnit: exercise.loadUnit,
    tempo: exercise.tempo,
    rest: exercise.rest,
    setDetails: exercise.setDetails,
    fullObject: exercise
  });

  const formatLoad = (load: string | number, loadUnit?: 'kg' | 'lbs'): string => {
    if (typeof load === 'number') {
      const unit = loadUnit || userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs';
      return `${load}${unit}`;
    }
    return String(load || 'BW');
  };

  const renderSetDetails = (set: SetDetail): string => {
    try {
      if (!set || typeof set !== 'object') {
        console.error('Invalid set data:', set);
        return '';
      }
      
      const reps = set.reps || 0;
      const load = set.load || 0;
      const loadUnit = set.loadUnit;
      
      if (!set.subSets?.length) {
        const loadStr = formatLoad(load, loadUnit);
        return `${reps} reps @ ${loadStr}`;
      }
      
      const subSetDetails = set.subSets?.map((subSet: SubSet) => {
        if (!subSet || typeof subSet !== 'object') {
          console.error('Invalid subset data:', subSet);
          return '';
        }
        const subReps = subSet.reps || 0;
        const subLoad = subSet.load || 0;
        const subLoadUnit = subSet.loadUnit;
        const loadStr = formatLoad(subLoad, subLoadUnit);
        return `${subReps} reps @ ${loadStr}`;
      }).filter(Boolean).join(', ');

      return subSetDetails || 'No details available';
    } catch (error) {
      console.error('Error rendering set details:', error);
      return 'Error rendering set';
    }
  };

  const calculateTotalReps = (): number => {
    if (exercise.isVariedSets && Array.isArray(exercise.setDetails)) {
      return exercise.setDetails.reduce((total, set) => {
        if (!set || typeof set !== 'object') return total;
        if (Array.isArray(set.subSets) && set.subSets.length > 0) {
          return total + set.subSets.reduce((subTotal, subSet) => {
            if (!subSet || typeof subSet !== 'object') return subTotal;
            return subTotal + (Number(subSet.reps) || 0);
          }, 0);
        }
        return total + (Number(set.reps) || 0);
      }, 0);
    }
    const sets = Array.isArray(exercise.sets) ? exercise.sets.length : Number(exercise.sets) || 0;
    return sets * (Number(exercise.reps) || 0);
  };

  const calculateTotalLoad = (): string => {
    let totalLoad = 0;
    const unit = exercise.loadUnit || userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'kg';

    if (typeof exercise.load !== 'number' && exercise.load !== undefined) {
      return String(exercise.load); // Return the non-numeric load (e.g., 'BW' or band color)
    }

    if (exercise.isVariedSets && Array.isArray(exercise.setDetails)) {
      totalLoad = exercise.setDetails.reduce((total, set) => {
        if (!set || typeof set !== 'object') return total;
        if (Array.isArray(set.subSets) && set.subSets.length > 0) {
          return total + set.subSets.reduce((subTotal, subSet) => {
            if (!subSet || typeof subSet !== 'object') return subTotal;
            const load = Number(subSet.load) || 0;
            const reps = Number(subSet.reps) || 0;
            return subTotal + (load * reps);
          }, 0);
        }
        const load = Number(set.load) || 0;
        const reps = Number(set.reps) || 0;
        return total + (load * reps);
      }, 0);
    } else {
      const load = Number(exercise.load) || 0;
      const sets = Array.isArray(exercise.sets) ? exercise.sets.length : Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      totalLoad = load * sets * reps;
    }

    const displayUnit = unit === 'kg' ? 'kg' : 'lbs';
    return `${totalLoad}${displayUnit}`;
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
              toggleMenu(exercise.id);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" />
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
          {exercise.isVariedSets ? (
            <div className="font-medium dark:text-slate-900">
              {Array.isArray(exercise.setDetails) && exercise.setDetails.map((set, idx) => {
                if (!set || typeof set !== 'object') return null;
                const setNumber = String(set.setNumber || idx + 1);
                const reps = String(set.reps || 0);
                const load = formatLoad(set.load || 0, set.loadUnit);
                
                if (Array.isArray(set.subSets) && set.subSets.length > 0) {
                  const subSetsString = set.subSets?.map((subSet: SubSet, subIdx) => {
                    if (!subSet || typeof subSet !== 'object') return '';
                    const subReps = String(subSet.reps || 0);
                    const subLoad = formatLoad(subSet.load || 0, subSet.loadUnit);
                    return `${subReps} reps @ ${subLoad}${subIdx < (set.subSets?.length || 0) - 1 ? ', ' : ''}`;
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
              {Array.isArray(exercise.sets) ? exercise.sets.length : String(exercise.sets || 0)} × {String(exercise.reps || 0)}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          {exercise.isVariedSets && Array.isArray(exercise.setDetails) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => {
                if (!set || typeof set !== 'object') return null;
                const setNumber = String(set.setNumber || idx + 1);
                const loadDisplay = formatLoad(set.load || 0, set.loadUnit);
                return (
                  <div key={idx}>
                    <p>Set {setNumber}: {loadDisplay}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{formatLoad(exercise.load || 0, exercise.loadUnit)}</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          {exercise.isVariedSets && Array.isArray(exercise.setDetails) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => {
                if (!set || typeof set !== 'object') return null;
                const setNumber = String(set.setNumber || idx + 1);
                const tempoDisplay = String(set.tempo || '2010');
                return (
                  <div key={idx}>
                    <p>Set {setNumber}: {tempoDisplay}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{String(exercise.tempo || '2010')}</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          {exercise.isVariedSets && Array.isArray(exercise.setDetails) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => {
                if (!set || typeof set !== 'object') return null;
                const setNumber = String(set.setNumber || idx + 1);
                const restDisplay = String(set.rest || 0);
                return (
                  <div key={idx}>
                    <p>Set {setNumber}: {restDisplay}s</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{String(exercise.rest || 0)}s</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          {exercise.isVariedSets && Array.isArray(exercise.setDetails) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.setDetails.map((set, idx) => {
                if (!set || typeof set !== 'object') return null;
                const setNumber = String(set.setNumber || idx + 1);
                const tutDisplay = calculateSetTUT(set.reps || 0, set.tempo || '2010');
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
    // Default to 'A' if no pairing exists
    if (!exercise.pairing) {
      if (!groups['A']) {
        groups['A'] = [];
      }
      groups['A'].push(exercise);
      return groups;
    }

    // For WU and CD, use the full prefix, otherwise just use the first letter
    const groupKey = exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD') 
      ? exercise.pairing.substring(0, 2)  // Take 'WU' or 'CD'
      : exercise.pairing.charAt(0);       // Take just the letter for regular groups
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(exercise);
    return groups;
  }, {} as GroupedExercises);

  const getGroupLabel = (groupKey: string): string => {
    // No need for switch case anymore since we're using the actual group key
    return groupKey;
  };

  return (
    <div className="space-y-4">
      {/* Remove DnD Context wrapper and just map over exercises directly */}
      {exercises.map((exercise, index) => {
        const currentGroupKey = !exercise.pairing ? 'A' :
          exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')
            ? exercise.pairing.substring(0, 2)
            : exercise.pairing.charAt(0);
        
        const previousGroupKey = index > 0 && exercises[index - 1].pairing ? (
          exercises[index - 1].pairing.startsWith('WU') || exercises[index - 1].pairing.startsWith('CD')
            ? exercises[index - 1].pairing.substring(0, 2)
            : exercises[index - 1].pairing.charAt(0)
        ) : 'A';
        
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