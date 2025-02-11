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
import { Program, Exercise, VolumeTarget, PhaseFocus, PeriodizationType, ProgressionRules } from '../shared/types';
import { calculateSessionVolume, calculateSessionDuration, applyLinearProgression } from '../shared/utils/calculations';
import type { z } from 'zod';
import { programSettingsSchema } from '../shared/schemas/program';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import UserSelector from '@/app/components/UserSelector';
import { useSession, SessionProvider } from 'next-auth/react';
import ProgramBrowser from './components/ProgramBrowser';
import { type Exercise as ExerciseType } from '../shared/schemas/exercise';
import { RegularExercise, VariedExercise, createRegularExercise, createVariedExercise, BaseExercise } from '../shared/types/exercise.types';

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

// Import or define SavedProgram type
interface SavedProgram {
  id: string;
  userId: string;
  program_name: string;
  phase_focus: PhaseFocus;
  periodization_type: PeriodizationType;
  progression_rules: ProgressionRules;
  volumeTargets?: VolumeTarget[];
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

// Helper function to convert SavedProgram to Program
const convertSavedProgramToProgram = (savedProgram: SavedProgram): Program => ({
  id: savedProgram.id,
  userId: savedProgram.userId,
  name: savedProgram.program_name,
  phaseFocus: savedProgram.phase_focus,
  periodizationType: savedProgram.periodization_type,
  progressionRules: savedProgram.progression_rules,
  volumeTargets: savedProgram.volumeTargets || [],
  exercises: savedProgram.exercises || [],
  createdAt: new Date(savedProgram.created_at),
  updatedAt: new Date(savedProgram.updated_at)
});

// Helper function to convert Program to SavedProgram
const convertProgramToSaved = (program: Program): SavedProgram => ({
  id: program.id,
  userId: program.userId,
  program_name: program.name,
  phase_focus: program.phaseFocus,
  periodization_type: program.periodizationType,
  progression_rules: program.progressionRules,
  volumeTargets: program.volumeTargets,
  exercises: program.exercises,
  created_at: program.createdAt.toISOString(),
  updated_at: program.updatedAt.toISOString()
});

// Import or define ExerciseOption type
interface ExerciseOption {
  id: string;
  value: string;
  label: string;
  libraryId?: number;
  data: {
    id: string;
    name: string;
    source: 'user' | 'library';
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
  const [editingExercise, setEditingExercise] = useState<RegularExercise | null>(null);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isProgramSettingsExpanded, setIsProgramSettingsExpanded] = useState(true);
  const [currentExercise, setCurrentExercise] = useState<ExerciseType | undefined>();
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<RegularExercise | null>(null);
  const [activeExercise, setActiveExercise] = useState<ExerciseType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [weekExercises, setWeekExercises] = useState<{ [key: number]: ExerciseType[] }>({});
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
    setActiveExercise(draggedExercise || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveExercise(null);
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
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0));
        currentNumber = 1;
      }

      const newPairing = `${currentGroup}${currentNumber}`;
      currentNumber = currentNumber === 1 ? 2 : 1;
      if (currentNumber === 1) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
      }

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
    const baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> = {
      id: `exercise-${Math.random().toString(36).substr(2, 9)}-day1`,
      name: '',
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60,
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'lbs',
      notes: '',
      source: 'custom' as const
    };
    
    const newExercise = createRegularExercise(baseExercise);
    setEditingExercise(newExercise);
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
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'lbs',
      notes: '',
      source: 'library' as const,
      libraryId: exercise.libraryId
    };
    
    const newExercise = createRegularExercise(baseExercise);
    setSelectedExercise(newExercise);
    setIsAdvancedSearchOpen(false);
  };

  const getNextPairing = (): string => {
    const exercises = program.exercises.filter(
      ex => !ex.pairing.startsWith('WU') && !ex.pairing.startsWith('CD')
    );
    if (exercises.length === 0) return 'A1';

    const lastPairing = exercises[exercises.length - 1].pairing;
    const letter = lastPairing.charAt(0);
    const number = parseInt(lastPairing.charAt(1));

    if (number === 2) {
      return String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
    }
    return letter + '2';
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
    
    // Get the base ID without any week suffix
    const baseId = formattedExercise.id.split('-week')[0];
    const isEditing = editingExercise !== undefined;
    
    // When editing, use the original exercise's base ID
    const editingBaseId = isEditing ? editingExercise.id.split('-week')[0] : null;
    
    // Find the library exercise to ensure we have the correct ID
    const libraryExercise = exerciseLibrary.find(ex => ex.label === formattedExercise.name);
    console.log('Found library exercise:', libraryExercise);
    
    // Update program exercises
    setProgram(prev => {
      const updatedExercises = [...prev.exercises];
      const existingIndex = updatedExercises.findIndex(ex => 
        ex.id.split('-week')[0] === (isEditing ? editingBaseId : baseId)
      );

      if (existingIndex >= 0) {
        updatedExercises[existingIndex] = formattedExercise;
      } else {
        updatedExercises.push(formattedExercise);
      }

      const defaultProgressionRules = {
        type: 'None' as const,
        settings: {
          programLength: 4,
          volumeIncrementPercentage: 0,
          loadIncrementPercentage: 0
        }
      };

      return {
        id: prev.id || '',
        userId: prev.userId || '',
        name: prev.name || '',
        exercises: updatedExercises,
        phaseFocus: prev.phaseFocus as PhaseFocus,
        periodizationType: prev.periodizationType as PeriodizationType,
        progressionRules: prev.progressionRules || defaultProgressionRules,
        volumeTargets: prev.volumeTargets || [],
        createdAt: prev.createdAt || new Date(),
        updatedAt: new Date()
      };
    });

    // Update week exercises if needed
    if (activeWeek) {
      setWeekExercises(prev => {
        const updatedWeekExercises = { ...prev };
        const weekExercises = updatedWeekExercises[activeWeek] || [];
        const existingIndex = weekExercises.findIndex(ex => 
          ex.id.split('-week')[0] === (isEditing ? editingBaseId : baseId)
        );

        if (existingIndex >= 0) {
          weekExercises[existingIndex] = formattedExercise;
        } else {
          weekExercises.push(formattedExercise);
        }

        updatedWeekExercises[activeWeek] = weekExercises;
        return updatedWeekExercises;
      });
    }

    setEditingExercise(undefined);
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
      name: program.name || '',  // Ensure name is never undefined
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
            return {
              dayNumber: parseInt(dayNumber),
              dayName: `Day ${dayNumber}`,
              notes: '',
              exercises: exercises.map((exercise, index) => {
                console.log(`Processing exercise at index ${index}:`, exercise);
                return {
                  source: 'library',  // Force library source
                  libraryId: exercise.libraryId,  // Use library ID directly
                  userExerciseId: null,  // Clear user exercise ID
                  customName: undefined,  // Clear custom name for library exercises
                  pairing: exercise.pairing,
                  notes: exercise.notes || '',
                  orderIndex: index,
                  sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
                    setNumber: setIndex + 1,
                    reps: exercise.reps,
                    load: exercise.load,
                    loadUnit: exercise.loadUnit || 'lbs',
                    rest: exercise.rest || 60,
                    tempo: exercise.tempo || '2010',
                    notes: ''
                  }))
                };
              })
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
        program_name: program.name.trim(),
        periodization_type: program.periodizationType,
        phase_focus: program.phaseFocus,
        progression_rules: program.progressionRules,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (weeks.length * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        notes: '',
        weeks,
        userId: selectedUserId || parseInt(session?.user?.id)
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
    console.log('Page - Received exercise from search:', exercise);
    
    // Transform the exercise data
    const transformedExercise = {
      id: `${exercise.data.source}-${exercise.data.id}-${Date.now()}`, // Ensure unique ID
      name: exercise.data.name,
      pairing: getNextPairing(),
      sets: 3, // Default values
      reps: 10,
      load: 0,
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'lbs',
      tempo: '2010',
      rest: 60,
      isVariedSets: false as const,
      isAdvancedSets: false,
      notes: '',
      setDetails: undefined
    };

    console.log('Page - Transformed exercise:', transformedExercise);
    
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
  const handleWeekExercisesChange = (exercises: ExerciseType[]) => {
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
    const program = convertSavedProgramToProgram(selectedProgram);
    setProgram(program);
    setActiveWeek(1);
    if (program.id) {
      loadProgramExercises(program.id);
    }
  };

  const loadProgramExercises = async (programId: string) => {
    try {
      // Ensure we have the exercise library
      if (exerciseLibrary.length === 0) {
        throw new Error('Exercise library not loaded');
      }

      const response = await fetch(`/api/resistance-training/program/${programId}`);
      if (!response.ok) throw new Error('Failed to load program exercises');
      
      const data = await response.json();
      console.log('Loaded program data:', data);
      
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error('Invalid program data: missing weeks array');
      }
      
      // Transform the data into our week exercises format
      const newWeekExercises: { [key: number]: ExerciseType[] } = {};
      
      data.weeks.forEach((week: any) => {
        if (!week.days || !Array.isArray(week.days)) {
          console.warn(`Week ${week.weekNumber} has no days array`);
          return;
        }

        const weekExercises: ExerciseType[] = [];
        week.days.forEach((day: any) => {
          if (!day.exercises || !Array.isArray(day.exercises)) {
            console.warn(`Day ${day.dayNumber} in week ${week.weekNumber} has no exercises array`);
            return;
          }

          day.exercises.forEach((exercise: any) => {
            console.log('Processing exercise:', exercise);
            
            // Handle both formats - exercises with sets array and exercises with just sets number
            let setDetails;
            if (Array.isArray(exercise.sets)) {
              setDetails = exercise.sets;
            } else {
              // Create sets array from the exercise properties
              setDetails = Array.from({ length: exercise.sets || 3 }, (_, i) => ({
                setNumber: i + 1,
                reps: exercise.reps || 0,
                load: exercise.load || 0,
                loadUnit: exercise.loadUnit || 'lbs',
                tempo: exercise.tempo || '2010',
                rest: exercise.rest || 60,
                notes: ''
              }));
            }
            
            // Find the exercise in the library
            const libraryExercise = exerciseLibrary.find(ex => ex.label === exercise.name);
            console.log('Found library exercise:', libraryExercise);
            
            if (!libraryExercise) {
              console.warn(`Could not find library exercise with ID ${exercise.libraryId}`);
            }
            
            const exerciseData = {
              id: exercise.id || `exercise-${Math.random().toString(36).substr(2, 9)}-day${day.dayNumber}-week${week.weekNumber}`,
              name: libraryExercise?.label || exercise.name || exercise.customName || 'Unknown Exercise',
              pairing: exercise.pairing || 'A1',
              sets: setDetails.length,
              reps: exercise.reps || setDetails[0]?.reps || 0,
              load: exercise.load || setDetails[0]?.load || 0,
              loadUnit: exercise.loadUnit || setDetails[0]?.loadUnit || 'lbs',
              tempo: exercise.tempo || setDetails[0]?.tempo || '2010',
              rest: exercise.rest || setDetails[0]?.rest || 60,
              notes: exercise.notes || '',
              source: 'library',
              libraryId: exercise.libraryId || exercise.id, // Handle both libraryId and id
              userExerciseId: null,
              customName: undefined,
              isVariedSets: false,
              isAdvancedSets: false,
              setDetails: setDetails
            };
            
            console.log('Created exercise data:', exerciseData);
            weekExercises.push(exerciseData);
          });
        });

        if (weekExercises.length > 0) {
          newWeekExercises[week.weekNumber] = weekExercises;
        }
      });

      console.log('Transformed week exercises:', newWeekExercises);
      
      if (Object.keys(newWeekExercises).length === 0) {
        throw new Error('No exercises were loaded');
      }

      setWeekExercises(newWeekExercises);
      
      // Also update the program exercises with Week 1 exercises
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resistance Training Program Planning</h1>

      {/* UserSelector - show for admin users */}
      {isAdmin && (
        <div className="mb-6">
          <UserSelector
            onUserSelect={handleUserSelect}
            currentUserId={parseInt(session?.user?.id)}
            label="Select Client"
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* Program Browser */}
      <div className="mb-6">
        <ProgramBrowser
          onProgramSelect={handleProgramSelect}
          currentUserId={selectedUserId || parseInt(session?.user?.id)}
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
        userSettings={userSettings?.pillar_settings}
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