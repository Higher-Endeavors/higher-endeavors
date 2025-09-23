'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ExerciseInstance {
  programId: number;
  programName: string;
  programInstance: number;
  executionDate: string;
  updatedAt: string;
  exerciseName: string;
  actualSets: any[];
  totalReps: number;
  totalSets: number;
  totalLoad: number;
  loadUnit: string;
  repVolume: number;
  loadVolume: number;
}

export interface ExerciseInstancesData {
  exerciseName: string;
  instances: ExerciseInstance[];
  timeframe: string;
  totalInstances: number;
}

interface UseExerciseInstancesResult {
  data: ExerciseInstancesData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExerciseInstances(
  userId: number,
  exerciseId: string | null,
  timeframe: string = 'year'
): UseExerciseInstancesResult {
  const [data, setData] = useState<ExerciseInstancesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async () => {
    if (!exerciseId || !userId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/resistance-training/exercise-instances?user_id=${userId}&exercise_id=${exerciseId}&timeframe=${timeframe}`
      );
      const result = await response.json();

      if (result.success) {
        setData({
          exerciseName: result.exerciseName,
          instances: result.instances,
          timeframe: result.timeframe,
          totalInstances: result.totalInstances
        });
      } else {
        setError(result.error || 'Failed to fetch exercise instances');
      }
    } catch (err) {
      console.error('Error fetching exercise instances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exercise instances');
    } finally {
      setIsLoading(false);
    }
  }, [userId, exerciseId, timeframe]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchInstances
  };
}
