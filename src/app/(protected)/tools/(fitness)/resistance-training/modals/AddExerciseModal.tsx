// Core
'use client';

// Dependencies
import { useState, useEffect } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import React from 'react';
import { BsPlus, BsDash } from 'react-icons/bs';
import { useForm, Controller } from 'react-hook-form';
import { addCustomExercise } from '../lib/actions/exerciseActions';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';

// Components
import AdvancedExerciseSearch from './AdvancedExerciseSearch';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '../types/resistance-training.zod';


// Alias for ExerciseLibraryItem since it now includes the source property
export type ExerciseWithSource = ExerciseLibraryItem;

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: ProgramExercisesPlanned) => void;
  exercises: ExerciseWithSource[];
  userId: number;
  editingExercise?: ProgramExercisesPlanned | null;
  fitnessSettings?: FitnessSettings;
}

interface ExerciseOption {
  value: number;
  label: string;
  exercise: ExerciseLibraryItem;
  source: 'library' | 'user' | 'cme_library';
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
  distance?: string;
  distanceUnit?: string;
  duration?: string;
  // Bike exercise fields
  speed?: string;
  resistance?: string;
  rpm?: string;
  watts?: string;
};

export default function AddExerciseModal({ isOpen, onClose, onAdd, exercises, userId, editingExercise, fitnessSettings }: AddExerciseModalProps) {
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [useAlternateUnit, setUseAlternateUnit] = useState(() => {
    // Initialize based on editing exercise's load unit, or user's preferred unit
    if (editingExercise && editingExercise.plannedSets && editingExercise.plannedSets.length > 0) {
      const firstSet = editingExercise.plannedSets[0];
      return firstSet.loadUnit === 'kg';
    }
    // Default to user's preferred unit from settings
    return fitnessSettings?.resistanceTraining?.loadUnit === 'kg';
  });
  const [variedSets, setVariedSets] = useState<{
    reps: string;
    load: string;
    rest: string;
    rpe: string;
    rir: string;
    distance: string;
    distanceUnit: string;
    subSets: { reps: string; load: string; rest: string; rpe?: string; rir?: string; distance?: string; distanceUnit?: string }[];
  }[]>([
    { reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] },
    { reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] },
    { reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] },
  ]);

  const defaultUnit = 'lbs';
  const alternateUnit = 'kg';

  // Helper function to check if exercise is a Carry exercise
  const isCarryExercise = (exercise: ExerciseWithSource | null) => {
    return exercise?.exercise_family === 'Carry';
  };

  // Helper function to check if exercise is a Bike exercise
  const isBikeExercise = (exercise: ExerciseWithSource | null) => {
    return exercise?.exercise_family === 'Cycling';
  };



  const DIFFICULTY_ORDER = [
    'Basic', 'Beginner', 'Novice', 'Intermediate', 'Advanced',
    'Expert', 'Master', 'Grand Master', 'Legendary'
  ];

  const sortedExercises = [...exercises].sort((a, b) => {
    // 1. User exercises first
    if (a.source === 'user' && b.source !== 'user') return -1;
    if (a.source !== 'user' && b.source === 'user') return 1;

    // 2. If both are user or both are library, sort by difficulty (for library)
    if (a.source === 'library' && b.source === 'library') {
      // Handle null difficulties by putting them at the end
      const diffA = a.difficulty ? DIFFICULTY_ORDER.indexOf(a.difficulty) : DIFFICULTY_ORDER.length;
      const diffB = b.difficulty ? DIFFICULTY_ORDER.indexOf(b.difficulty) : DIFFICULTY_ORDER.length;
      if (diffA !== diffB) return diffA - diffB;
    }

    // 3. Alphabetical by name
    return (a.name || '').localeCompare(b.name || '');
  });

  const exerciseOptions: ExerciseOption[] = sortedExercises.map(exercise => ({
    value: exercise.exerciseLibraryId || exercise.userExerciseLibraryId || 0,
    label: exercise.name,
    exercise,
    source: exercise.source || 'library'
  }));

  const getInitialValues = (): AddExerciseFormValues => {
    if (editingExercise) {
      const selectedExercise = exerciseOptions.find(opt => {
        if (editingExercise.exerciseSource === 'user') {
          return opt.value === editingExercise.userExerciseLibraryId;
        } else {
          return opt.value === editingExercise.exerciseLibraryId;
        }
      });
      const firstSet = editingExercise.plannedSets?.[0];
      const isCarry = isCarryExercise(selectedExercise?.exercise || null);
      const isBike = isBikeExercise(selectedExercise?.exercise || null);
      return {
        selectedExercise: selectedExercise || null,
        notes: editingExercise.notes || '',
        setsCount: editingExercise.plannedSets?.length || 3,
        pairing: editingExercise.pairing || '',
        reps: isCarry || isBike ? '' : (firstSet?.reps?.toString() || ''),
        load: firstSet?.load || '',
        rest: firstSet?.restSec?.toString() || '',
        tempo: isCarry || isBike ? '' : (firstSet?.tempo || '2010'),
        repUnit: 'reps',
        rpe: firstSet?.rpe?.toString() || '',
        rir: isCarry || isBike ? '' : (firstSet?.rir?.toString() || ''),
        distance: isCarry ? (firstSet?.distance?.toString() || '') : 
                  isBike ? (firstSet?.distance?.toString() || '') : '',
        distanceUnit: isCarry ? (firstSet?.distanceUnit || 'yards') : 
                     isBike ? (firstSet?.distanceUnit || 'miles') : 'yards',
        duration: isBike ? (firstSet?.duration?.toString() || '') : '',
        speed: isBike ? (firstSet?.speed?.toString() || '') : '',
        resistance: isBike ? (firstSet?.resistance?.toString() || '') : '',
        rpm: isBike ? (firstSet?.rpm?.toString() || '') : '',
        watts: isBike ? (firstSet?.watts?.toString() || '') : '',
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
      distance: '',
      distanceUnit: 'yards',
      duration: '',
      speed: '',
      resistance: '',
      rpm: '',
      watts: '',
    };
  };

  const getInitialVariedSetsState = () => {
    if (editingExercise && editingExercise.plannedSets && editingExercise.plannedSets.length > 0) {
      if (editingExercise.plannedSets.some((set: any) => set.subSet)) {
        return true;
      }
      return editingExercise.plannedSets.some((set, index) => 
        set.reps !== editingExercise.plannedSets?.[0]?.reps || 
        set.load !== editingExercise.plannedSets?.[0]?.load ||
        set.restSec !== editingExercise.plannedSets?.[0]?.restSec
      );
    }
    return false;
  };

  const getInitialAdvancedSetsState = () => {
    if (editingExercise && editingExercise.plannedSets && editingExercise.plannedSets.length > 0) {
      return editingExercise.plannedSets.some((set: any) => set.subSet);
    }
    return false;
  };

  const getInitialVariedSets = () => {
    if (editingExercise && editingExercise.plannedSets && editingExercise.plannedSets.length > 0) {
      if (editingExercise.plannedSets.some((set: any) => set.subSet)) {
        const grouped = editingExercise.plannedSets.reduce((acc: any[], curr: any) => {
          const setIdx = curr.set - 1;
          if (!acc[setIdx]) {
            acc[setIdx] = {
              reps: '',
              load: '',
              rest: '',
              rpe: '',
              rir: '',
              distance: '',
              distanceUnit: 'yards',
              subSets: []
            };
          }
          acc[setIdx].subSets.push({
            reps: curr.reps?.toString() || '',
            load: curr.load || '',
            rest: curr.restSec?.toString() || '',
            rpe: curr.rpe?.toString() || '',
            rir: curr.rir?.toString() || '',
            distance: curr.distance?.toString() || '',
            distanceUnit: curr.distanceUnit || 'yards'
          });
          return acc;
        }, []);
        return grouped;
      }
      if (getInitialVariedSetsState()) {
        return editingExercise.plannedSets.map(set => ({
          reps: set.reps?.toString() || '',
          load: set.load || '',
          rest: set.restSec?.toString() || '',
          rpe: set.rpe?.toString() || '',
          rir: set.rir?.toString() || '',
          distance: set.distance?.toString() || '',
          distanceUnit: set.distanceUnit || 'yards',
          subSets: []
        }));
      }
    }
    return [
      { reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] },
      { reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] },
      { reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] },
    ];
  };

  const [isVariedSets, setIsVariedSets] = useState(getInitialVariedSetsState());
  const [isAdvancedSets, setIsAdvancedSets] = useState(getInitialAdvancedSetsState());



  const { control, handleSubmit, setValue, watch, reset } = useForm<AddExerciseFormValues>({
    defaultValues: getInitialValues(),
  });

  const selectedExercise = watch('selectedExercise');

  const resistanceSettings = fitnessSettings?.resistanceTraining;
  const showRPE = resistanceSettings?.trackRPE;
  const showRIR = resistanceSettings?.trackRIR;
  const rpeScale = resistanceSettings?.rpeScale || '0-10';

  const onSubmit = (data: AddExerciseFormValues) => {
    if (!data.selectedExercise) return;
    
    const isCarry = isCarryExercise(data.selectedExercise.exercise);
    const isBike = isBikeExercise(data.selectedExercise.exercise);
    
    // Use existing load unit if editing, otherwise use current toggle state
    let currentLoadUnit = useAlternateUnit ? alternateUnit : defaultUnit;
    if (editingExercise && editingExercise.plannedSets && editingExercise.plannedSets.length > 0) {
      const firstSet = editingExercise.plannedSets[0];
      if (firstSet.loadUnit) {
        currentLoadUnit = firstSet.loadUnit;
      }
    }
    
    let plannedSets;
    if (isVariedSets) {
      if (isAdvancedSets) {
        plannedSets = variedSets.flatMap((set, setIdx) => {
          if (set.subSets && set.subSets.length > 0) {
            return set.subSets.map((subSet, subSetIdx) => ({
              set: setIdx + 1,
              reps: isCarry ? undefined : (parseInt(subSet.reps) || 0),
              load: subSet.load,
              loadUnit: currentLoadUnit,
              restSec: parseInt(subSet.rest) || 0,
              tempo: isCarry ? undefined : (data.tempo || '2010'),
              rpe: subSet.rpe ? parseInt(subSet.rpe) : undefined,
              rir: isCarry ? undefined : (subSet.rir ? parseInt(subSet.rir) : undefined),
              distance: isCarry ? (parseInt(subSet.distance || '0') || 0) : undefined,
              distanceUnit: isCarry ? (subSet.distanceUnit || 'yards') : undefined,
            }));
          } else {
            return [{
              set: setIdx + 1,
              reps: isCarry ? undefined : (parseInt(set.reps || '0') || 0),
              load: set.load,
              loadUnit: currentLoadUnit,
              restSec: parseInt(data.rest || '0') || 0,
              tempo: isCarry ? undefined : (data.tempo || '2010'),
              rpe: set.rpe ? parseInt(set.rpe) : undefined,
              rir: isCarry ? undefined : (set.rir ? parseInt(set.rir) : undefined),
              distance: isCarry ? (parseInt(set.distance || '0') || 0) : undefined,
              distanceUnit: isCarry ? (set.distanceUnit || 'yards') : undefined,
            }];
          }
        });
      } else {
        plannedSets = variedSets.map((set, index) => ({
          set: index + 1,
          reps: isCarry ? undefined : (parseInt(set.reps || '0') || 0),
          load: set.load,
          loadUnit: currentLoadUnit,
          restSec: parseInt(data.rest || '0') || 0,
          tempo: isCarry ? undefined : (data.tempo || '2010'),
          rpe: set.rpe ? parseInt(set.rpe) : undefined,
          rir: isCarry ? undefined : (set.rir ? parseInt(set.rir) : undefined),
          distance: isCarry ? (parseInt(set.distance || '0') || 0) : undefined,
          distanceUnit: isCarry ? (set.distanceUnit || 'yards') : undefined,
        }));
      }
    } else {
      plannedSets = Array(data.setsCount).fill({
        reps: isCarry || isBike ? undefined : (parseInt(data.reps || '0') || 0),
        load: data.load || '0',
        loadUnit: currentLoadUnit,
        restSec: parseInt(data.rest || '0') || 0,
        tempo: isCarry || isBike ? undefined : (data.tempo || '2010'),
        rpe: data.rpe ? parseInt(data.rpe) : undefined,
        rir: isCarry || isBike ? undefined : (data.rir ? parseInt(data.rir) : undefined),
        distance: isCarry ? (parseInt(data.distance || '0') || 0) : 
                  isBike ? (parseFloat(data.distance || '0') || 0) : undefined,
        distanceUnit: isCarry ? (data.distanceUnit || 'yards') : 
                     isBike ? 'miles' : undefined,
        duration: isBike ? (parseInt(data.duration || '0') || 0) : undefined,
        speed: isBike ? (data.speed && data.speed.trim() ? parseInt(data.speed) : null) : undefined,
        resistance: isBike ? (data.resistance && data.resistance.trim() ? parseInt(data.resistance) : null) : undefined,
        rpm: isBike ? (data.rpm && data.rpm.trim() ? parseInt(data.rpm) : null) : undefined,
        watts: isBike ? (data.watts && data.watts.trim() ? parseInt(data.watts) : null) : undefined,
      }).map((set, index) => ({
        ...set,
        set: index + 1,
      }));
    }
    const selectedExerciseData = data.selectedExercise.exercise;
    const isUserExercise = data.selectedExercise.source === 'user';
    const isCMEExercise = data.selectedExercise.source === 'cme_library';
    
    const newExercise: ProgramExercisesPlanned = {
      programExercisesPlannedId: 0,
      resistanceProgramId: 0,
      exerciseLibraryId: isUserExercise ? undefined : selectedExerciseData.exerciseLibraryId,
      userExerciseLibraryId: isUserExercise ? selectedExerciseData.userExerciseLibraryId : undefined,
      exerciseSource: isUserExercise ? 'user' : isCMEExercise ? 'cme_library' : 'library',
      pairing: data.pairing || 'A1',
      plannedSets,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    onAdd(newExercise);
    reset();
  };

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

  function multiWordFilter(option: { label: string }, inputValue: string) {
    if (!inputValue) return true;
    const words = inputValue.toLowerCase().split(/\s+/).filter(Boolean);
    const label = option.label.toLowerCase();
    return words.every(word => label.includes(word));
  }



  return (
    <Modal show={isOpen} onClose={onClose} size="xl" className="max-h-screen overflow-y-auto">
      <Modal.Header className="dark:text-white">
        {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                <label htmlFor="exercise-select" className="block text-sm font-medium dark:text-white">
                  Exercise Name
                </label>
                <button
                  type="button"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 self-start sm:self-auto"
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
                        }}
                        components={{ NoOptionsMessage }}
                        filterOption={multiWordFilter}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

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

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
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
                        const setsCount = Number(watch('setsCount')) || 1;
                        setVariedSets(Array.from({ length: setsCount }, () => ({ reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] })));
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
                                newArr.push({ reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] });
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
                              return [{ reps: '', load: '', rest: '', rpe: '', rir: '', distance: '', distanceUnit: 'yards', subSets: [] }];
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

            {!isVariedSets ? (
              <div>
                <label htmlFor="exercise-reps" className="block text-sm font-medium dark:text-white">
                  {isCarryExercise(selectedExercise?.exercise || null) ? 'Distance' : 
                   isBikeExercise(selectedExercise?.exercise || null) ? 'Duration (minutes)' : 'Reps'}
                </label>
                <div className="flex items-center space-x-2">
                  <Controller
                    name={isCarryExercise(selectedExercise?.exercise || null) ? "distance" : 
                          isBikeExercise(selectedExercise?.exercise || null) ? "duration" : "reps"}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id={isCarryExercise(selectedExercise?.exercise || null) ? "exercise-distance" : 
                            isBikeExercise(selectedExercise?.exercise || null) ? "exercise-duration" : "exercise-reps"}
                        type="number"
                        placeholder={isCarryExercise(selectedExercise?.exercise || null) ? "Enter distance" : 
                                     isBikeExercise(selectedExercise?.exercise || null) ? "Enter duration" : "Enter number of reps"}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                  {isCarryExercise(selectedExercise?.exercise || null) && (
                    <Controller
                      name="distanceUnit"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                        >
                          {CARRY_UNITS.map(unit => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
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

            {!isVariedSets && !isBikeExercise(selectedExercise?.exercise || null) ? (
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
                    className="mt-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center space-x-1 text-gray-700 min-w-[60px]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                  </button>
                </div>
              </div>
            ) : (
              !isBikeExercise(selectedExercise?.exercise || null) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                    className="mt-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center space-x-1 text-gray-700 min-w-[60px]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Load unit applies to all sets</span>
                </div>
              )
            )}

            {/* Tempo input should only show for non-Carry and non-Bike exercises */}
            {!isCarryExercise(selectedExercise?.exercise || null) && !isBikeExercise(selectedExercise?.exercise || null) && (
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
            )}

            {/* Bike-specific fields */}
            {isBikeExercise(selectedExercise?.exercise || null) && (
              <>
                <div>
                  <label htmlFor="exercise-distance" className="block text-sm font-medium dark:text-white">
                    Distance (miles)
                  </label>
                  <Controller
                    name="distance"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-distance"
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        placeholder="Enter distance in miles"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <label htmlFor="exercise-speed" className="block text-sm font-medium dark:text-white">
                    Speed (mph)
                  </label>
                  <Controller
                    name="speed"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-speed"
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.1"
                        placeholder="Enter speed in mph"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <label htmlFor="exercise-rpm" className="block text-sm font-medium dark:text-white">
                    RPM
                  </label>
                  <Controller
                    name="rpm"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-rpm"
                        type="number"
                        min="40"
                        max="120"
                        placeholder="Revolutions per minute"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <label htmlFor="exercise-watts" className="block text-sm font-medium dark:text-white">
                    Watts
                  </label>
                  <Controller
                    name="watts"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-watts"
                        type="number"
                        min="100"
                        placeholder="Enter watts"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <label htmlFor="exercise-resistance" className="block text-sm font-medium dark:text-white">
                    Resistance Level
                  </label>
                  <Controller
                    name="resistance"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="exercise-resistance"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="Enter resistance level"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                      />
                    )}
                  />
                </div>
              </>
            )}

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

            {showRIR && (!isVariedSets || !isAdvancedSets) && !isCarryExercise(selectedExercise?.exercise || null) && !isBikeExercise(selectedExercise?.exercise || null) && (
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

            <div className="col-span-1 lg:col-span-2">
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

          {isVariedSets && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                                  { reps: set.reps, load: set.load, rest: '', rpe: set.rpe, rir: set.rir },
                                  { reps: '', load: '', rest: '', rpe: '', rir: '' }
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
                              if (!s.subSets || s.subSets.length === 0) {
                                return {
                                  ...s,
                                  reps: '',
                                  load: '',
                                  rpe: '',
                                  rir: '',
                                  subSets: [
                                    { reps: s.reps, load: s.load, rest: '', },
                                    { reps: '', load: '', rest: '', }
                                  ]
                                };
                              } else {
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
                    {!(isAdvancedSets && set.subSets && set.subSets.length > 0) && (
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                        <div>
                          <label className="block text-sm dark:text-white">
                            {isCarryExercise(selectedExercise?.exercise || null) ? 'Distance' : 'Reps'}
                          </label>
                          <input
                            type="number"
                            placeholder={isCarryExercise(selectedExercise?.exercise || null) ? "Enter distance" : "Enter reps"}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            value={isCarryExercise(selectedExercise?.exercise || null) ? set.distance : set.reps}
                            onChange={e => {
                              const newVal = e.target.value;
                              setVariedSets(prev => prev.map((s, i) => i === idx ? { 
                                ...s, 
                                [isCarryExercise(selectedExercise?.exercise || null) ? 'distance' : 'reps']: newVal 
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
                        {showRIR && !isCarryExercise(selectedExercise?.exercise || null) && (
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm dark:text-white">
                              {isCarryExercise(selectedExercise?.exercise || null) ? 'Distance' : 'Reps'}
                            </label>
                            <input
                              type="number"
                              placeholder={isCarryExercise(selectedExercise?.exercise || null) ? "Enter distance" : "Enter reps"}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={isCarryExercise(selectedExercise?.exercise || null) ? subSet.distance || '' : subSet.reps}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { 
                                    ...ss, 
                                    [isCarryExercise(selectedExercise?.exercise || null) ? 'distance' : 'reps']: newVal 
                                  } : ss)
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

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!watch('selectedExercise')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
          const option = exerciseOptions.find(opt => opt.value === exercise.exerciseLibraryId);
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
          const formData = new FormData();
          formData.append('exercise_name', exerciseName);
          formData.append('user_id', String(userId));
          const result = await addCustomExercise(formData);
          if (result && result.error) {
            setCreationError(result.error);
            setIsCreatingExercise(false);
            return;
          }
          const newOption: ExerciseOption = {
            value: result.user_exercise_library_id,
            label: `${result.exercise_name} (Custom)` ,
            exercise: {
              userExerciseLibraryId: result.user_exercise_library_id,
              name: result.exercise_name,
              source: 'user',
            },
            source: 'user'
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