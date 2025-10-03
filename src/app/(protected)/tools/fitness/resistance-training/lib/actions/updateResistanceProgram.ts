"use server";

import { getClient } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';
import { UpdateResistanceProgramSchema, UpdateResistanceProgramInput } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';

export async function updateResistanceProgram(input: UpdateResistanceProgramInput) {
  // Validate the input using the schema
  const validatedInput = UpdateResistanceProgramSchema.parse(input);
  
  const { programId, userId, programName, resistPhaseId, resistPeriodizationId, progressionRules, programDuration, notes, weeklyExercises } = validatedInput;
  
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    // Update program metadata
    await client.query(
      `UPDATE resist_programs 
       SET program_name = $1,
           resist_phase_id = $2,
           resist_periodization_id = $3,
           progression_rules = $4,
           program_duration = $5,
           notes = $6,
           updated_at = NOW()
       WHERE program_id = $7 AND user_id = $8`,
      [
        programName,
        typeof resistPhaseId === 'number' ? resistPhaseId : null,
        typeof resistPeriodizationId === 'number' ? resistPeriodizationId : null,
        JSON.stringify(progressionRules),
        programDuration,
        notes,
        programId,
        userId,
      ]
    );
    
    // Process each week independently
    for (let weekIdx = 0; weekIdx < weeklyExercises.length; weekIdx++) {
      const week = weeklyExercises[weekIdx];
      const programInstance = weekIdx + 1;
      
      // Get existing exercises for this specific week
      const existingWeekExercisesResult = await client.query(
        `SELECT program_exercises_id, exercise_source, exercise_library_id, user_exercise_library_id, pairing, notes, planned_sets, actual_sets
         FROM resist_program_exercises 
         WHERE program_id = $1 AND program_instance = $2`,
        [programId, programInstance]
      );
      
      const existingWeekExercises = existingWeekExercisesResult.rows;
      
      // Create a map of existing exercises for this week
      const existingExerciseMap = new Map<string, any>();
      existingWeekExercises.forEach((ex: any) => {
        const exerciseId = ex.exercise_library_id || ex.user_exercise_library_id || 'null';
        const pairing = ex.pairing || 'null';
        const key = `${ex.exercise_source}-${exerciseId}-${pairing}`;
        existingExerciseMap.set(key, ex);
      });
      
      // Process each exercise in the new week data
      for (const ex of week) {
        const exerciseId = ex.exerciseLibraryId || ex.userExerciseLibraryId || 'null';
        const pairing = ex.pairing || 'null';
        const exerciseKey = `${ex.exerciseSource}-${exerciseId}-${pairing}`;
        const existingExercise = existingExerciseMap.get(exerciseKey);
        
        if (existingExercise) {
          // Exercise exists - update only if planned_sets or other data has changed
          const plannedSetsChanged = JSON.stringify(existingExercise.planned_sets) !== JSON.stringify(ex.plannedSets ?? []);
          const notesChanged = existingExercise.notes !== (ex.notes ?? null);
          const pairingChanged = existingExercise.pairing !== (ex.pairing ?? null);
          
          if (plannedSetsChanged || notesChanged || pairingChanged) {
            await client.query(
              `UPDATE resist_program_exercises 
               SET planned_sets = $1, notes = $2, pairing = $3, updated_at = NOW()
               WHERE program_exercises_id = $4`,
              [JSON.stringify(ex.plannedSets ?? []), ex.notes ?? null, ex.pairing ?? null, existingExercise.program_exercises_id]
            );
          }
          
          // Remove from map to track which exercises are no longer needed
          existingExerciseMap.delete(exerciseKey);
        } else {
          // New exercise - insert it
          await client.query(
            `INSERT INTO resist_program_exercises (program_id, program_instance, exercise_source, exercise_library_id, user_exercise_library_id, pairing, notes, planned_sets)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [programId, programInstance, ex.exerciseSource, ex.exerciseLibraryId ?? null, ex.userExerciseLibraryId ?? null, ex.pairing ?? null, ex.notes ?? null, JSON.stringify(ex.plannedSets ?? [])]
          );
        }
      }
      
      // Remove exercises that are no longer in this week
      for (const [key, existingExercise] of existingExerciseMap) {
        await client.query(
          `DELETE FROM resist_program_exercises WHERE program_exercises_id = $1`,
          [existingExercise.program_exercises_id]
        );
      }
    }
    
    // If the program duration was shortened, remove any exercises from weeks beyond the new duration
    if (weeklyExercises.length < programDuration) {
      await client.query(
        `DELETE FROM resist_program_exercises 
         WHERE program_id = $1 AND program_instance > $2`,
        [programId, weeklyExercises.length]
      );
    }
    
    await client.query('COMMIT');
    return { success: true, programId };
  } catch (error) {
    await client.query('ROLLBACK');
    await serverLogger.error('Failed to update resistance program', error, { userId, programId });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    client.release();
  }
}