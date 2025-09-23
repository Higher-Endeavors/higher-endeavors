'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Exercise {
  exerciseId: string;
  exerciseName: string;
  exerciseSource: string;
  exerciseLibraryId: number | null;
  userExerciseLibraryId: number | null;
  programCount: number;
  instanceCount: number;
  lastExecutionDate: string;
  firstExecutionDate: string;
}

interface UseExercisesResult {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExercises(userId: number): UseExercisesResult {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resistance-training/exercises?user_id=${userId}`);
      const data = await response.json();

      if (data.success && data.exercises) {
        setExercises(data.exercises);
      } else {
        setError(data.error || 'Failed to fetch exercises');
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exercises');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    isLoading,
    error,
    refetch: fetchExercises
  };
}
