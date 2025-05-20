'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItem from './ExerciseItem';

export default function ExerciseList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Updated placeholder data to match ExerciseItem interface
  const placeholderExercises = [
    {
      id: '1',
      name: 'Bench Press',
      pairing: 'A1',
      sets: 3,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 8,
          planned_load: 135,
          load_unit: 'lbs',
          planned_tempo: '2010',
          planned_rest: 90
        },
        {
          set_number: 2,
          planned_reps: 8,
          planned_load: 135,
          load_unit: 'lbs',
          planned_tempo: '2010',
          planned_rest: 90
        },
        {
          set_number: 3,
          planned_reps: 8,
          planned_load: 135,
          load_unit: 'lbs',
          planned_tempo: '2010',
          planned_rest: 90
        }
      ],
      notes: 'Focus on chest activation'
    },
    {
      id: '2',
      name: 'Squat',
      pairing: 'A2',
      sets: 3,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 5,
          planned_load: 225,
          load_unit: 'lbs',
          planned_tempo: '3010',
          planned_rest: 120
        },
        {
          set_number: 2,
          planned_reps: 5,
          planned_load: 225,
          load_unit: 'lbs',
          planned_tempo: '3010',
          planned_rest: 120
        },
        {
          set_number: 3,
          planned_reps: 5,
          planned_load: 225,
          load_unit: 'lbs',
          planned_tempo: '3010',
          planned_rest: 120
        }
      ]
    }
  ];

  const handleEdit = (id: string) => {
    console.log('Edit exercise:', id);
    // Placeholder for edit functionality
  };

  const handleDelete = (id: string) => {
    console.log('Delete exercise:', id);
    // Placeholder for delete functionality
  };

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">Exercise List</h2>
      {/* Exercise List */}
      <div className="space-y-4">
        {placeholderExercises.map((exercise, index) => {
          const isFirstInGroup = index === 0 || exercise.pairing[0] !== placeholderExercises[index - 1].pairing[0];

          return (
            <div key={exercise.id}>
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
        })}
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
      />
    </div>
  );
}