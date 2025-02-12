'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BsSearch, BsPlus, BsDash } from 'react-icons/bs';
import { HiInformationCircle, HiSwitchHorizontal } from 'react-icons/hi';
import { FitnessSettings } from '@/app/(protected)/user/settings/types/settings';
import { 
  Exercise,
  ExerciseSource,
  exerciseSchema,
  getNextPairing,
  isValidPairing,
  createRegularExercise,
  createVariedExercise,
  ExerciseOption,
  ExerciseSelectHandler
} from '../../shared/types/exercise.types';
import { LoadUnit } from '../../shared/types';
import { FilterOptionOption } from 'react-select';

/**
 * Filter function for the exercise select dropdown
 */
const filterExerciseOptions = (
  option: FilterOptionOption<ExerciseOption>,
  inputValue: string
): boolean => {
  if (!inputValue) return true;
  
  const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
  const exerciseName = option.label.toLowerCase();
  
  return searchTerms.every(term => exerciseName.includes(term));
};

/**
 * Props for the Exercise Modal component
 */
interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  exercise?: Exercise;          // Provided when editing an existing exercise
  exercises: Exercise[];        // Used for generating next pairing
  onAdvancedSearch: () => void;
  selectedExerciseName?: string;
  userSettings?: { fitness?: FitnessSettings };
}

/**
 * Custom styles for the exercise name select dropdown
 * Ensures proper color contrast in both light and dark modes
 */
const customSelectStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    color: state.isFocused ? 'white' : 'black',
    backgroundColor: state.isFocused ? '#6366F1' : 'white',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    '&:hover': {
      backgroundColor: '#6366F1',
      color: 'white'
    }
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    minHeight: '38px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#6366F1'
    }
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'black'
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'black'
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    zIndex: 10
  }),
  container: (provided: any) => ({
    ...provided,
    '.dark &': {
      '& input': {
        color: 'black !important'
      },
      '& .select__single-value': {
        color: 'black'
      },
      '& .select__control': {
        backgroundColor: '#e0e0e0'
      },
      '& .select__menu': {
        backgroundColor: '#e0e0e0'
      },
      '& .select__option': {
        backgroundColor: '#e0e0e0',
        color: 'black',
        '&:hover': {
          backgroundColor: '#6366F1',
          color: 'white'
        }
      }
    }
  })
};

/**
 * Exercise Modal Component
 * Handles both creating new exercises and editing existing ones
 * Supports both standard and varied set configurations
 */
export default function ExerciseModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  exercises,
  onAdvancedSearch,
  selectedExerciseName,
  userSettings
}: ExerciseModalProps) {
  useEffect(() => {
    console.log('AddExerciseModal - Received props:', {
      selectedExerciseName,
      exercise,
      exercises
    });
  }, [selectedExerciseName, exercise, exercises]);

  // Debug logs for user settings
  useEffect(() => {
    console.log('Modal User Settings:', userSettings);
    console.log('Track RIR:', userSettings?.fitness?.resistanceTraining?.trackRIR);
  }, [userSettings]);

  // State for exercise name options in dropdown
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add state for alternate unit
  const [useAlternateUnit, setUseAlternateUnit] = useState(false);
  const defaultUnit = (userSettings?.fitness?.resistanceTraining?.weightUnit || 'kg') === 'kg' ? 'kg' : 'lbs';
  const alternateUnit = defaultUnit === 'kg' ? 'lbs' : 'kg';

  // Add state for creating new exercise
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  /**
   * Form initialization with React Hook Form and Zod validation
   * Handles both standard and varied set exercises through discriminated union
   */
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<Exercise>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      id: '',
      name: '',
      pairing: 'A1',
      sets: 1,
      reps: 1,
      load: 0,
      tempo: '2010',
      rest: 60,
      notes: '',
      isVariedSets: false,
      isAdvancedSets: false,
      setDetails: undefined
    }
  });

  // Watch values for conditional rendering and updates
  const isVariedSets = watch('isVariedSets');
  const isAdvancedSets = watch('isAdvancedSets');
  const currentSets = watch('sets');

  /**
   * Effect: Initialize form when editing existing exercise
   * Handles type conversion for discriminated union
   */
  useEffect(() => {
    if (exercise) {
      reset(exercise); // The exercise type is already correct from our consolidated types
    } else {
      // Use our utility function to get the next pairing
      const nextPairing = getNextPairing(exercises.map(ex => ex.pairing));

      reset(createRegularExercise({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        pairing: nextPairing,
        sets: 1,
        reps: 1,
        load: 0,
        tempo: '2010',
        rest: 60,
        notes: ''
      }));
    }
  }, [exercise, exercises, reset]);

  /**
   * Handles selection of an exercise from the dropdown
   */
  const handleExerciseSelect: ExerciseSelectHandler = (newValue, actionMeta) => {
    setSelectedExercise(newValue);
    if (!newValue) {
      // Clear form values when no exercise is selected
      setValue('name', '');
      setValue('source', undefined);
      setValue('libraryId', undefined);
      setValue('id', '');
      return;
    }
    
    setValue('name', newValue.data.name);
    setValue('source', newValue.data.source);
    if (newValue.data.libraryId) {
      setValue('libraryId', newValue.data.libraryId);
    }
  };

  // Effect for handling selectedExerciseName
  useEffect(() => {
    if (selectedExerciseName && exerciseOptions.length > 0) {
      const matchingExercise = exerciseOptions.find(
        option => option.label === selectedExerciseName
      );
      if (matchingExercise) {
        handleExerciseSelect(matchingExercise, {
          action: 'select-option',
          option: matchingExercise,
          name: 'exercise-select'
        });
      }
    } else if (!selectedExerciseName && !exercise) {
      // Clear the selected exercise if there's no name and we're not editing
      setSelectedExercise(null);
      setValue('name', '');
    }
  }, [selectedExerciseName, exerciseOptions, handleExerciseSelect, exercise, setValue]);

  // Fetch exercises effect
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/exercises');
        const data = await response.json();
        
        if (data.error) {
          console.error('Error fetching exercises:', data.error);
          return;
        }

        const options: ExerciseOption[] = data.map((exercise: {
          id: string | number;
          exercise_name: string;
          source: ExerciseSource;
        }) => ({
          value: `${exercise.source}-${exercise.id}`,
          label: exercise.exercise_name,
          data: {
            id: exercise.id.toString(),
            name: exercise.exercise_name,
            source: exercise.source,
            libraryId: exercise.source === 'library' ? Number(exercise.id) : undefined
          }
        }));

        setExerciseOptions(options);

        // Only set selected exercise if we have a name and we're not adding a new exercise
        if (selectedExerciseName && exercise) {
          const matchingExercise = options.find(opt => opt.label === selectedExerciseName);
          if (matchingExercise) {
            setSelectedExercise(matchingExercise);
            setValue('name', matchingExercise.label);
          }
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen, selectedExerciseName, exercise, setValue]);

  /**
   * Effect: Manage setDetails array when varied sets is enabled
   * Creates or updates set details when number of sets changes
   */
  useEffect(() => {
    if (isVariedSets && currentSets > 0) {
      const newSetDetails = Array.from({ length: currentSets }, (_, i) => ({
        setNumber: i + 1,
        reps: watch('reps'),
        load: watch('load'),
        tempo: watch('tempo'),
        rest: watch('rest'),
        subSets: []
      }));
      setValue('setDetails', newSetDetails);
    } else {
      // Clear setDetails when varied sets is disabled
      setValue('setDetails', undefined);
    }
  }, [isVariedSets, currentSets, setValue, watch]);

  // Reset form and toggle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (exercise) {
        reset({
          ...exercise,
          name: selectedExerciseName || exercise.name
        });
      } else {
        reset(); // Reset to default values
        setSelectedExercise(null); // Clear the selected exercise
        setValue('name', ''); // Explicitly clear the name field
      }
      // Reset the toggle to false (use default unit) when modal opens
      setUseAlternateUnit(false);
    }
  }, [isOpen, exercise, selectedExerciseName, reset, setValue]);

  // Clear selected exercise when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedExercise(null);
      setValue('name', '');
    }
  }, [isOpen, setValue]);

  /**
   * Handles form submission with proper type conversion
   */
  const onSubmit = async (data: Exercise) => {
    console.log('Form Data:', data);
    console.log('Form Errors:', errors);

    const loadUnit = (useAlternateUnit ? alternateUnit : defaultUnit) as LoadUnit;

    if (data.isVariedSets) {
      const setDetails = data.setDetails?.map(set => ({
        ...set,
        loadUnit,
        subSets: set.subSets?.map(subSet => ({
          ...subSet,
          loadUnit
        }))
      })) || [];

      onSave(createVariedExercise({
        ...data,
        loadUnit
      }, setDetails));
    } else {
      onSave(createRegularExercise({
        ...data,
        loadUnit
      }));
    }
    onClose();
    // Reset the toggle after saving
    setUseAlternateUnit(false);
  };

  /**
   * Handlers for advanced set management
   */
  const handleAddSubSet = (setIndex: number) => {
    const currentSetDetails = watch('setDetails') || [];
    const updatedSetDetails = [...currentSetDetails];
    const currentSet = updatedSetDetails[setIndex];

    if (!currentSet.subSets?.length) {
      currentSet.subSets = [
        {
          reps: currentSet.reps,
          load: currentSet.load,
          rest: currentSet.rest
        },
        {
          reps: currentSet.reps,
          load: currentSet.load,
          rest: currentSet.rest
        }
      ];
    } else {
      currentSet.subSets.push({
        reps: currentSet.reps,
        load: currentSet.load,
        rest: currentSet.rest
      });
    }

    setValue('setDetails', updatedSetDetails);
  };

  const handleRemoveSubSet = (setIndex: number, subSetIndex: number) => {
    const currentSetDetails = watch('setDetails') || [];
    const updatedSetDetails = [...currentSetDetails];
    const currentSet = updatedSetDetails[setIndex];

    if (currentSet.subSets) {
      currentSet.subSets = currentSet.subSets.filter((_, idx) => idx !== subSetIndex);
    }

    setValue('setDetails', updatedSetDetails);
  };

  // Function to handle exercise creation
  const handleCreateExercise = async (exerciseName: string) => {
    try {
      const response = await fetch('/api/user-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exercise_name: exerciseName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create exercise');
      }

      const newExercise = await response.json();
      
      // Create a new exercise option
      const newOption: ExerciseOption = {
        value: `user-${newExercise.id}`,
        label: newExercise.exercise_name,
        data: {
          id: newExercise.id.toString(),
          name: newExercise.exercise_name,
          source: 'user' as ExerciseSource
        }
      };

      // Update exercise options
      setExerciseOptions(prev => [...prev, newOption]);
      
      // Select the new exercise
      setSelectedExercise(newOption);
      
      // Update form values
      setValue('name', newExercise.exercise_name);
      setValue('source', 'user' as ExerciseSource);
      setValue('id', newExercise.id.toString());
      
      // Reset modal state
      setIsCreatingExercise(false);
      setNewExerciseName('');

      // Don't close the modal - let the user configure the exercise details
      handleExerciseSelect(newOption, {
        action: 'select-option',
        option: newOption,
        name: 'exercise-select'
      });
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  // Modify the existing exercise search component
  const NoOptionsMessage = ({ inputValue }: { inputValue: string }) => {
    return (
      <div className="text-center">
        <p className="text-gray-900 dark:text-white font-medium">No matches found</p>
        <button
          type="button"
          onClick={() => {
            setIsCreatingExercise(true);
            setNewExerciseName(inputValue);
          }}
          className="mt-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          Create new exercise: {inputValue}
        </button>
      </div>
    );
  };

  // Add confirmation dialog
  const ConfirmationDialog = () => {
    if (!isCreatingExercise) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New Exercise</h3>
          <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to create "{newExerciseName}"?</p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              onClick={() => {
                setIsCreatingExercise(false);
                setNewExerciseName('');
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => handleCreateExercise(newExerciseName)}
            >
              Create Exercise
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        {exercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Name */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-white">Exercise Name</label>
                <button
                  type="button"
                  onClick={onAdvancedSearch}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Advanced Search
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select<ExerciseOption>
                    key={isOpen ? 'open' : 'closed'} // Force re-render when modal opens/closes
                    value={selectedExercise}
                    onChange={handleExerciseSelect}
                    options={exerciseOptions}
                    isLoading={isLoading}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Select or search for an exercise..."
                    isClearable
                    styles={customSelectStyles}
                    filterOption={filterExerciseOptions}
                    components={{
                      NoOptionsMessage: ({ children, ...props }: any) => (
                        <NoOptionsMessage inputValue={props.selectProps.inputValue} />
                      )
                    }}
                  />
                </div>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Pairing */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Pairing</label>
              <input
                {...register('pairing')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
              {errors.pairing && (
                <p className="mt-1 text-sm text-red-600">{errors.pairing.message}</p>
              )}
            </div>

            {/* Sets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-white">Sets</label>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="isVariedSets"
                    control={control}
                    defaultValue={false}
                    render={({ field: { value, onChange, ...field } }) => (
                      <input
                        type="checkbox"
                        id="variedSets"
                        checked={value}
                        onChange={(e) => {
                          onChange(e.target.checked);
                          if (!e.target.checked) {
                            setValue('setDetails', undefined);
                          }
                        }}
                        {...field}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  />
                  <label htmlFor="variedSets" className="text-sm font-medium dark:text-white">
                    Varied sets
                  </label>
                </div>
              </div>
              <input
                type="number"
                {...register('sets', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
              {errors.sets && (
                <p className="mt-1 text-sm text-red-600">{errors.sets.message}</p>
              )}
            </div>

            {/* Reps */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <label className="block text-sm font-medium dark:text-white">Reps</label>
                <input
                  type="number"
                  {...register('reps', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
                {errors.reps && (
                  <p className="mt-1 text-sm text-red-600">{errors.reps.message}</p>
                )}
              </div>
            )}

            {/* Load */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <div className="flex items-center space-x-1">
                  <label className="block text-sm font-medium dark:text-white">Load</label>
                  <div className="group relative">
                    <HiInformationCircle className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                      <p>Acceptable inputs:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Numeric weight in {useAlternateUnit ? alternateUnit : defaultUnit}</li>
                        <li>BW (bodyweight)</li>
                        <li>Band colors (e.g., red, black)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    {...register('load', {
                      setValueAs: v => {
                        const num = Number(v);
                        return isNaN(num) ? v : num;
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit}, BW, or band color`}
                  />
                  <button
                    type="button"
                    onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                    className="mt-1 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1 text-gray-700"
                    title={`Switch to ${useAlternateUnit ? defaultUnit : alternateUnit}`}
                  >
                    <HiSwitchHorizontal className="h-4 w-4" />
                    <span>{useAlternateUnit ? alternateUnit : defaultUnit}</span>
                  </button>
                </div>
                {errors.load && (
                  <p className="mt-1 text-sm text-red-600">{errors.load.message}</p>
                )}
              </div>
            )}

            {/* Tempo */}
            <div>
              <label className="block text-sm font-medium dark:text-white">
                Tempo (4 digits, X for explosive)
              </label>
              <input
                {...register('tempo')}
                maxLength={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
              {errors.tempo && (
                <p className="mt-1 text-sm text-red-600">{errors.tempo.message}</p>
              )}
            </div>

            {/* Rest */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <label className="block text-sm font-medium dark:text-white">Rest (seconds)</label>
                <input
                  type="number"
                  {...register('rest', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
                {errors.rest && (
                  <p className="mt-1 text-sm text-red-600">{errors.rest.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Optional Fields</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RPE */}
              {userSettings?.fitness?.resistanceTraining?.trackRPE && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    RPE (Rate of Perceived Exertion)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('rpe', { 
                      setValueAs: v => v === "" || v === "0" ? undefined : Number(v)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder="Enter RPE (0-20)"
                  />
                  {errors.rpe && (
                    <p className="mt-1 text-sm text-red-600">{errors.rpe.message}</p>
                  )}
                </div>
              )}

              {/* RIR */}
              {userSettings?.fitness?.resistanceTraining?.trackRIR && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    RIR (Reps in Reserve)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('rir', { 
                      setValueAs: v => v === "" || v === "0" ? undefined : Number(v)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder="Enter RIR (0-10)"
                  />
                  {errors.rir && (
                    <p className="mt-1 text-sm text-red-600">{errors.rir.message}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  placeholder="Add any additional notes about the exercise"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Varied Sets Form */}
          {isVariedSets && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Set Details</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isAdvancedSets"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="advancedSets"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    />
                    <label htmlFor="advancedSets" className="text-sm font-medium dark:text-white">
                      Advanced Sets
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4">
                {watch('setDetails')?.map((set, setIndex) => (
                  <div key={set.setNumber} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-white">Set {set.setNumber}</span>
                      {isAdvancedSets && (
                        <button
                          type="button"
                          onClick={() => handleAddSubSet(setIndex)}
                          className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200"
                        >
                          <BsPlus className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Main set inputs */}
                    {(!set.subSets?.length) && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm dark:text-white">Reps</label>
                          <input
                            type="number"
                            {...register(`setDetails.${setIndex}.reps` as const, { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm dark:text-white">Load</label>
                          <input
                            {...register(`setDetails.${setIndex}.load` as const, {
                              setValueAs: v => {
                                const num = Number(v);
                                return isNaN(num) ? v : num;
                              }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm dark:text-white">Rest</label>
                          <input
                            type="number"
                            {...register(`setDetails.${setIndex}.rest` as const, { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                          />
                        </div>
                      </div>
                    )}

                    {/* Sub-sets */}
                    {isAdvancedSets && set.subSets?.map((subSet, subSetIndex) => (
                      <div key={subSetIndex} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium dark:text-white">
                            Set {set.setNumber}.{subSetIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubSet(setIndex, subSetIndex)}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200"
                          >
                            <BsDash className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm dark:text-white">Reps</label>
                            <input
                              type="number"
                              {...register(`setDetails.${setIndex}.subSets.${subSetIndex}.reps` as const, { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm dark:text-white">Load</label>
                            <input
                              {...register(`setDetails.${setIndex}.subSets.${subSetIndex}.load` as const, {
                                setValueAs: v => {
                                  const num = Number(v);
                                  return isNaN(num) ? v : num;
                                }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm dark:text-white">Rest</label>
                            <input
                              type="number"
                              {...register(`setDetails.${setIndex}.subSets.${subSetIndex}.rest` as const, { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {exercise ? 'Save Changes' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </Modal.Body>
      {isCreatingExercise && <ConfirmationDialog />}
    </Modal>
  );
} 