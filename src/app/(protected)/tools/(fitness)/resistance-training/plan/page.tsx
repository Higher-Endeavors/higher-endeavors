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

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

const ExerciseListNoSSR = dynamic(
    () => import('./components/ExerciseList'),
    { ssr: false }
  )

export default function PlanPage() {
  // User settings
  const { settings: userSettings, isLoading: isLoadingSettings } = useUserSettings();

  // Debug logs for user settings
  useEffect(() => {
    console.log('User Settings:', userSettings);
    console.log('Fitness Settings:', userSettings?.pillar_settings?.fitness);
    console.log('Resistance Training Settings:', userSettings?.pillar_settings?.fitness?.resistanceTraining);
  }, [userSettings]);

  // Program state
  const [program, setProgram] = useState<Program>({
    id: '',
    userId: '',
    name: '',
    phaseFocus: 'GPP',
    periodizationType: 'Linear',
    exercises: [],
    progressionRules: {
      type: 'Linear',
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
  const [currentExercise, setCurrentExercise] = useState<Exercise | undefined>();
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [mounted, setMounted] = useState(false);
  const [weekExercises, setWeekExercises] = useState<{ [key: number]: Exercise[] }>({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load muscle groups on mount
  useEffect(() => {
    const fetchExerciseLibrary = async () => {
      try {
        const response = await fetch('/api/exercises');
        const data = await response.json();
        setExerciseLibrary(data);
      } catch (error) {
        console.error('Error fetching exercise library:', error);
      }
    };
    fetchExerciseLibrary();
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
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60,
      isVariedSets: false,
      isAdvancedSets: false,
      notes: ''
    });
    setIsExerciseModalOpen(true);
  };

  const handleExerciseSelect = (exerciseName: string) => {
    setIsExerciseSearchOpen(false);
    setIsAdvancedSearchOpen(false);
    setSelectedExerciseName(exerciseName);
    if (editingExercise) {
      setEditingExercise({
        ...editingExercise,
        name: exerciseName
      });
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

  const handleSaveExercise = (exercise: Exercise) => {
    // Get the week number from the exercise ID if it exists
    const weekMatch = exercise.id.match(/-week(\d+)$/);
    const weekNumber = weekMatch ? parseInt(weekMatch[1]) : 1;
    const baseId = exercise.id.split('-week')[0];

    // If this is Week 1 or a new exercise, update program exercises and mirror to all weeks
    if (weekNumber === 1 || !weekMatch) {
      // Update program exercises
      setProgram((prev: Program) => {
        const updatedExercises = prev.exercises.map(ex =>
          ex.id === baseId ? exercise : ex
        ).concat(
          prev.exercises.find(ex => ex.id === baseId) ? [] : [exercise]
        );

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
        if (!prev[1]?.find(ex => ex.id === baseId)) {
          newWeekExercises[1] = [...(prev[1] || []), exercise];
        } else {
          newWeekExercises[1] = prev[1].map(ex =>
            ex.id === baseId ? exercise : ex
          );
        }

        // Mirror Week 1's exercises to all other weeks with progression applied
        if (program.periodizationType === 'Linear') {
          for (let week = 2; week <= programLength; week++) {
            newWeekExercises[week] = newWeekExercises[1].map(ex => ({
              ...applyLinearProgression(
                ex,
                week,
                program.progressionRules.settings.volumeIncrementPercentage ?? 0,
                program.progressionRules.settings.loadIncrementPercentage ?? 0
              ),
              id: `${ex.id.split('-week')[0]}-week${week}`
            }));
          }
        } else {
          // For other periodization types, just copy Week 1
          for (let week = 2; week <= programLength; week++) {
            newWeekExercises[week] = newWeekExercises[1].map(ex => ({
              ...ex,
              id: `${ex.id.split('-week')[0]}-week${week}`
            }));
          }
        }
        
        return newWeekExercises;
      });
    } else {
      // This is an edit to a week other than Week 1, only update that specific week
      setWeekExercises(prev => {
        const newWeekExercises = { ...prev };
        newWeekExercises[weekNumber] = prev[weekNumber].map(ex =>
          ex.id === exercise.id ? exercise : ex
        );
        return newWeekExercises;
      });
    }

    setIsExerciseModalOpen(false);
    setEditingExercise(undefined);
  };

  const handleEditExercise = (id: string) => {
    // Find the exercise in the current week's exercises
    const exercise = weekExercises[activeWeek]?.find(ex => ex.id === id);
    if (exercise) {
      setEditingExercise({
        ...exercise,
        // Ensure we maintain the week-specific ID when editing
        id: exercise.id
      });
      setIsExerciseModalOpen(true);
    }
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
    console.log('Settings changed:', settings);
    setProgram(prev => ({
      ...prev,
      ...settings,
      progressionRules: settings.progressionRules ? {
        ...prev.progressionRules,
        ...settings.progressionRules
      } : prev.progressionRules
    }));
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

      // Client-side validation
      if (!program.name?.trim()) {
        const error = 'Please enter a program name';
        setErrorMessage(error);
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return; // Return instead of throwing
      }

      // Transform the program data into the format expected by the API
      const weeks = Array.from(
        { length: program.progressionRules.settings.programLength || 4 },
        (_, weekIndex) => {
          const weekNumber = weekIndex + 1;
          const weekExerciseList = weekExercises[weekNumber] || [];
          
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
          const days = Object.entries(exercisesByDay).map(([dayNumber, exercises]) => ({
            dayNumber: parseInt(dayNumber),
            dayName: `Day ${dayNumber}`,
            exercises: exercises.map((exercise, index) => ({
              source: 'library', // or 'user' if it's a custom exercise
              libraryId: exercise.libraryId,
              userExerciseId: exercise.userExerciseId,
              customName: exercise.customName,
              pairing: exercise.pairing,
              notes: exercise.notes,
              orderIndex: index,
              sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
                setNumber: setIndex + 1,
                reps: exercise.reps,
                load: exercise.load,
                loadUnit: exercise.loadUnit || 'lbs',
                rest: exercise.rest,
                tempo: exercise.tempo,
                notes: ''
              }))
            }))
          }));

          return {
            weekNumber,
            notes: '',
            days
          };
        }
      );

      const programData = {
        name: program.name.trim(),
        periodizationType: program.periodizationType,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (weeks.length * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        notes: '',
        weeks
      };

      console.log('Sending program data:', programData);

      const response = await fetch('/api/resistance-training/program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        const error = `Invalid response from server: ${responseText}`;
        setErrorMessage(error);
        throw new Error(error);
      }

      if (!response.ok) {
        const error = result.details?.name || result.error || 'Failed to save program';
        setErrorMessage(error);
        throw new Error(error);
      }

      console.log('Program saved successfully:', result);

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

    } catch (error) {
      console.error('Error saving program:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resistance Training Program Planning</h1>

      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-slate-900">Program Settings</h2>
          <ProgramSettings
            name={program.name}
            phaseFocus={program.phaseFocus}
            periodizationType={program.periodizationType}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>

      <div className="mb-6">
        <VolumeTargets
          targets={program.volumeTargets}
          onChange={handleVolumeTargetsChange}
        />
      </div>

      {/* Week Tabs */}
      <div className="mt-8 border-b border-gray-200">
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                      ? `Total Load (${userSettings?.pillar_settings?.fitness?.resistanceTraining?.weightUnit === 'kg' ? 'kgs' : 'lbs'})`
                      : key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-medium dark:text-slate-900">{Math.round(value)}</p>
                </div>
              ))}
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="font-medium dark:text-slate-900">
                  {Math.round(calculateSessionDuration(weekExercises[activeWeek]) / 60)} min
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Program'}
        </button>
      </div>

      {/* Modals */}
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

      {/* Exercise search modal */}
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

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Program saved successfully</div>
          </Toast>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              {errorMessage || 'Failed to save program. Please try again.'}
            </div>
          </Toast>
        </div>
      )}
    </div>
  );
} 