'use client';

import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { useState, useMemo } from 'react';
import { ExerciseLibraryItem } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';

interface AdvancedExerciseSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseLibraryItem) => void;
  exercises: ExerciseLibraryItem[];
}

export default function AdvancedExerciseSearch({ isOpen, onClose, onSelect, exercises }: AdvancedExerciseSearchProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    difficulty?: string;
    muscleGroup?: string;
    equipment?: string;
  }>({});

  // Extract unique values for each filter from exercises
  const filters = useMemo(() => {
    const getUniqueValues = (key: keyof ExerciseLibraryItem) => 
      Array.from(new Set(exercises.map(ex => ex[key]).filter(Boolean)))
        .sort()
        .map(value => ({ value, label: value }));

    return {
      difficulty: getUniqueValues('difficulty'),
      muscleGroup: getUniqueValues('muscleGroup'),
      equipment: getUniqueValues('equipment'),
    };
  }, [exercises]);

  // Filter exercises based on selected filters
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      return Object.entries(selectedFilters).every(([key, value]) => {
        if (!value) return true;
        return exercise[key as keyof ExerciseLibraryItem] === value;
      });
    });
  }, [exercises, selectedFilters]);

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
              options={exercises.map(ex => ({
                value: ex.exerciseLibraryId,
                label: ex.name,
                data: ex
              }))}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
              placeholder="Type to search exercises..."
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null
              }}
              onChange={(option) => option && onSelect(option.data)}
            />
          </div>

          {/* Filters in a responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Difficulty */}
            <div key="difficulty" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Difficulty
              </label>
              <Select
                options={filters.difficulty}
                isClearable
                placeholder="Filter by difficulty"
                className="dark:text-slate-700"
                onChange={(option) =>
                  setSelectedFilters(prev => ({
                    ...prev,
                    difficulty: typeof option?.value === 'string' ? option.value : undefined
                  }))
                }
              />
            </div>
            {/* Muscle Group */}
            <div key="muscleGroup" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Muscle Group
              </label>
              <Select
                options={filters.muscleGroup}
                isClearable
                placeholder="Filter by muscle group"
                className="dark:text-slate-700"
                onChange={(option) =>
                  setSelectedFilters(prev => ({
                    ...prev,
                    muscleGroup: typeof option?.value === 'string' ? option.value : undefined
                  }))
                }
              />
            </div>
            {/* Equipment */}
            <div key="equipment" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Equipment
              </label>
              <Select
                options={filters.equipment}
                isClearable
                placeholder="Filter by equipment"
                className="dark:text-slate-700"
                onChange={(option) =>
                  setSelectedFilters(prev => ({
                    ...prev,
                    equipment: typeof option?.value === 'string' ? option.value : undefined
                  }))
                }
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium dark:text-white mb-3">
              {filteredExercises.length} exercises found
            </h3>
            <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {filteredExercises.map((exercise) => (
                <div
                  key={`exercise-${exercise.exerciseLibraryId}`}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer rounded transition-colors"
                  onClick={() => {
                    onSelect(exercise);
                    onClose();
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {exercise.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {exercise.muscleGroup} • {exercise.equipment}
                    {exercise.difficulty && (
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                        {exercise.difficulty}
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