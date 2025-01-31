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
import { Program, Exercise, VolumeTarget } from '../shared/types';
import { calculateSessionVolume, calculateSessionDuration, applyLinearProgression } from '../shared/utils/calculations';
import type { z } from 'zod';
import { programSettingsSchema } from '../shared/schemas/program';

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

const ExerciseListNoSSR = dynamic(
    () => import('./components/ExerciseList'),
    { ssr: false }
  )

export default function PlanPage() {
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
        programLength: 4  // Set default program length
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
    console.log('Settings received:', settings);
    
    setProgram(prev => {
      // Extract progression settings
      const volumeIncrement = settings.progressionRules?.settings?.volumeIncrementPercentage;
      const loadIncrement = settings.progressionRules?.settings?.loadIncrementPercentage;
      const programLength = settings.progressionRules?.settings?.programLength;

      console.log('Updating progression settings:', {
        volumeIncrement,
        loadIncrement,
        programLength
      });

      const newProgram = {
        ...prev,
        name: settings.name ?? prev.name,
        phaseFocus: settings.phaseFocus ?? prev.phaseFocus,
        periodizationType: settings.periodizationType ?? prev.periodizationType,
        progressionRules: {
          ...prev.progressionRules,
          type: settings.periodizationType ?? prev.progressionRules.type,
          settings: {
            ...prev.progressionRules.settings,
            volumeIncrementPercentage: volumeIncrement ?? prev.progressionRules.settings.volumeIncrementPercentage,
            loadIncrementPercentage: loadIncrement ?? prev.progressionRules.settings.loadIncrementPercentage,
            programLength: programLength ?? prev.progressionRules.settings.programLength
          }
        }
      };

      // Immediately update week exercises if progression settings changed
      if (volumeIncrement !== undefined || loadIncrement !== undefined) {
        const newVolumeIncrement = volumeIncrement ?? prev.progressionRules.settings.volumeIncrementPercentage;
        const newLoadIncrement = loadIncrement ?? prev.progressionRules.settings.loadIncrementPercentage;
        const length = programLength ?? prev.progressionRules.settings.programLength ?? 4;
        
        setWeekExercises(prevWeeks => {
          const newWeekExercises = { ...prevWeeks };

          // Keep week 1 as is
          if (!newWeekExercises[1]) {
            newWeekExercises[1] = prev.exercises;
          }

          // Recalculate all other weeks
          for (let week = 2; week <= length; week++) {
            if (prev.periodizationType === 'Linear') {
              newWeekExercises[week] = (newWeekExercises[1] || []).map(ex => ({
                ...applyLinearProgression(
                  ex,
                  week,
                  newVolumeIncrement,
                  newLoadIncrement
                ),
                id: `${ex.id.split('-week')[0]}-week${week}`
              }));
            }
          }

          return newWeekExercises;
        });
      }

      console.log('Updated program state:', newProgram);
      return newProgram as Program; // Type assertion to satisfy the compiler
    });
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
      const response = await fetch('/api/resistance-programs', {
        method: program.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(program),
      });

      if (!response.ok) {
        throw new Error('Failed to save program');
      }

      const data = await response.json();
      if (!program.id) {
        setProgram(prev => ({ ...prev, id: data.id }));
      }
    } catch (error) {
      console.error('Error saving program:', error);
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
    
    console.log('Program settings:', {
      programLength,
      volumeIncrement,
      loadIncrement,
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
              console.log(`Applying progression for week ${i}:`, {
                volumeIncrement,
                loadIncrement
              });
              
              newWeekExercises[i] = program.exercises.map(exercise => {
                const progressed = applyLinearProgression(
                  exercise,
                  i,
                  volumeIncrement,
                  loadIncrement
                );
                console.log(`Week ${i} exercise progression:`, {
                  before: {
                    sets: exercise.sets,
                    reps: exercise.reps,
                    load: exercise.load
                  },
                  after: {
                    sets: progressed.sets,
                    reps: progressed.reps,
                    load: progressed.load
                  }
                });
                return {
                  ...progressed,
                  id: `${exercise.id}-week${i}`
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
  }, [program.progressionRules.settings.programLength, program.exercises, program.periodizationType, program.progressionRules.settings.volumeIncrementPercentage, program.progressionRules.settings.loadIncrementPercentage]);

  // Update exercises for the active week
  const handleWeekExercisesChange = (exercises: Exercise[]) => {
    setWeekExercises(prev => {
      const newWeekExercises = { ...prev };
      
      // If this is Week 1 and we're using Linear Progression, update all subsequent weeks
      if (activeWeek === 1 && program.periodizationType === 'Linear') {
        newWeekExercises[1] = exercises;
        
        const programLength = program.progressionRules.settings.programLength || 4;
        for (let week = 2; week <= programLength; week++) {
          newWeekExercises[week] = exercises.map(exercise => ({
            ...applyLinearProgression(
              exercise,
              week,
              program.progressionRules.settings.volumeIncrementPercentage || 5,
              program.progressionRules.settings.loadIncrementPercentage || 2.5
            ),
            id: `${exercise.id.split('-week')[0]}-week${week}`
          }));
        }
      } else {
        // For other weeks or non-Linear progression, just update the current week
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
              {Object.entries(calculateSessionVolume(weekExercises[activeWeek]))
                .filter(([key]) => key !== 'totalTimeUnderTension')
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
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
    </div>
  );
} 