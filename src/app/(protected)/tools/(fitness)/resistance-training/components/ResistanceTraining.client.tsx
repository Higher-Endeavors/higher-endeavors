'use client';

import { useState } from 'react';
import UserSelector from '../../../../components/UserSelector';
import ProgramBrowser from './ProgramBrowser';
import ProgramSettings from './ProgramSettings';
import ExerciseList from './ExerciseList';
import SessionSummary from './SessionSummary';
import AddExerciseModal from '../modals/AddExerciseModal';
import { ExerciseLibraryItem, PlannedExercise } from '../types/resistance-training.types';

export default function ResistanceTrainingClient({
  exercises,
  initialUserId,
  userId
}: {
  exercises: ExerciseLibraryItem[];
  initialUserId: number;
  userId: number;
}) {
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleAddExercise = (exercise: PlannedExercise) => {
    // TODO: Add logic to add the exercise to the program/session
    setIsAddModalOpen(false);
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
      <button
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        onClick={handleOpenAddModal}
      >
        Add Exercise
      </button>
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleAddExercise}
        exercises={exercises}
        userId={selectedUserId}
      />
      <ProgramBrowser />
      <ProgramSettings />
      <ExerciseList 
        exercises={exercises}
        isLoading={false}
        userId={selectedUserId}
      />
      <SessionSummary />
    </>
  );
} 