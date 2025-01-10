'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { exerciseSchema } from '../../shared/schemas/program';
import { SetDetails, SubSet } from '../../shared/types';
import { BsSearch, BsPlus, BsDash } from 'react-icons/bs';
import type { z } from 'zod';

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface Exercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  isVariedSets?: boolean;
  isAdvancedSets?: boolean;
  setDetails?: SetDetails[];
}

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  exercise?: Exercise;
  exercises: Exercise[];
  onAdvancedSearch: () => void;
  selectedExerciseName?: string;
}

interface ExerciseOption {
  value: string;
  label: string;
}

const filterExerciseOptions = (option: { label: string }, inputValue: string) => {
  if (!inputValue) return true;
  
  const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
  const exerciseName = option.label.toLowerCase();
  
  return searchTerms.every(term => exerciseName.includes(term));
};

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

export default function ExerciseModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  exercises,
  onAdvancedSearch,
  selectedExerciseName
}: ExerciseModalProps) {
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      id: exercise?.id || Math.random().toString(36).substr(2, 9),
      name: exercise?.name || '',
      pairing: exercise?.pairing || '',
      sets: exercise?.sets || 3,
      reps: exercise?.reps || 10,
      load: exercise?.load || 0,
      tempo: exercise?.tempo || '2010',
      rest: exercise?.rest || 60,
      notes: exercise?.notes || '',
      rpe: exercise?.rpe,
      rir: exercise?.rir,
      isVariedSets: exercise?.isVariedSets || false,
      isAdvancedSets: exercise?.isAdvancedSets || false,
      setDetails: exercise?.setDetails || []
    }
  });

  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: 'setDetails'
  });

  const isVariedSets = watch('isVariedSets');
  const isAdvancedSets = watch('isAdvancedSets');
  const sets = watch('sets');

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

  useEffect(() => {
    if (exercise) {
      reset(exercise);
    } else {
      // Generate next pairing based on existing exercises
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

      setValue('pairing', nextPairing);
    }
  }, [exercise, exercises, reset, setValue]);

  useEffect(() => {
    if (selectedExerciseName) {
      setValue('name', selectedExerciseName);
    }
  }, [selectedExerciseName, setValue]);

  useEffect(() => {
    if (isVariedSets) {
      // Update setDetails when sets change
      const currentDetails = setFields;
      if (sets > currentDetails.length) {
        // Add new sets
        for (let i = currentDetails.length; i < sets; i++) {
          appendSet({
            setNumber: i + 1,
            reps: watch('reps'),
            load: watch('load'),
            tempo: watch('tempo'),
            rest: watch('rest'),
            subSets: []
          });
        }
      } else if (sets < currentDetails.length) {
        // Remove excess sets
        for (let i = currentDetails.length - 1; i >= sets; i--) {
          removeSet(i);
        }
      }
    }
  }, [sets, isVariedSets, setFields, appendSet, removeSet, watch]);

  const onSubmit = (data: ExerciseFormData) => {
    onSave(data);
    onClose();
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
                  <div>
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
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Pairing */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Pairing</label>
              <Controller
                name="pairing"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.pairing && (
                      <p className="mt-1 text-sm text-red-600">{errors.pairing.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Sets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-white">Sets</label>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="isVariedSets"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <>
                        <input
                          {...field}
                          type="checkbox"
                          id="variedSets"
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="variedSets" className="text-sm font-medium dark:text-white">
                          Varied sets
                        </label>
                      </>
                    )}
                  />
                </div>
              </div>
              <Controller
                name="sets"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.sets && (
                      <p className="mt-1 text-sm text-red-600">{errors.sets.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Reps */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Reps</label>
              <Controller
                name="reps"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.reps && (
                      <p className="mt-1 text-sm text-red-600">{errors.reps.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Load */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Load (kg)</label>
              <Controller
                name="load"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      step="0.5"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.load && (
                      <p className="mt-1 text-sm text-red-600">{errors.load.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-sm font-medium dark:text-white">
                Tempo (4 digits, X for explosive)
              </label>
              <Controller
                name="tempo"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="text"
                      pattern="[0-9X]{4}"
                      maxLength={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.tempo && (
                      <p className="mt-1 text-sm text-red-600">{errors.tempo.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Rest */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Rest (seconds)</label>
              <Controller
                name="rest"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.rest && (
                      <p className="mt-1 text-sm text-red-600">{errors.rest.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* RPE */}
            <div>
              <label className="block text-sm font-medium dark:text-white">RPE (optional)</label>
              <Controller
                name="rpe"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.rpe && (
                      <p className="mt-1 text-sm text-red-600">{errors.rpe.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* RIR */}
            <div>
              <label className="block text-sm font-medium dark:text-white">RIR (optional)</label>
              <Controller
                name="rir"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                    {errors.rir && (
                      <p className="mt-1 text-sm text-red-600">{errors.rir.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium dark:text-white">Notes (optional)</label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div>
                  <textarea
                    {...field}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Varied Sets Form */}
          {isVariedSets && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Set Details</h3>
                <div className="flex items-center space-x-4">
                  <Controller
                    name="isAdvancedSets"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          {...field}
                          type="checkbox"
                          id="advancedSets"
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="advancedSets" className="text-sm font-medium dark:text-white">
                          Advanced Sets
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid gap-4">
                {setFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-white">Set {index + 1}</span>
                      {isAdvancedSets && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentSet = watch(`setDetails.${index}`);
                            if (currentSet) {
                              const newSubSet = {
                                reps: currentSet.reps,
                                load: Math.round(currentSet.load * 0.9),
                                rest: 10,
                                tempo: currentSet.tempo
                              };
                              setValue(`setDetails.${index}.subSets`, [
                                ...(currentSet.subSets || []),
                                newSubSet
                              ]);
                            }
                          }}
                          className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200"
                        >
                          <BsPlus className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Controller
                        name={`setDetails.${index}.reps`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm dark:text-white">Reps</label>
                            <input
                              {...field}
                              type="number"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                        )}
                      />
                      <Controller
                        name={`setDetails.${index}.load`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm dark:text-white">Load (kg)</label>
                            <input
                              {...field}
                              type="number"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                        )}
                      />
                      <Controller
                        name={`setDetails.${index}.rest`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm dark:text-white">Rest (s)</label>
                            <input
                              {...field}
                              type="number"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                        )}
                      />
                    </div>

                    {/* Sub-sets */}
                    {isAdvancedSets && watch(`setDetails.${index}.subSets`)?.map((subSet, subIndex) => (
                      <div key={subIndex} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium dark:text-white">
                            Set {index + 1}.{subIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentSubSets = watch(`setDetails.${index}.subSets`) || [];
                              setValue(
                                `setDetails.${index}.subSets`,
                                currentSubSets.filter((_, i) => i !== subIndex)
                              );
                            }}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200"
                          >
                            <BsDash className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Controller
                            name={`setDetails.${index}.subSets.${subIndex}.reps`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <label className="block text-sm dark:text-white">Reps</label>
                                <input
                                  {...field}
                                  type="number"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                                />
                              </div>
                            )}
                          />
                          <Controller
                            name={`setDetails.${index}.subSets.${subIndex}.load`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <label className="block text-sm dark:text-white">Load (kg)</label>
                                <input
                                  {...field}
                                  type="number"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                                />
                              </div>
                            )}
                          />
                          <Controller
                            name={`setDetails.${index}.subSets.${subIndex}.rest`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <label className="block text-sm dark:text-white">Rest (s)</label>
                                <input
                                  {...field}
                                  type="number"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                                />
                              </div>
                            )}
                          />
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