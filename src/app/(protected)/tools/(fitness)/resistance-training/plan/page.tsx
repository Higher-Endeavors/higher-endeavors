'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
// import ExerciseList from './components/ExerciseList';
import ExerciseModal from './components/AddExerciseModal';
import ExerciseSearch from './components/ExerciseSearch';
import ProgramSettings from './components/ProgramSettings';
import VolumeTargets from './components/VolumeTargets';
import WeekProgram from './components/WeekProgram';
import { Program, Exercise, VolumeTarget, PhaseFocus, PeriodizationType } from '../shared/types';
import { calculateSessionVolume, calculateSessionDuration, applyLinearProgression } from '../shared/utils/calculations';
import type { z } from 'zod';
import { programSettingsSchema } from '../shared/schemas/program';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import UserSelector from '@/app/components/UserSelector';
import { useSession, SessionProvider } from 'next-auth/react';
import ProgramBrowser from './components/ProgramBrowser';

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

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
        volumeIncrementPercentage: 5,
        loadIncrementPercentage: 2.5,
        programLength: 4,
        weeklyVolumePercentages: [100, 80, 90, 60]
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
  const [exerciseLibrary, setExerciseLibrary] = useState<Array<{ id: number; name: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isProgramSettingsExpanded, setIsProgramSettingsExpanded] = useState(true);
  const [currentExercise, setCurrentExercise] = useState<Exercise | undefined>();
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
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
        
        // Map the data to ensure all required fields are present
        const formattedData = data.map((exercise: any) => ({
          id: exercise.id,
          exercise_name: exercise.exercise_name || 'Unknown Exercise',
          difficulty_id: exercise.difficulty_id || 1,
          target_muscle_group_id: exercise.target_muscle_group_id || 1,
          prime_mover_muscle_id: exercise.prime_mover_muscle_id || 1,
          exercise_type: exercise.exercise_type || 'strength',
          description: exercise.description || '',
          instructions: exercise.instructions || '',
          tips: exercise.tips || '',
          video_url: exercise.video_url || '',
          image_url: exercise.image_url || ''
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

    return exercises.map((exercise, index) => {
      if (exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')) {
        return exercise;
      }

      // Start a new group if this is the first exercise or if previous exercise was in a different group
      if (index === 0 || (exercises[index - 1].pairing.charAt(0) !== currentGroup)) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0));
        currentNumber = 1;
      }

      const newPairing = `${currentGroup}${currentNumber}`;
      currentNumber = currentNumber === 1 ? 2 : 1;
      if (currentNumber === 1) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
      }

      return { ...exercise, pairing: newPairing };
    });
  };

  // Exercise management
  const handleAddExercise = () => {
    setEditingExercise({
      id: `exercise-${Math.random().toString(36).substr(2, 9)}-day1`,
      name: '',
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60,
      isVariedSets: false,
      isAdvancedSets: false,
      notes: '',
      source: 'library',
      libraryId: null,
      userExerciseId: null,
      customName: '',
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'lbs'
    });
    setSelectedExerciseName('');
    setIsExerciseModalOpen(true);
  };

  const handleExerciseSelect = (exerciseName: string) => {
    setSelectedExerciseName(exerciseName);
    setIsExerciseSearchOpen(false);
    setIsAdvancedSearchOpen(false);
    
    // Find the selected exercise in the library
    const selectedLibraryExercise = exerciseLibrary.find(ex => ex.exercise_name === exerciseName);
    console.log('Selected library exercise:', selectedLibraryExercise);
    
    if (editingExercise && selectedLibraryExercise) {
      const updatedExercise = {
        ...editingExercise,
        name: exerciseName,
        source: 'library',
        libraryId: selectedLibraryExercise.id,
        customName: undefined
      };
      console.log('Updated exercise data:', updatedExercise);
      setEditingExercise(updatedExercise);
    }
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
    if (exercise) {
      console.log('Editing exercise:', exercise);
      setEditingExercise({
        ...exercise,
        // Keep the original ID intact
        id: id
      });
      setSelectedExerciseName(exercise.name);
      setIsExerciseModalOpen(true);
    }
  };

  const handleSaveExercise = (exercise: Exercise) => {
    console.log('Received exercise data in handleSaveExercise:', exercise);
    
    // Get the base ID without any week suffix
    const baseId = exercise.id.split('-week')[0];
    const isEditing = editingExercise !== undefined;
    
    // When editing, use the original exercise's base ID
    const editingBaseId = isEditing ? editingExercise.id.split('-week')[0] : null;
    
    // Find the library exercise to ensure we have the correct ID
    const libraryExercise = exerciseLibrary.find(ex => ex.exercise_name === exercise.name);
    console.log('Found library exercise:', libraryExercise);
    
    // Ensure sets is a number and exercise data is properly formatted
    const exerciseWithNumberSets = {
      ...exercise,
      sets: typeof exercise.sets === 'number' ? exercise.sets : exercise.setDetails?.length || 3,
      source: 'library',
      libraryId: libraryExercise?.id,
      customName: undefined,
      name: exercise.name || '',
      loadUnit: exercise.loadUnit || userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit || 'lbs',
      // When editing, maintain the original base ID
      id: isEditing ? editingBaseId : baseId
    };

    console.log('Formatted exercise data:', exerciseWithNumberSets);

    // If this is Week 1, update program exercises and mirror to all weeks
    if (activeWeek === 1) {
      // Update program exercises
      setProgram((prev: Program) => {
        const existingExercise = prev.exercises.find(ex => 
          isEditing ? ex.id === editingBaseId : ex.id === baseId
        );
        const updatedExercises = existingExercise 
          ? prev.exercises.map(ex => 
              isEditing ? (ex.id === editingBaseId ? { ...exerciseWithNumberSets } : ex)
                       : (ex.id === baseId ? { ...exerciseWithNumberSets } : ex)
            )
          : [...prev.exercises, { ...exerciseWithNumberSets }];
        
        return {
          ...prev,
          exercises: updatedExercises
        };
      });

      // Update all weeks
      setWeekExercises(prev => {
        const newWeekExercises = { ...prev };
        const programLength = program.progressionRules.settings.programLength || 4;
        
        // Update Week 1
        const existingExerciseWeek1 = prev[1]?.find(ex => 
          isEditing ? ex.id === editingBaseId : ex.id === baseId
        );
        newWeekExercises[1] = prev[1] ? (
          existingExerciseWeek1
            ? prev[1].map(ex => 
                isEditing ? (ex.id === editingBaseId ? { ...exerciseWithNumberSets } : ex)
                         : (ex.id === baseId ? { ...exerciseWithNumberSets } : ex)
              )
            : [...prev[1], { ...exerciseWithNumberSets }]
        ) : [{ ...exerciseWithNumberSets }];

        // Mirror Week 1's exercises to all other weeks with progression applied
        for (let week = 2; week <= programLength; week++) {
          const weekId = isEditing 
            ? `${editingBaseId}-week${week}`
            : `${baseId}-week${week}`;
          
          const existingExerciseWeekN = prev[week]?.find(ex => 
            isEditing ? ex.id === `${editingBaseId}-week${week}` : ex.id === weekId
          );
          
          const weekExercise = {
            ...exerciseWithNumberSets,
            id: weekId,
            ...(program.periodizationType === 'Linear' 
              ? applyLinearProgression(
                  exerciseWithNumberSets,
                  week,
                  program.progressionRules.settings.volumeIncrementPercentage ?? 0,
                  program.progressionRules.settings.loadIncrementPercentage ?? 0
                )
              : {})
          };

          newWeekExercises[week] = prev[week] ? (
            existingExerciseWeekN
              ? prev[week].map(ex => 
                  isEditing ? (ex.id === `${editingBaseId}-week${week}` ? weekExercise : ex)
                           : (ex.id === weekId ? weekExercise : ex)
                )
              : [...prev[week], weekExercise]
          ) : [weekExercise];
        }
        
        return newWeekExercises;
      });
    } else {
      // This is an edit to a week other than Week 1, only update that specific week
      setWeekExercises(prev => {
        const newWeekExercises = { ...prev };
        const weekId = isEditing 
          ? `${editingBaseId}-week${activeWeek}`
          : `${baseId}-week${activeWeek}`;
        
        const existingExercise = prev[activeWeek]?.find(ex => 
          isEditing ? ex.id === editingExercise.id : ex.id === exercise.id
        );
        
        newWeekExercises[activeWeek] = prev[activeWeek] ? (
          existingExercise
            ? prev[activeWeek].map(ex => 
                isEditing ? (ex.id === editingExercise.id ? { ...exerciseWithNumberSets, id: weekId } : ex)
                         : (ex.id === exercise.id ? { ...exerciseWithNumberSets, id: weekId } : ex)
              )
            : [...prev[activeWeek], { ...exerciseWithNumberSets, id: weekId }]
        ) : [{ ...exerciseWithNumberSets, id: weekId }];
        
        return newWeekExercises;
      });
    }

    setIsExerciseModalOpen(false);
    setEditingExercise(undefined);
  };

  const handleDeleteExercise = (id: string) => {
    // Get the base ID (remove week suffix if present)
    const baseId = id.split('-week')[0];

    // Remove from program exercises
    setProgram(prev => ({
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
    const newProgram = {
      ...program,
      ...settings,
      // Ensure periodization type is explicitly updated
      periodizationType: settings.periodizationType || program.periodizationType,
      progressionRules: {
        ...program.progressionRules,
        type: settings.periodizationType || program.progressionRules.type, // Update progression rules type to match
        settings: settings.progressionRules ? {
          ...program.progressionRules.settings,
          ...settings.progressionRules.settings
        } : program.progressionRules.settings
      }
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

  // Volume targets management
  const handleVolumeTargetsChange = (targets: VolumeTarget[]) => {
    setProgram(prev => ({
      ...prev,
      volumeTargets: targets
    }));
  };

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
  const handleAdvancedSearchSelect = (exerciseName: string) => {
    handleExerciseSelect(exerciseName);
  };

  // Watch for program length changes
  useEffect(() => {
    const programLength = program.progressionRules.settings.programLength || 4;
    const volumeIncrement = program.progressionRules.settings.volumeIncrementPercentage ?? 0;
    const loadIncrement = program.progressionRules.settings.loadIncrementPercentage ?? 0;
    const weeklyVolumePercentages = program.progressionRules.settings.weeklyVolumePercentages ?? [100, 80, 90, 60];
    
    console.log('Program settings:', {
      programLength,
      volumeIncrement,
      loadIncrement,
      weeklyVolumePercentages,
      periodizationType: program.periodizationType
    });
    
    // If active week is beyond the new program length, set it to the last week
    if (activeWeek > programLength) {
      setActiveWeek(programLength);
    }
    
    // Update week exercises
    setWeekExercises(prev => {
      const newWeekExercises = { ...prev };

      // Ensure we have entries for all weeks
      for (let i = 1; i <= programLength; i++) {
        if (!newWeekExercises[i]) {
          // For week 1, use program.exercises
          if (i === 1) {
            newWeekExercises[1] = program.exercises;
          } else {
            // For other weeks, apply progression based on the type
            if (program.periodizationType === 'Linear') {
              console.log(`Applying Linear progression for week ${i}:`, {
                volumeIncrement,
                loadIncrement
              });
              
              newWeekExercises[i] = program.exercises.map(exercise => ({
                ...applyLinearProgression(
                  exercise,
                  i,
                  volumeIncrement,
                  loadIncrement
                ),
                id: `${exercise.id}-week${i}`
              }));
            } else if (program.periodizationType === 'Undulating') {
              const weekPercentage = weeklyVolumePercentages[i - 1] ?? 100;
              console.log(`Applying Undulating progression for week ${i}:`, {
                weekPercentage,
                weeklyVolumePercentages
              });
              
              // Apply the weekly volume percentage to each exercise
              newWeekExercises[i] = program.exercises.map(exercise => {
                const volumePercentage = weekPercentage / 100;
                const newReps = Math.max(1, Math.round(exercise.reps * volumePercentage));
                return {
                  ...exercise,
                  id: `${exercise.id}-week${i}`,
                  reps: newReps
                };
              });
            } else {
              // For other periodization types, just copy Week 1
              newWeekExercises[i] = program.exercises.map(exercise => ({
                ...exercise,
                id: `${exercise.id}-week${i}`
              }));
            }
          }
        }
      }

      // Remove entries for weeks that no longer exist
      Object.keys(newWeekExercises).forEach(week => {
        if (Number(week) > programLength) {
          delete newWeekExercises[Number(week)];
        }
      });

      return newWeekExercises;
    });
  }, [program.progressionRules.settings.programLength, program.exercises, program.periodizationType, program.progressionRules.settings.volumeIncrementPercentage, program.progressionRules.settings.loadIncrementPercentage, program.progressionRules.settings.weeklyVolumePercentages, activeWeek]);

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
          volumeIncrementPercentage: 5,
          loadIncrementPercentage: 2.5,
          programLength: 4,
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
    console.log('Selected program:', selectedProgram);
    // Set program state with default values for missing fields
    setProgram({
      id: selectedProgram.id,
      userId: selectedProgram.userId || '',
      name: selectedProgram.program_name, // Use program_name from database
      phaseFocus: selectedProgram.phase_focus || 'GPP', // Use phase_focus from database
      periodizationType: selectedProgram.periodization_type, // Remove default to preserve custom types
      exercises: [], // We'll load these separately
      progressionRules: {
        type: selectedProgram.periodization_type, // Use the same type without default
        settings: selectedProgram.progression_rules?.settings || {
          volumeIncrementPercentage: 5,
          loadIncrementPercentage: 2.5,
          programLength: 4,
          weeklyVolumePercentages: [100, 80, 90, 60]
        }
      },
      volumeTargets: selectedProgram.volume_targets || [],
      createdAt: new Date(selectedProgram.created_at),
      updatedAt: new Date(selectedProgram.updated_at)
    });

    // Load program weeks and exercises
    loadProgramExercises(selectedProgram.id);
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
            const libraryExercise = exerciseLibrary.find(ex => ex.id === exercise.libraryId);
            console.log('Found library exercise:', libraryExercise);
            
            if (!libraryExercise) {
              console.warn(`Could not find library exercise with ID ${exercise.libraryId}`);
            }
            
            const exerciseData = {
              id: exercise.id || `exercise-${Math.random().toString(36).substr(2, 9)}-day${day.dayNumber}-week${week.weekNumber}`,
              name: libraryExercise?.exercise_name || exercise.name || exercise.customName || 'Unknown Exercise',
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

      <div className="mb-6">
        <VolumeTargets
          targets={program.volumeTargets}
          onChange={handleVolumeTargetsChange}
        />
      </div>

      {/* Week Tabs */}
      <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Week selection">
          {Array.from(
            { length: program.progressionRules.settings.programLength || 4 },
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
        onSelect={handleExerciseSelect}
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