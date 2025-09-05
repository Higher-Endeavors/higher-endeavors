"use server";

import { getClient } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { ProgramExercisesPlanned } from '../../types/resistance-training.zod';

interface SaveResistanceProgramInput {
  userId: number;
  programName: string;
  phaseFocus?: string;
  periodizationType?: string;
  progressionRules: any;
  programDuration: number;
  notes?: string;
  weeklyExercises: ProgramExercisesPlanned[][];
}

export async function saveResistanceProgram({
  userId,
  programName,
  phaseFocus,
  periodizationType,
  progressionRules,
  programDuration,
  notes,
  weeklyExercises,
}: SaveResistanceProgramInput) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    // Insert program
    const programRes = await client.query(
      `INSERT INTO resist_programs (user_id, program_name, phase_focus, periodization_type, progression_rules, program_duration, notes, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NULL)
       RETURNING program_id`,
      [userId, programName, phaseFocus, periodizationType, JSON.stringify(progressionRules), programDuration, notes]
    );
    const programId = programRes.rows[0].program_id;
    // Prepare exercises for bulk insert
    const exerciseRows = [];
    for (let weekIdx = 0; weekIdx < weeklyExercises.length; weekIdx++) {
      const week = weeklyExercises[weekIdx];
      for (const ex of week) {
        exerciseRows.push({
          program_id: programId,
          program_instance: weekIdx + 1,
          exercise_source: ex.exerciseSource,
          exercise_library_id: ex.exerciseLibraryId ?? null,
          user_exercise_library_id: ex.userExerciseLibraryId ?? null,
          pairing: ex.pairing ?? null,
          notes: ex.notes ?? null,
          planned_sets: JSON.stringify(ex.plannedSets ?? []),
        });
      }
    }
    // Bulk insert exercises
    for (const row of exerciseRows) {
      await client.query(
        `INSERT INTO resist_program_exercises (program_id, program_instance, exercise_source, exercise_library_id, user_exercise_library_id, pairing, notes, planned_sets)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [row.program_id, row.program_instance, row.exercise_source, row.exercise_library_id, row.user_exercise_library_id, row.pairing, row.notes, row.planned_sets]
      );
    }
    await client.query('COMMIT');
    return { success: true, programId };
  } catch (error) {
    await client.query('ROLLBACK');
    await serverLogger.error('Failed to save resistance program', error, { userId, programName });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    client.release();
  }
} 