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
      name: 'Treadmill Intervals',
      pairing: 'Warm-Up',
      sets: 1,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 10, // duration in min
          planned_load: 3.5, // intensity value
          load_unit: 'mph', // intensity metric
          planned_tempo: 'Easy', // pace/cadence
          planned_rest: 0 // recovery in min
        }
      ],
      notes: 'Start easy, focus on raising core temperature.'
    },
    {
      id: '2',
      name: 'Interval Run',
      pairing: 'Work',
      sets: 4,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 5, // duration in min
          planned_load: 7.5, // intensity value
          load_unit: 'mph', // intensity metric
          planned_tempo: 'Moderate', // pace/cadence
          planned_rest: 2 // recovery in min
        },
        {
          set_number: 2,
          planned_reps: 5,
          planned_load: 7.5,
          load_unit: 'mph',
          planned_tempo: 'Moderate',
          planned_rest: 2
        },
        {
          set_number: 3,
          planned_reps: 5,
          planned_load: 7.5,
          load_unit: 'mph',
          planned_tempo: 'Moderate',
          planned_rest: 2
        },
        {
          set_number: 4,
          planned_reps: 5,
          planned_load: 7.5,
          load_unit: 'mph',
          planned_tempo: 'Moderate',
          planned_rest: 2
        }
      ],
      notes: 'Maintain consistent pace for each interval.'
    },
    {
      id: '3',
      name: 'Active Recovery Walk',
      pairing: 'Recovery',
      sets: 1,
      planned_sets: [
        {
          set_number: 1,
          planned_reps: 10,
          planned_load: 3.0,
          load_unit: 'mph',
          planned_tempo: 'Easy',
          planned_rest: 0
        }
      ],
      notes: 'Keep HR below 120.'
    },
    {
      id: '4',
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
          planned_rest: 0
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

  // Helper: Get work and recovery exercises
  const warmUp = placeholderExercises.find(e => e.pairing === 'Warm-Up');
  const coolDown = placeholderExercises.find(e => e.pairing === 'Cool-Down');
  const work = placeholderExercises.find(e => e.pairing === 'Work');
  const recovery = placeholderExercises.find(e => e.pairing === 'Recovery');

  // Build alternated intervals
  let alternatedIntervals: any[] = [];
  if (work && recovery) {
    const workSets = work.planned_sets;
    const recoverySet = recovery.planned_sets[0]; // Assume one recovery set for all
    for (let i = 0; i < workSets.length; i++) {
      alternatedIntervals.push({
        ...work,
        planned_sets: [workSets[i]],
        intervalType: 'Work',
        intervalNumber: i + 1
      });
      alternatedIntervals.push({
        ...recovery,
        planned_sets: [{ ...recoverySet, set_number: i + 1 }],
        intervalType: 'Recovery',
        intervalNumber: i + 1
      });
    }
  }

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
        {/* Alternating Work/Recovery Intervals */}
        {alternatedIntervals.map((interval, idx) => (
          <div key={interval.intervalType + interval.intervalNumber + idx}>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              <h3 className="text-lg font-semibold text-gray-700">
                Interval {interval.intervalNumber} ({interval.intervalType})
              </h3>
              <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <ExerciseItem
              exercise={interval}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
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