"use server";

import { getClient } from '@/app/lib/dbAdapter';
import { DuplicateResistanceProgramSchema, DuplicateResistanceProgramInput } from '../../types/resistance-training.zod';

export async function duplicateResistanceProgram(input: DuplicateResistanceProgramInput, userId: number) {
  try {
    // Validate the input
    const { programId, newProgramName } = DuplicateResistanceProgramSchema.parse(input);
    
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // First, get the original program
      const getProgramQuery = `
        SELECT 
          user_id,
          program_name,
          phase_focus,
          periodization_type,
          progression_rules,
          program_duration,
          notes,
          start_date,
          end_date
        FROM resist_programs
        WHERE program_id = $1 AND user_id = $2
      `;
      const programValues = [programId, userId];
      const programResult = await client.query(getProgramQuery, programValues);

      if (!programResult.rows.length) {
        throw new Error('Program not found');
      }

      const originalProgram = programResult.rows[0];

      // Create the new program
      const createProgramQuery = `
        INSERT INTO resist_programs (
          user_id,
          program_name,
          phase_focus,
          periodization_type,
          progression_rules,
          program_duration,
          notes,
          start_date,
          end_date,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING program_id
      `;
      const createProgramValues = [
        userId,
        newProgramName,
        originalProgram.phase_focus,
        originalProgram.periodization_type,
        originalProgram.progression_rules,
        originalProgram.program_duration,
        originalProgram.notes,
        originalProgram.start_date,
        originalProgram.end_date
      ];
      const newProgramResult = await client.query(createProgramQuery, createProgramValues);
      const newProgramId = newProgramResult.rows[0].program_id;

      // Get all exercises from the original program
      const getExercisesQuery = `
        SELECT 
          program_instance,
          exercise_source,
          exercise_library_id,
          user_exercise_library_id,
          pairing,
          planned_sets,
          notes
        FROM resist_program_exercises
        WHERE program_id = $1
        ORDER BY program_instance, created_at
      `;
      const exercisesResult = await client.query(getExercisesQuery, [programId]);

      // Duplicate all exercises for the new program
      if (exercisesResult.rows.length > 0) {
        const insertExerciseQuery = `
          INSERT INTO resist_program_exercises (
            program_id,
            program_instance,
            exercise_source,
            exercise_library_id,
            user_exercise_library_id,
            pairing,
            planned_sets,
            notes,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `;

        for (const exercise of exercisesResult.rows) {
          // Ensure planned_sets is properly formatted as JSON
          let plannedSets = exercise.planned_sets;
          if (typeof plannedSets === 'string') {
            try {
              plannedSets = JSON.parse(plannedSets);
            } catch (e) {
              // If parsing fails, use empty array as fallback
              plannedSets = [];
            }
          }
          
          // If plannedSets is null or undefined, use empty array
          if (!plannedSets) {
            plannedSets = [];
          }

          const exerciseValues = [
            newProgramId,
            exercise.program_instance,
            exercise.exercise_source,
            exercise.exercise_library_id,
            exercise.user_exercise_library_id,
            exercise.pairing,
            JSON.stringify(plannedSets), // Ensure it's a JSON string
            exercise.notes
          ];
          await client.query(insertExerciseQuery, exerciseValues);
        }
      }
      
      await client.query('COMMIT');
      return { success: true, newProgramId, message: 'Program duplicated successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error duplicating resistance training program:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to duplicate program' 
    };
  }
} 