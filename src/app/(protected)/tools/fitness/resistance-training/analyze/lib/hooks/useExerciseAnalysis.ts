'use client';

import { useState, useEffect, useCallback } from 'react';
import { getExerciseAnalysis } from '../actions/getExerciseAnalysis';
import type { ExerciseAnalysisData } from '../actions/getExerciseAnalysis';

interface UseExerciseAnalysisResult {
  analysis: ExerciseAnalysisData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExerciseAnalysis(
  userId: number,
  exerciseId: string | null,
  timeframe: string
): UseExerciseAnalysisResult {
  const [analysis, setAnalysis] = useState<ExerciseAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!exerciseId || !userId) {
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getExerciseAnalysis({ userId, exerciseId, timeframe });
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Failed to fetch exercise analysis');
      }
    } catch (err) {
      console.error('Error fetching exercise analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exercise analysis');
    } finally {
      setIsLoading(false);
    }
  }, [userId, exerciseId, timeframe]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const refetch = useCallback(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refetch
  };
}
