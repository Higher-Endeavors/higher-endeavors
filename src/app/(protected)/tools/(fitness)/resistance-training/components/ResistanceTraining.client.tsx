'use client';

import { useState } from 'react';
import UserSelector from '../../../../components/UserSelector';
import ProgramBrowser from './ProgramBrowser';
import ProgramSettings from './ProgramSettings';
import ExerciseList from './ExerciseList';
import SessionSummary from './SessionSummary';
import AddExerciseModal from '../modals/AddExerciseModal';
import WeekTabs from './WeekTabs';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '../types/resistance-training.zod';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';
import type { ExerciseWithSource } from '../modals/AddExerciseModal';

export default function ResistanceTrainingClient({
  exercises,
  initialUserId,
  userId,
  fitnessSettings,
}: {
  exercises: ExerciseLibraryItem[];
  initialUserId: number;
  userId: number;
  fitnessSettings?: FitnessSettings;
}) {
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [programLength, setProgramLength] = useState(4);
  const [weeklyExercises, setWeeklyExercises] = useState<ProgramExercisesPlanned[][]>(
    Array.from({ length: programLength }, () => [])
  );
  const [editingExercise, setEditingExercise] = useState<ProgramExercisesPlanned | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Week tab state
  const [activeWeek, setActiveWeek] = useState(1);
  // TODO: Connect this to ProgramSettings
  const [variationEditId, setVariationEditId] = useState<number | null>(null);
 

  // Helper to update a specific week
  const updateWeek = (weekIdx: number, updater: (arr: ProgramExercisesPlanned[]) => ProgramExercisesPlanned[]) => {
    setWeeklyExercises(prev => prev.map((arr, idx) => idx === weekIdx ? updater(arr) : arr));
  };

  // Add Exercise
  const handleAddExercise = (exercise: ProgramExercisesPlanned) => {
    if (activeWeek === 1) {
      // Add to all weeks
      setWeeklyExercises(prev => prev.map(arr => [...arr, exercise]));
    } else {
      // Add only to current week
      updateWeek(activeWeek - 1, arr => [...arr, exercise]);
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Edit Exercise
  const handleEditExercise = (id: number) => {
    const exerciseToEdit = weeklyExercises[activeWeek - 1].find(ex => ex.exerciseLibraryId === id);
    if (exerciseToEdit) {
      setEditingExercise(exerciseToEdit);
      setIsModalOpen(true);
    }
  };

  const handleUpdateExercise = (updatedExercise: ProgramExercisesPlanned) => {
    if (activeWeek === 1) {
      // Edit in all weeks
      setWeeklyExercises(prev => prev.map(arr =>
        arr.map(ex => ex.exerciseLibraryId === updatedExercise.exerciseLibraryId ? updatedExercise : ex)
      ));
    } else {
      // Edit only in current week
      updateWeek(activeWeek - 1, arr =>
        arr.map(ex => ex.exerciseLibraryId === updatedExercise.exerciseLibraryId ? updatedExercise : ex)
      );
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Delete Exercise
  const handleDeleteExercise = (id: number) => {
    if (activeWeek === 1) {
      // Delete from all weeks
      setWeeklyExercises(prev => prev.map(arr => arr.filter(ex => ex.exerciseLibraryId !== id)));
    } else {
      // Delete only from current week
      updateWeek(activeWeek - 1, arr => arr.filter(ex => ex.exerciseLibraryId !== id));
    }
  };

  // Handler for changing exercise variation
  const handleChangeVariation = (id: number) => {
    setVariationEditId(id);
    setEditingExercise(weeklyExercises[activeWeek - 1].find(ex => ex.exerciseLibraryId === id) || null);
    setIsModalOpen(true);
  };

  // In AddExerciseModal onAdd, handle variation change
  const handleAddOrUpdateExercise = (exercise: ProgramExercisesPlanned) => {
    if (variationEditId !== null && editingExercise) {
      // If exerciseLibraryId changed, replace old with new
      if (exercise.exerciseLibraryId !== editingExercise.exerciseLibraryId) {
        updateWeek(activeWeek - 1, arr => [
          ...arr.filter(ex => ex.exerciseLibraryId !== editingExercise.exerciseLibraryId),
          exercise
        ]);
      } else {
        // Just update variables as normal
        updateWeek(activeWeek - 1, arr =>
          arr.map(ex => ex.exerciseLibraryId === exercise.exerciseLibraryId ? exercise : ex)
        );
      }
      setVariationEditId(null);
      setEditingExercise(null);
      setIsModalOpen(false);
      return;
    }
    // Normal add/edit logic
    if (editingExercise) {
      handleUpdateExercise(exercise);
    } else {
      handleAddExercise(exercise);
    }
  };

  return (
    <>
      <div className="max-w-md">
        <UserSelector
          onUserSelect={userId => {
            if (userId !== null) setSelectedUserId(userId);
          }}
          currentUserId={selectedUserId}
        />
      </div>
      <ProgramBrowser />
      <ProgramSettings
        programLength={programLength}
        setProgramLength={setProgramLength}
      />
      <WeekTabs
        activeWeek={activeWeek}
        programLength={programLength}
        onWeekChange={setActiveWeek}
      />
      <ExerciseList
        exercises={exercises}
        isLoading={false}
        userId={selectedUserId}
        plannedExercises={weeklyExercises[activeWeek - 1]}
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
        activeWeek={activeWeek}
        onChangeVariation={handleChangeVariation}
      />
      <button
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        onClick={() => {
          setEditingExercise(null);
          setIsModalOpen(true);
        }}
      >
        Add Exercise
      </button>
      <AddExerciseModal
        key={editingExercise?.exerciseLibraryId || 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExercise(null);
          setVariationEditId(null);
        }}
        onAdd={handleAddOrUpdateExercise}
        exercises={exercises.map(e => ({ ...e, source: 'library' }))}
        userId={selectedUserId}
        editingExercise={editingExercise}
        fitnessSettings={fitnessSettings}
      />
      {weeklyExercises[activeWeek - 1].length > 0 && (
        <div className="mt-6">
          <SessionSummary exercises={weeklyExercises[activeWeek - 1]} />
        </div>
      )}
    </>
  );
} 