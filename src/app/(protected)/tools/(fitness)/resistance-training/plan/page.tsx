'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ExerciseList from './components/ExerciseList';
import ExerciseModal from './components/ExerciseModal';
import ExerciseSearch from './components/ExerciseSearch';
import ProgramSettings from './components/ProgramSettings';
import VolumeTargets from './components/VolumeTargets';
import { Program, Exercise, VolumeTarget } from '../shared/types';
import { calculateSessionVolume } from '../shared/utils/calculations';

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
        loadIncrementPercentage: 2.5
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

  // First, uncomment the DND-Kit setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProgram((prev) => {
        const oldIndex = prev.exercises.findIndex((ex) => ex.id === active.id);
        const newIndex = prev.exercises.findIndex((ex) => ex.id === over.id);

        // Update exercise pairings after reordering
        const newExercises = arrayMove(prev.exercises, oldIndex, newIndex);
        const updatedExercises = updatePairings(newExercises);

        return {
          ...prev,
          exercises: updatedExercises
        };
      });
    }
  };

  // Helper function to update exercise pairings after reordering
  const updatePairings = (exercises: Exercise[]): Exercise[] => {
    let currentGroup = 'A';
    let currentNumber = 1;
    
    return exercises.map((exercise) => {
      if (exercise.pairing.startsWith('WU')) {
        return exercise;
      }
      if (exercise.pairing.startsWith('CD')) {
        return exercise;
      }

      const newPairing = `${currentGroup}${currentNumber}`;
      currentNumber++;
      if (currentNumber > 2) {
        currentNumber = 1;
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
      rest: 60
    });
    setIsExerciseModalOpen(true);
  };

  const handleExerciseSelect = (exerciseName: string) => {
    setIsExerciseSearchOpen(false);
    setEditingExercise({
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseName,
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60
    });
    setIsExerciseModalOpen(true);
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
    setProgram(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exercise.id ? exercise : ex
      ).concat(
        prev.exercises.find(ex => ex.id === exercise.id) ? [] : [exercise]
      )
    }));
    setIsExerciseModalOpen(false);
    setEditingExercise(undefined);
  };

  const handleEditExercise = (id: string) => {
    const exercise = program.exercises.find(ex => ex.id === id);
    if (exercise) {
      setEditingExercise(exercise);
      setIsExerciseModalOpen(true);
    }
  };

  const handleDeleteExercise = (id: string) => {
    setProgram(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  // Program settings management
  const handleSettingsChange = (key: string, value: string) => {
    setProgram(prev => ({
      ...prev,
      [key]: value
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
    setIsAdvancedSearchOpen(false);
    setCurrentExercise({
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseName,
      pairing: getNextPairing(),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60
    });
    setIsExerciseModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resistance Training Program Planning</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSaving ? 'Saving...' : 'Save Program'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Program Settings */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-slate-900">Program Settings</h2>
            <ProgramSettings
              name={program.name}
              phaseFocus={program.phaseFocus}
              periodizationType={program.periodizationType}
              onSettingsChange={handleSettingsChange}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-slate-900">Volume Targets</h2>
            {/* <VolumeTargets
              targets={program.volumeTargets}
              onTargetChange={handleVolumeTargetsChange}
              muscleGroups={muscleGroups}
            /> */}
          </div>
        </div>

        {/* Exercise List */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-slate-900">Exercises</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddExercise}
              >
                Add Exercise
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={program.exercises.map(ex => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                <ExerciseList
                  exercises={program.exercises}
                  onEdit={handleEditExercise}
                  onDelete={handleDeleteExercise}
                />
              </SortableContext>
            </DndContext>

            {/* Volume Summary */}
            {program.exercises.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 dark:text-slate-900">Session Volume Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(calculateSessionVolume(program.exercises)).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="font-medium dark:text-slate-900">{Math.round(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        exercise={editingExercise}
        exercises={program.exercises}
        onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
      />

      {/* Advanced search modal */}
      <ExerciseSearch
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSelect={handleAdvancedSearchSelect}
      />
    </div>
  );
} 