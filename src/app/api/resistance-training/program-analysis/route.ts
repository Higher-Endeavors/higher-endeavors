import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';
import type { ProgramVolumeAnalysis } from '(protected)/tools/fitness/resistance-training/analyze/types/analysis.zod';
import type { ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const programId = searchParams.get('program_id');
    const userId = searchParams.get('user_id') || session?.user?.id;
    const loadUnit = searchParams.get('load_unit') || 'lbs';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    // Fetch program details
    const programQuery = `
      SELECT 
        program_id as "resistanceProgramId",
        program_name as "programName",
        program_duration as "programDuration"
      FROM resist_programs 
      WHERE program_id = $1 AND user_id = $2
    `;
    
    const programResult = await SingleQuery(programQuery, [programId, userId]);
    
    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
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
    
    const exercisesResult = await SingleQuery(exercisesQuery, [programId]);
    const exercises = exercisesResult.rows as (ProgramExercisesPlanned & { programInstance?: number; exerciseName?: string })[];
    
    // Group exercises by week (program_instance)
    const weeklyExercises: (ProgramExercisesPlanned & { exerciseName?: string })[][] = [];
    const maxWeek = Math.max(...exercises.map(ex => ex.programInstance || 1), 1);
    
    for (let week = 1; week <= maxWeek; week++) {
      const weekExercises = exercises.filter(ex => (ex.programInstance || 1) === week);
      weeklyExercises.push(weekExercises);
    }
    
    // Calculate volume analysis
    const { calculateProgramVolumeAnalysis } = await import('(protected)/tools/fitness/resistance-training/analyze/lib/volumeCalculations');
    const volumeAnalysis = calculateProgramVolumeAnalysis(program, weeklyExercises, loadUnit);
    
    return NextResponse.json({
      success: true,
      analysis: volumeAnalysis
    });

  } catch (error) {
    await serverLogger.error('Error fetching program analysis', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch program analysis' 
      },
      { status: 500 }
    );
  }
}
