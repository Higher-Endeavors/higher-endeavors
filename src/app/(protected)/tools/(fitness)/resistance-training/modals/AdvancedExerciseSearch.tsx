'use client';

import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { useState, useMemo } from 'react';
import { ExerciseLibraryItem } from '../types/resistance-training.types';

interface AdvancedExerciseSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseLibraryItem) => void;
  exercises: ExerciseLibraryItem[];
}

export default function AdvancedExerciseSearch({ isOpen, onClose, onSelect, exercises }: AdvancedExerciseSearchProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    exerciseFamily?: string;
    bodyRegion?: string;
    muscleGroup?: string;
    movementPattern?: string;
    movementPlane?: string;
    equipment?: string;
    laterality?: string;
  }>({});

  // Extract unique values for each filter from exercises
  const filters = useMemo(() => {
    const getUniqueValues = (key: keyof ExerciseLibraryItem) => 
      Array.from(new Set(exercises.map(ex => ex[key]).filter(Boolean)))
        .sort()
        .map(value => ({ value, label: value }));

    return {
      exerciseFamily: getUniqueValues('exercise_family'),
      bodyRegion: getUniqueValues('body_region'),
      muscleGroup: getUniqueValues('muscle_group'),
      movementPattern: getUniqueValues('movement_pattern'),
      movementPlane: getUniqueValues('movement_plane'),
      equipment: getUniqueValues('equipment'),
      laterality: getUniqueValues('laterality'),
    };
  }, [exercises]);

  // Filter exercises based on selected filters
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      return Object.entries(selectedFilters).every(([key, value]) => {
        if (!value) return true;
        const mappedKey = {
          exerciseFamily: 'exercise_family',
          bodyRegion: 'body_region',
          muscleGroup: 'muscle_group',
          movementPattern: 'movement_pattern',
          movementPlane: 'movement_plane',
          equipment: 'equipment',
          laterality: 'laterality',
        }[key as string];
        return exercise[mappedKey as keyof ExerciseLibraryItem] === value;
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
                value: ex.exercise_library_id,
                label: ex.name,
                data: ex
              }))}
              className="basic-single"
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
            {/* Exercise Family */}
            <div key="exerciseFamily" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Exercise Family
              </label>
              <Select
                options={filters.exerciseFamily}
                isClearable
                placeholder="Filter by exercise family"
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, exerciseFamily: option?.value }))}
              />
            </div>

            {/* Body Region */}
            <div key="bodyRegion" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Body Region
              </label>
              <Select
                options={filters.bodyRegion}
                isClearable
                placeholder="Filter by body region"
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, bodyRegion: option?.value }))}
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
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, muscleGroup: option?.value }))}
              />
            </div>

            {/* Movement Pattern */}
            <div key="movementPattern" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Movement Pattern
              </label>
              <Select
                options={filters.movementPattern}
                isClearable
                placeholder="Filter by movement pattern"
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, movementPattern: option?.value }))}
              />
            </div>

            {/* Movement Plane */}
            <div key="movementPlane" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Movement Plane
              </label>
              <Select
                options={filters.movementPlane}
                isClearable
                placeholder="Filter by movement plane"
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, movementPlane: option?.value }))}
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
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, equipment: option?.value }))}
              />
            </div>

            {/* Laterality */}
            <div key="laterality" className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Laterality
              </label>
              <Select
                options={filters.laterality}
                isClearable
                placeholder="Filter by laterality"
                onChange={(option) => setSelectedFilters(prev => ({ ...prev, laterality: option?.value }))}
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
                  key={`exercise-${exercise.exercise_library_id}`}
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
                    {exercise.muscle_group} • {exercise.equipment}
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