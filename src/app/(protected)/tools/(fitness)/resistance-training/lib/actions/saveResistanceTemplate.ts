'use server';

import { auth } from '@/app/auth';
import { SingleQuery, getClient } from '@/app/lib/dbAdapter';
import { ProgramExercisesPlanned } from '../../types/resistance-training.zod';

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
  programId?: number; // ID of the existing program to copy from
}

interface SaveTemplateResult {
  success: boolean;
  templateId?: number;
  newProgramId?: number;
  error?: string;
}

export async function saveResistanceTemplate(params: SaveTemplateParams): Promise<SaveTemplateResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin using session role
    if (session.user.role !== 'admin') {
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
      weeklyExercises,
      programId
    } = params;

    // Validate required fields
    if (!templateName.trim()) {
      return { success: false, error: 'Template name is required' };
    }

    if (!weeklyExercises || weeklyExercises.length === 0) {
      return { success: false, error: 'At least one week of exercises is required' };
    }

    if (!programId) {
      return { success: false, error: 'Program ID is required to save template' };
    }

    // Start transaction
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Create the template in resist_program_templates (referencing the existing program)
      const templateResult = await client.query(
        `INSERT INTO resist_program_templates 
         (template_name, difficulty_level, program_id)
         VALUES ($1, $2, $3)
         RETURNING program_template_id`,
        [
          templateName.trim(),
          difficultyLevel || null,
          programId
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