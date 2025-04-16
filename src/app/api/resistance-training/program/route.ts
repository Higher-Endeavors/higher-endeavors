import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { getClient } from '@/app/lib/dbAdapter';

export async function POST(request: Request) {
  const client = await getClient();

  try {
    console.log('Starting program save...');
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
      program_name: name, 
      periodization_type: periodizationType,
      start_date: startDate,
      end_date: endDate,
      notes,
      weeks,
      user_id: target_user_id,
      phase_focus: phaseFocus
    } = data;

    // Check if the current user has permission to create programs for the target user
    const current_user_id = parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin';
    const effective_user_id = isAdmin && target_user_id ? parseInt(target_user_id) : current_user_id;

    if (target_user_id && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to create programs for other users' }, { status: 403 });
    }

    // Validate required fields
    if (!name || !periodizationType || !weeks || !Array.isArray(weeks)) {
      console.log('Missing required fields:', { name, periodizationType, weeks });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          program_name: !name ? 'Program name is required' : undefined,
          periodization_type: !periodizationType ? 'Periodization type is required' : undefined,
          weeks: !weeks ? 'Weeks are required' : !Array.isArray(weeks) ? 'Weeks must be an array' : undefined
        }
      }, { status: 400 });
    }

    try {
      // Start a transaction
      await client.query('BEGIN');
      console.log('Transaction started');

      // 1. Create the program
      const programResult = await client.query(
        `INSERT INTO resistance_programs 
        (user_id, program_name, periodization_type, phase_focus, start_date, end_date, notes)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [effective_user_id, name, periodizationType, phaseFocus, startDate, endDate, notes]
      );
      const program_id = programResult.rows[0].id;
      console.log('Program created with ID:', program_id);

      // 2. Create weeks
      for (const week of weeks) {
        if (!week.week_number) {
          throw new Error(`Week number is required for week: ${JSON.stringify(week)}`);
        }

        const weekResult = await client.query(
          `INSERT INTO program_weeks 
          (resistance_program_id, week_number, notes, created_at, updated_at)
          VALUES 
          ($1, $2, $3, $4, $5)
          RETURNING id`,
          [program_id, week.week_number, week.notes, week.created_at, week.updated_at]
        );
        const week_id = weekResult.rows[0].id;
        console.log(`Week ${week.week_number} created with ID:`, week_id);

        // 3. Create days for each week
        if (!Array.isArray(week.days)) {
          throw new Error(`Days array is required for week ${week.week_number}`);
        }

        for (const day of week.days) {
          const dayResult = await client.query(
            `INSERT INTO program_days 
            (program_week_id, day_number, day_name, notes)
            VALUES 
            ($1, $2, $3, $4)
            RETURNING id`,
            [week_id, day.day_number, day.day_name, day.notes]
          );
          const day_id = dayResult.rows[0].id;
          console.log(`Day ${day.day_number} created with ID:`, day_id);

          // 4. Create exercises for each day
          if (!Array.isArray(day.exercises)) {
            throw new Error(`Exercises array is required for day ${day.day_number} in week ${week.week_number}`);
          }

          for (const exercise of day.exercises) {
            const exerciseResult = await client.query(
              `INSERT INTO program_day_exercises 
              (program_day_id, exercise_source, exercise_library_id, user_exercise_id, 
               custom_exercise_name, pairing, notes, order_index)
              VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id`,
              [day_id, exercise.exercise_source, exercise.exercise_library_id, exercise.user_exercise_id,
               exercise.custom_exercise_name, exercise.pairing, exercise.notes, exercise.order_index]
            );
            const exercise_id = exerciseResult.rows[0].id;
            console.log(`Exercise created with ID:`, exercise_id);

            // 5. Create sets for each exercise
            if (!Array.isArray(exercise.sets)) {
              throw new Error(`Sets array is required for exercise ${exercise.custom_name || exercise.library_id} in day ${day.day_number}, week ${week.week_number}`);
            }

            for (const set of exercise.sets) {
              await client.query(
                `INSERT INTO program_day_exercise_sets 
                (program_day_exercise_id, set_number, planned_reps, planned_load, 
                 load_unit, planned_rest, planned_tempo, notes)
                VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [exercise_id, set.set_number, set.planned_reps, set.planned_load,
                 set.load_unit, set.planned_rest, set.planned_tempo, set.notes]
              );
            }
            console.log(`Sets created for exercise ${exercise_id}`);
          }
        }
      }

      // Commit the transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully');

      return NextResponse.json({ 
        success: true, 
        program_id 
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
    console.error('Error saving program:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save program',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
} 