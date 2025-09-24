'use client';

import { useState, useEffect, useCallback } from 'react';

export interface StructuralBalanceImbalance {
  comparedExercise: string;
  repCount: number;
  actualRatio: number;
  idealRatio: number;
  deviation: number;
  severity: 'yellow' | 'red';
  userLoad: number;
  comparedLoad: number;
  loadUnit: string;
}

export interface StructuralBalanceData {
  imbalances: { [exerciseName: string]: StructuralBalanceImbalance[] };
  totalImbalances: number;
  totalExercisesWithImbalances: number;
}

export interface UseStructuralBalanceAnalysisResult {
  data: StructuralBalanceData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStructuralBalanceAnalysis(userId: number): UseStructuralBalanceAnalysisResult {
  const [data, setData] = useState<StructuralBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!userId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/structural-balance-analysis?user_id=${userId}`
      );
      const result = await response.json();

      if (result.success) {
        setData({
          imbalances: result.imbalances,
          totalImbalances: result.totalImbalances,
          totalExercisesWithImbalances: result.totalExercisesWithImbalances
        });
      } else {
        setError(result.error || 'Failed to fetch structural balance analysis');
      }
    } catch (err) {
      console.error('Error fetching structural balance analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch structural balance analysis');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalysis
  };
}
