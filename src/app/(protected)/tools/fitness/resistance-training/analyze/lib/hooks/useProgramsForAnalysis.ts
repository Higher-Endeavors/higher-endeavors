'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProgramForAnalysis } from '../../types/analysis.zod';

interface UseProgramsForAnalysisResult {
  programs: ProgramForAnalysis[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProgramsForAnalysis(userId: number): UseProgramsForAnalysisResult {
  const [programs, setPrograms] = useState<ProgramForAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resistance-training/programs-for-analysis?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.programs) {
        setPrograms(data.programs);
      } else {
        setError(data.error || 'Failed to fetch programs');
      }
    } catch (err) {
      console.error('Error fetching programs for analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch programs');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    isLoading,
    error,
    refetch: fetchPrograms
  };
}