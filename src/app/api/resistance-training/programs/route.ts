import { NextResponse } from 'next/server';
import { SingleQuery } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('id');
    const userId = searchParams.get('userId') || session.user.id;
    


    if (programId) {
      // Fetch specific program first
      const programQuery = `
        SELECT 
          p.program_id,
          p.user_id,
          p.program_name,
          p.resist_phase_id,
          rp.resist_phase_name,
          p.resist_periodization_id,
          rpt.resist_periodization_name,
          p.progression_rules,
          p.program_duration,
          p.notes,
          p.start_date,
          p.end_date,
          p.created_at,
          p.updated_at,
          -- Template information (only for templates)
          CASE 
            WHEN p.user_id = 1 THEN COALESCE((
              SELECT json_build_object(
                'tierContinuumId', COALESCE(rpt.tier_continuum_id, 1),
                'tierContinuumName', COALESCE(htc.tier_continuum_name, 'Healthy'),
                'categories', COALESCE((
                  SELECT json_agg(jsonb_build_object(
                    'id', rptc.resist_program_template_categories_id,
                    'name', rptc.category_name,
                    'description', rptc.description
                  ))
                  FROM resist_program_template_category_links rptcl
                  JOIN resist_program_template_categories rptc ON rptcl.resist_program_template_categories_id = rptc.resist_program_template_categories_id
                  WHERE rptcl.program_template_id = rpt.program_template_id
                ), '[]'::json)
              )
              FROM resist_program_templates rpt
              LEFT JOIN highend_tier_continuum htc ON rpt.tier_continuum_id = htc.tier_continuum_id
              WHERE rpt.program_id = p.program_id
            ), '{"tierContinuumId": 1, "tierContinuumName": "Healthy", "categories": []}'::json)
            ELSE NULL
          END as template_info
        FROM resist_programs p
        LEFT JOIN resist_phase rp ON p.resist_phase_id = rp.resist_phase_id
        LEFT JOIN resist_periodization_type rpt ON p.resist_periodization_id = rpt.resist_periodization_id
        WHERE p.program_id = $1 AND p.user_id = $2
      `;
      const programValues = [programId, userId];
      const programResult = await SingleQuery(programQuery, programValues);

      if (!programResult.rows.length) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      // Fetch exercises separately
      const exercisesQuery = `
        SELECT 
          program_exercises_id,
          program_id,
          program_instance,
          exercise_source,
          exercise_library_id,
          user_exercise_library_id,
          pairing,
          planned_sets,
          actual_sets,
          notes,
          created_at,
          updated_at
        FROM resist_program_exercises
        WHERE program_id = $1
        ORDER BY program_instance, created_at
      `;
      const exercisesValues = [programId];
      const exercisesResult = await SingleQuery(exercisesQuery, exercisesValues);

      // Combine program and exercises
      const program = programResult.rows[0];
      const exercises = exercisesResult.rows.map((ex: any) => ({
        programExercisesPlannedId: ex.program_exercises_id,
        resistanceProgramId: ex.program_id,
        programInstance: ex.program_instance,
        exerciseSource: ex.exercise_source,
        exerciseLibraryId: ex.exercise_library_id,
        userExerciseLibraryId: ex.user_exercise_library_id,
        pairing: ex.pairing,
        plannedSets: ex.planned_sets,
        actualSets: ex.actual_sets, // <-- add this line
        notes: ex.notes,
        createdAt: ex.created_at,
        updatedAt: ex.updated_at
      }));

      return NextResponse.json({
        ...program,
        exercises
      });
    } else {
      // Fetch program list - using subquery for exercise count
      const query = `
        SELECT 
          p.program_id as "resistanceProgramId",
          p.user_id as "userId",
          p.program_name as "programName",
          p.resist_phase_id as "resistPhaseId",
          rp.resist_phase_name as "resistPhaseName",
          p.resist_periodization_id as "resistPeriodizationId",
          rpt.resist_periodization_name as "resistPeriodizationName",
          p.progression_rules as "progressionRules",
          p.program_duration as "programDuration",
          p.notes,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          COALESCE((SELECT COUNT(*) FROM resist_program_exercises WHERE program_id = p.program_id), 0) as exercise_count,
          json_build_object(
            'total_exercises', 0,
            'exercises', COALESCE((
              SELECT json_agg(DISTINCT jsonb_build_object(
                'name', 
                CASE 
                  WHEN pe.exercise_source = 'library' THEN el.exercise_name
                  WHEN pe.exercise_source = 'user' THEN uel.exercise_name
                  WHEN pe.exercise_source = 'cme_library' THEN cal.activity
                  ELSE 'Unknown Exercise'
                END,
                'source', pe.exercise_source,
                'exerciseLibraryId', pe.exercise_library_id,
                'userExerciseLibraryId', pe.user_exercise_library_id
              ))
              FROM resist_program_exercises pe
              LEFT JOIN exercise_library el ON pe.exercise_library_id = el.exercise_library_id AND pe.exercise_source = 'library'
              LEFT JOIN resist_user_exercise_library uel ON pe.user_exercise_library_id = uel.user_exercise_library_id AND pe.exercise_source = 'user'
              LEFT JOIN cme_activity_library cal ON pe.exercise_library_id = cal.cme_activity_library_id AND pe.exercise_source = 'cme_library'
              WHERE pe.program_id = p.program_id
            ), '[]'::json)
          ) as exercise_summary,
          -- Template information (only for templates)
          CASE 
            WHEN p.user_id = 1 THEN COALESCE((
              SELECT json_build_object(
                'tierContinuumId', COALESCE(rpt.tier_continuum_id, 1),
                'tierContinuumName', COALESCE(htc.tier_continuum_name, 'Healthy'),
                'categories', COALESCE((
                  SELECT json_agg(jsonb_build_object(
                    'id', rptc.resist_program_template_categories_id,
                    'name', rptc.category_name,
                    'description', rptc.description
                  ))
                  FROM resist_program_template_category_links rptcl
                  JOIN resist_program_template_categories rptc ON rptcl.resist_program_template_categories_id = rptc.resist_program_template_categories_id
                  WHERE rptcl.program_template_id = rpt.program_template_id
                ), '[]'::json)
              )
              FROM resist_program_templates rpt
              LEFT JOIN highend_tier_continuum htc ON rpt.tier_continuum_id = htc.tier_continuum_id
              WHERE rpt.program_id = p.program_id
            ), '{"tierContinuumId": 1, "tierContinuumName": "Healthy", "categories": []}'::json)
            ELSE NULL
          END as template_info
        FROM resist_programs p
        LEFT JOIN resist_phase rp ON p.resist_phase_id = rp.resist_phase_id
        LEFT JOIN resist_periodization_type rpt ON p.resist_periodization_id = rpt.resist_periodization_id
        WHERE p.user_id = $1 AND (p.deleted IS NULL OR p.deleted = false)
        ORDER BY p.created_at DESC
      `;
      const values = [userId];
      const result = await SingleQuery(query, values);

      // Transform the results to match the TypeScript schema
      const transformedPrograms = result.rows.map((program: any) => {
        const transformed = {
          ...program,
          // Map template_info to templateInfo (camelCase)
          templateInfo: program.template_info || null,
          // Remove the snake_case version
          template_info: undefined
        };
        
        // Debug logging for templates
        if (program.user_id === 1) {
          serverLogger.info('Template program:', { templateProgram: transformed });
        }
        
        return transformed;
      });

      return NextResponse.json({ programs: transformedPrograms });
    }
  } catch (error) {
    await serverLogger.error('Error fetching resistance training programs', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}
 
