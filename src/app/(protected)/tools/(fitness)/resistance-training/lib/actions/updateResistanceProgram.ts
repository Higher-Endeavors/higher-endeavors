"use server";

import { getClient } from '@/app/lib/dbAdapter';
import { ProgramExercisesPlanned } from '../../../resistance-training/types/resistance-training.zod';

interface UpdateResistanceProgramInput {
  programId: number;
  userId: number;
  programName: string;
  phaseFocus?: string;
  periodizationType?: string;
  progressionRules: any;
  programDuration: number;
  notes?: string;
  weeklyExercises: ProgramExercisesPlanned[][];
}

export async function updateResistanceProgram({
  programId,
  userId,
  programName,
  phaseFocus,
  periodizationType,
  progressionRules,
  programDuration,
  notes,
  weeklyExercises,
}: UpdateResistanceProgramInput) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    // Update program
    await client.query(
      `UPDATE resist_programs 
       SET program_name = $1, phase_focus = $2, periodization_type = $3, progression_rules = $4, 
           program_duration = $5, notes = $6, updated_at = NOW()
       WHERE program_id = $7 AND user_id = $8`,
      [programName, phaseFocus, periodizationType, JSON.stringify(progressionRules), programDuration, notes, programId, userId]
    );
    
    // Delete existing exercises for this program
    await client.query(
      `DELETE FROM resist_program_exercises WHERE program_id = $1`,
      [programId]
    );
    
    // Insert new exercises
    for (let weekIdx = 0; weekIdx < weeklyExercises.length; weekIdx++) {
      const week = weeklyExercises[weekIdx];
      for (const ex of week) {
        await client.query(
          `INSERT INTO resist_program_exercises (program_id, program_instance, exercise_source, exercise_library_id, user_exercise_library_id, pairing, notes, planned_sets)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [programId, weekIdx + 1, ex.exerciseSource, ex.exerciseLibraryId ?? null, ex.userExerciseLibraryId ?? null, ex.pairing ?? null, ex.notes ?? null, JSON.stringify(ex.plannedSets ?? [])]
        );
      }
    }
    
    await client.query('COMMIT');
    return { success: true, programId };
  } catch (error) {
    await client.query('ROLLBACK');
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    client.release();
  }
} 