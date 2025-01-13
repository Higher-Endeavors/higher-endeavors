'use client';

import React from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BsSearch, BsPlus, BsDash } from 'react-icons/bs';
import { exerciseSchema, type Exercise, type SetDetails } from '../../shared/schemas/exercise';
import { generateNextPairing } from '../../shared/utils/pairingUtils';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  exercise?: Exercise;
  exercises: Exercise[];
  exerciseOptions: Array<{ value: string; label: string }>;
  onAdvancedSearch: () => void;
  selectedExerciseName?: string;
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
  exerciseOptions,
  onAdvancedSearch,
  selectedExerciseName
}: ExerciseModalProps) {
  // Create appropriate default values based on whether we're editing or creating
  const defaultValues = exercise ? (
    exercise.isVariedSets ? {
      ...exercise,
      isVariedSets: true as const,
      isAdvancedSets: Boolean(exercise.isAdvancedSets),
      setDetails: exercise.setDetails
    } : {
      ...exercise,
      isVariedSets: false as const,
      isAdvancedSets: Boolean(exercise.isAdvancedSets),
      setDetails: undefined
    }
  ) : {
    id: Math.random().toString(36).substr(2, 9),
    name: selectedExerciseName || '',
    pairing: generateNextPairing(exercises),
    sets: 1,
    reps: 1,
    load: 0,
    tempo: '2010',
    rest: 60,
    notes: '',
    isVariedSets: false as const,
    isAdvancedSets: false,
    setDetails: undefined
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Exercise>({
    resolver: zodResolver(exerciseSchema),
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "setDetails"
  });

  const isVariedSets = watch('isVariedSets');
  const isAdvancedSets = watch('isAdvancedSets');
  const currentSets = watch('sets');

  // Handle varied sets changes
  const handleVariedSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    // Update isVariedSets with the correct literal type
    setValue('isVariedSets', isChecked ? true : false as const);
    
    if (isChecked) {
      // Initialize setDetails when varied sets is enabled
      const initialSetDetails: SetDetails[] = Array.from({ length: currentSets }, (_, i) => ({
        setNumber: i + 1,
        reps: watch('reps'),
        load: watch('load'),
        tempo: watch('tempo'),
        rest: watch('rest'),
        subSets: []
      }));
      append(initialSetDetails);
    } else {
      // Clear setDetails when varied sets is disabled
      while (fields.length > 0) {
        remove(0);
      }
      setValue('setDetails', undefined);
    }
  };

  const onSubmit = (data: Exercise) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        {exercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body>
        <form id="exercise-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exercise Name
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={exerciseOptions}
                    filterOption={filterExerciseOptions}
                    styles={customSelectStyles}
                    className="mt-1"
                    value={exerciseOptions.find(option => option.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                  />
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onAdvancedSearch}
              className="mt-6 p-2 text-gray-600 hover:text-gray-900"
            >
              <BsSearch className="h-5 w-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pairing</label>
            <input
              {...register('pairing')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.pairing && (
              <p className="mt-1 text-sm text-red-600">{errors.pairing.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Sets</label>
              <input
                type="number"
                {...register('sets', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.sets && (
                <p className="mt-1 text-sm text-red-600">{errors.sets.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="variedSets"
                {...register('isVariedSets')}
                onChange={handleVariedSetsChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="variedSets" className="text-sm font-medium text-gray-700">
                Varied Sets
              </label>
            </div>
          </div>

          {!isVariedSets && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reps</label>
                <input
                  type="number"
                  {...register('reps', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.reps && (
                  <p className="mt-1 text-sm text-red-600">{errors.reps.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Load</label>
                <input
                  {...register('load')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Weight or band color"
                />
                {errors.load && (
                  <p className="mt-1 text-sm text-red-600">{errors.load.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tempo</label>
                <input
                  {...register('tempo')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 2010"
                />
                {errors.tempo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tempo.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rest (seconds)</label>
                <input
                  type="number"
                  {...register('rest', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.rest && (
                  <p className="mt-1 text-sm text-red-600">{errors.rest.message}</p>
                )}
              </div>
            </div>
          )}

          {isVariedSets && (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Set {index + 1}</h4>
                    {isAdvancedSets && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentSet = watch(`setDetails.${index}`);
                          if (!currentSet.subSets?.length) {
                            setValue(`setDetails.${index}.subSets`, [
                              { reps: currentSet.reps, load: currentSet.load, rest: currentSet.rest },
                              { reps: currentSet.reps, load: currentSet.load, rest: currentSet.rest }
                            ]);
                          } else {
                            setValue(`setDetails.${index}.subSets`, [
                              ...currentSet.subSets,
                              { reps: currentSet.reps, load: currentSet.load, rest: currentSet.rest }
                            ]);
                          }
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <BsPlus className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reps</label>
                      <input
                        type="number"
                        {...register(`setDetails.${index}.reps` as const, { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Load</label>
                      <input
                        {...register(`setDetails.${index}.load` as const)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tempo</label>
                      <input
                        {...register(`setDetails.${index}.tempo` as const)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rest</label>
                      <input
                        type="number"
                        {...register(`setDetails.${index}.rest` as const, { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {watch(`setDetails.${index}.subSets`)?.map((_, subIndex) => (
                    <div key={subIndex} className="ml-6 p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-md font-medium">Sub-Set {subIndex + 1}</h5>
                        <button
                          type="button"
                          onClick={() => {
                            const currentSubSets = watch(`setDetails.${index}.subSets`) || [];
                            setValue(
                              `setDetails.${index}.subSets`,
                              currentSubSets.filter((_, i) => i !== subIndex)
                            );
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <BsDash className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Reps</label>
                          <input
                            type="number"
                            {...register(`setDetails.${index}.subSets.${subIndex}.reps` as const, { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Load</label>
                          <input
                            {...register(`setDetails.${index}.subSets.${subIndex}.load` as const)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rest</label>
                          <input
                            type="number"
                            {...register(`setDetails.${index}.subSets.${subIndex}.rest` as const, { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Optional Fields</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">RPE</label>
                <input
                  type="number"
                  step="0.5"
                  {...register('rpe', { 
                    setValueAs: v => v === "" || v === "0" ? undefined : Number(v)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter RPE (0-20)"
                />
                {errors.rpe && (
                  <p className="mt-1 text-sm text-red-600">{errors.rpe.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">RIR</label>
                <input
                  type="number"
                  step="0.5"
                  {...register('rir', { 
                    setValueAs: v => v === "" || v === "0" ? undefined : Number(v)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter RIR (0-10)"
                />
                {errors.rir && (
                  <p className="mt-1 text-sm text-red-600">{errors.rir.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add any additional notes about the exercise"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="exercise-form"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </Modal.Footer>
    </Modal>
  );
}