'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProgramAnalysis } from '../actions/getProgramAnalysis';
import type { ProgramVolumeAnalysis } from '../../types/analysis.zod';

interface UseProgramAnalysisResult {
  analysis: ProgramVolumeAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProgramAnalysis(
  programId: number | null,
  userId: number,
  loadUnit: string = 'lbs'
): UseProgramAnalysisResult {
  const [analysis, setAnalysis] = useState<ProgramVolumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgramAnalysis = useCallback(async () => {
    if (!programId) {
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProgramAnalysis({ 
        programId, 
        userId, 
        loadUnit 
      });
      
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Failed to fetch program analysis');
      }
    } catch (err) {
      console.error('Error fetching program analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch program analysis');
    } finally {
      setIsLoading(false);
    }
  }, [programId, userId, loadUnit]);

  useEffect(() => {
    fetchProgramAnalysis();
  }, [fetchProgramAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchProgramAnalysis
  };
}