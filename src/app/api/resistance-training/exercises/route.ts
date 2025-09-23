import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    // Allow admin to specify user_id, otherwise use session user
    const userId = searchParams.get('user_id') || session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query to get all exercises performed by the user with analysis data
    const query = `
      SELECT DISTINCT
        rpe.exercise_library_id,
        rpe.user_exercise_library_id,
        rpe.exercise_source,
        COALESCE(el.exercise_name, uel.exercise_name) as exercise_name,
        COUNT(DISTINCT rpe.program_id) as program_count,
        COUNT(rpe.program_id) as instance_count,
        MAX(rp.updated_at) as last_execution_date,
        MIN(rp.created_at) as first_execution_date
      FROM resist_program_exercises rpe
      INNER JOIN resist_programs rp ON rpe.program_id = rp.program_id
      LEFT JOIN exercise_library el ON rpe.exercise_library_id = el.exercise_library_id
      LEFT JOIN resist_user_exercise_library uel ON rpe.user_exercise_library_id = uel.user_exercise_library_id
      WHERE rp.user_id = $1
        AND (rpe.exercise_library_id IS NOT NULL OR rpe.user_exercise_library_id IS NOT NULL)
        AND rpe.actual_sets IS NOT NULL 
        AND rpe.actual_sets::text != '[]'
      GROUP BY 
        rpe.exercise_library_id,
        rpe.user_exercise_library_id,
        rpe.exercise_source,
        COALESCE(el.exercise_name, uel.exercise_name)
      ORDER BY exercise_name
    `;

    const result = await SingleQuery(query, [userId]);

    // Transform results to include exercise ID for frontend use
    const exercises = result.rows.map((row: any) => ({
      exerciseId: row.exercise_library_id 
        ? `lib_${row.exercise_library_id}` 
        : `user_${row.user_exercise_library_id}`,
      exerciseName: row.exercise_name,
      exerciseSource: row.exercise_source,
      exerciseLibraryId: row.exercise_library_id,
      userExerciseLibraryId: row.user_exercise_library_id,
      programCount: parseInt(row.program_count),
      instanceCount: parseInt(row.instance_count),
      lastExecutionDate: row.last_execution_date,
      firstExecutionDate: row.first_execution_date
    }));

    return NextResponse.json({
      success: true,
      exercises
    });

  } catch (error) {
    await serverLogger.error('Error fetching user exercises for analysis', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user exercises for analysis' 
      },
      { status: 500 }
    );
  }
}
