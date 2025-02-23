import { useState } from 'react';
import type { ExerciseOption, BaseExercise, Exercise, Program } from '@/app/lib/types/pillars/fitness';
import { createPlannedExercise } from '@/app/lib/types/pillars/fitness';
import { getNextPairing } from '../utils/ExercisePairings';

export function useExerciseManagement(
    userSettings: any, 
    program: Program,
    modalControls: { 
      setIsExerciseModalOpen: (open: boolean) => void,
      setIsAdvancedSearchOpen: (open: boolean) => void
    }
  ) {
    const { setIsExerciseModalOpen, setIsAdvancedSearchOpen } = modalControls;
    const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
    const [selectedExerciseName, setSelectedExerciseName] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>();

    const handleAddExercise = () => {
        setEditingExercise(undefined);
        setSelectedExerciseName('');
        setIsExerciseModalOpen(true);
    };

  const handleExerciseSelect = (exercise: ExerciseOption) => {
    const baseExercise = {
      id: `exercise-${Math.random().toString(36).substr(2, 9)}-day1`,
      name: exercise.label || '',
      pairing: getNextPairing(program.exercises),
      sets: 3,
      reps: 10,
      load: 0,
      tempo: '2010',
      rest: 60,
      loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'kg',
      notes: '',
      source: 'exercise_library',
      libraryId: exercise.libraryId
    };
    
    setSelectedExercise(createPlannedExercise(baseExercise));
    setIsAdvancedSearchOpen(false);
  };

  return {
    editingExercise,
    setEditingExercise,
    selectedExerciseName,
    setSelectedExerciseName,
    selectedExercise,
    setSelectedExercise,
    handleAddExercise,
    handleExerciseSelect
  };
}