'use client';

import { useState, useCallback } from 'react';
import type { Exercise } from './useExercises';

export interface ExerciseSelectionState {
  selectedExercise: Exercise | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExerciseSelectionActions {
  selectExercise: (exercise: Exercise | null) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useExerciseSelection(): ExerciseSelectionState & ExerciseSelectionActions {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectExercise = useCallback((exercise: Exercise | null) => {
    setSelectedExercise(exercise);
    setError(null); // Clear any previous errors when selecting
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedExercise(null);
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    setError(error);
  }, []);

  return {
    selectedExercise,
    isLoading,
    error,
    selectExercise,
    clearSelection,
    setLoading,
    setError: setErrorState
  };
}
