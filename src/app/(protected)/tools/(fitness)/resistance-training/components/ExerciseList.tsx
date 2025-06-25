'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItem from './ExerciseItem';
import { ExerciseLibraryItem, PlannedExercise } from '../types/resistance-training.types';

interface ExerciseListProps {
  exercises: ExerciseLibraryItem[] | null;
  isLoading: boolean;
  userId: number;
  plannedExercises: PlannedExercise[];
  onEditExercise: (id: number) => void;
  onDeleteExercise: (id: number) => void;
}

export default function ExerciseList({
  exercises,
  isLoading,
  userId,
  plannedExercises,
  onEditExercise,
  onDeleteExercise
}: ExerciseListProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">Exercise List</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">Exercise List</h2>
      {/* Exercise List */}
      <div className="space-y-4">
        {plannedExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No exercises added yet. Click the button below to add exercises to your workout.
          </div>
        ) : (
          plannedExercises.map((exercise, index) => {
            const isFirstInGroup = index === 0 || exercise.pairing[0] !== plannedExercises[index - 1].pairing[0];
            return (
              <div key={`${exercise.exerciseLibraryId}-${exercise.pairing}`}>
                {isFirstInGroup && (
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-700">
                      Group {exercise.pairing[0]}
                    </h3>
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
                <ExerciseItem
                  exercise={exercise}
                  exercises={exercises || []}
                  onEdit={onEditExercise}
                  onDelete={onDeleteExercise}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}