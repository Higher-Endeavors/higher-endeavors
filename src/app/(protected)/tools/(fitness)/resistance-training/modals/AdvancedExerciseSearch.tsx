'use client';

import { Modal } from 'flowbite-react';
import Select from 'react-select';

interface AdvancedExerciseSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: any) => void;
}

export default function AdvancedExerciseSearch({ isOpen, onClose, onSelect }: AdvancedExerciseSearchProps) {
  // Placeholder options for demonstration
  const exerciseFamilyOptions = [
    { value: 'compound', label: 'Compound' },
    { value: 'isolation', label: 'Isolation' },
  ];

  const bodyRegionOptions = [
    { value: 'upper', label: 'Upper Body' },
    { value: 'lower', label: 'Lower Body' },
    { value: 'core', label: 'Core' },
  ];

  const muscleGroupOptions = [
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'legs', label: 'Legs' },
  ];

  const movementPatternOptions = [
    { value: 'push', label: 'Push' },
    { value: 'pull', label: 'Pull' },
    { value: 'squat', label: 'Squat' },
    { value: 'hinge', label: 'Hinge' },
  ];

  const movementPlaneOptions = [
    { value: 'sagittal', label: 'Sagittal' },
    { value: 'frontal', label: 'Frontal' },
    { value: 'transverse', label: 'Transverse' },
  ];

  const equipmentOptions = [
    { value: 'barbell', label: 'Barbell' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'bodyweight', label: 'Bodyweight' },
  ];

  const lateralityOptions = [
    { value: 'bilateral', label: 'Bilateral' },
    { value: 'unilateral', label: 'Unilateral' },
  ];

  // Placeholder exercises for demonstration
  const placeholderExercises = [
    {
      id: '1',
      label: 'Barbell Bench Press',
      data: {
        target_muscle_group: 'Chest',
        primary_equipment: 'Barbell',
        difficulty: 'Intermediate'
      },
      source: 'library'
    },
    {
      id: '2',
      label: 'Custom Exercise',
      data: {
        target_muscle_group: 'Back',
        primary_equipment: 'Dumbbell'
      },
      source: 'user'
    }
  ];

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        Advanced Exercise Search
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">
              Search Exercise
            </label>
            <Select
              options={placeholderExercises}
              className="basic-single"
              classNamePrefix="select"
              placeholder="Type to search exercises..."
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null
              }}
            />
          </div>

          {/* Filters in a responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Exercise Family */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Exercise Family
              </label>
              <Select
                options={exerciseFamilyOptions}
                isClearable
                placeholder="Filter by exercise family"
              />
            </div>

            {/* Body Region */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Body Region
              </label>
              <Select
                options={bodyRegionOptions}
                isClearable
                placeholder="Filter by body region"
              />
            </div>

            {/* Muscle Group */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Muscle Group
              </label>
              <Select
                options={muscleGroupOptions}
                isClearable
                placeholder="Filter by muscle group"
              />
            </div>

            {/* Movement Pattern */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Movement Pattern
              </label>
              <Select
                options={movementPatternOptions}
                isClearable
                placeholder="Filter by movement pattern"
              />
            </div>

            {/* Movement Plane */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Movement Plane
              </label>
              <Select
                options={movementPlaneOptions}
                isClearable
                placeholder="Filter by movement plane"
              />
            </div>

            {/* Equipment */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Equipment
              </label>
              <Select
                options={equipmentOptions}
                isClearable
                placeholder="Filter by equipment"
              />
            </div>

            {/* Laterality */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Laterality
              </label>
              <Select
                options={lateralityOptions}
                isClearable
                placeholder="Filter by laterality"
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium dark:text-white mb-3">
              {placeholderExercises.length} exercises found
            </h3>
            <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {placeholderExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer rounded transition-colors"
                  onClick={() => {
                    onSelect(exercise);
                    onClose();
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {exercise.label}
                    {exercise.source === 'user' && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {exercise.data.target_muscle_group} • {exercise.data.primary_equipment}
                    {exercise.source === 'library' && exercise.data.difficulty && (
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                        {exercise.data.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}