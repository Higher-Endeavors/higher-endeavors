'use server';

import { auth } from '@/app/auth';
import { SingleQuery, getClient } from '@/app/lib/dbAdapter';
import { ProgramExercisesPlanned } from '../../types/resistance-training.zod';
import { checkAdminAccess } from '@/app/lib/actions/checkAdminAccess';

interface SaveTemplateParams {
  userId: number;
  templateName: string;
  phaseFocus?: string;
  periodizationType?: string;
  progressionRules?: any;
  difficultyLevel?: string;
  notes?: string;
  selectedCategories?: number[];
  weeklyExercises: ProgramExercisesPlanned[][];
}

interface SaveTemplateResult {
  success: boolean;
  templateId?: number;
  error?: string;
}



export async function saveResistanceTemplate(params: SaveTemplateParams): Promise<SaveTemplateResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const sessionUserId = parseInt(session.user.id);
    
    // Check if user is admin
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const {
      userId,
      templateName,
      phaseFocus,
      periodizationType,
      progressionRules,
      difficultyLevel,
      notes,
      selectedCategories,
      weeklyExercises
    } = params;

    // Validate required fields
    if (!templateName.trim()) {
      return { success: false, error: 'Template name is required' };
    }

    if (!weeklyExercises || weeklyExercises.length === 0) {
      return { success: false, error: 'At least one week of exercises is required' };
    }

    // Start transaction
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Insert template
      const templateResult = await client.query(
        `INSERT INTO resist_program_templates 
         (template_name, phase_focus, periodization_type, progression_rules, difficulty_level, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING program_template_id`,
        [
          templateName.trim(),
          phaseFocus || null,
          periodizationType || null,
          progressionRules ? JSON.stringify(progressionRules) : null,
          difficultyLevel || null,
          notes || null
        ]
      );

      const templateId = templateResult.rows[0].program_template_id;

      // Insert category links if categories are selected
      if (selectedCategories && selectedCategories.length > 0) {
        for (const categoryId of selectedCategories) {
          await client.query(
            `INSERT INTO resist_program_template_category_links 
             (program_template_id, resist_program_template_categories_id)
             VALUES ($1, $2)`,
            [templateId, categoryId]
          );
        }
      }

      // Insert exercises for each week
      for (let weekIndex = 0; weekIndex < weeklyExercises.length; weekIndex++) {
        const weekExercises = weeklyExercises[weekIndex];
        
        for (const exercise of weekExercises) {
          await client.query(
            `INSERT INTO resist_program_exercises 
             (program_id, program_instance, exercise_source, exercise_library_id, user_exercise_library_id, pairing, notes, planned_sets)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              templateId, // Use template ID as program_id for templates
              weekIndex + 1, // program_instance represents the week
              exercise.exerciseSource,
              exercise.exerciseLibraryId || null,
              exercise.userExerciseLibraryId || null,
              exercise.pairing || null,
              exercise.notes || null,
              JSON.stringify(exercise.plannedSets || [])
            ]
          );
        }
      }

      await client.query('COMMIT');

      return {
        success: true,
        templateId
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error saving resistance template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save template'
    };
  }
} 