'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClient } from 'lib/dbAdapter';
import type { ProgramForAnalysis } from '(protected)/tools/fitness/resistance-training/analyze/types/analysis.zod';

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
      const client = await getClient();
      
      // Fetch programs with exercise counts and actual data indicators
      const query = `
        SELECT 
          rp.program_id as "resistanceProgramId",
          rp.program_name as "programName",
          rp.program_duration as "programDuration",
          rp.phase_focus as "phaseFocus",
          rp.periodization_type as "periodizationType",
          rp.created_at as "createdAt",
          COUNT(rpe.program_exercises_id) as "exerciseCount",
          COUNT(CASE WHEN rpe.actual_sets IS NOT NULL AND rpe.actual_sets != '[]' THEN 1 END) as "actualDataCount"
        FROM resist_programs rp
        LEFT JOIN resist_program_exercises rpe ON rp.program_id = rpe.program_id
        WHERE rp.user_id = $1 AND rp.deleted IS NOT TRUE
        GROUP BY rp.program_id, rp.program_name, rp.program_duration, rp.phase_focus, rp.periodization_type, rp.created_at
        HAVING COUNT(rpe.program_exercises_id) > 0
        ORDER BY rp.created_at DESC
      `;
      
      const result = await client.query(query, [userId]);
      
      const programsData: ProgramForAnalysis[] = result.rows.map((row: any) => ({
        resistanceProgramId: row.resistanceProgramId,
        programName: row.programName,
        programDuration: row.programDuration || 0,
        phaseFocus: row.phaseFocus,
        periodizationType: row.periodizationType,
        createdAt: row.createdAt,
        hasActualData: parseInt(row.actualDataCount) > 0,
        exerciseCount: parseInt(row.exerciseCount)
      }));
      
      setPrograms(programsData);
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
