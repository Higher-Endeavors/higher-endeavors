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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await getClient();

  try {
    console.log('Starting program update...');
    const session = await auth();
    console.log('Session:', session);

    if (!session?.user?.id) {
      console.log('Unauthorized: No user ID in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data;
    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);
      data = JSON.parse(rawBody);
      console.log('Parsed request data:', data);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    const { 
      program_name, 
      periodization_type,
      phase_focus,
      progression_rules,
      start_date,
      end_date,
      notes,
      weeks,
      userId: targetUserId
    } = data;

    // Check if the current user has permission to update the program
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin';
    const effectiveUserId = isAdmin && targetUserId ? parseInt(targetUserId) : currentUserId;

    if (targetUserId && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to update programs for other users' }, { status: 403 });
    }

    // Validate required fields
    if (!program_name || !periodization_type || !weeks || !Array.isArray(weeks)) {
      console.log('Missing required fields:', { program_name, periodization_type, weeks });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          program_name: !program_name ? 'Program name is required' : undefined,
          periodization_type: !periodization_type ? 'Periodization type is required' : undefined,
          weeks: !weeks ? 'Weeks are required' : !Array.isArray(weeks) ? 'Weeks must be an array' : undefined
        }
      }, { status: 400 });
    }

    try {
      // Start a transaction
      await client.query('BEGIN');
      console.log('Transaction started');

      // 1. Update the program
      await client.query(
        `UPDATE resistance_programs 
        SET program_name = $1, 
            periodization_type = $2, 
            phase_focus = $3,
            progression_rules = $4,
            start_date = $5, 
            end_date = $6, 
            notes = $7,
            updated_at = NOW()
        WHERE id = $8 AND user_id = $9`,
        [program_name, periodization_type, phase_focus, JSON.stringify(progression_rules), 
         start_date, end_date, notes, params.id, effectiveUserId]
      );

      // 2. Delete existing weeks, days, exercises, and sets
      const weekIds = await client.query(
        'DELETE FROM program_weeks WHERE resistance_program_id = $1 RETURNING id',
        [params.id]
      );

      // 3. Create new weeks
      for (const week of weeks) {
        if (!week.weekNumber) {
          throw new Error(`Week number is required for week: ${JSON.stringify(week)}`);
        }

        const weekResult = await client.query(
          `INSERT INTO program_weeks 
          (resistance_program_id, week_number, notes)
          VALUES 
          ($1, $2, $3)
          RETURNING id`,
          [params.id, week.weekNumber, week.notes]
        );
        const weekId = weekResult.rows[0].id;

        // 4. Create days for each week
        if (!Array.isArray(week.days)) {
          throw new Error(`Days array is required for week ${week.weekNumber}`);
        }

        for (const day of week.days) {
          const dayResult = await client.query(
            `INSERT INTO program_days 
            (program_week_id, day_number, day_name, notes)
            VALUES 
            ($1, $2, $3, $4)
            RETURNING id`,
            [weekId, day.dayNumber, day.dayName, day.notes]
          );
          const dayId = dayResult.rows[0].id;

          // 5. Create exercises for each day
          if (!Array.isArray(day.exercises)) {
            throw new Error(`Exercises array is required for day ${day.dayNumber} in week ${week.weekNumber}`);
          }

          for (const exercise of day.exercises) {
            const exerciseResult = await client.query(
              `INSERT INTO program_day_exercises 
              (program_day_id, exercise_source, exercise_library_id, user_exercise_id, 
               custom_exercise_name, pairing, notes, order_index)
              VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id`,
              [dayId, exercise.source, exercise.libraryId, exercise.userExerciseId,
               exercise.customName, exercise.pairing, exercise.notes, exercise.orderIndex]
            );
            const exerciseId = exerciseResult.rows[0].id;

            // 6. Create sets for each exercise
            if (!Array.isArray(exercise.sets)) {
              throw new Error(`Sets array is required for exercise ${exercise.customName || exercise.libraryId} in day ${day.dayNumber}, week ${week.weekNumber}`);
            }

            for (const set of exercise.sets) {
              await client.query(
                `INSERT INTO program_day_exercise_sets 
                (program_day_exercise_id, set_number, planned_reps, planned_load, 
                 load_unit, planned_rest, planned_tempo, notes)
                VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [exerciseId, set.setNumber, set.reps, set.load,
                 set.loadUnit, set.rest, set.tempo, set.notes]
              );
            }
          }
        }
      }

      // Commit the transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully');

      return NextResponse.json({ 
        success: true,
        programId: params.id
      });

    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error('Database operation failed:', error);
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
      console.log('Database client released');
    }

  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update program',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await getClient();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the current user has permission to delete the program
    const programAccess = await SingleQuery(
      `SELECT user_id FROM resistance_programs WHERE id = $1`,
      [params.id]
    );

    if (!programAccess.rows.length) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    if (!isAdmin && programAccess.rows[0].user_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized to delete this program' }, { status: 403 });
    }

    try {
      // Start a transaction
      await client.query('BEGIN');

      // Delete the program (cascading will handle related records)
      await client.query(
        'DELETE FROM resistance_programs WHERE id = $1',
        [params.id]
      );

      // Commit the transaction
      await client.query('COMMIT');

      return NextResponse.json({ success: true });

    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete program',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 