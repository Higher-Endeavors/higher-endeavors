'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { GroupBase } from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BsSearch, BsPlus, BsDash } from 'react-icons/bs';
import { HiInformationCircle, HiSwitchHorizontal } from 'react-icons/hi';
import { FitnessSettings, UserSettings, PillarSettings } from '@/app/lib/types/user_settings';
import {
  exercise,
  exercise_source,
  ExerciseOption,
  ExerciseSelectHandler,
  load_unit,
  ExerciseFormData,
  exercise_set,
  create_exercise,
  exercise_sub_set,
  base_exercise
} from '@/app/lib/types/pillars/fitness';
import { FilterOptionOption } from 'react-select';
import { exerciseSchema } from '@/app/lib/types/pillars/fitness/zod_schemas';
import { useToast } from '@/app/lib/hooks/useToast';
import { transformFormToDatabase } from '@/app/lib/utils/transformers';

/**
 * Debug Configuration
 * Controls what types of logging are active
 * All logs are prefixed with [AddExerciseModal] for easy filtering
 */
const DEBUG = {
  FORM: true,         // Form changes and submissions
  VALIDATION: true,   // Validation errors and states
  STATE: true,        // State changes (exercise selection, units, etc.)
  EFFECTS: true,      // Effect triggers and updates
  EXERCISE_MGMT: true,// Exercise creation and selection
  SET_MGMT: false,    // Set and subset management
  API: true          // API calls and responses
};

/**
 * Debugging utilities for different component aspects
 */
const Debug = {
  form: (message: string, data?: any) => {
    if (DEBUG.FORM) console.log(`[AddExerciseModal:Form] ${message}`, data || '');
  },
  validation: (message: string, data?: any) => {
    if (DEBUG.VALIDATION) console.log(`[AddExerciseModal:Validation] ${message}`, data || '');
  },
  state: (message: string, data?: any) => {
    if (DEBUG.STATE) console.log(`[AddExerciseModal:State] ${message}`, data || '');
  },
  effect: (message: string, data?: any) => {
    if (DEBUG.EFFECTS) console.log(`[AddExerciseModal:Effect] ${message}`, data || '');
  },
  exerciseMgmt: (message: string, data?: any) => {
    if (DEBUG.EXERCISE_MGMT) console.log(`[AddExerciseModal:ExerciseMgmt] ${message}`, data || '');
  },
  setMgmt: (message: string, data?: any) => {
    if (DEBUG.SET_MGMT) console.log(`[AddExerciseModal:SetMgmt] ${message}`, data || '');
  },
  api: (message: string, data?: any) => {
    if (DEBUG.API) console.log(`[AddExerciseModal:API] ${message}`, data || '');
  }
};

/**
 * Filter function for the exercise select dropdown
 */
const filterExerciseOptions = (
  option: FilterOptionOption<ExerciseOption>,
  inputValue: string
): boolean => {
  if (!inputValue || !option?.label) return true;
  
  const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
  const exerciseName = option.label.toLowerCase();
  
  return searchTerms.every(term => exerciseName.includes(term));
};

/**
 * Custom styles for the exercise name select dropdown
 * Ensures proper color contrast in both light and dark modes
 * Used by the react-select component for consistent theming
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
 * Helper function to get the next available pairing
 */
const getNextPairing = (exercises: exercise[]): string => {
  const existingPairings = exercises.map(ex => ex.pairing).filter(Boolean);
  if (existingPairings.length === 0) return 'A1';

  const lastPairing = existingPairings.sort().pop() || 'A1';
  const letter = lastPairing.charAt(0);
  const number = parseInt(lastPairing.slice(1));

  if (number < 9) {
    return `${letter}${number + 1}`;
  } else {
    return `${String.fromCharCode(letter.charCodeAt(0) + 1)}1`;
  }
};

/**
 * Props required by the AddExerciseModal:
 * 
 * Core Props:
 * @param isOpen - Controls modal visibility
 * @param onClose - Function to call when modal closes
 * @param onSave - Function to call with new/edited exercise data
 * @param exercise - Existing exercise data (for editing mode)
 * 
 * Exercise Management:
 * @param exercises - List of available exercises
 * @param onAdvancedSearch - Handler for advanced exercise search
 * @param selectedExerciseName - Pre-selected exercise name
 * 
 * Configuration:
 * @param userSettings - User preferences (units, tracking options)
 * @param exerciseLibrary - Pre-fetched exercise library from page level
 */
interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: exercise) => Promise<void>;
  exercise?: exercise;
  exercises: exercise[];
  onAdvancedSearch: () => void;
  selectedExerciseName?: string;
  userSettings?: UserSettings;
  exerciseLibrary?: ExerciseOption[]; // Optional to maintain backward compatibility
}

/**
 * Exercise Modal Component
 * Handles both creating new exercises and editing existing ones
 * Supports both standard and varied set configurations
 */
export default function AddExerciseModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  exercises,
  onAdvancedSearch,
  selectedExerciseName,
  userSettings,
  exerciseLibrary
}: ExerciseModalProps) {
  const toast = useToast();
  // Debug props on component mount and updates
  useEffect(() => {
    Debug.state('Component props received', {
      selectedExerciseName,
      exercise,
      exercisesCount: exercises.length
    });
  }, [selectedExerciseName, exercise, exercises]);

  // Debug user settings separately for clarity
  useEffect(() => {
    Debug.state('User settings received', {
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit,
      trackRIR: userSettings?.pillar_settings?.fitness?.resistanceTraining?.trackRIR,
      trackRPE: userSettings?.pillar_settings?.fitness?.resistanceTraining?.trackRPE
    });
  }, [userSettings]);

  // State for exercise name options in dropdown
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug initial state setup
  useEffect(() => {
    Debug.state('Initial state setup', {
      selectedExercise: selectedExercise?.label || null,
      optionsCount: exerciseOptions.length,
      isLoading
    });
  }, []);
  
  // Add state for alternate unit
  const [useAlternateUnit, setUseAlternateUnit] = useState(false);
  const defaultUnit: load_unit = (userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs') === 'kg' ? 'kg' : 'lbs';
  const alternateUnit: load_unit = defaultUnit === 'kg' ? 'lbs' : 'kg';

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
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      id: '',
      name: '',
      exerciseId: 0,  // Back to camelCase
      source: 'exercise_library' as const,
      pairing: 'A1',
      sets: 3,
      reps: 10,
      load: 0,
      loadUnit: defaultUnit,
      tempo: '2010',
      rest: 60,
      notes: '',
      isVariedSets: false,  // Back to camelCase
      isAdvancedSets: false,  // Back to camelCase
      plannedSets: [{  // Back to camelCase
        set_number: 1,
        planned_reps: 10,
        planned_load: 0,
        planned_tempo: '2010',
        planned_rest: 60
      }]
    }
  });

  // Watch values for conditional rendering and updates
  const isVariedSets = watch('isVariedSets');
  const isAdvancedSets = watch('isAdvancedSets');
  const currentSets = watch('sets');

  // Initialize useAlternateUnit based on user settings when modal opens
  useEffect(() => {
    if (isOpen && exercise) {
      const resetData: ExerciseFormData = {
        id: exercise.id.toString(),
        name: selectedExerciseName || exercise.name,
        exerciseId: exercise.exercise_id,
        source: exercise.source,
        pairing: exercise.pairing,
        sets: exercise.sets,
        isVariedSets: exercise.is_varied_sets,
        isAdvancedSets: exercise.is_advanced_sets,
        reps: exercise.is_varied_sets ? 0 : exercise.planned_sets[0]?.planned_reps ?? 0,
        load: exercise.is_varied_sets ? 0 : exercise.planned_sets[0]?.planned_load ?? 0,
        loadUnit: exercise.planned_sets[0]?.load_unit,
        tempo: exercise.planned_sets[0]?.planned_tempo ?? '2010',
        rest: exercise.planned_sets[0]?.planned_rest ?? 60,
        notes: exercise.notes,
        plannedSets: exercise.planned_sets
      };
      reset(resetData);
    }
  }, [isOpen, exercise, selectedExerciseName, reset]);

  /**
   * Effect: Initialize form when editing existing exercise
   * Handles type conversion for discriminated union
   */
  useEffect(() => {
    Debug.form('Initializing form', {
      isEditing: !!exercise,
      exerciseId: exercise?.id,
      nextPairing: exercise ? exercise.pairing : getNextPairing(exercises.filter(ex => ex.pairing))
    });

    if (exercise) {
      const formData = {
        ...exercise,
        id: exercise.id.toString(),
        name: selectedExerciseName || exercise.name,
        isVariedSets: exercise.is_varied_sets,
        isAdvancedSets: exercise.is_advanced_sets,
        setDetails: exercise.is_varied_sets ? exercise.planned_sets.map(set => ({
          set_number: set.set_number,
          planned_reps: set.planned_reps,
          planned_load: set.planned_load,
          planned_rest: set.planned_rest,
          planned_tempo: set.planned_tempo,
          notes: set.notes,
          sub_sets: set.sub_sets?.map(subSet => ({
            sub_set_number: subSet.sub_set_number,
            planned_reps: subSet.planned_reps,
            planned_load: subSet.planned_load,
            planned_rest: subSet.planned_rest
          }))
        })) : undefined
      };
      reset(formData);
    } else {
      // Use our local utility function to get the next pairing
      const nextPairing = getNextPairing(exercises.filter(ex => ex.pairing));

      // Default values for new exercises
      reset({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        exerciseId: 0,
        source: 'exercise_library' as const,
        pairing: nextPairing,
        sets: 3,
        reps: 10,
        load: 0,
        tempo: '2010',
        rest: 60,
        notes: '',
        isVariedSets: false,
        isAdvancedSets: false,
        plannedSets: []
      } satisfies ExerciseFormData);
    }
  }, [exercise, exercises, reset, selectedExerciseName]);


  /**
   * Handles the selection of an exercise from the dropdown
   * - Updates form state with selected exercise details
   * - Triggers form updates
   */
  const handleExerciseSelect: ExerciseSelectHandler = (selectedOption, actionMeta) => {
    Debug.exerciseMgmt('Exercise Selection:', {
      selectedOption,
      actionType: actionMeta.action
    });
    
    if (selectedOption) {
      setSelectedExercise(selectedOption);
      setValue('name', selectedOption.label);
      Debug.form('Updated form with selected exercise:', {
        name: selectedOption.label,
        formValues: watch()
      });
    } else {
      setSelectedExercise(null);
      setValue('name', '');
      Debug.form('Cleared exercise selection');
    }
  };

  useEffect(() => {
    // Only run this effect if we're editing an existing exercise
    if (!isOpen || !exercise || !selectedExerciseName || exerciseOptions.length === 0) return;

    Debug.exerciseMgmt('Setting up exercise for editing', {
      exerciseName: selectedExerciseName,
      exerciseId: exercise.id
    });
    
    const matchingExercise = exerciseOptions.find(
      option => option.label === selectedExerciseName
    );
    
    if (matchingExercise) {
      Debug.exerciseMgmt('Pre-selecting exercise for editing');
      handleExerciseSelect(matchingExercise, { action: 'select-option' });
    }
  }, [isOpen, exercise, selectedExerciseName, exerciseOptions, handleExerciseSelect]);

  // Use exerciseLibrary if provided (minimal change)
   useEffect(() => {
       if (exerciseLibrary && exerciseLibrary.length > 0) {
         console.log('Using provided exerciseLibrary:', exerciseLibrary.length);
         setExerciseOptions(exerciseLibrary);
       }
     }, [exerciseLibrary]);

  // Fetch exercises effect
  useEffect(() => {
    const fetchExercises = async () => {
      Debug.api('Starting exercise fetch');
      try {
        setIsLoading(true);
        const response = await fetch('/api/exercises');
        Debug.api('Fetch response status:', response.status);
        
        const data = await response.json();
        Debug.api('Raw API response data:', data);

        if (!Array.isArray(data)) {
          Debug.api('Invalid response format:', typeof data);
          throw new Error('Invalid response format: expected an array');
        }

        const options = data.map((exercise: any) => ({
          id: exercise.id,
          value: exercise.id.toString(),
          label: exercise.name,
          source: exercise.source,
          data: {
            id: exercise.id,
            name: exercise.name,
            source: exercise.source
          }
        }));

        Debug.api('Mapped exercise options:', {
          count: options.length,
          sample: options.slice(0, 2)
        });

        setExerciseOptions(options);
      } catch (error) {
        Debug.api('Error in fetchExercises:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      Debug.effect('Modal opened - fetching exercises');
      fetchExercises();
    }
  }, [isOpen, setValue]);

  // Add effect to monitor exerciseOptions changes
  useEffect(() => {
    Debug.state('Exercise options updated:', {
      count: exerciseOptions.length,
      sample: exerciseOptions.slice(0, 2)
    });
  }, [exerciseOptions]);

  /**
   * Effect: Manage setDetails array when varied sets is enabled
   * Creates or updates set details when number of sets changes
   */
  useEffect(() => {
    Debug.setMgmt('Managing set details', { isVariedSets, currentSets });
  
    if (isVariedSets && currentSets > 0) {
      const newPlannedSets: exercise_set[] = Array.from({ length: currentSets }, (_, i) => ({
        set_number: i + 1,
        planned_reps: watch('reps'),
        planned_load: Number(watch('load')) || 0,
        planned_tempo: watch('tempo'),
        planned_rest: watch('rest'),
        load_unit: watch('loadUnit'),
        notes: '',
        sub_sets: []
      }));
      
      Debug.setMgmt('Creating new planned sets', { setCount: newPlannedSets.length });
      setValue('plannedSets', newPlannedSets);
    } else {
      Debug.setMgmt('Clearing planned sets');
      setValue('plannedSets', []);
    }
  }, [isVariedSets, currentSets, setValue, watch]);

   // Reset form and state when modal opens/closes
   useEffect(() => {
    Debug.effect('Modal state change', { isOpen, hasExercise: !!exercise });

    if (isOpen) {
      if (exercise) {
        Debug.form('Resetting form with existing exercise');
        reset({
          ...exercise,
          id: exercise.id.toString(),
          name: selectedExerciseName || exercise.name,
          isVariedSets: exercise.is_varied_sets,
          isAdvancedSets: exercise.is_advanced_sets,
          plannedSets: exercise.is_varied_sets ? exercise.planned_sets.map(set => ({
            setNumber: set.set_number,
            plannedReps: set.planned_reps,
            plannedLoad: set.planned_load,
            plannedTempo: set.planned_tempo,
            plannedRest: set.planned_rest,
            notes: set.notes,
            sub_sets: set.sub_sets?.map(subSet => ({
              sub_set_number: subSet.sub_set_number,
              planned_reps: subSet.planned_reps,
              planned_load: subSet.planned_load,
              planned_rest: subSet.planned_rest
            }))
          })) : undefined
        });
      } else {
        Debug.form('Resetting form to defaults');
        reset();
        setSelectedExercise(null);
        setValue('name', '');
      }
      
      Debug.state('Resetting unit toggle');
      setUseAlternateUnit(false);
    }
  }, [isOpen, exercise, selectedExerciseName, reset, setValue]);

    // Clear selected exercise when modal closes
    useEffect(() => {
      if (!isOpen) {
        Debug.state('Modal closed - clearing exercise selection');
        setSelectedExercise(null);
        setValue('name', '');
      }
    }, [isOpen, setValue]);

  /**
   * Handles form submission with proper type conversion
   */
  const onSubmit = async (data: ExerciseFormData) => {
    Debug.form('Form submission started', { data });
  
    if (!selectedExercise) {
      Debug.validation('No exercise selected');
      toast.error('Please select an exercise');
      return;
    }
  
    try {
      const exerciseData = {
        id: Number(data.id),
        name: data.name,
        exercise_id: selectedExercise.data.id,
        source: selectedExercise.data.source === 'library' 
          ? ('exercise_library' as const) 
          : ('user_exercises' as const),
        is_varied_sets: Boolean(data.isVariedSets),
        is_advanced_sets: Boolean(data.isAdvancedSets),
        planned_sets: data.plannedSets.map(set => ({
          set_number: set.set_number,
          planned_reps: set.planned_reps || 0,  // Ensure non-null values
          planned_load: set.planned_load || 0,
          planned_tempo: set.planned_tempo || '2010',
          planned_rest: set.planned_rest || 60
        })) || []  // Ensure non-null array
      };
  
      const createdExercise = create_exercise(
        {
          id: exerciseData.id,
          name: exerciseData.name,
          exercise_id: exerciseData.exercise_id,
          source: exerciseData.source
        },
        exerciseData.is_varied_sets,
        exerciseData.is_advanced_sets,
        exerciseData.planned_sets
      );
  
      await onSave(createdExercise);
      onClose();
    } catch (error) {
      Debug.form('Error in form submission:', error);
      toast.error('Failed to save exercise');
    }
  };

  const formSubmitHandler = handleSubmit((data) => {
    Debug.form('Form submit handler triggered', { data });
    try {
      return onSubmit(data);
    } catch (error) {
      Debug.form('Error in formSubmitHandler:', error);
      throw error; // Re-throw to be caught by the form's error handler
    }
  }, (errors) => {
    // This is the validation errors handler
    Debug.validation('Form validation failed:', errors);
    return false;
  });

  /**
   * Adds a subset to a specific set in varied exercises
   */
  const handleAddSubSet = (setIndex: number) => {
    Debug.setMgmt('Adding subset', { setIndex });
    
    const currentPlannedSets = watch('plannedSets') || [];
    if (setIndex >= currentPlannedSets.length) {
      Debug.setMgmt('Invalid set index', { setIndex, totalSets: currentPlannedSets.length });
      return;
    }
  
    const updatedPlannedSets = [...currentPlannedSets];
    const currentSet = updatedPlannedSets[setIndex];
    
    const newSubSet: exercise_sub_set = {
      sub_set_number: (currentSet.sub_sets?.length || 0) + 1,
      planned_reps: currentSet.planned_reps,
      planned_load: currentSet.planned_load,
      load_unit: currentSet.load_unit,
      planned_rest: currentSet.planned_rest,
      planned_tempo: currentSet.planned_tempo
    };
  
    currentSet.sub_sets = currentSet.sub_sets ?? [];
    currentSet.sub_sets.push(newSubSet);
  
    Debug.setMgmt('Updated planned sets', { setIndex, subSetsCount: currentSet.sub_sets.length });
    setValue('plannedSets', updatedPlannedSets);
  };

  const handleRemoveSubSet = (setIndex: number, subSetIndex: number) => {
    Debug.setMgmt('Removing subset', { setIndex, subSetIndex });
  
    const currentPlannedSets = watch('plannedSets') || [];
    if (setIndex >= currentPlannedSets.length) {
      Debug.setMgmt('Invalid set index', { setIndex, totalSets: currentPlannedSets.length });
      return;
    }
  
    const updatedPlannedSets = [...currentPlannedSets];
    const currentSet = updatedPlannedSets[setIndex];
  
    if (currentSet.sub_sets) {
      currentSet.sub_sets = currentSet.sub_sets.filter((_, idx) => idx !== subSetIndex);
      Debug.setMgmt('Updated planned sets', { setIndex, remainingSubSets: currentSet.sub_sets.length });
    }
  
    setValue('plannedSets', updatedPlannedSets);
  };

  /**
   * Handles the creation of a new custom exercise
   * - Validates exercise name
   * - Makes API call to create exercise
   * - Updates exercise options
   * - Selects newly created exercise
   */
  const handleCreateExercise = async (exerciseName: string) => {
    Debug.exerciseMgmt('Creating new user exercise', { name: exerciseName });
    
    try {
      const response = await fetch('/api/user-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_name: exerciseName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newExercise = await response.json();
      Debug.exerciseMgmt('User exercise created successfully', newExercise);
      
      const newOption: ExerciseOption = {
        id: newExercise.id,
        value: `user-${newExercise.id}`,
        label: newExercise.exercise_name,
        source: 'user',
        data: {
          id: newExercise.id,
          name: newExercise.exercise_name,
          source: 'user'
        }
      };

      setExerciseOptions(prev => [...prev, newOption]);
      handleExerciseSelect(newOption, { action: 'select-option' });
      setIsCreatingExercise(false);
      
    } catch (error) {
      Debug.form('Error saving exercise', error);
      toast.error('Failed to save exercise: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  interface NoOptionsMessageProps {
    inputValue: string;
  }
  
  const NoOptionsMessage: React.FC<NoOptionsMessageProps> = ({ inputValue }) => {
    const handleCreateExercise = () => {
      setIsCreatingExercise(true);
      setNewExerciseName(inputValue);
    };
  
    return (
      <div className="text-center">
        <p className="text-gray-900 dark:text-white font-medium">
          No matches found
        </p>
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

  // Add confirmation dialog
  interface ConfirmationDialogProps {
    isOpen: boolean;
    exerciseName: string;
    onConfirm: (name: string) => void;
    onCancel: () => void;
  }
  
  const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    exerciseName,
    onConfirm,
    onCancel
  }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Create New Exercise
          </h3>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Are you sure you want to create "{exerciseName}"?
          </p>
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
        {exercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            Debug.form('Raw form submit event triggered');
            try {
              const result = formSubmitHandler(e);
              if (result && typeof result.catch === 'function') {
                result.catch((error) => {
                  Debug.form('Error in form submission:', error);
                });
              } else {
                Debug.form('Form handler did not return a promise', { result });
              }
            } catch (error) {
              Debug.form('Error in form event handler:', error);
            }
          }} 
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Selection Section */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="exercise-select" className="block text-sm font-medium dark:text-white">
                  Exercise Name
                </label>
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
                    value={selectedExercise}
                    onChange={(newValue, action) => {
                      Debug.exerciseMgmt('Select onChange:', { newValue, action });
                      handleExerciseSelect(newValue, action);
                    }}
                    options={exerciseOptions}
                    onMenuOpen={() => {
                      Debug.exerciseMgmt('Select menu opened:', {
                        optionsAvailable: exerciseOptions.length > 0,
                        firstOption: exerciseOptions[0],
                        selectedValue: selectedExercise
                      });
                    }}
                    isLoading={isLoading}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Select or search for an exercise..."
                    isClearable
                    styles={customSelectStyles}
                    filterOption={filterExerciseOptions}
                    components={{
                      NoOptionsMessage: (props) => <NoOptionsMessage inputValue={props.selectProps.inputValue} />
                    }}
                  />
                </div>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Pairing Input */}
            <div>
              <label 
                htmlFor="exercise-pairing" 
                className="block text-sm font-medium dark:text-white"
              >
                Pairing
              </label>
              <input
                id="exercise-pairing"
                type="text"
                {...register('pairing')}
                placeholder="e.g., A1, B2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-blue-500 focus:ring-blue-500 
                         dark:text-black p-2"
              />
              {errors.pairing && (
                <p 
                  className="mt-1 text-sm text-red-600" 
                  role="alert"
                >
                  {errors.pairing.message}
                </p>
              )}
            </div>

             {/* Sets Input Section */}
             <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="exercise-sets" className="block text-sm font-medium dark:text-white">
                  Sets
                </label>
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
                            setValue('plannedSets', []);
                          }
                        }}
                        {...field}
                        aria-label="Enable varied sets"
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
                id="exercise-sets"
                type="number"
                min="1"
                placeholder="Enter number of sets"
                {...register('sets', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
              {errors.sets && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.sets.message}
                </p>
              )}
            </div>

            {/* Reps Input */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <label htmlFor="exercise-reps" className="block text-sm font-medium dark:text-white">
                  Reps
                </label>
                <input
                  id="exercise-reps"
                  type="number"
                  placeholder="Enter number of reps"
                  {...register('reps', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                           focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
                {errors.reps && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.reps.message}
                  </p>
                )}
              </div>
            )}

            {/* Load Input with Unit Toggle */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <div className="flex items-center space-x-1">
                  <label htmlFor="exercise-load" className="block text-sm font-medium dark:text-white">
                    Load
                  </label>
                  <div className="group relative">
                    <HiInformationCircle 
                      className="h-4 w-4 text-gray-400 hover:text-gray-500" 
                      aria-hidden="true"
                    />
                    <div 
                      role="tooltip" 
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50"
                    >
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
                    id="exercise-load"
                    type="text"
                    {...register('load', {
                      setValueAs: v => {
                        const num = Number(v);
                        return isNaN(num) ? v : num;
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                             focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit}, BW, or band color`}
                  />
                  <button
                    type="button"
                    onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                    className="mt-1 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1 text-gray-700"
                    title={`Switch to ${useAlternateUnit ? 'lbs' : 'kg'}`}
                  >
                    <HiSwitchHorizontal className="h-4 w-4" />
                    <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                  </button>
                </div>
                {errors.load && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.load.message}
                  </p>
                )}
              </div>
            )}

            {/* Tempo Input */}
            <div>
              <label 
                htmlFor="exercise-tempo" 
                className="block text-sm font-medium dark:text-white"
              >
                Tempo (4 digits, X for explosive)
              </label>
              <input
                id="exercise-tempo"
                type="text"
                {...register('tempo')}
                placeholder="e.g., 2010"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
              {errors.tempo && (
                <p 
                  className="mt-1 text-sm text-red-600" 
                  role="alert"
                >
                  {errors.tempo.message}
                </p>
              )}
            </div>

            {/* Rest Input */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <label 
                  htmlFor="exercise-rest" 
                  className="block text-sm font-medium dark:text-white"
                >
                  Rest (seconds)
                </label>
                <input
                  id="exercise-rest"
                  type="number"
                  placeholder="Enter rest period"
                  {...register('rest', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                           focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
                {errors.rest && (
                  <p 
                    className="mt-1 text-sm text-red-600" 
                    role="alert"
                  >
                    {errors.rest.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Optional Fields</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RPE */}
              {userSettings?.pillar_settings?.fitness?.resistanceTraining?.trackRPE && (
                <div>
                  <label htmlFor="exercise-rpe" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    RPE (Rate of Perceived Exertion)
                  </label>
                  <input
                    id="exercise-rpe"
                    type="number"
                    step="0.5"
                    {...register('rpe', { 
                      setValueAs: v => v === "" || v === "0" ? undefined : Number(v)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder="Enter RPE (0-20)"
                  />
                  {errors.rpe && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{errors.rpe.message}</p>
                  )}
                </div>
              )}

              {/* RIR */}
              {userSettings?.pillar_settings?.fitness?.resistanceTraining?.trackRIR && (
                <div>
                  <label htmlFor="exercise-rir" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    RIR (Reps in Reserve)
                  </label>
                  <input
                    id="exercise-rir"
                    type="number"
                    step="0.5"
                    {...register('rir', { 
                      setValueAs: v => v === "" || v === "0" ? undefined : Number(v)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder="Enter RIR (0-10)"
                  />
                  {errors.rir && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{errors.rir.message}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="col-span-2">
                <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notes
                </label>
                <textarea
                  id="exercise-notes"
                  {...register('notes')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  placeholder="Add any additional notes about the exercise"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.notes.message}</p>
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
                          aria-label="Enable advanced sets"
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
                {watch('plannedSets')?.map((set: exercise_set, setIndex: number) => (
                  <div key={set.set_number} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-white">Set {set.set_number}</span>
                      {isAdvancedSets && (
                        <button
                          type="button"
                          onClick={() => handleAddSubSet(setIndex)}
                          aria-label={`Add subset to set ${set.set_number}`}
                          className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200"
                        >
                          <BsPlus className="w-5 h-5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {/* Main set inputs */}
                    {(!set.sub_sets?.length) && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor={`set-${setIndex}-reps`} className="block text-sm dark:text-white">
                            Reps
                          </label>
                          <input
                            id={`set-${setIndex}-reps`}
                            type="number"
                            placeholder="Enter reps"
                            {...register(`plannedSets.${setIndex}.planned_reps`)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                          />
                        </div>
                        <div>
                          <label htmlFor={`set-${setIndex}-load`} className="block text-sm dark:text-white">
                            Load
                          </label>
                          <input
                            id={`set-${setIndex}-load`}
                            type="text"
                            {...register(`plannedSets.${setIndex}.planned_load`, {
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
                          <label htmlFor={`set-${setIndex}-rest`} className="block text-sm dark:text-white">
                            Rest
                          </label>
                          <input
                            id={`set-${setIndex}-rest`}
                            type="number"
                            placeholder="Enter rest"
                            {...register(`plannedSets.${setIndex}.planned_rest`)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                          />
                        </div>
                      </div>
                    )}

                     {/* Sub-sets */}
                     {isAdvancedSets && set.sub_sets?.map((subSet: exercise_sub_set, subSetIndex: number) => (
                      <div key={subSetIndex} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium dark:text-white">
                            Set {set.set_number}.{subSetIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubSet(setIndex, subSetIndex)}
                            aria-label={`Remove subset ${subSetIndex + 1} from set ${set.set_number}`}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200"
                          >
                            <BsDash className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label htmlFor={`subset-${setIndex}-${subSetIndex}-reps`} className="block text-sm dark:text-white">
                              Reps
                            </label>
                            <input
                              id={`subset-${setIndex}-${subSetIndex}-reps`}
                              type="number"
                              placeholder="Enter reps"
                              {...register(`plannedSets.${setIndex}.sub_sets.${subSetIndex}.planned_reps`)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                          <div>
                            <label htmlFor={`subset-${setIndex}-${subSetIndex}-load`} className="block text-sm dark:text-white">
                              Load
                            </label>
                            <input
                              id={`subset-${setIndex}-${subSetIndex}-load`}
                              type="text"
                              placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                              {...register(`plannedSets.${setIndex}.sub_sets.${subSetIndex}.planned_load`, {
                                setValueAs: v => {
                                  const num = Number(v);
                                  return isNaN(num) ? v : num;
                                }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                          </div>
                          <div>
                            <label htmlFor={`subset-${setIndex}-${subSetIndex}-rest`} className="block text-sm dark:text-white">
                              Rest
                            </label>
                            <input
                              id={`subset-${setIndex}-${subSetIndex}-rest`}
                              type="number"
                              placeholder="Enter rest"
                              {...register(`plannedSets.${setIndex}.sub_sets.${subSetIndex}.planned_rest`)}
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