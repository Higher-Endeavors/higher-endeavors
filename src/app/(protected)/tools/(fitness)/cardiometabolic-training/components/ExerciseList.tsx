'use client';

import { useState } from 'react';
import AddExerciseModal from '../modals/AddExerciseModal';
import ExerciseItem from './ExerciseItem';

export default function ExerciseList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Updated placeholder data for CardioMetabolic Training
  const placeholderExercises = [
    {
      id: '1',
      name: 'Treadmill Warm-Up',
      pairing: 'Warm-Up',
      sets: 1,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 10, // duration in min
          planned_load: 3.5, // intensity value
          load_unit: 'mph', // intensity metric
          planned_tempo: 'Easy', // pace/cadence
          planned_rest: 0, // recovery in min
          notes: ''
        }
      ],
      notes: 'Start easy, focus on raising core temperature.'
    },
    {
      id: '2',
      name: 'Intervals',
      pairing: 'Intervals',
      sets: 4,
      planned_sets: [
        // Interval 1 - Work
        {
          set_number: 1,
          pairing: 'Work',
          planned_reps: 2, // duration in min
          planned_load: 180, // intensity value
          load_unit: 'bpm', // intensity metric
          planned_tempo: '',
          planned_rest: 0,
          notes: ''
        },
        // Interval 1 - Recovery
        {
          set_number: 1,
          pairing: 'Recovery',
          planned_reps: 1, // duration in min
          planned_load: 140, // intensity value
          load_unit: 'bpm', // intensity metric
          planned_tempo: '',
          planned_rest: 0,
          notes: ''
        },
        // Interval 2 - Work
        {
          set_number: 2,
          pairing: 'Work',
          planned_reps: 2,
          planned_load: 180,
          load_unit: 'bpm',
          planned_tempo: '',
          planned_rest: 0,
          notes: ''
        },
        // Interval 2 - Recovery
        {
          set_number: 2,
          pairing: 'Recovery',
          planned_reps: 1,
          planned_load: 140,
          load_unit: 'bpm',
          planned_tempo: '',
          planned_rest: 0,
          notes: ''
        }
      ],
      notes: 'Maintain consistent pace for each interval.'
    },
    {
      id: '3',
      name: 'Cool-Down Cycle',
      pairing: 'Cool-Down',
      sets: 1,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 8,
          planned_load: 80,
          load_unit: 'watts',
          planned_tempo: 'Light',
          planned_rest: 0,
          pairing: 'Cool-Down',
          notes: ''
        }
      ],
      notes: 'Gradually decrease intensity.'
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

  // Only render three cards: Warm-Up, Intervals, Cool-Down
  const warmUp = placeholderExercises.find(e => e.pairing === 'Warm-Up');
  const intervalsExercise = placeholderExercises.find(e => e.pairing === 'Intervals');
  const coolDown = placeholderExercises.find(e => e.pairing === 'Cool-Down');

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