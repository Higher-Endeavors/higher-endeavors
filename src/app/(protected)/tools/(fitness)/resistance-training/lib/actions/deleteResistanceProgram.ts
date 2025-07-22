"use server";

import { getClient } from '@/app/lib/dbAdapter';
import { DeleteResistanceProgramSchema, DeleteResistanceProgramInput } from '../../types/resistance-training.zod';

export async function deleteResistanceProgram(input: DeleteResistanceProgramInput, userId: number) {
  try {
    // Validate the input
    const { programId } = DeleteResistanceProgramSchema.parse(input);
    
    const client = await getClient();
    
    try {
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
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting resistance training program:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete program' 
    };
  }
} 