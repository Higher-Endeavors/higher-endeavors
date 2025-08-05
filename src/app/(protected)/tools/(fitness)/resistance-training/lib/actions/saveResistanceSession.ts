'use server';

import { getClient } from '@/app/lib/dbAdapter';
import { z } from 'zod';

const SaveResistanceSessionInput = z.object({
  userId: z.number().int(),
  resistanceProgramId: z.number().int(),
  week: z.number().int(),
  date: z.string(), // ISO date
  exercises: z.array(z.object({
    programExercisesId: z.number().int().min(0), // Allow 0 for new Act-only exercises
    actualSets: z.array(z.any()), // Should match ExerciseSet[]
    // Additional fields for Act-only exercises
    exerciseSource: z.string().optional(),
    exerciseLibraryId: z.number().int().nullable().optional(),
    userExerciseLibraryId: z.number().int().nullable().optional(),
    pairing: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })),
});

export async function saveResistanceSession(input: z.infer<typeof SaveResistanceSessionInput>) {
  const parse = SaveResistanceSessionInput.safeParse(input);
  if (!parse.success) {
    console.error('Validation error:', parse.error);
    return { success: false, error: 'Invalid input', details: parse.error };
  }
  const { userId, resistanceProgramId, week, date, exercises } = parse.data;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (const ex of exercises) {
      if (ex.programExercisesId === 0) {
        // Insert new Act-only exercise
        await client.query(
          `INSERT INTO resist_program_exercises (
            program_id, 
            program_instance, 
            exercise_source, 
            exercise_library_id, 
            user_exercise_library_id, 
            pairing, 
            notes, 
            planned_sets, 
            actual_sets
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            resistanceProgramId,
            week,
            ex.exerciseSource || 'library',
            ex.exerciseLibraryId ?? null,
            ex.userExerciseLibraryId ?? null,
            ex.pairing ?? null,
            ex.notes ?? null,
            JSON.stringify([]), // Empty planned_sets for Act-only exercises
            JSON.stringify(ex.actualSets), // Exercise data goes to actual_sets
          ]
        );
      } else {
        // Update existing exercise
        await client.query(
          `UPDATE resist_program_exercises SET actual_sets = $1, updated_at = NOW() WHERE program_exercises_id = $2 AND program_id = $3`,
          [JSON.stringify(ex.actualSets), ex.programExercisesId, resistanceProgramId]
        );
      }
    }
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    client.release();
  }
} 