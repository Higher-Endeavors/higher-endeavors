'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Modal } from 'flowbite-react';

interface ExerciseOption {
  value: string;
  label: string;
  data: {
    id: number;
    name: string;
    difficulty: string;
    targetMuscleGroup: string;
    primaryMoverMuscle: string;
    secondaryMuscle: string;
    tertiaryMuscle: string;
    primaryEquipment: string;
    secondaryEquipment: string;
  };
}

interface FilterOption {
  value: string;
  label: string;
}

interface ExerciseSearchProps {
  onSelect: (exerciseName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Add these custom styles for the Select component
const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    color: 'black', // Force black text for options
  }),
  singleValue: (provided: any, state: any) => ({
    ...provided,
    color: 'black', // Force black text for selected value
  }),
  input: (provided: any, state: any) => ({
    ...provided,
    color: 'black', // Force black text for input
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white', // Force white background
  }),
};

// Add this filter function
const filterExercises = (candidate: { label: string, value: string, data: any }, input: string) => {
  if (!input) return true;
  
  // Convert both to lowercase for case-insensitive matching
  const searchTerms = input.toLowerCase().split(' ');
  const exerciseName = candidate.label.toLowerCase();
  
  // Check if all search terms are found in the exercise name
  return searchTerms.every(term => exerciseName.includes(term));
};

export default function ExerciseSearch({ onSelect, isOpen, onClose }: ExerciseSearchProps) {
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<FilterOption | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<FilterOption | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterOption | null>(null);

  // Fetch exercises from the database
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        const data = await response.json();
        
        // Log the first exercise to see its structure
        console.log('Sample exercise:', data[0]);
        
        const options = data.map((exercise: any) => ({
          // Use exercise_id if id is not available
          value: exercise.exercise_id?.toString() || exercise.id?.toString(),
          label: exercise.exercise_name,
          data: {
            id: exercise.exercise_id || exercise.id,
            name: exercise.exercise_name,
            difficulty: exercise.difficulty,
            targetMuscleGroup: exercise.target_muscle_group,
            primaryMoverMuscle: exercise.primary_mover_muscle,
            secondaryMuscle: exercise.secondary_muscle,
            tertiaryMuscle: exercise.tertiary_muscle,
            primaryEquipment: exercise.primary_equipment,
            secondaryEquipment: exercise.secondary_equipment
          }
        }));

        setExercises(options);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  // Filter options derived from exercises
  const muscleGroupOptions = Array.from(new Set(
    exercises.map(ex => ex.data.targetMuscleGroup)
  )).map(group => ({ value: group, label: group }));

  const equipmentOptions = Array.from(new Set(
    exercises.flatMap(ex => [ex.data.primaryEquipment, ex.data.secondaryEquipment])
      .filter(Boolean)
  )).map(equipment => ({ value: equipment, label: equipment }));

  const difficultyOptions = Array.from(new Set(
    exercises.map(ex => ex.data.difficulty)
  )).map(difficulty => ({ value: difficulty, label: difficulty }));

  // Filter exercises based on selected filters
  const filteredExercises = exercises.filter(exercise => {
    if (selectedMuscleGroup && exercise.data.targetMuscleGroup !== selectedMuscleGroup.value) {
      return false;
    }
    if (selectedEquipment && 
        exercise.data.primaryEquipment !== selectedEquipment.value && 
        exercise.data.secondaryEquipment !== selectedEquipment.value) {
      return false;
    }
    if (selectedDifficulty && exercise.data.difficulty !== selectedDifficulty.value) {
      return false;
    }
    return true;
  });

  const handleExerciseSelect = (option: ExerciseOption | null) => {
    if (option) {
      onSelect(option.label);
      onClose();
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        Advanced Exercise Search
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Exercise
            </label>
            <Select
              options={filteredExercises}
              isLoading={isLoading}
              onChange={(option) => handleExerciseSelect(option as ExerciseOption)}
              className="basic-single"
              classNamePrefix="select"
              placeholder="Type to search exercises..."
              styles={customStyles}
              filterOption={(candidate, input) => filterExercises(candidate, input)}
            />
          </div>

          {/* Filters - now always visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Muscle Group
              </label>
              <Select
                options={muscleGroupOptions}
                value={selectedMuscleGroup}
                onChange={setSelectedMuscleGroup}
                isClearable
                placeholder="Filter by muscle group"
                styles={customStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment
              </label>
              <Select
                options={equipmentOptions}
                value={selectedEquipment}
                onChange={setSelectedEquipment}
                isClearable
                placeholder="Filter by equipment"
                styles={customStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <Select
                options={difficultyOptions}
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                isClearable
                placeholder="Filter by difficulty"
                styles={customStyles}
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {filteredExercises.length} exercises found
            </h3>
            <div className="max-h-60 overflow-y-auto">
              {filteredExercises.map((exercise, index) => (
                <div
                  key={`${exercise.value}-${index}`}
                  className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                  onClick={() => handleExerciseSelect(exercise)}
                >
                  <div className="font-medium">{exercise.label}</div>
                  <div className="text-sm text-gray-500">
                    {exercise.data.targetMuscleGroup} • {exercise.data.primaryEquipment}
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