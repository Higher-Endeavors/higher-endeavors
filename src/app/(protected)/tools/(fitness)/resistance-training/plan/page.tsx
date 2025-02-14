'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ExerciseModal from './components/AddExerciseModal';
import ExerciseSearch from './components/ExerciseSearch';
import ProgramSettings, { ProgramSettingsFormData } from './components/ProgramSettings';
import WeekProgram from './components/WeekProgram';
import { z } from 'zod';
import { KG_TO_LBS, LBS_TO_KG } from '@/app/lib/utils/fitness/unit-conversions';
import { calculateSessionVolume } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { 
  Exercise, 
  BaseExercise, 
  RegularExercise, 
  VariedExercise, 
  SetDetail,
  ExerciseOption,
  programSettingsSchema, 
  programSchema,
  createRegularExercise,
  createVariedExercise,
  getNextPairing,
  PhaseFocusType,
  PeriodizationTypeEnum,
  ProgressionFrequencyType,
  PhaseFocus,
  PeriodizationType,
  ProgressionFrequency,
  isPhaseFocus,
  isPeriodizationType,
  isProgressionFrequency,
  applyLinearProgression
} from '@/app/lib/types/pillars/fitness';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import UserSelector from '@/app/components/UserSelector';
import { useSession } from 'next-auth/react';
import ProgramBrowser from './components/ProgramBrowser';
import type { FitnessSettings } from '@/app/lib/types/user_settings';
import { SavedProgram, VolumeTarget, ProgressionRules, Program } from '@/app/lib/types/pillars/fitness';
import { APIProgramResponse, APIWeek, APIDay, APIExercise } from '@/app/lib/types/pillars/fitness/api.types';

const ExerciseListNoSSR = dynamic(
    () => import('./components/ExerciseList'),
    { ssr: false }
  )

// Add type guards for exercise details
const isVariedExercise = (exercise: Exercise): exercise is VariedExercise => {
  return 'setDetails' in exercise && exercise.setDetails !== undefined;
};

const calculateSessionDuration = (exercises: Exercise[]): number => {
  const REST_TIME_BETWEEN_SETS = 90; // seconds
  const TIME_PER_REP = 4; // seconds
  
  return exercises.reduce((total, exercise) => {
    if (isVariedExercise(exercise)) {
      const sets = exercise.setDetails.length;
      const avgReps = exercise.setDetails.reduce((sum, set) => sum + Number(set.reps), 0) / sets;
      const timePerSet = (avgReps * TIME_PER_REP) + REST_TIME_BETWEEN_SETS;
      return total + (sets * timePerSet);
    }
    const timePerSet = (Number(exercise.reps) * TIME_PER_REP) + REST_TIME_BETWEEN_SETS;
    return total + (Number(exercise.sets) * timePerSet);
  }, 0);
};

// Initialize default program state
const defaultProgram: Program = {
    id: '',
    name: '',
  userId: '',
  phaseFocus: 'Hypertrophy',
    periodizationType: 'Linear',
    progressionRules: {
      type: 'Linear',
      settings: {
      volumeIncrementPercentage: 0,
      loadIncrementPercentage: 0,
        programLength: 4,
        weeklyVolumePercentages: [100, 80, 90, 60]
      }
    },
  exercises: [],
    createdAt: new Date(),
    updatedAt: new Date()
};

// Helper functions for weight calculations
const getNumericLoad = (load: number | string | undefined): number => {
  // If it's a number, return it directly
  if (typeof load === 'number') return load;
  
  // If it's undefined, return 0
  if (load === undefined) return 0;
  
  // If it's a string, try to parse it as a number
  const parsed = parseFloat(load);
  
  // If it's a valid number, return it
  if (!isNaN(parsed)) return parsed;
  
  // If it's a color or "BW" or any other non-numeric string, return 0
  return 0;
};

const convertWeight = (weight: number, fromUnit: string, toUnit: string): number => {
  if (fromUnit === toUnit) return weight;
  if (fromUnit === 'kg' && toUnit === 'lbs') return weight * KG_TO_LBS;
  if (fromUnit === 'lbs' && toUnit === 'kg') return weight * LBS_TO_KG;
  return weight;
};

function PlanPageContent() {
  const { data: session } = useSession();
  const { settings: userSettings, isLoading: settingsLoading } = useUserSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/users');
          setIsAdmin(response.ok);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [session?.user?.id]);

  // Debug logs
  useEffect(() => {
    console.log('Component State:', {
      isAdmin,
      sessionUserId: session?.user?.id,
      selectedUserId,
      settingsLoading
    });
  }, [isAdmin, session?.user?.id, selectedUserId, settingsLoading]);

  // Program state
  const [program, setProgram] = useState<Program>({
    ...defaultProgram,
    progressionRules: {
      type: PeriodizationType.Linear,
      settings: {
        volumeIncrementPercentage: 0,
        loadIncrementPercentage: 0,
        programLength: 4,
        weeklyVolumePercentages: [100, 80, 90, 60]
      }
    }
  });

  // UI state
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isExerciseSearchOpen, setIsExerciseSearchOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isProgramSettingsExpanded, setIsProgramSettingsExpanded] = useState(true);
  const [currentExercise, setCurrentExercise] = useState<Exercise | undefined>();
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>();
  const [activeExercise, setActiveExercise] = useState<Exercise | undefined>();
  const [mounted, setMounted] = useState(false);
  const [weekExercises, setWeekExercises] = useState<{ [key: number]: Exercise[] }>({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load exercise library on mount
  useEffect(() => {
    const loadExerciseLibrary = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercise library');
        }
        const data = await response.json();
        console.log('Loaded exercise library:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid exercise library data format');
        }
        
        // Transform the data to match ExerciseOption type
        const formattedData: ExerciseOption[] = data.map((exercise: any) => ({
          id: exercise.id.toString(),
          value: `${exercise.source}-${exercise.id}`,
          label: exercise.exercise_name,
          libraryId: exercise.source === 'library' ? parseInt(exercise.id) : undefined,
          source: exercise.source,
          data: {
            id: exercise.id.toString(),
            name: exercise.exercise_name,
            source: exercise.source || 'library',
            difficulty: exercise.difficulty_name,
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
        
        setExerciseLibrary(formattedData);
      } catch (error) {
        console.error('Error loading exercise library:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load exercise library');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    };

    loadExerciseLibrary();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // First, uncomment the DND-Kit setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedExercise = program.exercises.find(ex => ex.id === active.id);
    setActiveExercise(draggedExercise);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveExercise(undefined);
    const { active, over } = event;

    if (active.id !== over?.id) {
      setProgram((prev) => {
        const oldIndex = prev.exercises.findIndex((ex) => ex.id === active.id);
        const newIndex = prev.exercises.findIndex((ex) => ex.id === over?.id);

        // Create new array with the moved exercise
        const newExercises = arrayMove(prev.exercises, oldIndex, newIndex);

        // Update pairings for all exercises
        const updatedExercises = updatePairings(newExercises);

        return {
          ...prev,
          exercises: updatedExercises
        };
      });
    }
  };

  // Modified updatePairings function to handle group changes
  const updatePairings = (exercises: Exercise[]): Exercise[] => {
    let currentGroup = 'A';
    let currentNumber = 1;

    return exercises.map((exercise, index): Exercise => {
      if (exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')) {
        return exercise;
      }

      if (index === 0 || (exercises[index - 1].pairing.charAt(0) !== currentGroup)) {
        if (index > 0) {
          // Only increment group if not first exercise
          currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
        }
        currentNumber = 1;
      }

      const newPairing = `${currentGroup}${currentNumber}`;
      currentNumber = currentNumber === 1 ? 2 : 1;

      // Extract only the BaseExercise properties
      const baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> = {
        id: exercise.id,
        name: exercise.name || '',
        pairing: newPairing,
        sets: exercise.sets,
        reps: exercise.reps,
        load: exercise.load,
        tempo: exercise.tempo,
        rest: exercise.rest,
        notes: exercise.notes || '',
        rpe: exercise.rpe,
        rir: exercise.rir,
        loadUnit: exercise.loadUnit,
        source: exercise.source || 'custom',
        libraryId: exercise.libraryId
      };

      if (!exercise.isVariedSets) {
        return createRegularExercise(baseExercise);
      } else {
        return createVariedExercise(baseExercise, exercise.setDetails);
      }
    });
  };

  // Exercise management
  const handleAddExercise = () => {
    setEditingExercise(undefined);
    setSelectedExerciseName('');
    setIsExerciseModalOpen(true);
  };

  const handleExerciseSelect = (exercise: ExerciseOption) => {
    const baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> = {
      id: `exercise-${Math.random().toString(36).substr(2, 9)}-day1`,
      name: exercise.label || '',
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60,
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'kg',
      notes: '',
      source: 'library' as const,
      libraryId: exercise.libraryId
    };
    
    setSelectedExercise(createRegularExercise(baseExercise));
    setIsAdvancedSearchOpen(false);
  };

  const getNextPairing = (): string => {
    // Filter out warm-up and cool-down exercises
    const exercises = program.exercises.filter(
      ex => !ex.pairing?.startsWith('WU') && !ex.pairing?.startsWith('CD')
    );

    if (exercises.length === 0) return 'A1';

    const lastExercise = exercises[exercises.length - 1];
    const letter = lastExercise.pairing.charAt(0);
    const number = parseInt(lastExercise.pairing.charAt(1));

    // If we're at number 1, return same letter with number 2
    if (number === 1) {
      return `${letter}2`;
    }
    
    // If we're at number 2, move to next letter and start at 1
    return `${String.fromCharCode(letter.charCodeAt(0) + 1)}1`;
  };

  const handleEditExercise = (id: string) => {
    // Find the exercise in the current week's exercises
    const exercise = weekExercises[activeWeek]?.find(ex => ex.id === id);
    if (exercise && !exercise.isVariedSets) {
      console.log('Editing exercise:', exercise);
      setEditingExercise(createRegularExercise({
        ...exercise,
        id: id
      }));
      setSelectedExerciseName(exercise.name);
      setIsExerciseModalOpen(true);
    }
  };

  const handleSaveExercise = (formattedExercise: Exercise) => {
    console.log('Received exercise data in handleSaveExercise:', formattedExercise);
    
    const baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> = {
      id: formattedExercise.id,
      name: formattedExercise.name,
      pairing: formattedExercise.pairing || 'A1',
      sets: formattedExercise.sets,
      reps: formattedExercise.reps,
      load: formattedExercise.load,
      tempo: formattedExercise.tempo || '2010',
      rest: formattedExercise.rest,
      notes: formattedExercise.notes || '',
      source: formattedExercise.source || 'library',
      libraryId: formattedExercise.libraryId,
      loadUnit: formattedExercise.loadUnit || 'kg'
    };

    const exerciseData = formattedExercise.isVariedSets 
      ? createVariedExercise(baseExercise, formattedExercise.setDetails || [])
      : createRegularExercise(baseExercise);

    // Update program exercises
    setProgram(prev => ({
      ...prev,
      exercises: editingExercise 
        ? prev.exercises.map(ex => ex.id === exerciseData.id ? exerciseData : ex)
        : [...prev.exercises, exerciseData]
    }));

    // Update week exercises
      setWeekExercises(prev => {
        const newWeekExercises = { ...prev };
      
      // If editing an existing exercise
      if (editingExercise) {
        Object.keys(newWeekExercises).forEach(weekNum => {
          newWeekExercises[Number(weekNum)] = newWeekExercises[Number(weekNum)]?.map(ex =>
            ex.id === exerciseData.id ? exerciseData : ex
          ) || [];
        });
        } else {
        // If adding a new exercise
        if (!newWeekExercises[activeWeek]) {
          newWeekExercises[activeWeek] = [];
        }
        newWeekExercises[activeWeek] = [...newWeekExercises[activeWeek], exerciseData];
        }
        
        return newWeekExercises;
      });

    setIsExerciseModalOpen(false);
  };

  const handleDeleteExercise = (id: string) => {
    // Get the base ID (remove week suffix if present)
    const baseId = id.split('-week')[0];

    // Remove from program exercises
    setProgram((prev) => ({
      ...prev,
      exercises: prev.exercises.filter(ex => !ex.id.startsWith(baseId))
    }));

    // Remove from all weeks
    setWeekExercises(prev => {
      const newWeekExercises = { ...prev };
      Object.keys(newWeekExercises).forEach(week => {
        newWeekExercises[Number(week)] = newWeekExercises[Number(week)]?.filter(
          ex => !ex.id.startsWith(baseId)
        ) || [];
      });
      return newWeekExercises;
    });
  };

  // Program settings management
  const handleSettingsChange = (settings: Partial<ProgramSettingsFormData>) => {
    setProgram(prevProgram => {
      if (!prevProgram) return prevProgram;

      return {
        ...prevProgram,
        periodizationType: (settings.periodizationType || prevProgram.periodizationType) as PeriodizationTypeEnum,
        phaseFocus: (settings.phaseFocus || prevProgram.phaseFocus) as PhaseFocusType,
        progressionRules: {
          type: (settings.periodizationType || prevProgram.progressionRules.type) as PeriodizationTypeEnum,
          settings: {
            ...prevProgram.progressionRules.settings,
            ...settings.progressionRules?.settings
          }
        }
      };
    });
  };

  // Volume targets management - commented out for now
  /*const handleVolumeTargetsChange = (targets: VolumeTarget[]) => {
    setProgram(prev => ({
      ...prev,
      volumeTargets: targets
    }));
  };*/

  // Save program
  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Current program state:', program);
      console.log('Program name:', program.name);
      console.log('Selected User ID:', selectedUserId);

      // Client-side validation
      if (!program.name?.trim()) {
        const error = 'Please enter a program name';
        setErrorMessage(error);
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }

      // Check if there are any exercises in week 1
      if (!weekExercises[1] || weekExercises[1].length === 0) {
        const error = 'Please add at least one exercise to the program';
        setErrorMessage(error);
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }

      // Transform the program data into the format expected by the API
      const weeks = Array.from(
        { length: program.progressionRules?.settings?.programLength ?? 4 },
        (_, weekIndex) => {
          const weekNumber = weekIndex + 1;
          const weekExerciseList = weekExercises[weekNumber] || [];
          
          console.log(`Processing week ${weekNumber} exercises:`, weekExerciseList);
          
          // Group exercises by day (assuming exercises are named with day numbers)
          const exercisesByDay = weekExerciseList.reduce((acc, exercise) => {
            const dayMatch = exercise.id.match(/day(\d+)/);
            const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1;
            
            if (!acc[dayNumber]) {
              acc[dayNumber] = [];
            }
            acc[dayNumber].push(exercise);
            return acc;
          }, {} as Record<number, any[]>);

          // Create days array
          const days = Object.entries(exercisesByDay).map(([dayNumber, exercises]) => {
            console.log(`Processing day ${dayNumber} exercises:`, exercises);

            // Fix pairings for this day's exercises
            let currentGroup = 'A';
            let currentNumber = 1;
            const fixedExercises = exercises.map((exercise, index) => {
              // Keep warm-up and cool-down exercises as is
              if (exercise.pairing?.startsWith('WU') || exercise.pairing?.startsWith('CD')) {
                return exercise;
              }

              // If this is the first exercise or if we need to start a new pair
              if (index === 0 || currentNumber > 2) {
                currentNumber = 1;
                if (index > 0) {
                  // Increment the group letter (A -> B -> C, etc.)
                  currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
                }
              }

              const newPairing = `${currentGroup}${currentNumber}`;
              currentNumber++;

              // Create the exercise data for API
              const exerciseData = {
                source: exercise.source || 'library',
                libraryId: exercise.libraryId,
                userExerciseId: exercise.userExerciseId || null,
                customName: exercise.customName,
                pairing: exercise.pairing,
                notes: exercise.notes || '',
                orderIndex: index,
                sets: exercise.isVariedSets && exercise.setDetails 
                  ? exercise.setDetails.map((set: SetDetail) => ({
                      setNumber: set.setNumber,
                      reps: set.reps,
                      load: set.load,
                      loadUnit: set.loadUnit || exercise.loadUnit || 'lbs',
                      rest: set.rest,
                      tempo: set.tempo,
                      notes: set.notes || ''
                    }))
                  : Array.from({ length: exercise.sets }, (_, setIndex) => ({
                      setNumber: setIndex + 1,
                      reps: exercise.reps,
                      load: exercise.load,
                      loadUnit: exercise.loadUnit || 'lbs',
                      rest: exercise.rest || 60,
                      tempo: exercise.tempo || '2010',
                      notes: ''
                    }))
              };

              console.log(`Preparing exercise ${exercise.name} for API:`, exerciseData);
              return exerciseData;
            });

            return {
              dayNumber: parseInt(dayNumber),
              dayName: `Day ${dayNumber}`,
              notes: '',
              exercises: fixedExercises.map((exercise, index) => ({
                source: exercise.source || 'library',
                libraryId: exercise.libraryId,
                userExerciseId: exercise.userExerciseId || null,
                customName: exercise.customName,
                pairing: exercise.pairing,
                notes: exercise.notes || '',
                orderIndex: index,
                sets: exercise.isVariedSets && exercise.setDetails 
                  ? exercise.setDetails.map((set: SetDetail) => ({
                      setNumber: set.setNumber,
                      reps: set.reps,
                      load: set.load,
                      loadUnit: set.loadUnit || exercise.loadUnit || 'lbs',
                      rest: set.rest,
                      tempo: set.tempo,
                      notes: set.notes || ''
                    }))
                  : Array.from({ length: exercise.sets }, (_, setIndex) => ({
                      setNumber: setIndex + 1,
                      reps: exercise.reps,
                      load: exercise.load,
                      loadUnit: exercise.loadUnit || 'lbs',
                      rest: exercise.rest || 60,
                      tempo: exercise.tempo || '2010',
                      notes: ''
                    }))
              }))
            };
          });

          return {
            weekNumber,
            notes: '',
            days
          };
        }
      );

      const programData = {
        id: program.id,
        name: program.name.trim(),
        periodization_type: program.periodizationType,
        phase_focus: program.phaseFocus,
        progression_rules: program.progressionRules,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + (weeks.length * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        notes: '',
        weeks: weeks,
        userId: selectedUserId?.toString() || session?.user?.id || '0',
        program_name: program.name.trim()
      };

      console.log('Final program data being sent:', JSON.stringify(programData, null, 2));

      // Determine if this is a new program or an update
      const isUpdate = Boolean(program.id);
      const url = isUpdate 
        ? `/api/resistance-training/program/${program.id}`
        : '/api/resistance-training/program';

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Error saving program:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save program');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Add handler for advanced search selection
  const handleAdvancedSearchSelect = (exercise: ExerciseOption) => {
    const transformedExercise: RegularExercise = {
      id: exercise.data.id,
      name: exercise.data.name,
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'kg',
      tempo: '2010',
      rest: 60,
      source: exercise.data.source,
      libraryId: exercise.libraryId,
      notes: '',
      isVariedSets: false,
      isAdvancedSets: false
    };
    
    setSelectedExerciseName(exercise.data.name);
    setEditingExercise(transformedExercise);
    setIsExerciseModalOpen(true);
  };

  // Watch for program length changes
  useEffect(() => {
    if (!program) return;

    setWeekExercises((prevWeekExercises) => {
      // If no exercises for this week yet, initialize with program exercises
      if (!prevWeekExercises[activeWeek]) {
        return {
          ...prevWeekExercises,
          [activeWeek]: program.exercises ?? []
        };
      }

      // Apply progression based on program type and settings
      const baseExercises = program.exercises ?? [];
      const newWeekExercises = baseExercises.map(exercise => {
        if (program.periodizationType === 'Linear' && program.progressionRules?.settings) {
          return applyLinearProgression(
                  exercise,
            activeWeek,
            program.progressionRules.settings.volumeIncrementPercentage || 0,
            program.progressionRules.settings.loadIncrementPercentage || 0
          );
        }
        return exercise;
      });

                return {
        ...prevWeekExercises,
        [activeWeek]: newWeekExercises
                };
              });
  }, [
    program?.exercises,
    program?.periodizationType,
    program?.progressionRules?.settings?.programLength,
    program?.progressionRules?.settings?.volumeIncrementPercentage,
    program?.progressionRules?.settings?.loadIncrementPercentage,
    program?.progressionRules?.settings?.weeklyVolumePercentages,
    activeWeek
  ]);

  // Update exercises for the active week
  const handleWeekExercisesChange = (exercises: Exercise[]) => {
    setWeekExercises(prev => {
      const newWeekExercises = { ...prev };
      
      // If this is Week 1, update all subsequent weeks
      if (activeWeek === 1) {
        newWeekExercises[1] = exercises;
        
        const programLength = program.progressionRules?.settings?.programLength ?? 4;
        const weeklyVolumePercentages = program.progressionRules?.settings?.weeklyVolumePercentages ?? [100, 100, 100, 100];

        for (let week = 2; week <= programLength; week++) {
          if (program.periodizationType === 'Linear') {
            newWeekExercises[week] = exercises.map(exercise => ({
              ...applyLinearProgression(
                exercise,
                week,
                program.progressionRules?.settings?.volumeIncrementPercentage ?? 0,
                program.progressionRules?.settings?.loadIncrementPercentage ?? 0
              ),
              id: `${exercise.id.split('-week')[0]}-week${week}`
            }));
          } else if (program.periodizationType === 'Undulating') {
            const weekPercentage = weeklyVolumePercentages[week - 1] ?? 100;
            newWeekExercises[week] = exercises.map(exercise => {
              const volumePercentage = weekPercentage / 100;
              const newReps = Math.max(1, Math.round(exercise.reps * volumePercentage));
              return {
                ...exercise,
                id: `${exercise.id.split('-week')[0]}-week${week}`,
                reps: newReps
              };
            });
          } else {
            // For other periodization types, just copy Week 1
            newWeekExercises[week] = exercises.map(exercise => ({
              ...exercise,
              id: `${exercise.id.split('-week')[0]}-week${week}`
            }));
          }
        }
      } else {
        // For other weeks, just update the current week
        newWeekExercises[activeWeek] = exercises;
      }
      
      return newWeekExercises;
    });
  };

  // Handle user selection
  const handleUserSelect = (userId: number | null) => {
    setSelectedUserId(userId);
    // Reset program state when switching users
    setProgram({
      id: '',
      userId: userId?.toString() || '',
      name: '',
      phaseFocus: PhaseFocus.Hypertrophy,
      periodizationType: PeriodizationType.Linear,
      exercises: [],
      progressionRules: {
        type: PeriodizationType.Linear,
        loadIncrement: 2.5,
        frequency: ProgressionFrequency.PerSession,
        settings: {
          programLength: 4,
          volumeIncrementPercentage: 5,
          loadIncrementPercentage: 2.5,
          weeklyVolumePercentages: [100, 80, 90, 60]
        }
      },
      volumeTargets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setWeekExercises({});
  };

  const handleProgramSelect = (selectedProgram: SavedProgram) => {
    if (!selectedProgram.program_name) return;

    setProgram({
      id: selectedProgram.id,
      userId: selectedProgram.userId || '',
      name: selectedProgram.program_name,
      phaseFocus: selectedProgram.phase_focus,
      periodizationType: selectedProgram.periodization_type,
      progressionRules: {
        type: selectedProgram.progression_rules.type,
        loadIncrement: selectedProgram.progression_rules.loadIncrement,
        frequency: selectedProgram.progression_rules.frequency,
        settings: selectedProgram.progression_rules.settings
      },
      volumeTargets: selectedProgram.volumeTargets || [],
      exercises: selectedProgram.exercises ?? [],
      createdAt: typeof selectedProgram.created_at === 'string' ? new Date(selectedProgram.created_at) : selectedProgram.created_at,
      updatedAt: typeof selectedProgram.updated_at === 'string' ? new Date(selectedProgram.updated_at) : selectedProgram.updated_at
    });
  };

  const loadProgramExercises = async (programId: string) => {
    try {
      const response = await fetch(`/api/resistance-training/program/${programId}`);
      if (!response.ok) throw new Error('Failed to load program exercises');
      
      const data: APIProgramResponse = await response.json();
      console.log('Loaded program data:', data);
      
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error('Invalid program data: missing weeks array');
      }
      
      const newWeekExercises: { [key: number]: Exercise[] } = {};
      
      data.weeks.forEach((week: APIWeek) => {
        if (!week.days || !Array.isArray(week.days)) {
          console.warn(`Week ${week.weekNumber} has no days array`);
          return;
        }

        const weekExercises: Exercise[] = [];
        week.days.forEach((day: APIDay) => {
          if (!day.exercises || !Array.isArray(day.exercises)) {
            console.warn(`Day ${day.dayNumber} in week ${week.weekNumber} has no exercises array`);
            return;
          }

          day.exercises.forEach((exercise: APIExercise) => {
            console.log('Processing exercise from API:', exercise);
            
            // Create base exercise properties
            const baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> = {
              id: exercise.id || `exercise-${Math.random().toString(36).substr(2, 9)}-day${day.dayNumber}-week${week.weekNumber}`,
              name: exercise.name || exercise.customName || 'Unknown Exercise',
              pairing: exercise.pairing || 'A1',
              sets: exercise.sets.length,
              reps: exercise.sets[0]?.reps || 10,
              load: exercise.sets[0]?.load || 0,
              loadUnit: exercise.sets[0]?.loadUnit || 'lbs',
              tempo: exercise.sets[0]?.tempo || '2010',
              rest: exercise.sets[0]?.rest || 60,
              notes: exercise.notes || '',
              source: exercise.source,
              libraryId: exercise.libraryId,
              userExerciseId: exercise.userExerciseId
            };

            // Check if exercise has varied sets
            const hasVariedSets = exercise.sets.length > 1 && exercise.sets.some((set, idx, arr) => {
              if (idx === 0) return false;
              const prevSet = arr[idx - 1];
              return set.reps !== prevSet.reps || set.load !== prevSet.load || set.tempo !== prevSet.tempo;
            });

            let exerciseData: Exercise;
            if (hasVariedSets) {
              exerciseData = createVariedExercise(baseExercise, exercise.sets.map(set => ({
                setNumber: set.setNumber,
                reps: set.reps,
                load: set.load,
                loadUnit: set.loadUnit,
                tempo: set.tempo,
                rest: set.rest,
                notes: set.notes || ''
              })));
            } else {
              exerciseData = createRegularExercise(baseExercise);
            }

            console.log('Created exercise data:', exerciseData);
            weekExercises.push(exerciseData);
          });
        });

        if (weekExercises.length > 0) {
          newWeekExercises[week.weekNumber] = weekExercises;
        }
      });

      console.log('Transformed week exercises:', newWeekExercises);
      setWeekExercises(newWeekExercises);
      
      // Update program exercises with Week 1 exercises
      if (newWeekExercises[1]) {
        setProgram(prev => ({
          ...prev,
          exercises: newWeekExercises[1]
        }));
      }
    } catch (error) {
      console.error('Error loading program exercises:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load program exercises');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : 0;

  // Fix set parameter typing
  const transformExerciseForSave = (exercise: Exercise, index: number) => {
    if (exercise.isVariedSets) {
      return {
        ...exercise,
        orderIndex: index,
        sets: exercise.setDetails.map((set: SetDetail) => ({
          setNumber: set.setNumber,
          reps: set.reps,
          load: set.load,
          loadUnit: set.loadUnit,
          tempo: set.tempo,
          rest: set.rest,
          notes: set.notes
        }))
      };
    }
    
    // For regular exercises, omit the varied set properties
    const { isVariedSets, isAdvancedSets, setDetails, ...baseExercise } = exercise;
    return {
      ...baseExercise,
      orderIndex: index
    };
  };

  // Fix UserSelector props
  const UserSelectorWrapper = ({ currentUserId, onUserSelect, className }: {
    currentUserId: number;
    onUserSelect: (userId: number | null) => void;
    className?: string;
  }) => (
    <UserSelector
      currentUserId={currentUserId}
      onUserSelect={onUserSelect}
      className={className}
    />
  );

  // Update the remaining sections with proper null checks
  const handleWeekChange = (weekNumber: number) => {
    const settings = program?.progressionRules?.settings;
    if (!settings) return;
    
    const programLength = settings.programLength || 4;
    if (weekNumber < 1 || weekNumber > programLength) return;
    
    setActiveWeek(weekNumber);
  };

  // Update applyProgressionToWeek to handle undefined settings
  const applyProgressionToWeek = (weekNumber: number) => {
    const settings = program?.progressionRules?.settings;
    if (!settings) return;

    const volumeIncrement = settings.volumeIncrementPercentage || 0;
    const loadIncrement = settings.loadIncrementPercentage || 0;

    setWeekExercises(prev => {
      const currentWeekExercises = prev[weekNumber] || [];
      return {
        ...prev,
        [weekNumber]: currentWeekExercises.map(exercise => ({
          ...exercise,
          reps: Math.round(exercise.reps * (1 + volumeIncrement / 100)),
          load: typeof exercise.load === 'number'
            ? Math.round(exercise.load * (1 + loadIncrement / 100) * 100) / 100
            : exercise.load
        }))
      };
    });
  };

  const handleProgramUpdate = (program: SavedProgram) => {
    if (!program.userId) return; // Early return if no userId

    setProgram({
      id: program.id,
      name: program.program_name,
      userId: program.userId,
      phaseFocus: program.phase_focus,
      periodizationType: program.periodization_type,
      progressionRules: program.progression_rules,
      exercises: program.exercises ?? [],
      createdAt: typeof program.created_at === 'string' ? new Date(program.created_at) : program.created_at,
      updatedAt: typeof program.updated_at === 'string' ? new Date(program.updated_at) : program.updated_at
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resistance Training Program Planning</h1>

      {/* UserSelector - show for admin users */}
      {isAdmin && (
        <div className="mb-6">
          <UserSelectorWrapper
            currentUserId={currentUserId}
            onUserSelect={handleUserSelect}
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* Program Browser */}
      <div className="mb-6">
        <ProgramBrowser
          onProgramSelect={handleProgramSelect}
          currentUserId={selectedUserId || currentUserId}
          isAdmin={isAdmin}
        />
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsProgramSettingsExpanded(!isProgramSettingsExpanded)}>
            <h2 className="text-xl font-semibold dark:text-slate-900">Program Settings</h2>
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
              style={{ transform: isProgramSettingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
          {isProgramSettingsExpanded && (
          <ProgramSettings
            name={program.name}
            phaseFocus={program.phaseFocus}
            periodizationType={program.periodizationType}
            progressionRules={{
              type: program.progressionRules.type,
              settings: program.progressionRules.settings ?? {
                volumeIncrementPercentage: 0,
                loadIncrementPercentage: 0,
                programLength: 4,
                weeklyVolumePercentages: [100, 100, 100, 100]
              }
            }}
            onSettingsChange={handleSettingsChange}
          />
          )}
        </div>
      </div>

      {/* Volume Targets - commented out for now */}
      {/*<div className="mb-6">
        <VolumeTargets
          targets={program.volumeTargets}
          onChange={handleVolumeTargetsChange}
        />
      </div>*/}

      {/* Week Tabs */}
      <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Week selection">
          {Array.from(
            { length: program?.progressionRules?.settings?.programLength || 4 },
            (_, i) => i + 1
          ).map((week) => (
            <button
              key={week}
              onClick={() => handleWeekChange(week)}
              className={`
                whitespace-nowrap pb-4 px-4 border-b-2 font-medium text-sm
                ${activeWeek === week
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              Week {week}
            </button>
          ))}
        </nav>
      </div>

      {/* Exercises Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-slate-900">Week {activeWeek} Exercises</h2>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleAddExercise}
          >
            Add Exercise
          </button>
        </div>

        <WeekProgram
          weekNumber={activeWeek}
          exercises={weekExercises[activeWeek] || []}
          onExercisesChange={handleWeekExercisesChange}
          onEdit={handleEditExercise}
          onDelete={handleDeleteExercise}
        />

        {/* Volume Summary */}
        {weekExercises[activeWeek]?.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 dark:text-slate-900">Session Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(calculateSessionVolume(
                weekExercises[activeWeek] || [],
                userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs'
              )).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-600">
                    {key === 'totalLoad' 
                      ? `Total Load: ${value} ${userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs'}`
                      : key === 'totalSets'
                      ? `Total Sets: ${value}`
                      : key === 'totalReps'
                      ? `Total Reps: ${value}`
                      : `${key}: ${value}`
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanPageContent;