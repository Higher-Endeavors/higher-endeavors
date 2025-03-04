'use client';

import { useState } from 'react';
import { Program, Exercise } from '@/app/lib/types/pillars/fitness';
import { transformWeekExercises } from '../utils/ExerciseTransformations';
import { formatProgramData, saveProgramToAPI } from '../utils/programTransformations';



interface UseProgramSaveProps {
  program: Program;
  weekExercises: { [key: number]: Exercise[] };
  selectedUserId: number;
  sessionUserId: number;
  setProgram: (value: Program | ((prev: Program) => Program)) => void;
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
      const weeks = transformWeekExercises(weekExercises, program.progression_rules?.settings?.program_length);
      const programData = formatProgramData(program, weeks, selectedUserId, sessionUserId);
      await saveProgramToAPI(programData, program.id, setProgram);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to save program');
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSave, isSaving };
}