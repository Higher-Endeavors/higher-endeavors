'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
// import ExerciseList from './components/ExerciseList';
import ExerciseModal from './components/AddExerciseModal';
import ExerciseSearch from './components/ExerciseSearch';
import ProgramSettings from './components/ProgramSettings';
// import VolumeTargets from './components/VolumeTargets';
import WeekProgram from './components/WeekProgram';
import { Program, VolumeTarget, PhaseFocus, PeriodizationType, ProgressionRules, LoadUnit } from '../shared/types';
import { calculateSessionVolume, calculateSessionDuration, applyLinearProgression } from '../shared/utils/calculations';
import type { z } from 'zod';
import { programSettingsSchema } from '../shared/schemas/program';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import UserSelector from '@/app/components/UserSelector';
import { useSession } from 'next-auth/react';
import ProgramBrowser from './components/ProgramBrowser';
import {
  Exercise,
  BaseExercise,
  RegularExercise,
  VariedExercise,
  createRegularExercise,
  createVariedExercise,
  getNextPairing,
  type SetDetail
} from '../shared/types/exercise.types';
import type { SavedProgram } from '../shared/types';
import type { FitnessSettings } from '@/app/lib/types/userSettings';

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

// Import or define ExerciseOption type
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

const ExerciseListNoSSR = dynamic(
    () => import('./components/ExerciseList'),
    { ssr: false }
  )

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
    id: '',
    userId: '',
    name: '',
    phaseFocus: 'GPP',
    periodizationType: 'None',
    exercises: [],
    progressionRules: {
      type: 'None',
      settings: {
        programLength: 4,
        volumeIncrementPercentage: 0,
        loadIncrementPercentage: 0
      }
    },
    volumeTargets: [],
    createdAt: new Date(),
    updatedAt: new Date()
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
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'kg',
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
    console.log('Settings change received:', settings);
    
    // Create the new program state
    const newProgram: Program = {
      ...program,
      periodizationType: (settings.periodizationType || program.periodizationType) as PeriodizationType,
      phaseFocus: (settings.phaseFocus || program.phaseFocus) as PhaseFocus,
      progressionRules: {
        ...program.progressionRules,
        type: (settings.periodizationType || program.progressionRules.type) as PeriodizationType,
        settings: settings.progressionRules ? {
          ...program.progressionRules.settings,
          ...settings.progressionRules.settings
        } : program.progressionRules.settings
      },
      name: settings.name || program.name || '',  // Update name from settings if provided
      userId: program.userId || '',  // Ensure userId is never undefined
      exercises: program.exercises,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      volumeTargets: program.volumeTargets
    };

    console.log('Updated program state:', {
      oldType: program.periodizationType,
      newType: newProgram.periodizationType,
      progressionRules: newProgram.progressionRules
    });

    setProgram(newProgram);

    // If periodization type changed, update week exercises accordingly
    if (settings.periodizationType && settings.periodizationType !== program.periodizationType) {
      console.log('Periodization type changed, updating week exercises');
      setWeekExercises(prev => {
        const newWeekExercises = { ...prev };
        const programLength = newProgram.progressionRules.settings.programLength || 4;
        
        // Keep Week 1 as is
        if (!newWeekExercises[1]) return newWeekExercises;

        // Update subsequent weeks based on new periodization type
        for (let week = 2; week <= programLength; week++) {
          if (settings.periodizationType === 'Linear') {
            newWeekExercises[week] = newWeekExercises[1].map(exercise => ({
              ...applyLinearProgression(
                exercise,
                week,
                newProgram.progressionRules.settings.volumeIncrementPercentage ?? 0,
                newProgram.progressionRules.settings.loadIncrementPercentage ?? 0
              ),
              id: `${exercise.id.split('-week')[0]}-week${week}`
            }));
          } else if (settings.periodizationType === 'Undulating') {
            const weeklyVolumePercentages = newProgram.progressionRules.settings.weeklyVolumePercentages ?? [100, 80, 90, 60];
            const weekPercentage = weeklyVolumePercentages[week - 1] ?? 100;
            newWeekExercises[week] = newWeekExercises[1].map(exercise => {
              const volumePercentage = weekPercentage / 100;
              const newReps = Math.max(1, Math.round(exercise.reps * volumePercentage));
              return {
                ...exercise,
                id: `${exercise.id.split('-week')[0]}-week${week}`,
                reps: newReps
              };
            });
          } else {
            // For 'None' or other types, just copy Week 1
            newWeekExercises[week] = newWeekExercises[1].map(exercise => ({
              ...exercise,
              id: `${exercise.id.split('-week')[0]}-week${week}`
            }));
          }
        }
        return newWeekExercises;
      });
    }
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
        { length: program.progressionRules.settings.programLength || 4 },
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
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'kg',
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
          [activeWeek]: program.exercises || []
        };
      }

      // Apply progression based on program type and settings
      const baseExercises = program.exercises || [];
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
        
        const programLength = program.progressionRules.settings.programLength || 4;
        const weeklyVolumePercentages = program.progressionRules.settings.weeklyVolumePercentages ?? [100, 80, 90, 60];

        for (let week = 2; week <= programLength; week++) {
          if (program.periodizationType === 'Linear') {
            newWeekExercises[week] = exercises.map(exercise => ({
              ...applyLinearProgression(
                exercise,
                week,
                program.progressionRules.settings.volumeIncrementPercentage ?? 0,
                program.progressionRules.settings.loadIncrementPercentage ?? 0
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
      phaseFocus: 'GPP',
      periodizationType: 'None',
      exercises: [],
      progressionRules: {
        type: 'None',
        settings: {
          programLength: 4,
          volumeIncrementPercentage: 0,
          loadIncrementPercentage: 0
        }
      },
      volumeTargets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setWeekExercises({});
  };

  const handleProgramSelect = (selectedProgram: SavedProgram) => {
    console.log('Selected program:', selectedProgram);
    const program: Program = {
      id: selectedProgram.id,
      userId: selectedProgram.userId,
      name: selectedProgram.program_name,
      phaseFocus: selectedProgram.phase_focus || 'GPP',
      periodizationType: selectedProgram.periodization_type || 'None',
      progressionRules: selectedProgram.progression_rules || {
        type: 'None',
        settings: {
          programLength: 4,
          volumeIncrementPercentage: 0,
          loadIncrementPercentage: 0
        }
      },
      volumeTargets: selectedProgram.volumeTargets || [],
      exercises: selectedProgram.exercises || [],
      createdAt: new Date(selectedProgram.created_at),
      updatedAt: new Date(selectedProgram.updated_at)
    };
    console.log('Transformed program:', program);
    setProgram(program);
    setActiveWeek(1);
    if (program.id) {
      loadProgramExercises(program.id);
    }
  };

  const loadProgramExercises = async (programId: string) => {
    try {
      const response = await fetch(`/api/resistance-training/program/${programId}`);
      if (!response.ok) throw new Error('Failed to load program exercises');
      
      const data = await response.json();
      console.log('Loaded program data:', data);
      
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error('Invalid program data: missing weeks array');
      }
      
      const newWeekExercises: { [key: number]: Exercise[] } = {};
      
      data.weeks.forEach((week: any) => {
        if (!week.days || !Array.isArray(week.days)) {
          console.warn(`Week ${week.weekNumber} has no days array`);
          return;
        }

        const weekExercises: Exercise[] = [];
        week.days.forEach((day: any) => {
          if (!day.exercises || !Array.isArray(day.exercises)) {
            console.warn(`Day ${day.dayNumber} in week ${week.weekNumber} has no exercises array`);
            return;
          }

          day.exercises.forEach((exercise: any) => {
            console.log('Processing exercise from API:', exercise);
            
            // Create base exercise properties
            const baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> = {
              id: exercise.id || `exercise-${Math.random().toString(36).substr(2, 9)}-day${day.dayNumber}-week${week.weekNumber}`,
              name: exercise.name || exercise.customName || 'Unknown Exercise',
              pairing: exercise.pairing || 'A1',
              sets: Array.isArray(exercise.sets) ? exercise.sets.length : 3,
              reps: exercise.sets?.[0]?.reps || 10,
              load: exercise.sets?.[0]?.load || 0,
              loadUnit: exercise.sets?.[0]?.loadUnit || 'lbs',
              tempo: exercise.sets?.[0]?.tempo || '2010',
              rest: exercise.sets?.[0]?.rest || 60,
              notes: exercise.notes || '',
              source: exercise.source || 'library',
              libraryId: exercise.libraryId,
              userExerciseId: exercise.userExerciseId || null
            };

            // Check if exercise has varied sets
            const hasVariedSets = Array.isArray(exercise.sets) && exercise.sets.some((set: any, idx: number, arr: any[]) => {
              if (idx === 0) return false;
              const prevSet = arr[idx - 1];
              return set.reps !== prevSet.reps || set.load !== prevSet.load || set.tempo !== prevSet.tempo;
            });

            let exerciseData: Exercise;
            if (hasVariedSets) {
              exerciseData = createVariedExercise(baseExercise, exercise.sets.map((set: any) => ({
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

  // Fix ProgramBrowser props and types
  interface SavedProgramWithOptional extends Omit<SavedProgram, 'phase_focus' | 'progression_rules'> {
    phase_focus?: SavedProgram['phase_focus'];
    progression_rules?: SavedProgram['progression_rules'];
  }

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
          onProgramSelect={(program: SavedProgramWithOptional) => handleProgramSelect(program as SavedProgram)}
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
              progressionRules={program.progressionRules}
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
              onClick={() => setActiveWeek(week)}
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
                weekExercises[activeWeek],
                userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'kg'
              )).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-600">
                    {key === 'totalLoad' 
                      ? `Total Load: ${value} ${userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'kg'}`
                      : key === 'totalSets'
                      ? `Total Sets: ${value}`
                      : key === 'totalReps'
                      ? `Total Reps: ${value}`
                      : `${key}: ${value}`}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-sm text-gray-600">
                  Duration: {calculateSessionDuration(weekExercises[activeWeek])} min
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 font-medium"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Program'}
        </button>
      </div>

      {showSuccessToast && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
          <p>Program saved successfully!</p>
        </div>
      )}

      {showErrorToast && (
        <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
          <p>{errorMessage || 'Failed to save program. Please try again later.'}</p>
        </div>
      )}

      {/* Exercise Modals */}
      <ExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        exercise={editingExercise}
        exercises={weekExercises[activeWeek] || []}
        onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
        selectedExerciseName={selectedExerciseName}
        userSettings={{ fitness: userSettings?.pillar_settings?.fitness }}
      />

      <ExerciseSearch
        isOpen={isExerciseSearchOpen || isAdvancedSearchOpen}
        onClose={() => {
          setIsExerciseSearchOpen(false);
          setIsAdvancedSearchOpen(false);
        }}
        onSelect={handleAdvancedSearchSelect}
      />

      {mounted && activeExercise && createPortal(
        <DragOverlay>
          <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
            {activeExercise.name}
          </div>
        </DragOverlay>,
        document.body
      )}
    </div>
  );
}

export default PlanPageContent;