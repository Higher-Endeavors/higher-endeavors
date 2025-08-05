'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItem from './ExerciseItem';
import { clientLogger } from '@/app/lib/logging/logger.client';

export default function ExerciseList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Updated placeholder data for CardioMetabolic Training
  const placeholderExercises = [
    {
      id: 1,
      name: 'Treadmill Warm-Up',
      step_type: 'Warm-Up',
      intervals: 1,
      planned_intervals: [
        {
          interval_number: 1,
          planned_duration: 10, // duration in min
          planned_intensity: 3.5, // intensity value
          intensity_unit: 'mph', // intensity metric
          notes: ''
        }
      ],
      notes: 'Start easy, focus on raising core temperature.'
    },
    {
      id: 2,
      name: 'Intervals',
      step_type: 'Intervals',
      intervals: 4,
      planned_intervals: [
        // Interval 1 - Work
        {
          interval_number: 1,
          step_type: 'Work',
          planned_duration: 2, // duration in min
          planned_intensity: 180, // intensity value
          intensity_unit: 'bpm', // intensity metric
          notes: ''
        },
        // Interval 1 - Recovery
        {
          interval_number: 1,
          step_type: 'Recovery',
          planned_duration: 1, // duration in min
          planned_intensity: 140, // intensity value
          intensity_unit: 'bpm', // intensity metric
          notes: ''
        },
        // Interval 2 - Work
        {
          interval_number: 2,
          step_type: 'Work',
          planned_duration: 2,
          planned_intensity: 180,
          intensity_unit: 'bpm',
          notes: ''
        },
        // Interval 2 - Recovery
        {
          interval_number: 2,
          step_type: 'Recovery',
          planned_duration: 1,
          planned_intensity: 140,
          intensity_unit: 'bpm',
          notes: ''
        }
      ],
      notes: 'Maintain consistent pace for each interval.'
    },
    {
      id: 3,
      name: 'Cool-Down Cycle',
      step_type: 'Cool-Down',
      intervals: 1,
      planned_intervals: [
        {
          interval_number: 1,
          step_type: 'Cool-Down',
          planned_duration: 8,
          planned_intensity: 80,
          intensity_unit: 'watts',
          notes: ''
        }
      ],
      notes: 'Gradually decrease intensity.'
    }
  ];

  const handleEdit = (id: number) => {
    clientLogger.info('Edit exercise:', { id });
    // Placeholder for edit functionality
  };

  const handleDelete = (id: number) => {
    clientLogger.info('Delete exercise:', { id });
    // Placeholder for delete functionality
  };

  // Only render three cards: Warm-Up, Intervals, Cool-Down
  const warmUp = placeholderExercises.find(e => e.step_type === 'Warm-Up');
  const intervalsExercise = placeholderExercises.find(e => e.step_type === 'Intervals');
  const coolDown = placeholderExercises.find(e => e.step_type === 'Cool-Down');

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">Exercise List</h2>
      {/* Exercise List */}
      <div className="space-y-4">
        {/* Warm-Up */}
        {warmUp && (
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              <h3 className="text-lg font-semibold text-gray-700">Warm-Up</h3>
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <ExerciseItem
              exercise={warmUp}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
        {/* Intervals */}
        {intervalsExercise && (
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              <h3 className="text-lg font-semibold text-gray-700">Intervals</h3>
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <ExerciseItem
              exercise={intervalsExercise}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
        {/* Cool-Down */}
        {coolDown && (
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              <h3 className="text-lg font-semibold text-gray-700">Cool-Down</h3>
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <ExerciseItem
              exercise={coolDown}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
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
      />
    </div>
  );
}