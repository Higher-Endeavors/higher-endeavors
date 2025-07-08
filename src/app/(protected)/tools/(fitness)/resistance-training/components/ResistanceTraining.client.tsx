'use client';

import { useState } from 'react';
import UserSelector from '../../../../components/UserSelector';
import ProgramBrowser from './ProgramBrowser';
import ProgramSettings from './ProgramSettings';
import ExerciseList from './ExerciseList';
import SessionSummary from './SessionSummary';
import AddExerciseModal from '../modals/AddExerciseModal';
import { ExerciseLibraryItem, PlannedExercise } from '../types/resistance-training.zod';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';

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
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<PlannedExercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddExercise = (exercise: PlannedExercise) => {
    if (editingExercise) {
      setPlannedExercises(prev =>
        prev.map(ex =>
          ex.exerciseLibraryId === editingExercise.exerciseLibraryId ? exercise : ex
        )
      );
    } else {
      setPlannedExercises(prev => [...prev, exercise]);
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  const handleEditExercise = (id: number) => {
    const exerciseToEdit = plannedExercises.find(ex => ex.exerciseLibraryId === id);
    if (exerciseToEdit) {
      setEditingExercise(exerciseToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDeleteExercise = (id: number) => {
    setPlannedExercises(prev => prev.filter(ex => ex.exerciseLibraryId !== id));
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
      <ProgramSettings />
      <ExerciseList
        exercises={exercises}
        isLoading={false}
        userId={selectedUserId}
        plannedExercises={plannedExercises}
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
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
        }}
        onAdd={handleAddExercise}
        exercises={exercises}
        userId={selectedUserId}
        editingExercise={editingExercise}
        fitnessSettings={fitnessSettings}
      />
      {plannedExercises.length > 0 && (
        <div className="mt-6">
          <SessionSummary exercises={plannedExercises} />
        </div>
      )}
    </>
  );
} 