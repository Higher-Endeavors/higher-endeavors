import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
      name, 
      periodizationType,
      startDate,
      endDate,
      notes,
      weeks,
      userId: targetUserId // The user we're creating the program for
    } = data;

    // Check if the current user has permission to create programs for the target user
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin';
    const effectiveUserId = isAdmin && targetUserId ? parseInt(targetUserId) : currentUserId;

    if (targetUserId && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to create programs for other users' }, { status: 403 });
    }

    // Validate required fields
    if (!name || !periodizationType || !weeks || !Array.isArray(weeks)) {
      console.log('Missing required fields:', { name, periodizationType, weeks });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          name: !name ? 'Program name is required' : undefined,
          periodizationType: !periodizationType ? 'Periodization type is required' : undefined,
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
        (user_id, program_name, periodization_type, start_date, end_date, notes)
        VALUES 
        ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [effectiveUserId, name, periodizationType, startDate, endDate, notes]
      );
      const programId = programResult.rows[0].id;
      console.log('Program created with ID:', programId);

      // 2. Create weeks
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
          [programId, week.weekNumber, week.notes]
        );
        const weekId = weekResult.rows[0].id;
        console.log(`Week ${week.weekNumber} created with ID:`, weekId);

        // 3. Create days for each week
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
          console.log(`Day ${day.dayNumber} created with ID:`, dayId);

          // 4. Create exercises for each day
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
            console.log(`Exercise created with ID:`, exerciseId);

            // 5. Create sets for each exercise
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
            console.log(`Sets created for exercise ${exerciseId}`);
          }
        }
      }

      // Commit the transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully');

      return NextResponse.json({ 
        success: true, 
        programId 
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