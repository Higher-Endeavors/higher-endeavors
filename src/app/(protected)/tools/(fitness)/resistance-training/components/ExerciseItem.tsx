'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { PlannedExercise, PlannedSet, ExerciseLibraryItem } from '../types/resistance-training.types';
import { calculateTimeUnderTension, formatTimeUnderTension } from '../../lib/calculations/resistanceTrainingCalculations';

interface ExerciseItemProps {
  exercise: PlannedExercise;
  exercises: ExerciseLibraryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ExerciseItem({ exercise, exercises, onEdit, onDelete }: ExerciseItemProps) {
  const [menuOpen, setMenuOpen] = useState<{ [key: number]: boolean }>({});

  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  // Simplified helper functions
  const formatLoad = (load: string) => {
    return load; // Load is already formatted with unit in the PlannedSet
  };

  // Get exercise name by looking up the ID in the exercises array
  const getExerciseName = () => {
    const exerciseData = exercises.find(ex => ex.exercise_library_id === exercise.exerciseLibraryId);
    return exerciseData?.name || `Exercise ${exercise.exerciseLibraryId}`;
  };

  // Calculate total load for this exercise
  const getTotalLoad = () => {
    if (!exercise.detail) return 0;
    return exercise.detail.reduce((sum, set) => {
      const reps = set.reps || 0;
      const load = Number(set.load) || 0;
      return sum + (reps * load);
    }, 0);
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
              toggleMenu(exercise.exerciseLibraryId || 0);
            }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[exercise.exerciseLibraryId || 0]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          
          {menuOpen[exercise.exerciseLibraryId || 0] && (
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
                      onEdit(exercise.exerciseLibraryId || 0);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(exercise.exerciseLibraryId || 0);
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
            {exercise.detail?.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  Set {set.set || idx + 1}: {set.reps || 0} reps
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.detail?.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  {formatLoad(set.load || '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.detail?.map((set, idx) => (
              <div key={idx}>
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
            {exercise.detail?.map((set, idx) => (
              <div key={idx}>
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
            {exercise.detail?.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  {formatTimeUnderTension(calculateTimeUnderTension(set.reps, set.tempo))}
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
              <span>{exercise.detail?.reduce((sum, set) => sum + (set.reps || 0), 0)}</span>
            </div>
            <div>
              <span className="mr-1">Total Load:</span>
              <span>
                {formatNumberWithCommas(getTotalLoad())}
              </span>
            </div>
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