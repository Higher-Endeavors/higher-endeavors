'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AddExerciseModal from './ExerciseModals/AddExerciseModal';
import ExerciseSearch from './ExerciseModals/ExerciseSearch';
import ProgramSettings, { ProgramSettingsFormData } from './components/ProgramContainer/ProgramSettings';
import WeekProgram from './components/WeekProgram';
import { z } from 'zod';
import { KG_TO_LBS, LBS_TO_KG } from '@/app/lib/utils/fitness/unit-conversions';
import { calculateSessionVolume } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { 
  Exercise, 
  BaseExercise, 
  createPlannedExercise, 
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
import ProgramBrowser from './components/ProgramBrowser/ProgramBrowser';
import type { FitnessSettings } from '@/app/lib/types/user_settings';
import { SavedProgram, VolumeTarget, ProgressionRules, Program } from '@/app/lib/types/pillars/fitness';
import ProgramHeader from './components/ProgramHeader';
import { createWeekExercise } from '@/app/lib/utils/fitness/resistance-training/ExerciseTransformations';
import { getNumericLoad, convertWeight } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { DEFAULT_PROGRAM } from './components/program-defaults';
import { useUserManagement } from './hooks/useUserManagement';
import { useProgramState } from './hooks/useProgramState';
import { useExerciseLibrary } from './hooks/useExerciseLibrary';
import { useExerciseModal } from './hooks/useExerciseModal';
import { useToastMessages } from './hooks/useToastMessage';
import { updatePairings } from './utils/ExercisePairings';
import { useExerciseManagement } from './hooks/useExerciseManagement';

function PlanPageContent() {
  const { exerciseLibrary, setExerciseLibrary } = useExerciseLibrary({
    onError: useToastMessages().handleError
  });
  const { program, setProgram, weekExercises, setWeekExercises, activeWeek } = useProgramState();
  const { 
    isExerciseModalOpen, setIsExerciseModalOpen,
    isExerciseSearchOpen, setIsExerciseSearchOpen,
    isAdvancedSearchOpen, setIsAdvancedSearchOpen,
    editingExercise, setEditingExercise,
    selectedExerciseName, setSelectedExerciseName,
    selectedExercise, setSelectedExercise
  } = useExerciseModal();
  const { 
    showSuccessToast, setShowSuccessToast,
    showErrorToast, setShowErrorToast,
    errorMessage, setErrorMessage,
    showSaveToast, setShowSaveToast,
    saveError, setSaveError,
    isSaving, setIsSaving
  } = useToastMessages();
  const { 
    session, 
    userSettings, 
    settingsLoading, 
    isAdmin, 
    selectedUserId, 
    setSelectedUserId 
  } = useUserManagement();
  const { 
    handleAddExercise, 
    handleExerciseSelect,
    // ... other exercise management functions and state
  } = useExerciseManagement(userSettings);
  const modalControls = useExerciseModal();
  const exerciseManagement = useExerciseManagement(userSettings, program, modalControls);

  // DND functionality to be implemented later
  // const { sensors, handleDragStart, handleDragEnd } = useDragAndDrop();

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
        name: settings.name || prevProgram.name,
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
    console.log('Starting save with program state:', program);
    
    if (!program.name) {
      setSaveError('Program name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
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
        (_, weekIndex) => ({
          weekNumber: weekIndex + 1,
          notes: '',
          days: [{
            dayNumber: 1,
            notes: '',
            exercises: weekExercises[weekIndex + 1]?.map((exercise, exerciseIndex) => ({
              id: exercise.id,
              name: exercise.name,
              pairing: exercise.pairing,
              orderIndex: exerciseIndex,
              notes: exercise.notes || '',
              source: exercise.source,
              libraryId: exercise.libraryId,
              sets: exercise.isVariedSets 
                ? exercise.setDetails.map(set => ({
                    setNumber: set.setNumber,
                    reps: set.reps,
                    load: set.load,
                    loadUnit: set.loadUnit || 'kg',
                    tempo: set.tempo,
                    rest: set.rest,
                    notes: set.notes || ''
                  }))
                : Array(exercise.sets).fill(null).map((_, i) => ({
                    setNumber: i + 1,
                    reps: exercise.reps,
                    load: exercise.load,
                    loadUnit: exercise.loadUnit || 'kg',
                    tempo: exercise.tempo,
                    rest: exercise.rest,
                    notes: ''
                  }))
            })) || []
          }]
        })
      );

      const programData = {
        id: program.id,
        name: program.name.trim(),
        periodizationType: program.periodizationType,
        phaseFocus: program.phaseFocus,
        progressionRules: program.progressionRules,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + (weeks.length * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        notes: program.notes || '',
        weeks: weeks,
        userId: selectedUserId?.toString() || session?.user?.id || '0'
      };

      console.log('Formatted program data:', programData);
      console.log('Program data stringified:', JSON.stringify(programData, null, 2));

      // Determine if this is a new program or an update
      const isUpdate = Boolean(program.id);
      const url = isUpdate 
        ? `/api/resistance-training/program/${program.id}`
        : '/api/resistance-training/program';

      console.log('Making request to:', url);
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      const result = JSON.parse(responseText);
      setProgram(prev => ({ ...prev, id: result.programId }));
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (error) {
      console.error('Error saving program:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save program');
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
      phaseFocus: PhaseFocus.GPP,
      periodizationType: PeriodizationType.None,
      exercises: [],
      progressionRules: {
        type: PeriodizationType.None,
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
      ...(selectedProgram.progression_rules && {
        progressionRules: selectedProgram.progression_rules
      }),
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

  const handleProgramDelete = (programId: string) => {
    // If the deleted program was the current program, reset to initial state
    if (program.id === programId) {
      setProgram({
        id: '',
        userId: currentUserId.toString(),
        name: '',
        phaseFocus: 'GPP',
        periodizationType: 'Linear',
        notes: '',
        progressionRules: {
          type: 'Linear',
          settings: {
            programLength: 4
          }
        },
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resistance Training Program Planning</h1>

      <ProgramHeader
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        onProgramSelect={handleProgramSelect}
        onProgramDelete={handleProgramDelete}
      />

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
            progressionRules={program.progressionRules ? {
              type: program.progressionRules.type,
              settings: program.progressionRules.settings ?? {
                volumeIncrementPercentage: 0,
                loadIncrementPercentage: 0,
                programLength: 4,
                weeklyVolumePercentages: []
              }
            } : undefined}
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

      {/* Save Button - Positioned below ExerciseList block */}
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all
            ${isSaving 
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'
            }
          `}
        >
          {isSaving ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Program...
            </div>
          ) : (
            'Save Program'
          )}
        </button>
      </div>

      {/* Exercise Modals */}
      <AddExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        exercise={editingExercise}
        exercises={weekExercises[activeWeek] || []}
        onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
        selectedExerciseName={selectedExerciseName}
        userSettings={userSettings ?? undefined}
      />

      <ExerciseSearch
        isOpen={isExerciseSearchOpen || isAdvancedSearchOpen}
        onClose={() => {
          setIsExerciseSearchOpen(false);
          setIsAdvancedSearchOpen(false);
        }}
        onSelect={handleAdvancedSearchSelect}
      />

      {/* Toast Notifications */}
      {showSaveToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Program saved successfully</div>
          </Toast>
        </div>
      )}
      
      {saveError && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{saveError}</div>
          </Toast>
        </div>
      )}
    </div>
  );
}

export default PlanPageContent;