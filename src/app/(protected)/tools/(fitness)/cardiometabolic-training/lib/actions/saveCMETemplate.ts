'use server';

import { auth } from '@/app/auth';
import { SingleQuery, getClient } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';

interface SaveCMETemplateParams {
  userId: number;
  templateName: string;
  tierContinuumId?: number;
  notes?: string;
  macrocyclePhase?: string;
  focusBlock?: string;
  exercises: any[]; // Exercise data to save directly
}

interface SaveCMETemplateResult {
  success: boolean;
  templateId?: number;
  error?: string;
}

export async function saveCMETemplate(params: SaveCMETemplateParams): Promise<SaveCMETemplateResult> {
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
      tierContinuumId,
      notes,
      macrocyclePhase,
      focusBlock,
      exercises
    } = params;

    // Validate required fields
    if (!templateName.trim()) {
      return { success: false, error: 'Template name is required' };
    }

    if (!exercises || exercises.length === 0) {
      return { success: false, error: 'At least one exercise is required' };
    }

    // Start transaction
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // First, create the session for the template (with user_id = 1)
      const sessionResult = await client.query(
        `INSERT INTO cme_sessions 
         (user_id, session_name, macrocycle_phase, focus_block, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING cme_session_id`,
        [
          1, // Template sessions have user_id = 1
          templateName.trim(),
          macrocyclePhase || null,
          focusBlock || null,
          notes || null
        ]
      );

      const templateSessionId = sessionResult.rows[0].cme_session_id;

      // Insert all exercises as session activities
      for (const exercise of exercises) {
        // We need to get the activity family ID from the activity library
        // For now, we'll insert with the activity library ID and derive family ID later
        await client.query(
          `INSERT INTO cme_sessions_activities 
           (cme_session_id, cme_activity_library_id, planned_steps, notes)
           VALUES ($1, $2, $3, $4)`,
          [
            templateSessionId,
            exercise.activityId,
            JSON.stringify(exercise.intervals || []),
            exercise.notes || null
          ]
        );
      }

      // Create the template entry in cme_session_templates
      const templateResult = await client.query(
        `INSERT INTO cme_session_templates 
         (template_name, tier_continuum_id, cme_session_id)
         VALUES ($1, $2, $3)
         RETURNING cme_template_id`,
        [
          templateName.trim(),
          tierContinuumId || 1, // Default to Healthy (tier_continuum_id: 1)
          templateSessionId
        ]
      );

      const templateId = templateResult.rows[0].cme_template_id;

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
    serverLogger.error('Error saving CME template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save template'
    };
  }
}
