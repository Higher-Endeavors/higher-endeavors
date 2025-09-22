'use server';

import { getClient } from 'lib/dbAdapter';
import { z } from 'zod';
import type { ProgramVolumeAnalysis } from '../../types/analysis.zod';
import type { ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';

const GetProgramAnalysisInput = z.object({
  programId: z.number().int(),
  userId: z.number().int(),
  loadUnit: z.string().default('lbs'),
});

export async function getProgramAnalysis(input: z.infer<typeof GetProgramAnalysisInput>): Promise<{
  success: boolean;
  analysis?: ProgramVolumeAnalysis;
  error?: string;
}> {
  const parse = GetProgramAnalysisInput.safeParse(input);
  if (!parse.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { programId, userId, loadUnit } = parse.data;
  const client = await getClient();

  try {
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
      return { success: false, error: 'Program not found' };
    }
    
    const program = programResult.rows[0];
    
    // Fetch all exercises for this program with exercise names, grouped by week
    const exercisesQuery = `
      SELECT 
        rpe.program_exercises_id as "programExercisesPlannedId",
        rpe.program_instance as "programInstance",
        rpe.exercise_source as "exerciseSource",
        rpe.exercise_library_id as "exerciseLibraryId",
        rpe.user_exercise_library_id as "userExerciseLibraryId",
        rpe.pairing,
        rpe.notes,
        rpe.planned_sets as "plannedSets",
        rpe.actual_sets as "actualSets",
            COALESCE(el.exercise_name, uel.exercise_name) as "exerciseName"
      FROM resist_program_exercises rpe
      LEFT JOIN exercise_library el ON rpe.exercise_library_id = el.exercise_library_id
      LEFT JOIN resist_user_exercise_library uel ON rpe.user_exercise_library_id = uel.user_exercise_library_id
      WHERE rpe.program_id = $1
      ORDER BY rpe.program_instance, rpe.program_exercises_id
    `;
    
    const exercisesResult = await client.query(exercisesQuery, [programId]);
    const exercises = exercisesResult.rows as (ProgramExercisesPlanned & { programInstance?: number; exerciseName?: string })[];
    
    // Group exercises by week (program_instance)
    const weeklyExercises: (ProgramExercisesPlanned & { exerciseName?: string })[][] = [];
    const maxWeek = Math.max(...exercises.map(ex => ex.programInstance || 1), 1);
    
    for (let week = 1; week <= maxWeek; week++) {
      const weekExercises = exercises.filter(ex => (ex.programInstance || 1) === week);
      weeklyExercises.push(weekExercises);
    }
    
    // Calculate volume analysis
    const { calculateProgramVolumeAnalysis } = await import('../volumeCalculations');
    const volumeAnalysis = calculateProgramVolumeAnalysis(program, weeklyExercises, loadUnit);
    
    return { success: true, analysis: volumeAnalysis };
  } catch (error) {
    console.error('Error fetching program analysis:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch program analysis' 
    };
  } finally {
    client.release();
  }
}
