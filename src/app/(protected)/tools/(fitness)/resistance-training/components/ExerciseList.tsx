'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItem from './ExerciseItem';
import { ExerciseLibraryItem, PlannedExercise } from '../types/resistance-training.types';

interface ExerciseListProps {
  exercises: ExerciseLibraryItem[] | null;
  isLoading: boolean;
  userId: number;
}

export default function ExerciseList({ exercises, isLoading, userId }: ExerciseListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);

  const handleEdit = (id: number) => {
    console.log('Edit exercise:', id);
    // Placeholder for edit functionality
  };

  const handleDelete = (id: number) => {
    console.log('Delete exercise:', id);
    // Placeholder for delete functionality
  };

  const handleAddExercise = (exercise: PlannedExercise) => {
    setPlannedExercises(prev => [...prev, exercise]);
    setIsModalOpen(false);
  };

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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Add Exercise Button - Below the exercise list */}
      <div className="mt-6 flex">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Exercise
        </button>
      </div>

      <AddExerciseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExercise}
        exercises={exercises || []}
        userId={userId}
      />
    </div>
  );
}