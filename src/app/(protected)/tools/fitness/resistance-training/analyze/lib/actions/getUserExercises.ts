'use server';

import { getClient } from 'lib/dbAdapter';
import { clientLogger } from 'lib/logging/logger.client';

export interface UserExercise {
  exerciseId: string;
  exerciseName: string;
  exerciseSource: 'library' | 'user' | 'cme_library';
  exerciseLibraryId?: number;
  userExerciseLibraryId?: number;
  programCount?: number;
  totalInstances?: number;
}

export interface GetUserExercisesResult {
  success: boolean;
  exercises?: UserExercise[];
  error?: string;
}

// Lightweight function to get just exercise names for the dropdown
export async function getUserExerciseList({ userId }: { userId: number }): Promise<GetUserExercisesResult> {
  try {
    console.log('🔍 [getUserExerciseList] Starting getUserExerciseList', { userId });
    clientLogger.info('Starting getUserExerciseList', { userId });
    
    const client = await getClient();
    console.log('🔍 [getUserExerciseList] Database client obtained');
    clientLogger.info('Database client obtained');

    // Simple query like getProgramsForAnalysis - just get the data we need
    const query = `
      SELECT DISTINCT
        rpe.exercise_library_id,
        rpe.user_exercise_library_id,
        rpe.exercise_source,
        COALESCE(el.exercise_name, uel.exercise_name) as exercise_name
      FROM resist_program_exercises rpe
      INNER JOIN resist_programs rp ON rpe.program_id = rp.program_id
      LEFT JOIN exercise_library el ON rpe.exercise_library_id = el.exercise_library_id
      LEFT JOIN resist_user_exercise_library uel ON rpe.user_exercise_library_id = uel.user_exercise_library_id
      WHERE rp.user_id = $1
        AND (rpe.exercise_library_id IS NOT NULL OR rpe.user_exercise_library_id IS NOT NULL)
      ORDER BY exercise_name
    `;
    
    console.log('🔍 [getUserExerciseList] Executing simple query...');
    const result = await client.query(query, [userId]);
    console.log('🔍 [getUserExerciseList] Query completed', { 
      rowCount: result.rows.length,
      sampleData: result.rows.slice(0, 3)
    });
    
    // Transform results to UserExercise format
    const exercises: UserExercise[] = result.rows.map((row: any) => ({
      exerciseId: row.exercise_library_id 
        ? `lib_${row.exercise_library_id}` 
        : `user_${row.user_exercise_library_id}`,
      exerciseName: row.exercise_name,
      exerciseSource: row.exercise_source,
      exerciseLibraryId: row.exercise_library_id,
      userExerciseLibraryId: row.user_exercise_library_id
    }));
    
    console.log('🔍 [getUserExerciseList] All exercises processed:', exercises.length);
    clientLogger.info('getUserExerciseList completed successfully', { exerciseCount: exercises.length });

    return {
      success: true,
      exercises
    };

  } catch (error) {
    console.log('🔍 [getUserExerciseList] Error:', error);
    clientLogger.error('Error fetching user exercise list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user exercise list'
    };
  }
}

// Keep the old function name for backward compatibility, but make it lightweight
export async function getUserExercises({ userId }: { userId: number }): Promise<GetUserExercisesResult> {
  return getUserExerciseList({ userId });
}
