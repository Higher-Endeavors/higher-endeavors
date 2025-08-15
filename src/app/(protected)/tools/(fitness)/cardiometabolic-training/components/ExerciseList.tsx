'use client';

import { useState } from 'react';
import ExerciseItem from './ExerciseItem';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface CMEExercise {
  activityId: number;
  activityName: string;
  activitySource: 'library' | 'user';
  useIntervals: boolean;
  intervals: Array<{
    stepType: string;
    duration: number;
    intensity: string;
    intensityMetric: string;
    notes: string;
  }>;
  notes: string;
  createdAt: string;
  userId: number;
}

interface ExerciseListProps {
  exercises: CMEExercise[];
  onAddExercise: () => void;
  onEditExercise: (exerciseId: number) => void;
  onDeleteExercise: (exerciseId: number) => void;
}

export default function ExerciseList({ exercises, onAddExercise, onEditExercise, onDeleteExercise }: ExerciseListProps) {
  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Exercise List</h2>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium mb-2">No Exercises Added</p>
          <p className="text-sm">Add your first exercise to get started with your cardio session</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.activityId}
              exercise={exercise}
              onEdit={onEditExercise}
              onDelete={onDeleteExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
}