'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Modal } from 'flowbite-react';

interface ExerciseOption {
  id: string;
  value: string;
  label: string;
  libraryId?: number;
  source?: 'user' | 'library';
  data: {
    id: string;
    name: string;
    source: 'user' | 'library';
    difficulty?: string;
    targetMuscleGroup: string;
    primaryEquipment: string;
    secondaryEquipment?: string;
    exerciseFamily: string;
    bodyRegion: string;
    movementPattern: string;
    movementPlane: string;
    laterality: string;
  };
}

interface FilterOption {
  value: string;
  label: string;
}

interface ExerciseSearchProps {
  onSelect: (exercise: ExerciseOption) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Add these custom styles for the Select component
const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    color: 'black',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '20px',
  }),
  singleValue: (provided: any, state: any) => ({
    ...provided,
    color: 'black',
    fontSize: '14px',
    lineHeight: '20px',
  }),
  input: (provided: any, state: any) => ({
    ...provided,
    color: 'black',
    margin: '0',
    padding: '0',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    minHeight: '38px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#E5E7EB',
    },
  }),
  container: (provided: any) => ({
    ...provided,
    width: '100%',
  }),
  menu: (provided: any) => ({
    ...provided,
    width: '100%',
    zIndex: 10,
  }),
  menuList: (provided: any) => ({
    ...provided,
    maxHeight: '215px',
    padding: '4px',
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: '2px 8px',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    padding: '0 8px',
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    padding: '0 8px',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontSize: '14px',
    lineHeight: '20px',
  }),
};

// Update the filter function to handle both search and dropdown filtering
const filterExercises = (candidate: { label: string, value: string, data: any }, input: string) => {
  if (!input) return true;
  
  // Convert both to lowercase for case-insensitive matching
  const searchTerms = input.toLowerCase().split(' ');
  const exerciseName = candidate.label.toLowerCase();
  const muscleGroup = (candidate.data.targetMuscleGroup || '').toLowerCase();
  const equipment = (candidate.data.primaryEquipment || '').toLowerCase();
  
  // Check if all search terms are found in either the name, muscle group, or equipment
  return searchTerms.every(term => 
    exerciseName.includes(term) || 
    muscleGroup.includes(term) || 
    equipment.includes(term)
  );
};

export default function ExerciseSearch({ onSelect, isOpen, onClose }: ExerciseSearchProps) {
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  
  // Filter states
  const [selectedExerciseFamily, setSelectedExerciseFamily] = useState<FilterOption | null>(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<FilterOption | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<FilterOption | null>(null);
  const [selectedMovementPattern, setSelectedMovementPattern] = useState<FilterOption | null>(null);
  const [selectedMovementPlane, setSelectedMovementPlane] = useState<FilterOption | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<FilterOption | null>(null);
  const [selectedLaterality, setSelectedLaterality] = useState<FilterOption | null>(null);

  // Fetch exercises from the database
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        const data = await response.json();
        
        // Handle error response
        if (data.error) {
          console.error('Error fetching exercises:', data.error);
          setExercises([]);
          setIsLoading(false);
          return;
        }

        // Ensure data is an array
        const exercisesArray = Array.isArray(data) ? data : [];
        console.log('Exercises data:', exercisesArray);
        
        const options: ExerciseOption[] = exercisesArray.map((exercise: any) => ({
          id: exercise.id,
          value: `${exercise.source}-${exercise.id}`,
          label: exercise.exercise_name,
          libraryId: exercise.source === 'library' ? parseInt(exercise.id) : undefined,
          source: exercise.source,
          data: {
            id: exercise.id,
            name: exercise.exercise_name,
            source: exercise.source,
            difficulty: exercise.difficulty_name || 'User Exercise',
            targetMuscleGroup: exercise.target_muscle_group || 'N/A',
            primaryEquipment: exercise.primary_equipment || 'N/A',
            secondaryEquipment: exercise.secondary_equipment,
            exerciseFamily: exercise.exercise_family || 'N/A',
            bodyRegion: exercise.body_region || 'N/A',
            movementPattern: exercise.movement_pattern || 'N/A',
            movementPlane: exercise.movement_plane || 'N/A',
            laterality: exercise.laterality || 'N/A'
          }
        }));

        setExercises(options);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setExercises([]);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  // Filter options derived from exercises
  const exerciseFamilyOptions: FilterOption[] = Array.from(new Set(
    exercises.map(ex => ex.data.exerciseFamily)
  )).filter((family): family is string => Boolean(family))
    .map(family => ({ value: family, label: family }));

  const bodyRegionOptions: FilterOption[] = Array.from(new Set(
    exercises.map(ex => ex.data.bodyRegion)
  )).filter((region): region is string => Boolean(region))
    .map(region => ({ value: region, label: region }));

  const muscleGroupOptions: FilterOption[] = Array.from(new Set(
    exercises.map(ex => ex.data.targetMuscleGroup)
  )).filter((group): group is string => Boolean(group))
    .map(group => ({ value: group, label: group }));

  const movementPatternOptions: FilterOption[] = Array.from(new Set(
    exercises.map(ex => ex.data.movementPattern)
  )).filter((pattern): pattern is string => Boolean(pattern))
    .map(pattern => ({ value: pattern, label: pattern }));

  const movementPlaneOptions: FilterOption[] = Array.from(new Set(
    exercises.map(ex => ex.data.movementPlane)
  )).filter((plane): plane is string => Boolean(plane))
    .map(plane => ({ value: plane, label: plane }));

  const equipmentOptions: FilterOption[] = Array.from(new Set(
    exercises.flatMap(ex => [ex.data.primaryEquipment, ex.data.secondaryEquipment])
  )).filter((equipment): equipment is string => Boolean(equipment))
    .map(equipment => ({ value: equipment, label: equipment }));

  const lateralityOptions: FilterOption[] = Array.from(new Set(
    exercises.map(ex => ex.data.laterality)
  )).filter((laterality): laterality is string => Boolean(laterality))
    .map(laterality => ({ value: laterality, label: laterality }));

  // Filter exercises based on all filters
  const filteredExercises = exercises.filter(exercise => {
    const matchesExerciseFamily = !selectedExerciseFamily || exercise.data.exerciseFamily === selectedExerciseFamily.value;
    const matchesBodyRegion = !selectedBodyRegion || exercise.data.bodyRegion === selectedBodyRegion.value;
    const matchesMuscleGroup = !selectedMuscleGroup || exercise.data.targetMuscleGroup === selectedMuscleGroup.value;
    const matchesMovementPattern = !selectedMovementPattern || exercise.data.movementPattern === selectedMovementPattern.value;
    const matchesMovementPlane = !selectedMovementPlane || exercise.data.movementPlane === selectedMovementPlane.value;
    const matchesEquipment = !selectedEquipment || 
      exercise.data.primaryEquipment === selectedEquipment.value || 
      exercise.data.secondaryEquipment === selectedEquipment.value;
    const matchesLaterality = !selectedLaterality || exercise.data.laterality === selectedLaterality.value;
    
    return matchesExerciseFamily && matchesBodyRegion && matchesMuscleGroup && 
           matchesMovementPattern && matchesMovementPlane && matchesEquipment && matchesLaterality;
  });

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>Advanced Exercise Search</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Exercise
            </label>
            <Select
              options={filteredExercises}
              isLoading={isLoading}
              onChange={(option) => {
                if (option) {
                  console.log('ExerciseSearch - Selected exercise:', {
                    option,
                    fullData: option.data
                  });
                  onSelect(option as ExerciseOption);
                  onClose();
                }
              }}
              className="basic-single"
              classNamePrefix="select"
              placeholder="Type to search exercises..."
              styles={customStyles}
              filterOption={filterExercises}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Family
              </label>
              <Select
                value={selectedExerciseFamily}
                onChange={(option) => setSelectedExerciseFamily(option)}
                options={exerciseFamilyOptions}
                isClearable
                placeholder="Filter by exercise family"
                styles={customStyles}
              />
            </div>

            {/* Body Region */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Region
              </label>
              <Select
                value={selectedBodyRegion}
                onChange={(option) => setSelectedBodyRegion(option)}
                options={bodyRegionOptions}
                isClearable
                placeholder="Filter by body region"
                styles={customStyles}
              />
            </div>

            {/* Muscle Group */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Muscle Group
              </label>
              <Select
                value={selectedMuscleGroup}
                onChange={(option) => setSelectedMuscleGroup(option)}
                options={muscleGroupOptions}
                isClearable
                placeholder="Filter by muscle group"
                styles={customStyles}
              />
            </div>

            {/* Movement Pattern */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movement Pattern
              </label>
              <Select
                value={selectedMovementPattern}
                onChange={(option) => setSelectedMovementPattern(option)}
                options={movementPatternOptions}
                isClearable
                placeholder="Filter by movement pattern"
                styles={customStyles}
              />
            </div>

            {/* Movement Plane */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movement Plane
              </label>
              <Select
                value={selectedMovementPlane}
                onChange={(option) => setSelectedMovementPlane(option)}
                options={movementPlaneOptions}
                isClearable
                placeholder="Filter by movement plane"
                styles={customStyles}
              />
            </div>

            {/* Equipment */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment
              </label>
              <Select
                value={selectedEquipment}
                onChange={(option) => setSelectedEquipment(option)}
                options={equipmentOptions}
                isClearable
                placeholder="Filter by equipment"
                styles={customStyles}
              />
            </div>

            {/* Laterality */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Laterality
              </label>
              <Select
                value={selectedLaterality}
                onChange={(option) => setSelectedLaterality(option)}
                options={lateralityOptions}
                isClearable
                placeholder="Filter by laterality"
                styles={customStyles}
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {filteredExercises.length} exercises found
            </h3>
            <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {filteredExercises.map((exercise) => (
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
                    {exercise.data.targetMuscleGroup} • {exercise.data.primaryEquipment}
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