'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BsSearch, BsPlus, BsDash } from 'react-icons/bs';
import { HiInformationCircle, HiSwitchHorizontal } from 'react-icons/hi';
import { exerciseSchema, type Exercise } from '../../shared/schemas/exercise';
import { FitnessSettings } from '@/app/(protected)/user/settings/types/settings';

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
 * Option type for exercise name select dropdown
 */
interface ExerciseOption {
  value: string;
  label: string;
}

/**
 * Filter function for exercise name search
 * Matches if all search terms are found in the exercise name
 */
const filterExerciseOptions = (option: { label: string }, inputValue: string) => {
  if (!inputValue) return true;
  
  const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
  const exerciseName = option.label.toLowerCase();
  
  return searchTerms.every(term => exerciseName.includes(term));
};

/**
 * Custom styles for the exercise name select dropdown
 * Ensures proper color contrast in both light and dark modes
 */
const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'white',
  }),
  input: (base: any) => ({
    ...base,
    color: 'black',
  }),
  option: (base: any) => ({
    ...base,
    color: 'black',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'black',
  }),
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
  // Debug logs for user settings
  useEffect(() => {
    console.log('Modal User Settings:', userSettings);
    console.log('Track RIR:', userSettings?.fitness?.resistanceTraining?.trackRIR);
  }, [userSettings]);

  // State for exercise name options in dropdown
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);

  // Add state for alternate unit
  const [useAlternateUnit, setUseAlternateUnit] = useState(false);
  const defaultUnit = (userSettings?.fitness?.resistanceTraining?.weightUnit || 'kg') === 'kg' ? 'kgs' : 'lbs';
  const alternateUnit = defaultUnit === 'kgs' ? 'lbs' : 'kgs';

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
      // Ensure correct literal types for discriminated union
      const resetData = exercise.isVariedSets ? {
        ...exercise,
        isVariedSets: true as const,
        isAdvancedSets: Boolean(exercise.isAdvancedSets)
      } : {
        ...exercise,
        isVariedSets: false as const,
        isAdvancedSets: Boolean(exercise.isAdvancedSets),
        setDetails: undefined
      };
      reset(resetData);
    } else {
      // Generate next pairing for new exercise
      const existingPairings = exercises.map(ex => ex.pairing)
        .filter(p => !p.includes('WU') && !p.includes('CD'));
      
      let nextPairing = 'A1';
      if (existingPairings.length > 0) {
        const lastPairing = existingPairings[existingPairings.length - 1];
        const letter = lastPairing.charAt(0);
        const number = parseInt(lastPairing.charAt(1));
        
        if (number === 2) {
          nextPairing = String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
        } else {
          nextPairing = letter + '2';
        }
      }

      reset({
        id: Math.random().toString(36).substr(2, 9),
        pairing: nextPairing,
        sets: 1,
        reps: 1,
        load: 0,
        tempo: '2010',
        rest: 60,
        notes: '',
        isVariedSets: false as const,
        isAdvancedSets: false,
        setDetails: undefined
      });
    }
  }, [exercise, exercises, reset]);

  /**
   * Effect: Fetch available exercises for name dropdown
   */
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        const data = await response.json();
        const options = data.map((ex: any) => ({
          value: ex.exercise_name,
          label: ex.exercise_name
        }));
        setExerciseOptions(options);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  /**
   * Effect: Update exercise name when selected from advanced search
   */
  useEffect(() => {
    if (selectedExerciseName) {
      setValue('name', selectedExerciseName);
    }
  }, [selectedExerciseName, setValue]);

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
        reset();
      }
      // Reset the toggle to false (use default unit) when modal opens
      setUseAlternateUnit(false);
    }
  }, [isOpen, exercise, selectedExerciseName, reset]);

  /**
   * Form submission handler
   * Ensures correct typing for discriminated union before saving
   */
  const onSubmit = async (data: Exercise) => {
    console.log('Form Data:', data);
    console.log('Form Errors:', errors);

    // Add loadUnit if the load is numeric
    const loadData = typeof data.load === 'number' ? {
      load: data.load,
      loadUnit: (useAlternateUnit ? alternateUnit : defaultUnit).replace('kgs', 'kg') as 'kg' | 'lbs'
    } : {
      load: data.load
    };

    // Create the correct type based on isVariedSets
    const submissionData = data.isVariedSets ? {
      ...data,
      ...loadData,
      isVariedSets: true as const,
      isAdvancedSets: Boolean(data.isAdvancedSets),
      setDetails: (data.setDetails || []).map(set => ({
        ...set,
        ...(typeof set.load === 'number' ? { loadUnit: (useAlternateUnit ? alternateUnit : defaultUnit).replace('kgs', 'kg') as 'kg' | 'lbs' } : {}),
        subSets: set.subSets?.map(subSet => ({
          ...subSet,
          ...(typeof subSet.load === 'number' ? { loadUnit: (useAlternateUnit ? alternateUnit : defaultUnit).replace('kgs', 'kg') as 'kg' | 'lbs' } : {})
        }))
      }))
    } : {
      ...data,
      ...loadData,
      isVariedSets: false as const,
      isAdvancedSets: Boolean(data.isAdvancedSets),
      setDetails: undefined
    };

    console.log('Submission Data:', submissionData);
    onSave(submissionData);
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
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={exerciseOptions}
                    value={exerciseOptions.find(option => option.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Search for an exercise..."
                    isClearable
                    isSearchable
                    styles={customSelectStyles}
                    filterOption={filterExerciseOptions}
                  />
                )}
              />
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

            {/* Load */}
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
    </Modal>
  );
} 