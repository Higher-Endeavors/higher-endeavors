'use server';

import { getClient } from 'lib/dbAdapter';
import { clientLogger } from 'lib/logging/logger.client';

export interface ExerciseInstance {
  programId: number;
  programName: string;
  programInstance: number;
  executionDate: string;
  repVolume: number;
  loadVolume: number;
  reps: number;
  sets: number;
  load: number;
  loadUnit: string;
}

export interface ExerciseAnalysisData {
  exerciseName: string;
  instances: ExerciseInstance[];
  timeframeData: {
    period: string;
    instances: ExerciseInstance[];
    averageLoadVolume: number;
    totalLoadVolume: number;
    instanceCount: number;
  }[];
}

export interface GetExerciseAnalysisResult {
  success: boolean;
  analysis?: ExerciseAnalysisData;
  error?: string;
}

export async function getExerciseAnalysis({ 
  userId, 
  exerciseId, 
  timeframe 
}: { 
  userId: number; 
  exerciseId: string; 
  timeframe: string 
}): Promise<GetExerciseAnalysisResult> {
  try {
    clientLogger.info('Starting exercise analysis', { userId, exerciseId, timeframe });
    
    const client = await getClient();
    
    // Parse exercise ID to get source and ID
    const [source, id] = exerciseId.split('_');
    const exerciseLibraryId = source === 'lib' ? parseInt(id) : null;
    const userExerciseLibraryId = source === 'user' ? parseInt(id) : null;
    const cmeLibraryId = source === 'cme' ? parseInt(id) : null;
    
    clientLogger.info('Parsed exercise ID', { source, id, exerciseLibraryId, userExerciseLibraryId, cmeLibraryId });
    
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
    
    clientLogger.info('Date range calculated', { startDate: startDate.toISOString(), timeframe });
    
    // Build the WHERE clause based on exercise source
    let whereClause = 'WHERE rp.user_id = $1 AND rpe.actual_sets IS NOT NULL AND rpe.actual_sets::text != \'[]\' AND rp.created_at >= $2';
    let paramIndex = 3;
    
    if (exerciseLibraryId) {
      whereClause += ` AND rpe.exercise_library_id = $${paramIndex}`;
    } else if (userExerciseLibraryId) {
      whereClause += ` AND rpe.user_exercise_library_id = $${paramIndex}`;
    } else if (cmeLibraryId) {
      whereClause += ` AND rpe.exercise_library_id = $${paramIndex}`;
    }
    
    // Query to get exercise instances with program data
    const query = `
      SELECT 
        rpe.program_id as "programId",
        rp.program_name as "programName",
        rpe.program_instance as "programInstance",
        rp.created_at as "executionDate",
        rpe.actual_sets as "actualSets"
      FROM resist_program_exercises rpe
      JOIN resist_programs rp ON rpe.program_id = rp.program_id
      ${whereClause}
      ORDER BY rp.created_at DESC, rpe.program_instance ASC
    `;
    
    const params = [userId, startDate.toISOString()];
    if (exerciseLibraryId || userExerciseLibraryId || cmeLibraryId) {
      const exerciseId = exerciseLibraryId || userExerciseLibraryId || cmeLibraryId;
      if (exerciseId !== null) {
        params.push(exerciseId);
      }
    }
    
    clientLogger.info('Executing query', { query, params });
    
    const result = await client.query(query, params);
    
    clientLogger.info('Query executed successfully', { rowCount: result.rows.length });
    
    // Get exercise name
    let exerciseName = 'Unknown Exercise';
    if (exerciseLibraryId) {
      clientLogger.info('Fetching exercise name from library', { exerciseLibraryId });
      const nameResult = await client.query(
        'SELECT exercise_name FROM exercise_library WHERE exercise_library_id = $1',
        [exerciseLibraryId]
      );
      if (nameResult.rows.length > 0) {
        exerciseName = nameResult.rows[0].exercise_name;
        clientLogger.info('Found exercise name', { exerciseName });
      }
    } else if (userExerciseLibraryId) {
      clientLogger.info('Fetching exercise name from user library', { userExerciseLibraryId });
      const nameResult = await client.query(
        'SELECT exercise_name FROM resist_user_exercise_library WHERE user_exercise_library_id = $1',
        [userExerciseLibraryId]
      );
      if (nameResult.rows.length > 0) {
        exerciseName = nameResult.rows[0].exercise_name;
        clientLogger.info('Found exercise name', { exerciseName });
      }
    }
    
    // Process instances and calculate volumes
    const instances: ExerciseInstance[] = [];
    
    clientLogger.info('Processing instances', { totalRows: result.rows.length });
    
    for (const row of result.rows) {
      const actualSets = row.actualSets;
      clientLogger.info('Processing row', { 
        programId: row.programId, 
        programName: row.programName,
        actualSetsType: typeof actualSets,
        actualSetsLength: Array.isArray(actualSets) ? actualSets.length : 'not array'
      });
      
      if (Array.isArray(actualSets) && actualSets.length > 0) {
        // Calculate total reps, sets, and load for this instance
        let totalReps = 0;
        let totalSets = 0;
        let totalLoad = 0;
        let loadUnit = 'lbs';
        
        for (const set of actualSets) {
          clientLogger.info('Processing set', { set });
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
        
        clientLogger.info('Calculated totals', { totalReps, totalSets, totalLoad, loadUnit });
        
        if (totalReps > 0 && totalSets > 0 && totalLoad > 0) {
          const repVolume = totalReps * totalSets;
          const loadVolume = repVolume * totalLoad;
          
          instances.push({
            programId: row.programId,
            programName: row.programName,
            programInstance: row.programInstance || 1,
            executionDate: row.executionDate,
            repVolume,
            loadVolume,
            reps: totalReps,
            sets: totalSets,
            load: totalLoad,
            loadUnit
          });
          
          clientLogger.info('Added instance', { repVolume, loadVolume });
        }
      }
    }
    
    clientLogger.info('Processed all instances', { instanceCount: instances.length });
    
    // Group instances by time periods
    const timeframeData = groupInstancesByTimeframe(instances, timeframe);
    
    clientLogger.info('Grouped by timeframe', { timeframeDataCount: timeframeData.length });
    
    return {
      success: true,
      analysis: {
        exerciseName,
        instances,
        timeframeData
      }
    };
  } catch (error) {
    clientLogger.error('Error fetching exercise analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exercise analysis'
    };
  }
}

function groupInstancesByTimeframe(instances: ExerciseInstance[], timeframe: string) {
  const now = new Date();
  const groups: { [key: string]: ExerciseInstance[] } = {};
  
  instances.forEach(instance => {
    const instanceDate = new Date(instance.executionDate);
    let periodKey: string;
    
    switch (timeframe) {
      case 'week':
        // Group by week
        const weekStart = new Date(instanceDate);
        weekStart.setDate(instanceDate.getDate() - instanceDate.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        // Group by month
        periodKey = `${instanceDate.getFullYear()}-${String(instanceDate.getMonth() + 1).padStart(2, '0')}`;
        break;
      case '3month':
        // Group by quarter
        const quarter = Math.floor(instanceDate.getMonth() / 3) + 1;
        periodKey = `${instanceDate.getFullYear()}-Q${quarter}`;
        break;
      case '6month':
        // Group by half-year
        const halfYear = instanceDate.getMonth() < 6 ? 'H1' : 'H2';
        periodKey = `${instanceDate.getFullYear()}-${halfYear}`;
        break;
      case 'year':
        // Group by year
        periodKey = instanceDate.getFullYear().toString();
        break;
      default:
        periodKey = instanceDate.toISOString().split('T')[0];
    }
    
    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }
    groups[periodKey].push(instance);
  });
  
  // Convert to array and calculate averages
  return Object.entries(groups)
    .map(([period, periodInstances]) => {
      const totalLoadVolume = periodInstances.reduce((sum, inst) => sum + inst.loadVolume, 0);
      const averageLoadVolume = totalLoadVolume / periodInstances.length;
      
      return {
        period,
        instances: periodInstances,
        averageLoadVolume,
        totalLoadVolume,
        instanceCount: periodInstances.length
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
}
