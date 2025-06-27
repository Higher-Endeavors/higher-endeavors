// Core
'use client';

// Dependencies
import { useState } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import React from 'react';
import { BsPlus, BsDash } from 'react-icons/bs';
import { useForm, Controller } from 'react-hook-form';
import { addCustomExercise } from '../actions/exerciseActions';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';

// Components
import AdvancedExerciseSearch from './AdvancedExerciseSearch';
import { ExerciseLibraryItem, PlannedExercise } from '../types/resistance-training.types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: PlannedExercise) => void;
  exercises: ExerciseLibraryItem[];
  userId: number;
  editingExercise?: PlannedExercise | null;
}

interface ExerciseOption {
  value: number;
  label: string;
  exercise: ExerciseLibraryItem;
}

const CARRY_UNITS = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'feet', label: 'Feet' },
  { value: 'yards', label: 'Yards' },
  { value: 'meters', label: 'Meters' },
];

type AddExerciseFormValues = {
  selectedExercise: ExerciseOption | null;
  notes: string;
  setsCount: number;
  pairing: string;
  reps: string;
  load: string;
  rest: string;
  tempo: string;
  repUnit?: string;
  rpe?: string;
  rir?: string;
};

export default function AddExerciseModal({ isOpen, onClose, onAdd, exercises, userId, editingExercise }: AddExerciseModalProps) {
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const defaultUnit = 'lbs';
  const alternateUnit = 'kg';

  const DIFFICULTY_ORDER = [
    'Basic', 'Beginner', 'Novice', 'Intermediate', 'Advanced',
    'Expert', 'Master', 'Grand Master', 'Legendary'
  ];

  const sortedExercises = [...exercises].sort((a, b) => {
    // 1. User exercises first
    if (a.source === 'user' && b.source !== 'user') return -1;
    if (a.source !== 'user' && b.source === 'user') return 1;

    // 2. Within user exercises, sort alphabetically
    if (a.source === 'user' && b.source === 'user') {
      return (a.name || '').localeCompare(b.name || '');
    }

    // 3. Within library exercises, sort by difficulty, then name
    if (a.source === 'library' && b.source === 'library') {
      const diffA = DIFFICULTY_ORDER.indexOf(a.difficulty || '');
      const diffB = DIFFICULTY_ORDER.indexOf(b.difficulty || '');
      if (diffA !== diffB) return diffA - diffB;
      return (a.name || '').localeCompare(b.name || '');
    }

    return 0;
  });

  // Convert exercises to options for the Select component
  const exerciseOptions: ExerciseOption[] = sortedExercises.map(exercise => ({
    value: exercise.exercise_library_id,
    label: exercise.name,
    exercise
  }));

  // Helper function to get initial form values
  const getInitialValues = (): AddExerciseFormValues => {
    if (editingExercise) {
      const selectedExercise = exerciseOptions.find(opt => opt.value === editingExercise.exerciseLibraryId);
      const firstSet = editingExercise.detail?.[0];
      return {
        selectedExercise: selectedExercise || null,
        notes: editingExercise.notes || '',
        setsCount: editingExercise.setCount,
        pairing: editingExercise.pairing || '',
        reps: firstSet?.reps?.toString() || '',
        load: firstSet?.load || '',
        rest: firstSet?.restSec?.toString() || '',
        tempo: firstSet?.tempo || '2010',
        repUnit: firstSet?.repUnit || (selectedExercise?.exercise?.exercise_family === 'Carry' ? 'yards' : 'reps'),
        rpe: firstSet?.rpe?.toString() || '',
        rir: firstSet?.rir?.toString() || '',
      };
    }
    return {
      selectedExercise: null,
      notes: '',
      setsCount: 3,
      pairing: '',
      reps: '',
      load: '',
      rest: '',
      tempo: '2010',
      repUnit: 'reps',
      rpe: '',
      rir: '',
    };
  };

  // Initialize varied sets based on editing exercise
  const getInitialVariedSetsState = () => {
    if (editingExercise && editingExercise.detail && editingExercise.detail.length > 0) {
      // Advanced Sets: if any set has a subSet property
      if (editingExercise.detail.some((set: any) => set.subSet)) {
        return true;
      }
      // Varied Sets: if any set differs from the first set
      return editingExercise.detail.some((set, index) => 
        set.reps !== editingExercise.detail?.[0]?.reps || 
        set.load !== editingExercise.detail?.[0]?.load ||
        set.restSec !== editingExercise.detail?.[0]?.restSec
      );
    }
    return false;
  };

  const getInitialAdvancedSetsState = () => {
    if (editingExercise && editingExercise.detail && editingExercise.detail.length > 0) {
      return editingExercise.detail.some((set: any) => set.subSet);
    }
    return false;
  };

  const getInitialVariedSets = () => {
    if (editingExercise && editingExercise.detail && editingExercise.detail.length > 0) {
      // Advanced Sets: group by parent set
      if (editingExercise.detail.some((set: any) => set.subSet)) {
        // Group by set number
        const grouped = editingExercise.detail.reduce((acc: any[], curr: any) => {
          const setIdx = curr.set - 1;
          if (!acc[setIdx]) {
            acc[setIdx] = {
              reps: '',
              load: '',
              rest: '',
              rpe: '',
              rir: '',
              subSets: []
            };
          }
          acc[setIdx].subSets.push({
            reps: curr.reps?.toString() || '',
            load: curr.load || '',
            rest: curr.restSec?.toString() || '',
            rpe: curr.rpe?.toString() || '',
            rir: curr.rir?.toString() || ''
          });
          return acc;
        }, []);
        return grouped;
      }
      // Varied Sets: as before
      if (getInitialVariedSetsState()) {
        return editingExercise.detail.map(set => ({
          reps: set.reps?.toString() || '',
          load: set.load || '',
          rest: set.restSec?.toString() || '',
          rpe: set.rpe?.toString() || '',
          rir: set.rir?.toString() || '',
          subSets: []
        }));
      }
    }
    // Default
    return [
      { reps: '', load: '', rest: '', rpe: '', rir: '', subSets: [] },
      { reps: '', load: '', rest: '', rpe: '', rir: '', subSets: [] },
      { reps: '', load: '', rest: '', rpe: '', rir: '', subSets: [] },
    ];
  };

  const [isVariedSets, setIsVariedSets] = useState(getInitialVariedSetsState());
  const [isAdvancedSets, setIsAdvancedSets] = useState(getInitialAdvancedSetsState());
  const [useAlternateUnit, setUseAlternateUnit] = useState(false);
  const [variedSets, setVariedSets] = useState<{
    reps: string;
    load: string;
    rest: string;
    rpe: string;
    rir: string;
    subSets: { reps: string; load: string; rest: string; rpe?: string; rir?: string }[];
  }[]>(getInitialVariedSets());

  const { control, handleSubmit, setValue, watch, reset } = useForm<AddExerciseFormValues>({
    defaultValues: getInitialValues(),
  });

  const selectedExercise = watch('selectedExercise');
  const isCarry = selectedExercise?.exercise?.exercise_family === 'Carry';

  const { settings, isLoading: isLoadingSettings } = useUserSettings();
  const resistanceSettings = settings?.fitness?.resistanceTraining;
  const showRPE = resistanceSettings?.trackRPE;
  const showRIR = resistanceSettings?.trackRIR;
  const rpeScale = resistanceSettings?.rpeScale || '0-10';

  const onSubmit = (data: AddExerciseFormValues) => {
    if (!data.selectedExercise) return;
    const isCarry = data.selectedExercise.exercise.exercise_family === 'Carry';
    const repUnit = isCarry ? data.repUnit || 'yards' : 'reps';
    let detail;
    if (isVariedSets) {
      if (isAdvancedSets) {
        // Flatten all sub-sets into detail array
        detail = variedSets.flatMap((set, setIdx) => {
          if (set.subSets && set.subSets.length > 0) {
            return set.subSets.map((subSet, subSetIdx) => ({
              set: setIdx + 1,
              subSet: subSetIdx + 1,
              reps: parseInt(subSet.reps) || 0,
              load: subSet.load,
              restSec: parseInt(subSet.rest) || 0,
              tempo: data.tempo || '2010',
              repUnit,
              rpe: ('rpe' in subSet && typeof subSet.rpe === 'string' && subSet.rpe) ? parseInt(subSet.rpe) : undefined,
              rir: ('rir' in subSet && typeof subSet.rir === 'string' && subSet.rir) ? parseInt(subSet.rir) : undefined,
            }));
          } else {
            // No sub-sets, use main set values
            return [{
              set: setIdx + 1,
              reps: parseInt(set.reps) || 0,
              load: set.load,
              restSec: parseInt(data.rest) || 0,
              tempo: data.tempo || '2010',
              repUnit,
              rpe: set.rpe ? parseInt(set.rpe) : undefined,
              rir: set.rir ? parseInt(set.rir) : undefined,
            }];
          }
        });
      } else {
        // Varied sets, not advanced
        detail = variedSets.map((set, index) => ({
          set: index + 1,
          reps: parseInt(set.reps) || 0,
          load: set.load,
          restSec: parseInt(data.rest) || 0,
          tempo: data.tempo || '2010',
          repUnit,
          rpe: set.rpe ? parseInt(set.rpe) : undefined,
          rir: set.rir ? parseInt(set.rir) : undefined,
        }));
      }
    } else {
      // Standard sets
      detail = Array(data.setsCount).fill({
        reps: parseInt(data.reps) || 0,
        load: data.load || '0',
        restSec: parseInt(data.rest) || 0,
        tempo: data.tempo || '2010',
        repUnit,
        rpe: data.rpe ? parseInt(data.rpe) : undefined,
        rir: data.rir ? parseInt(data.rir) : undefined,
      }).map((set, index) => ({
        ...set,
        set: index + 1,
      }));
    }
    const newExercise: PlannedExercise = {
      exerciseLibraryId: data.selectedExercise.value,
      exerciseSource: 'library',
      weekNumber: 1, // These would come from the program context
      dayNumber: 1,  // These would come from the program context
      pairing: data.pairing || 'A1', // This should be determined based on existing exercises
      setCount: data.setsCount,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      detail,
    };
    onAdd(newExercise);
    reset();
  };

  // Custom NoOptionsMessage for Select
  const NoOptionsMessage = (props: any) => {
    const inputValue = props.selectProps.inputValue;
    const handleCreateExercise = () => {
      setNewExerciseName(inputValue);
      setShowConfirmation(true);
    };
    return (
      <div className="text-center">
        <p className="text-gray-900 dark:text-white font-medium">No matches found</p>
        <button
          type="button"
          onClick={handleCreateExercise}
          className="mt-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          Create new exercise: {inputValue}
        </button>
      </div>
    );
  };

  // Confirmation Dialog
  const ConfirmationDialog = ({
    isOpen,
    exerciseName,
    onConfirm,
    onCancel
  }: {
    isOpen: boolean;
    exerciseName: string;
    onConfirm: (name: string) => void;
    onCancel: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New Exercise</h3>
          <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to create "{exerciseName}"?</p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => onConfirm(exerciseName)}
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
        {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Selection Section */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="exercise-select" className="block text-sm font-medium dark:text-white">
                  Exercise Name
                </label>
                <button
                  type="button"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Advanced Search
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Controller
                    name="selectedExercise"
                    control={control}
                    render={({ field }) => (
                      <Select
                        className="basic-single dark:text-slate-700"
                        classNamePrefix="select"
                        placeholder="Select or search for an exercise..."
                        isClearable
                        options={exerciseOptions}
                        value={field.value}
                        onChange={option => {
                          field.onChange(option);
                          if (option?.exercise?.exercise_family === 'Carry') {
                            setValue('repUnit', 'yards', { shouldValidate: true });
                          } else {
                            setValue('repUnit', 'reps', { shouldValidate: true });
                          }
                        }}
                        components={{ NoOptionsMessage }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Pairing Input */}
            <div>
              <label htmlFor="exercise-pairing" className="block text-sm font-medium dark:text-white">
                Pairing
              </label>
              <Controller
                name="pairing"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="exercise-pairing"
                    type="text"
                    placeholder="e.g., A1, B2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  />
                )}
              />
            </div>

            {/* Sets Input Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="exercise-sets" className="block text-sm font-medium dark:text-white">
                  Sets
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="variedSets"
                    checked={isVariedSets}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsVariedSets(checked);
                      if (checked) {
                        // When enabling, sync variedSets to current setsCount
                        const setsCount = Number(watch('setsCount')) || 1;
                        setVariedSets(Array.from({ length: setsCount }, () => ({ reps: '', load: '', rest: '', rpe: '', rir: '', subSets: [] })));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="variedSets" className="text-sm font-medium dark:text-white">
                    Varied sets
                  </label>
                </div>
              </div>
              <Controller
                name="setsCount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="exercise-sets"
                    type="number"
                    min="1"
                    placeholder="Enter number of sets"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    value={field.value === 0 ? '' : field.value}
                    onChange={e => {
                      const val = e.target.value;
                      // Allow empty string for typing
                      if (val === '') {
                        field.onChange('');
                        if (isVariedSets) setVariedSets([]);
                      } else {
                        const numVal = Number(val);
                        field.onChange(numVal);
                        if (isVariedSets) {
                          setVariedSets(prev => {
                            const newArr = [...prev];
                            if (numVal > prev.length) {
                              for (let i = prev.length; i < numVal; i++) {
                                newArr.push({ reps: '', load: '', rest: '', rpe: '', rir: '', subSets: [] });
                              }
                            } else if (numVal < prev.length) {
                              newArr.length = numVal;
                            }
                            return newArr;
                          });
                        }
                      }
                    }}
                    onBlur={e => {
                      let val = e.target.value;
                      if (val === '' || Number(val) < 1) {
                        field.onChange(1);
                        if (isVariedSets) {
                          setVariedSets(prev => {
                            if (prev.length !== 1) {
                              return [{ reps: '', load: '', rest: '', rpe: '', rir: '', subSets: [] }];
                            }
                            return prev;
                          });
                        }
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* Reps Input */}
            {!isVariedSets ? (
              <div>
                <label htmlFor="exercise-reps" className="block text-sm font-medium dark:text-white">
                  {isCarry ? 'Distance/Time' : 'Reps'}
                </label>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="reps"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-reps"
                        type="number"
                        placeholder={isCarry ? 'Enter value' : 'Enter number of reps'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                  {isCarry && (
                    <Controller
                      name="repUnit"
                      control={control}
                      defaultValue="yards"
                      render={({ field }) => (
                        <select
                          {...field}
                          className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                        >
                          {CARRY_UNITS.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Load Input with Unit Toggle */}
            {!isVariedSets ? (
              <div>
                <div className="flex items-center space-x-1">
                  <label htmlFor="exercise-load" className="block text-sm font-medium dark:text-white">
                    Load
                  </label>
                  <div className="group relative">
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="load"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-load"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                        placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit}, BW, or band color`}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                    className="mt-1 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1 text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                  className="mt-1 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1 text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Load unit applies to all sets</span>
              </div>
            )}

            {/* Tempo Input */}
            <div>
              <label htmlFor="exercise-tempo" className="block text-sm font-medium dark:text-white">
                Tempo (4 digits, X for explosive)
              </label>
              <Controller
                name="tempo"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="exercise-tempo"
                    type="text"
                    placeholder="e.g., 2010"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  />
                )}
              />
            </div>

            {/* Rest Input */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <label htmlFor="exercise-rest" className="block text-sm font-medium dark:text-white">
                  Rest (seconds)
                </label>
                <Controller
                  name="rest"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="exercise-rest"
                      type="number"
                      placeholder="Enter rest period"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                  )}
                />
              </div>
            )}

            {/* RPE Input */}
            {showRPE && (!isVariedSets || !isAdvancedSets) && (
              <div>
                <label htmlFor="exercise-rpe" className="block text-sm font-medium dark:text-white">
                  RPE ({rpeScale})
                </label>
                <Controller
                  name="rpe"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="exercise-rpe"
                      type="number"
                      min={rpeScale === '6-20' ? 6 : 0}
                      max={rpeScale === '6-20' ? 20 : 10}
                      placeholder={`Enter RPE (${rpeScale})`}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                  )}
                />
              </div>
            )}

            {/* RIR Input */}
            {showRIR && (!isVariedSets || !isAdvancedSets) && (
              <div>
                <label htmlFor="exercise-rir" className="block text-sm font-medium dark:text-white">
                  RIR (0-10)
                </label>
                <Controller
                  name="rir"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="exercise-rir"
                      type="number"
                      min={0}
                      max={10}
                      placeholder="Enter RIR (0-10)"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    />
                  )}
                />
              </div>
            )}

            {/* Notes Field */}
            <div className="col-span-2">
              <label htmlFor="exercise-notes" className="block text-sm font-medium dark:text-white">
                Notes
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="exercise-notes"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder="Add any additional notes about the exercise"
                  />
                )}
              />
            </div>
          </div>

          {/* Varied Sets Form */}
          {isVariedSets && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Set Details</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="advancedSets"
                      checked={isAdvancedSets}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsAdvancedSets(checked);
                        if (checked) {
                          setVariedSets(prev => prev.map(set => {
                            if (!set.subSets || set.subSets.length === 0) {
                              return {
                                ...set,
                                reps: '',
                                load: '',
                                rpe: '',
                                rir: '',
                                subSets: [
                                  { reps: set.reps, load: set.load, rest: '', rpe: set.rpe, rir: set.rir }, // 1.1
                                  { reps: '', load: '', rest: '', rpe: '', rir: '' } // 1.2
                                ]
                              };
                            }
                            return set;
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="advancedSets" className="text-sm font-medium dark:text-white">
                      Advanced Sets
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                {variedSets.map((set, idx) => (
                  <div key={idx} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-white">Set {idx + 1}</span>
                      {isAdvancedSets && (
                        <button
                          type="button"
                          onClick={() => {
                            setVariedSets(prev => prev.map((s, i) => {
                              if (i !== idx) return s;
                              // If no sub-sets, move main set values to first sub-set
                              if (!s.subSets || s.subSets.length === 0) {
                                return {
                                  ...s,
                                  reps: '',
                                  load: '',
                                  rpe: '',
                                  rir: '',
                                  subSets: [
                                    { reps: s.reps, load: s.load, rest: '', }, // Set 1.1
                                    { reps: '', load: '', rest: '', } // Set 1.2 (empty)
                                  ]
                                };
                              } else {
                                // Add a new empty sub-set
                                return {
                                  ...s,
                                  subSets: [
                                    ...s.subSets,
                                    { reps: '', load: '', rest: '' }
                                  ]
                                };
                              }
                            }));
                          }}
                          aria-label={`Add subset to set ${idx + 1}`}
                          className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200"
                        >
                          <BsPlus className="w-5 h-5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    {/* Main set inputs: only show if no sub-sets */}
                    {!(isAdvancedSets && set.subSets && set.subSets.length > 0) && (
                      <div className={`grid grid-cols-${isAdvancedSets ? '2' : '2'} gap-4`}>
                        <div>
                          <label className="block text-sm dark:text-white">Reps</label>
                          <input
                            type="number"
                            placeholder="Enter reps"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            value={set.reps}
                            onChange={e => {
                              const newVal = e.target.value;
                              setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, reps: newVal } : s));
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm dark:text-white">Load</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                            value={set.load}
                            onChange={e => {
                              const newVal = e.target.value;
                              setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, load: newVal } : s));
                            }}
                          />
                        </div>
                        {showRPE && (
                          <div>
                            <label className="block text-sm dark:text-white">RPE</label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              placeholder="RPE (0-10)"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={set.rpe}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, rpe: newVal } : s));
                              }}
                            />
                          </div>
                        )}
                        {showRIR && (
                          <div>
                            <label className="block text-sm dark:text-white">RIR</label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              placeholder="RIR (0-10)"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={set.rir}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, rir: newVal } : s));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Sub-sets */}
                    {isAdvancedSets && set.subSets.map((subSet, subSetIdx) => (
                      <div key={subSetIdx} className="space-y-4 p-4 border rounded-lg mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium dark:text-white">
                            Set {idx + 1}.{subSetIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                ...s,
                                subSets: s.subSets.filter((_, j) => j !== subSetIdx)
                              } : s));
                            }}
                            aria-label={`Remove subset ${subSetIdx + 1} from set ${idx + 1}`}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200"
                          >
                            <BsDash className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm dark:text-white">Reps</label>
                            <input
                              type="number"
                              placeholder="Enter reps"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={subSet.reps}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { ...ss, reps: newVal } : ss)
                                } : s));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm dark:text-white">Load</label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                              value={subSet.load}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { ...ss, load: newVal } : ss)
                                } : s));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm dark:text-white">Rest</label>
                            <input
                              type="number"
                              placeholder="Enter rest"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={subSet.rest}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { ...ss, rest: newVal } : ss)
                                } : s));
                              }}
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
              disabled={!watch('selectedExercise')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingExercise ? 'Update Exercise' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </Modal.Body>

      <AdvancedExerciseSearch
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSelect={(exercise) => {
          const option = exerciseOptions.find(opt => opt.value === exercise.exercise_library_id);
          if (option) {
            setValue('selectedExercise', option);
          }
          setIsAdvancedSearchOpen(false);
        }}
        exercises={exercises}
      />

      <ConfirmationDialog
        isOpen={showConfirmation}
        exerciseName={newExerciseName}
        onConfirm={async (exerciseName) => {
          setCreationError(null);
          setIsCreatingExercise(true);
          // Use FormData and server action
          const formData = new FormData();
          formData.append('exercise_name', exerciseName);
          formData.append('user_id', String(userId));
          const result = await addCustomExercise(formData);
          if (result && result.error) {
            setCreationError(result.error);
            setIsCreatingExercise(false);
            return;
          }
          // Add to options with custom color and (Custom) label
          const newOption: ExerciseOption = {
            value: result.id,
            label: `${result.exercise_name} (Custom)` ,
            exercise: {
              exercise_library_id: result.id,
              name: result.exercise_name,
              source: 'user',
              exercise_family: null,
              body_region: null,
              muscle_group: null,
              movement_pattern: null,
              movement_plane: null,
              equipment: null,
              laterality: null,
              difficulty: null
            }
          };
          setValue('selectedExercise', newOption);
          setIsCreatingExercise(false);
          setShowConfirmation(false);
          setCreationError(null);
          exerciseOptions.push(newOption);
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setCreationError(null);
        }}
      />

      {creationError && (
        <div className="text-red-500 text-center mt-2">{creationError}</div>
      )}
    </Modal>
  );
}