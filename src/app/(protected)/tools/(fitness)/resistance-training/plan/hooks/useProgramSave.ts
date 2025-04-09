'use client';

import { useState } from 'react';
import { program, exercise } from '@/app/lib/types/pillars/fitness';
import { transform_week_exercises } from '../utils/ExerciseTransformations';
import { formatProgramData, saveProgramToAPI } from '../utils/programTransformations';

interface UseProgramSaveProps {
  program: program;
  weekExercises: { [key: number]: exercise[] };
  selectedUserId: number;
  sessionUserId: number;
  setProgram: (value: program | ((prev: program) => program)) => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function useProgramSave({
  program,
  weekExercises,
  selectedUserId,
  sessionUserId,
  setProgram,
  onSuccess,
  onError
}: UseProgramSaveProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!program.program_name?.trim()) {
      onError('Program name is required');
      return;
    }

    if (!weekExercises[1]?.length) {
      onError('Please add at least one exercise to the program');
      return;
    }

    setIsSaving(true);

    try {
      const weeks = transform_week_exercises(weekExercises, program.progression_rules?.settings?.program_length);
      const program_data = formatProgramData(program, weeks, selectedUserId, sessionUserId);
      await saveProgramToAPI(program_data, program.id, setProgram);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to save program');
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSave, isSaving };
}