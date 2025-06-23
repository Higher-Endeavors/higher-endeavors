'use client';

import { useState } from 'react';
import UserSelector from '../../../components/UserSelector';
import ProgramBrowser from './components/ProgramBrowser';
import ProgramSettings from './components/ProgramSettings';
import ExerciseList from './components/ExerciseList';
import SessionSummary from './components/SessionSummary';
import { ExerciseLibraryItem } from '../resistance-training/types/resistance-training.types';

export default function ResistanceTrainingClient({
  exercises,
  initialUserId
}: {
  exercises: ExerciseLibraryItem[];
  initialUserId: number;
}) {
  const [userId, setUserId] = useState(initialUserId);

  return (
    <>
      <div className="max-w-md">
        <UserSelector
          onUserSelect={setUserId}
          currentUserId={userId}
        />
      </div>
      <ProgramBrowser />
      <ProgramSettings />
      <ExerciseList 
        exercises={exercises}
        isLoading={false}
      />
      <SessionSummary />
    </>
  );
} 