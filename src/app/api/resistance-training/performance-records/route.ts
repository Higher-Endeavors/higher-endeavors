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
    const timeframe = searchParams.get('timeframe') || 'all';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date | null = null;
    
    if (timeframe !== 'all') {
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
          startDate = null; // All time
      }
    }

    // Build the WHERE clause
    let whereClause = 'WHERE rp.user_id = $1 AND rpe.actual_sets IS NOT NULL AND rpe.actual_sets::text != \'[]\'';
    let params: any[] = [userId];
    let paramIndex = 2;
    
    if (startDate) {
      whereClause += ` AND rp.created_at >= $${paramIndex}`;
      params.push(startDate.toISOString());
      paramIndex++;
    }

    // Query to get all exercise instances with actual_sets data
    const query = `
      SELECT 
        rpe.program_id as "programId",
        rp.program_name as "programName",
        rpe.program_instance as "programInstance",
        rp.created_at as "executionDate",
        rp.updated_at as "updatedAt",
        rpe.actual_sets as "actualSets",
        COALESCE(el.exercise_name, uel.exercise_name) as "exerciseName",
        rpe.exercise_library_id,
        rpe.user_exercise_library_id
      FROM resist_program_exercises rpe
      JOIN resist_programs rp ON rpe.program_id = rp.program_id
      LEFT JOIN exercise_library el ON rpe.exercise_library_id = el.exercise_library_id
      LEFT JOIN resist_user_exercise_library uel ON rpe.user_exercise_library_id = uel.user_exercise_library_id
      ${whereClause}
      ORDER BY rp.created_at DESC
    `;
    
    const result = await SingleQuery(query, params);

    // Process instances and extract individual sets for PR analysis
    const exerciseSets: { [exerciseName: string]: Array<{ reps: number; load: number; loadUnit: string; date: string; programName: string }> } = {};
    
    result.rows.forEach((row: any) => {
      const exerciseName = row.exerciseName;
      const actualSets = row.actualSets;
      const executionDate = row.executionDate;
      const programName = row.programName;
      
      if (!exerciseSets[exerciseName]) {
        exerciseSets[exerciseName] = [];
      }
      
      if (Array.isArray(actualSets) && actualSets.length > 0) {
        actualSets.forEach((set: any) => {
          if (set.reps && set.load && set.load !== '0' && set.load !== '') {
            const reps = parseInt(set.reps) || 0;
            const load = parseFloat(set.load) || 0;
            const loadUnit = set.loadUnit || 'lbs';
            
            if (reps > 0 && load > 0) {
              exerciseSets[exerciseName].push({
                reps,
                load,
                loadUnit,
                date: executionDate,
                programName
              });
            }
          }
        });
      }
    });

    // Calculate PRs for each exercise and rep count (1-15)
    const performanceRecords: Array<{
      exerciseName: string;
      exerciseId: string;
      repCount: number;
      maxLoad: number;
      loadUnit: string;
      date: string;
      programName: string;
    }> = [];

    Object.entries(exerciseSets).forEach(([exerciseName, sets]) => {
      // Group sets by rep count
      const setsByReps: { [reps: number]: Array<{ load: number; loadUnit: string; date: string; programName: string }> } = {};
      
      sets.forEach(set => {
        if (set.reps >= 1 && set.reps <= 15) {
          if (!setsByReps[set.reps]) {
            setsByReps[set.reps] = [];
          }
          setsByReps[set.reps].push({
            load: set.load,
            loadUnit: set.loadUnit,
            date: set.date,
            programName: set.programName
          });
        }
      });

      // Find max load for each rep count
      Object.entries(setsByReps).forEach(([repCountStr, repSets]) => {
        const repCount = parseInt(repCountStr);
        const maxSet = repSets.reduce((max, set) => set.load > max.load ? set : max);
        
        performanceRecords.push({
          exerciseName,
          exerciseId: '', // Will be set below
          repCount,
          maxLoad: maxSet.load,
          loadUnit: maxSet.loadUnit,
          date: maxSet.date,
          programName: maxSet.programName
        });
      });
    });

    // Add exercise IDs to the records
    const recordsWithIds = performanceRecords.map(record => {
      // Find the exercise ID from the original data
      const exerciseRow = result.rows.find((row: any) => row.exerciseName === record.exerciseName);
      const exerciseId = exerciseRow?.exercise_library_id 
        ? `lib_${exerciseRow.exercise_library_id}` 
        : `user_${exerciseRow?.user_exercise_library_id}`;
      
      return {
        ...record,
        exerciseId
      };
    });

    // Group records by exercise for easier frontend consumption
    const groupedRecords: { [exerciseName: string]: Array<{
      repCount: number;
      maxLoad: number;
      loadUnit: string;
      date: string;
      programName: string;
    }> } = {};

    recordsWithIds.forEach(record => {
      if (!groupedRecords[record.exerciseName]) {
        groupedRecords[record.exerciseName] = [];
      }
      groupedRecords[record.exerciseName].push({
        repCount: record.repCount,
        maxLoad: record.maxLoad,
        loadUnit: record.loadUnit,
        date: record.date,
        programName: record.programName
      });
    });

    // Sort each exercise's records by rep count
    Object.keys(groupedRecords).forEach(exerciseName => {
      groupedRecords[exerciseName].sort((a, b) => a.repCount - b.repCount);
    });

    return NextResponse.json({
      success: true,
      records: groupedRecords,
      timeframe,
      totalExercises: Object.keys(groupedRecords).length,
      totalRecords: recordsWithIds.length
    });

  } catch (error) {
    await serverLogger.error('Error fetching performance records', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch performance records' 
      },
      { status: 500 }
    );
  }
}
