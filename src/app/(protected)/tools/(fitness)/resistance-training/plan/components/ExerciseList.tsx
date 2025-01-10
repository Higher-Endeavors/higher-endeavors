'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsThreeDotsVertical, BsGripVertical } from 'react-icons/bs';
import { SetDetails } from '../../shared/types';
import { calculateExerciseTUT } from '../../shared/utils/calculations';

interface Exercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  isVariedSets?: boolean;
  setDetails?: SetDetails[];
}

interface ExerciseItemProps {
  exercise: Exercise;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface MenuState {
  [key: string]: boolean;
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
                <p key={idx}>{`Set ${set.setNumber}: ${set.reps} reps`}</p>
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
                <p key={idx}>{`${set.load}lbs.`}</p>
              ))}
            </div>
          ) : (
            <p className="font-medium dark:text-slate-900">{exercise.load}lbs.</p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          <p className="font-medium dark:text-slate-900">{exercise.tempo}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          <p className="font-medium dark:text-slate-900">{exercise.rest}s</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          <p className="font-medium dark:text-slate-900">{calculateExerciseTUT(exercise)}s</p>
        </div>
      </div>

      {(exercise.rpe || exercise.rir || exercise.notes) && (
        <div className="mt-3 text-sm text-gray-600">
          {exercise.rpe && <span className="mr-4 dark:text-slate-900">RPE: {exercise.rpe}</span>}
          {exercise.rir && <span className="mr-4 dark:text-slate-900">RIR: {exercise.rir}</span>}
          {exercise.notes && (
            <div className="mt-1">
              <span className="font-medium dark:text-slate-900">Notes: </span>
              <span className="dark:text-slate-900">{exercise.notes}</span>
            </div>
          )}
        </div>
      )}
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