import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('user_id') || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's performance records
    const performanceRecordsQuery = `
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
      WHERE rp.user_id = $1
        AND rpe.actual_sets IS NOT NULL 
        AND rpe.actual_sets::text != '[]'
      ORDER BY rp.created_at DESC
    `;

    const performanceResult = await SingleQuery(performanceRecordsQuery, [userId]);

    // Get structural balance reference lifts
    const refLiftsQuery = `
      SELECT 
        id,
        exercise_name,
        struct_bal_ref_lift_load,
        struct_bal_ref_lift_note
      FROM struct_bal_ref_lifts_list
      ORDER BY exercise_name
    `;

    const refLiftsResult = await SingleQuery(refLiftsQuery);

    // Process performance records to extract individual sets
    const exerciseSets: { [exerciseName: string]: Array<{ reps: number; load: number; loadUnit: string; date: string; programName: string }> } = {};
    
    performanceResult.rows.forEach((row: any) => {
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
          repCount,
          maxLoad: maxSet.load,
          loadUnit: maxSet.loadUnit,
          date: maxSet.date,
          programName: maxSet.programName
        });
      });
    });

    // Create reference lifts lookup
    const refLiftsMap = new Map();
    refLiftsResult.rows.forEach((lift: any) => {
      refLiftsMap.set(lift.exercise_name.toLowerCase(), {
        id: lift.id,
        exerciseName: lift.exercise_name,
        refLoad: lift.struct_bal_ref_lift_load,
        note: lift.struct_bal_ref_lift_note
      });
    });

    // Find structural balance analysis
    const imbalances: Array<{
      exercise1: string;
      exercise2: string;
      repCount: number;
      actualRatio: number;
      idealRatio: number;
      deviation: number;
      severity: 'yellow' | 'red';
      exercise1Load: number;
      exercise2Load: number;
      loadUnit: string;
    }> = [];

    // Compare all pairs of exercises that have the same rep count
    for (let i = 0; i < performanceRecords.length; i++) {
      for (let j = i + 1; j < performanceRecords.length; j++) {
        const record1 = performanceRecords[i];
        const record2 = performanceRecords[j];
        
        // Only compare if same rep count and both exercises are in structural balance data
        if (record1.repCount === record2.repCount && 
            refLiftsMap.has(record1.exerciseName.toLowerCase()) && 
            refLiftsMap.has(record2.exerciseName.toLowerCase())) {
          
          const ref1 = refLiftsMap.get(record1.exerciseName.toLowerCase());
          const ref2 = refLiftsMap.get(record2.exerciseName.toLowerCase());
          
          // Calculate actual ratio (exercise1 / exercise2)
          const actualRatio = record1.maxLoad / record2.maxLoad;
          
          // Calculate ideal ratio (ref1 / ref2)
          const idealRatio = ref1.refLoad / ref2.refLoad;
          
          // Calculate deviation percentage
          const deviation = Math.abs((actualRatio - idealRatio) / idealRatio) * 100;
          
          // Only include if deviation is >= 10%
          if (deviation >= 10) {
            const severity = deviation >= 20 ? 'red' : 'yellow';
            
            imbalances.push({
              exercise1: record1.exerciseName,
              exercise2: record2.exerciseName,
              repCount: record1.repCount,
              actualRatio,
              idealRatio,
              deviation,
              severity,
              exercise1Load: record1.maxLoad,
              exercise2Load: record2.maxLoad,
              loadUnit: record1.loadUnit
            });
          }
        }
      }
    }

    // Group imbalances by exercise for easier frontend consumption
    const imbalancesByExercise: { [exerciseName: string]: Array<{
      comparedExercise: string;
      repCount: number;
      actualRatio: number;
      idealRatio: number;
      deviation: number;
      severity: 'yellow' | 'red';
      userLoad: number;
      comparedLoad: number;
      loadUnit: string;
    }> } = {};

    imbalances.forEach(imbalance => {
      // Add to both exercises
      [imbalance.exercise1, imbalance.exercise2].forEach(exerciseName => {
        if (!imbalancesByExercise[exerciseName]) {
          imbalancesByExercise[exerciseName] = [];
        }
        
        const isFirstExercise = exerciseName === imbalance.exercise1;
        const comparedExercise = isFirstExercise ? imbalance.exercise2 : imbalance.exercise1;
        const userLoad = isFirstExercise ? imbalance.exercise1Load : imbalance.exercise2Load;
        const comparedLoad = isFirstExercise ? imbalance.exercise2Load : imbalance.exercise1Load;
        const actualRatio = isFirstExercise ? imbalance.actualRatio : 1 / imbalance.actualRatio;
        const idealRatio = isFirstExercise ? imbalance.idealRatio : 1 / imbalance.idealRatio;
        
        imbalancesByExercise[exerciseName].push({
          comparedExercise,
          repCount: imbalance.repCount,
          actualRatio,
          idealRatio,
          deviation: imbalance.deviation,
          severity: imbalance.severity,
          userLoad,
          comparedLoad,
          loadUnit: imbalance.loadUnit
        });
      });
    });

    return NextResponse.json({
      success: true,
      imbalances: imbalancesByExercise,
      totalImbalances: imbalances.length,
      totalExercisesWithImbalances: Object.keys(imbalancesByExercise).length
    });

  } catch (error) {
    await serverLogger.error('Error analyzing structural balance', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze structural balance' 
      },
      { status: 500 }
    );
  }
}
