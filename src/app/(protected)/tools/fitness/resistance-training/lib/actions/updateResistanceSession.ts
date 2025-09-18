'use server';

import { getClient } from 'lib/dbAdapter';
import { z } from 'zod';

const UpdateResistanceSessionInput = z.object({
  userId: z.number().int(),
  resistanceProgramId: z.number().int(),
  exercises: z.array(z.object({
    programExercisesId: z.number().int().positive(), // Only positive IDs for existing exercises
    actualSets: z.array(z.any()), // Should match ExerciseSet[]
  })),
});

export async function updateResistanceSession(input: z.infer<typeof UpdateResistanceSessionInput>) {
  const parse = UpdateResistanceSessionInput.safeParse(input);
  if (!parse.success) {
    console.error('Validation error:', parse.error);
    return { success: false, error: 'Invalid input', details: parse.error };
  }
  
  const { userId, resistanceProgramId, exercises } = parse.data;
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Validate that all exercises exist before updating
    for (const ex of exercises) {
      const checkQuery = `
        SELECT program_exercises_id 
        FROM resist_program_exercises 
        WHERE program_exercises_id = $1 AND program_id = $2
      `;
      const checkResult = await client.query(checkQuery, [ex.programExercisesId, resistanceProgramId]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { 
          success: false, 
          error: `Exercise with ID ${ex.programExercisesId} not found` 
        };
      }
    }
    
    // Update all exercises
    for (const ex of exercises) {
      await client.query(
        `UPDATE resist_program_exercises 
         SET actual_sets = $1, updated_at = NOW() 
         WHERE program_exercises_id = $2 AND program_id = $3`,
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