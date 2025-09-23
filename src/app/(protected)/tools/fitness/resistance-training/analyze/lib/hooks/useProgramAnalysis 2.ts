'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClient } from 'lib/dbAdapter';
import type { ProgramVolumeAnalysis } from '(protected)/tools/fitness/resistance-training/analyze/types/analysis.zod';
import type { ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';

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
      const client = await getClient();
      
      // Fetch program details
      const programQuery = `
        SELECT 
          program_id as "resistanceProgramId",
          program_name as "programName",
          program_duration as "programDuration"
        FROM resist_programs 
        WHERE program_id = $1 AND user_id = $2
      `;
      
      const programResult = await client.query(programQuery, [programId, userId]);
      
      if (programResult.rows.length === 0) {
        throw new Error('Program not found');
      }
      
      const program = programResult.rows[0];
      
      // Fetch all exercises for this program, grouped by week
      const exercisesQuery = `
        SELECT 
          program_exercises_id as "programExercisesPlannedId",
          program_instance as "programInstance",
          exercise_source as "exerciseSource",
          exercise_library_id as "exerciseLibraryId",
          user_exercise_library_id as "userExerciseLibraryId",
          pairing,
          notes,
          planned_sets as "plannedSets",
          actual_sets as "actualSets"
        FROM resist_program_exercises 
        WHERE program_id = $1
        ORDER BY program_instance, program_exercises_id
      `;
      
      const exercisesResult = await client.query(exercisesQuery, [programId]);
      const exercises = exercisesResult.rows as (ProgramExercisesPlanned & { programInstance?: number })[];
      
      // Group exercises by week (program_instance)
      const weeklyExercises: ProgramExercisesPlanned[][] = [];
      const maxWeek = Math.max(...exercises.map(ex => ex.programInstance || 1), 1);
      
      for (let week = 1; week <= maxWeek; week++) {
        const weekExercises = exercises.filter(ex => (ex.programInstance || 1) === week);
        weeklyExercises.push(weekExercises);
      }
      
      // Calculate volume analysis
      const { calculateProgramVolumeAnalysis } = await import('../volumeCalculations');
      const volumeAnalysis = calculateProgramVolumeAnalysis(program, weeklyExercises, loadUnit);
      
      setAnalysis(volumeAnalysis);
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
