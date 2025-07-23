'use server';

import { getClient } from '@/app/lib/dbAdapter';
import { z } from 'zod';

const SaveResistanceSessionInput = z.object({
  userId: z.number().int(),
  resistanceProgramId: z.number().int(),
  week: z.number().int(),
  date: z.string(), // ISO date
  exercises: z.array(z.object({
    programExercisesId: z.number().int(),
    actualSets: z.array(z.any()), // Should match ExerciseSet[]
  })),
});

export async function saveResistanceSession(input: z.infer<typeof SaveResistanceSessionInput>) {
  const parse = SaveResistanceSessionInput.safeParse(input);
  if (!parse.success) {
    return { success: false, error: 'Invalid input', details: parse.error };
  }
  const { userId, resistanceProgramId, week, date, exercises } = parse.data;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (const ex of exercises) {
      await client.query(
        `UPDATE resist_program_exercises SET actual_sets = $1, updated_at = NOW() WHERE program_exercises_id = $2 AND program_id = $3`,
        [JSON.stringify(ex.actualSets), ex.programExercisesId, resistanceProgramId]
      );
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