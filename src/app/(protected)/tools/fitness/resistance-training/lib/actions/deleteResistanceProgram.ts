"use server";

import { getClient } from 'lib/dbAdapter';
import { DeleteResistanceProgramSchema, DeleteResistanceProgramInput } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { serverLogger } from 'lib/logging/logger.server';

export async function deleteResistanceProgram(input: DeleteResistanceProgramInput, userId: number) {
  const client = await getClient();
  
  try {
    // Validate the input
    const { programId } = DeleteResistanceProgramSchema.parse(input);
    
    await client.query('BEGIN');
    
    // First, delete all associated exercises
    const deleteExercisesQuery = `
      DELETE FROM resist_program_exercises 
      WHERE program_id = $1
    `;
    await client.query(deleteExercisesQuery, [programId]);

    // Then delete the program
    const deleteProgramQuery = `
      DELETE FROM resist_programs 
      WHERE program_id = $1 AND user_id = $2
    `;
    const result = await client.query(deleteProgramQuery, [programId, userId]);

    if (result.rowCount === 0) {
      throw new Error('Program not found');
    }
    
    await client.query('COMMIT');
    return { success: true, message: 'Program deleted successfully' };
  } catch (error) {
    await client.query('ROLLBACK');
    await serverLogger.error('Failed to delete resistance program', error, { userId, programId: input.programId });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    client.release();
  }
} 