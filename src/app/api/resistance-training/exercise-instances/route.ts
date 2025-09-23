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
    const exerciseId = searchParams.get('exercise_id');
    const timeframe = searchParams.get('timeframe') || 'year';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!exerciseId) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 });
    }

    // Parse exercise ID to get source and ID
    const [source, id] = exerciseId.split('_');
    const exerciseLibraryId = source === 'lib' ? parseInt(id) : null;
    const userExerciseLibraryId = source === 'user' ? parseInt(id) : null;

    if (!exerciseLibraryId && !userExerciseLibraryId) {
      return NextResponse.json({ error: 'Invalid exercise ID format' }, { status: 400 });
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3month':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6month':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build the WHERE clause based on exercise source
    let whereClause = 'WHERE rp.user_id = $1 AND rpe.actual_sets IS NOT NULL AND rpe.actual_sets::text != \'[]\' AND rp.created_at >= $2';
    let paramIndex = 3;
    
    if (exerciseLibraryId) {
      whereClause += ` AND rpe.exercise_library_id = $${paramIndex}`;
    } else if (userExerciseLibraryId) {
      whereClause += ` AND rpe.user_exercise_library_id = $${paramIndex}`;
    }

    // Query to get exercise instances with actual_sets data
    const query = `
      SELECT 
        rpe.program_id as "programId",
        rp.program_name as "programName",
        rpe.program_instance as "programInstance",
        rp.created_at as "executionDate",
        rp.updated_at as "updatedAt",
        rpe.actual_sets as "actualSets",
        COALESCE(el.exercise_name, uel.exercise_name) as "exerciseName"
      FROM resist_program_exercises rpe
      JOIN resist_programs rp ON rpe.program_id = rp.program_id
      LEFT JOIN exercise_library el ON rpe.exercise_library_id = el.exercise_library_id
      LEFT JOIN resist_user_exercise_library uel ON rpe.user_exercise_library_id = uel.user_exercise_library_id
      ${whereClause}
      ORDER BY rp.created_at DESC, rpe.program_instance ASC
    `;
    
    const params = [userId, startDate.toISOString()];
    if (exerciseLibraryId || userExerciseLibraryId) {
      const exerciseId = exerciseLibraryId || userExerciseLibraryId;
      if (exerciseId !== null) {
        params.push(exerciseId.toString());
      }
    }

    const result = await SingleQuery(query, params);

    // Process instances and calculate basic metrics
    const instances = result.rows.map((row: any) => {
      const actualSets = row.actualSets;
      let totalReps = 0;
      let totalSets = 0;
      let totalLoad = 0;
      let loadUnit = 'lbs';
      
      if (Array.isArray(actualSets) && actualSets.length > 0) {
        for (const set of actualSets) {
          if (set.reps && set.load && set.load !== '0' && set.load !== '') {
            const reps = parseInt(set.reps) || 0;
            const load = parseFloat(set.load) || 0;
            totalReps += reps;
            totalSets += 1;
            totalLoad += load;
            if (set.loadUnit) {
              loadUnit = set.loadUnit;
            }
          }
        }
      }

      const repVolume = totalReps; // Rep volume is just the total reps
      const loadVolume = totalReps * totalLoad; // Load volume is reps × load

      return {
        programId: row.programId,
        programName: row.programName,
        programInstance: row.programInstance || 1,
        executionDate: row.executionDate,
        updatedAt: row.updatedAt,
        exerciseName: row.exerciseName,
        actualSets: actualSets,
        totalReps,
        totalSets,
        totalLoad,
        loadUnit,
        repVolume,
        loadVolume
      };
    });

    return NextResponse.json({
      success: true,
      exerciseName: instances.length > 0 ? instances[0].exerciseName : 'Unknown Exercise',
      instances,
      timeframe,
      totalInstances: instances.length
    });

  } catch (error) {
    await serverLogger.error('Error fetching exercise instances', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch exercise instances' 
      },
      { status: 500 }
    );
  }
}
