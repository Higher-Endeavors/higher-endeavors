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
import { generateProgressedWeeks } from '../../lib/calculations/resistanceTrainingCalculations';

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
  // Progression settings state
  const [progressionSettings, setProgressionSettings] = useState({
    type: 'None',
    settings: {
      volume_increment_percentage: 0,
      load_increment_percentage: 0,
      weekly_volume_percentages: [100, 100, 100, 100],
    },
  });
  // Week 1 (base) exercises
  const [baseWeekExercises, setBaseWeekExercises] = useState<ProgramExercisesPlanned[]>([]);
  // All weeks' exercises
  const [weeklyExercises, setWeeklyExercises] = useState<ProgramExercisesPlanned[][]>(
    Array.from({ length: programLength }, (_, i) => (i === 0 ? baseWeekExercises : []))
  );
  const [editingExercise, setEditingExercise] = useState<ProgramExercisesPlanned | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const [variationEditId, setVariationEditId] = useState<number | null>(null);

  // Helper to recalculate all weeks from base and progression settings
  const recalculateAllWeeks = (newBaseWeek: ProgramExercisesPlanned[], newSettings = progressionSettings, newLength = programLength) => {
    const allWeeksObj = generateProgressedWeeks(newBaseWeek, newLength, newSettings);
    const allWeeksArr = Object.values(allWeeksObj);
    setWeeklyExercises(allWeeksArr);
  };

  // When programLength changes, recalculate all weeks
  const handleProgramLengthChange = (newLength: number) => {
    setProgramLength(newLength);
    recalculateAllWeeks(baseWeekExercises, progressionSettings, newLength);
  };

  // When progression settings change, recalculate all weeks
  const handleProgressionSettingsChange = (newSettings: typeof progressionSettings) => {
    setProgressionSettings(newSettings);
    recalculateAllWeeks(baseWeekExercises, newSettings);
  };

  // Add Exercise
  const handleAddExercise = (exercise: ProgramExercisesPlanned) => {
    if (activeWeek === 1) {
      const newBase = [...baseWeekExercises, exercise];
      setBaseWeekExercises(newBase);
      recalculateAllWeeks(newBase);
    } else {
      setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? [...arr, exercise] : arr));
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
      const newBase = baseWeekExercises.map(ex => ex.exerciseLibraryId === updatedExercise.exerciseLibraryId ? updatedExercise : ex);
      setBaseWeekExercises(newBase);
      recalculateAllWeeks(newBase);
    } else {
      setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? arr.map(ex => ex.exerciseLibraryId === updatedExercise.exerciseLibraryId ? updatedExercise : ex) : arr));
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Delete Exercise
  const handleDeleteExercise = (id: number) => {
    if (activeWeek === 1) {
      const newBase = baseWeekExercises.filter(ex => ex.exerciseLibraryId !== id);
      setBaseWeekExercises(newBase);
      recalculateAllWeeks(newBase);
    } else {
      setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? arr.filter(ex => ex.exerciseLibraryId !== id) : arr));
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
      if (exercise.exerciseLibraryId !== editingExercise.exerciseLibraryId) {
        setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? [...arr.filter(ex => ex.exerciseLibraryId !== editingExercise.exerciseLibraryId), exercise] : arr));
      } else {
        setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? arr.map(ex => ex.exerciseLibraryId === exercise.exerciseLibraryId ? exercise : ex) : arr));
      }
      setVariationEditId(null);
      setEditingExercise(null);
      setIsModalOpen(false);
      return;
    }
    if (editingExercise) {
      handleUpdateExercise(exercise);
    } else {
      handleAddExercise(exercise);
    }
  };

  // Pass progression settings and program length to ProgramSettings
  // ProgramSettings should call setProgramLength and setProgressionSettings on change

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
        setProgramLength={handleProgramLengthChange}
        progressionSettings={progressionSettings}
        setProgressionSettings={handleProgressionSettingsChange}
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
        plannedExercises={weeklyExercises[activeWeek - 1] || []}
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
      {weeklyExercises[activeWeek - 1]?.length > 0 && (
        <div className="mt-6">
          <SessionSummary exercises={weeklyExercises[activeWeek - 1]} />
        </div>
      )}
    </>
  );
} 