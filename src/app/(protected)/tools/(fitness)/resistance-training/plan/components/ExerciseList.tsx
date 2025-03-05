'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsThreeDotsVertical, BsGripVertical } from 'react-icons/bs';
import { 
  exercise,
  planned_exercise,
  is_varied_exercise,
  planned_exercise_set,
  planned_exercise_sub_set
} from '@/app/lib/types/pillars/fitness';
import { calculate_exercise_tut } from '@/app/lib/utils/fitness/resistance-training/calculations';

interface ExerciseItemProps {
  exercise: exercise;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

interface MenuState {
  [key: number]: boolean;
}

const ExerciseItem = ({ exercise, onEdit, onDelete }: ExerciseItemProps) => {
  const [menuOpen, setMenuOpen] = useState<MenuState>({});

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

  const toggleMenu = (id: number) => {
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
          {is_varied_exercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.set_details.map((set: planned_exercise_set, idx: number) => (
                <div key={idx}>
                  <p>Set {set.set_number}{!set.sub_sets?.length && `: ${set.planned_reps} reps`}</p>
                  {set.sub_sets && set.sub_sets.map((sub_set: planned_exercise_sub_set, sub_idx: number) => (
                    <p key={sub_idx} className="ml-4 text-sm">
                      → {sub_set.planned_reps} reps @ {sub_set.planned_load}lbs ({sub_set.planned_rest}s rest)
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">
              {exercise.sets} x {exercise.planned_sets?.[0]?.planned_reps}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          {is_varied_exercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.set_details.map((set: planned_exercise_set, idx: number) => (
                <div key={idx}>
                  <p>{set.planned_load}lbs.</p>
                  {set.sub_sets && set.sub_sets.map((_: planned_exercise_sub_set, sub_idx: number) => (
                    <p key={sub_idx} className="ml-4 text-sm">&nbsp;</p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.planned_sets?.[0]?.planned_load}lbs.</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          {is_varied_exercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.set_details.map((set: planned_exercise_set, idx: number) => (
                <p key={idx}>{set.planned_tempo}</p>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.planned_sets?.[0]?.planned_tempo}</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          {is_varied_exercise(exercise) ? (
            <div className="font-medium dark:text-slate-900">
              {exercise.set_details.map((set: planned_exercise_set, idx: number) => (
                <p key={idx}>{set.planned_rest}s</p>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.planned_sets?.[0]?.planned_rest}s</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          <p className="font-medium dark:text-slate-900">{calculate_exercise_tut(exercise)}s</p>
        </div>
      </div>

      {(!is_varied_exercise(exercise) && exercise.planned_sets?.[0]) && (
        <div className="mt-3 text-sm text-gray-600">
          {exercise.planned_sets[0].rpe && <span className="mr-4 dark:text-slate-900">RPE: {exercise.planned_sets[0].rpe}</span>}
          {exercise.planned_sets[0].rir && <span className="mr-4 dark:text-slate-900">RIR: {exercise.planned_sets[0].rir}</span>}
          {exercise.planned_sets[0].notes && (
            <div className="mt-1">
              <span className="font-medium dark:text-slate-900">Notes: </span>
              <span className="dark:text-slate-900">{exercise.planned_sets[0].notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ExerciseListProps {
  exercises: exercise[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

interface GroupedExercises {
  [key: string]: exercise[];
}

export default function ExerciseList({ exercises, onEdit, onDelete }: ExerciseListProps) {
  // Group exercises by their pairing letter
  const groupedExercises = exercises.reduce((groups: GroupedExercises, exercise) => {
    const letter = exercise.pairing.charAt(0);
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(exercise);
    return groups;
  }, {});

  return (
    <div className="space-y-4">
      {/* Render all exercises in a flat list for drag and drop */}
      {exercises.map((exercise, index) => {
        const letter = exercise.pairing.charAt(0);
        const isFirstInGroup = !exercises[index - 1] || exercises[index - 1].pairing.charAt(0) !== letter;

        return (
          <React.Fragment key={exercise.id}>
            {isFirstInGroup && (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">
                  Group {letter}
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