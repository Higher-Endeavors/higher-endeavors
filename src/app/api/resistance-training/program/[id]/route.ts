import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the program ID from the URL params
    const { id: programId } = params;

    // First, verify the user has access to this program
    const programAccess = await SingleQuery(
      `SELECT user_id FROM resistance_programs WHERE id = $1`,
      [programId]
    );

    if (!programAccess.rows.length) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check if user is admin
    const userRole = await SingleQuery(
      'SELECT role FROM users WHERE id = $1',
      [session.user.id]
    );
    const isAdmin = userRole.rows[0]?.role === 'admin';

    // If not admin and not the program owner, deny access
    if (!isAdmin && programAccess.rows[0].user_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch program weeks, days, and exercises
    const result = await SingleQuery(
      `WITH RECURSIVE 
        sets_agg AS (
          SELECT 
            pde.id as exercise_id,
            jsonb_agg(
              jsonb_build_object(
                'setNumber', pdes.set_number,
                'reps', pdes.planned_reps,
                'load', pdes.planned_load,
                'loadUnit', pdes.load_unit,
                'rest', pdes.planned_rest,
                'tempo', pdes.planned_tempo,
                'notes', pdes.notes
              ) ORDER BY pdes.set_number
            ) as sets
          FROM program_day_exercises pde
          LEFT JOIN program_day_exercise_sets pdes ON pde.id = pdes.program_day_exercise_id
          GROUP BY pde.id
        ),
        exercises_agg AS (
          SELECT 
            pd.id as day_id,
            jsonb_agg(
              jsonb_build_object(
                'id', pde.id::text,
                'name', CASE 
                  WHEN pde.exercise_source = 'library' THEN (
                    SELECT el.exercise_name 
                    FROM exercise_library el 
                    WHERE el.id = pde.exercise_library_id
                  )
                  WHEN pde.exercise_source = 'user' THEN (
                    SELECT ue.exercise_name 
                    FROM user_exercises ue 
                    WHERE ue.id = pde.user_exercise_id
                  )
                  ELSE COALESCE(pde.custom_exercise_name, 'Unnamed Exercise')
                END,
                'source', COALESCE(pde.exercise_source, 'library'),
                'libraryId', pde.exercise_library_id,
                'userExerciseId', pde.user_exercise_id,
                'pairing', COALESCE(pde.pairing, 'A1'),
                'notes', COALESCE(pde.notes, ''),
                'orderIndex', COALESCE(pde.order_index, 0),
                'isVariedSets', false,
                'isAdvancedSets', false,
                'sets', COALESCE(
                  (SELECT COUNT(*)::int FROM program_day_exercise_sets WHERE program_day_exercise_id = pde.id),
                  3
                ),
                'reps', COALESCE(
                  (SELECT planned_reps FROM program_day_exercise_sets 
                   WHERE program_day_exercise_id = pde.id 
                   ORDER BY set_number LIMIT 1),
                  10
                ),
                'load', COALESCE(
                  (SELECT planned_load FROM program_day_exercise_sets 
                   WHERE program_day_exercise_id = pde.id 
                   ORDER BY set_number LIMIT 1),
                  0
                ),
                'loadUnit', COALESCE(
                  (SELECT load_unit FROM program_day_exercise_sets 
                   WHERE program_day_exercise_id = pde.id 
                   ORDER BY set_number LIMIT 1),
                  'lbs'
                ),
                'tempo', COALESCE(
                  (SELECT planned_tempo FROM program_day_exercise_sets 
                   WHERE program_day_exercise_id = pde.id 
                   ORDER BY set_number LIMIT 1),
                  '2010'
                ),
                'rest', COALESCE(
                  (SELECT planned_rest FROM program_day_exercise_sets 
                   WHERE program_day_exercise_id = pde.id 
                   ORDER BY set_number LIMIT 1),
                  60
                )
              ) ORDER BY pde.order_index
            ) as exercises
          FROM program_days pd
          LEFT JOIN program_day_exercises pde ON pd.id = pde.program_day_id
          LEFT JOIN exercise_library el ON pde.exercise_library_id = el.id
          LEFT JOIN user_exercises ue ON pde.user_exercise_id = ue.id
          WHERE pde.id IS NOT NULL
          GROUP BY pd.id
        ),
        days_agg AS (
          SELECT 
            pw.id as week_id,
            jsonb_agg(
              jsonb_build_object(
                'dayNumber', pd.day_number,
                'dayName', pd.day_name,
                'notes', pd.notes,
                'exercises', COALESCE((SELECT exercises FROM exercises_agg WHERE day_id = pd.id), '[]'::jsonb)
              ) ORDER BY pd.day_number
            ) as days
          FROM program_weeks pw
          LEFT JOIN program_days pd ON pw.id = pd.program_week_id
          GROUP BY pw.id
        )
        SELECT jsonb_build_object(
          'weeks', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'weekNumber', pw.week_number,
                'notes', pw.notes,
                'days', COALESCE((SELECT days FROM days_agg WHERE week_id = pw.id), '[]'::jsonb)
              ) ORDER BY pw.week_number
            )
            FROM program_weeks pw
            WHERE pw.resistance_program_id = $1
          )
        ) as program_data`,
      [programId]
    );

    if (!result.rows[0]?.program_data) {
      return NextResponse.json({ error: 'Program data not found' }, { status: 404 });
    }

    console.log('Program data:', JSON.stringify(result.rows[0].program_data, null, 2));
    return NextResponse.json(result.rows[0].program_data);
  } catch (error: any) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 