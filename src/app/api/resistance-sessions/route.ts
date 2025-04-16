import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';
import { exercise } from '@/app/lib/types/pillars/fitness';
import { training_session } from '@/app/lib/types/pillars/fitness/exercise.types';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('id');
    const program_id = searchParams.get('programId');
    const start_date = searchParams.get('startDate');
    const end_date = searchParams.get('endDate');

    let query = `
      SELECT 
        ts.*,
        json_agg(
          json_build_object(
            'id', se.id,
            'exercise_name', el.exercise_name,
            'pairing', se.pairing,
            'planned_sets', se.planned_sets,
            'actual_sets', (
              SELECT json_agg(ss.*)
              FROM session_sets ss
              WHERE ss.session_exercise_id = se.id
              ORDER BY ss.set_number
            )
          )
        ) as exercises
      FROM training_sessions ts
      LEFT JOIN session_exercises se ON ts.id = se.session_id
      LEFT JOIN exercise_library el ON se.exercise_library_id = el.id
      WHERE ts.user_id = $1
    `;

    const params: any[] = [session.user.id];
    let paramIndex = 2;

    if (session_id) {
      query += ` AND ts.id = $${paramIndex}`;
      params.push(session_id);
      paramIndex++;
    }

    if (program_id) {
      query += ` AND ts.program_id = $${paramIndex}`;
      params.push(program_id);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND ts.scheduled_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND ts.scheduled_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' GROUP BY ts.id ORDER BY ts.scheduled_date DESC';

    const { rows } = await SingleQuery(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const client = await getClient();
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const training_session_data: training_session = await request.json();

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Insert session
      const { rows: [new_session] } = await client.query(`
        INSERT INTO training_sessions (
          program_id,
          user_id,
          scheduled_date,
          actual_date,
          status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        training_session_data.program_id,
        session.user.id,
        training_session_data.scheduled_date,
        training_session_data.actual_date,
        training_session_data.status
      ]);

      // Insert exercises and sets
      for (const exercise of training_session_data.exercises) {
        const { rows: [new_exercise] } = await client.query(`
          INSERT INTO session_exercises (
            session_id,
            exercise_library_id,
            pairing,
            planned_sets
          ) VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [
          new_session.id,
          exercise.exercise_library_id,
          exercise.pairing,
          exercise.planned_sets
        ]);

        // Insert sets
        for (const set of exercise.actual_sets) {
          await client.query(`
            INSERT INTO session_sets (
              session_exercise_id,
              set_number,
              planned_reps,
              actual_reps,
              planned_load,
              actual_load,
              planned_tempo,
              rest_time,
              rpe,
              rir,
              notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            new_exercise.id,
            set.set_number,
            set.planned_reps,
            set.actual_reps,
            set.planned_load,
            set.actual_load,
            set.planned_tempo,
            set.rest_time,
            set.rpe,
            set.rir,
            set.notes
          ]);
        }
      }

      // Insert feedback if provided
      if (training_session_data.feedback) {
        await client.query(`
          INSERT INTO session_feedback (
            session_id,
            feeling,
            energy_level,
            muscle_pump,
            notes,
            next_day_soreness,
            next_day_feeling,
            next_day_energy_level
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          new_session.id,
          training_session_data.feedback.feeling,
          training_session_data.feedback.energy_level,
          training_session_data.feedback.muscle_pump,
          training_session_data.feedback.notes,
          training_session_data.feedback.next_day_soreness,
          training_session_data.feedback.next_day_feeling,
          training_session_data.feedback.next_day_energy_level
        ]);
      }

      await client.query('COMMIT');
      return NextResponse.json(new_session);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: Request) {
  const client = await getClient();
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const training_session_data: training_session = await request.json();

    // Verify ownership
    const { rows } = await client.query(
      'SELECT id FROM training_sessions WHERE id = $1 AND user_id = $2',
      [training_session_data.id, session.user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Update session
      await client.query(`
        UPDATE training_sessions
        SET actual_date = $1,
            status = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [
        training_session_data.actual_date,
        training_session_data.status,
        training_session_data.id
      ]);

      // Update exercises and sets
      for (const exercise of training_session_data.exercises) {
        // Update or insert exercise
        const { rows: [existing_exercise] } = await client.query(
          'SELECT id FROM session_exercises WHERE id = $1',
          [exercise.id]
        );

        if (existing_exercise) {
          await client.query(`
            UPDATE session_exercises
            SET planned_sets = $1
            WHERE id = $2
          `, [exercise.planned_sets, exercise.id]);
        } else {
          await client.query(`
            INSERT INTO session_exercises (
              session_id,
              exercise_library_id,
              pairing,
              planned_sets
            ) VALUES ($1, $2, $3, $4)
          `, [
            training_session_data.id,
            exercise.exercise_library_id,
            exercise.pairing,
            exercise.planned_sets
          ]);
        }

        // Update sets
        for (const set of exercise.actual_sets) {
          if (set.id) {
            await client.query(`
              UPDATE session_sets
              SET actual_reps = $1,
                  actual_load = $2,
                  rpe = $3,
                  rir = $4,
                  notes = $5
              WHERE id = $6
            `, [
              set.actual_reps,
              set.actual_load,
              set.rpe,
              set.rir,
              set.notes,
              set.id
            ]);
          } else {
            await client.query(`
              INSERT INTO session_sets (
                session_exercise_id,
                set_number,
                planned_reps,
                actual_reps,
                planned_load,
                actual_load,
                planned_tempo,
                rest_time,
                rpe,
                rir,
                notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
              exercise.id,
              set.set_number,
              set.planned_reps,
              set.actual_reps,
              set.planned_load,
              set.actual_load,
              set.planned_tempo,
              set.rest_time,
              set.rpe,
              set.rir,
              set.notes
            ]);
          }
        }
      }

      // Update feedback
      if (training_session_data.feedback) {
        const { rows: [existing_feedback] } = await client.query(
          'SELECT id FROM session_feedback WHERE session_id = $1',
          [training_session_data.id]
        );

        if (existing_feedback) {
          await client.query(`
            UPDATE session_feedback
            SET feeling = $1,
                energy_level = $2,
                muscle_pump = $3,
                notes = $4,
                next_day_soreness = $5,
                next_day_feeling = $6,
                next_day_energy_level = $7
            WHERE session_id = $8
          `, [
            training_session_data.feedback.feeling,
            training_session_data.feedback.energy_level,
            training_session_data.feedback.muscle_pump,
            training_session_data.feedback.notes,
            training_session_data.feedback.next_day_soreness,
            training_session_data.feedback.next_day_feeling,
            training_session_data.feedback.next_day_energy_level,
            training_session_data.id
          ]);
        } else {
          await client.query(`
            INSERT INTO session_feedback (
              session_id,
              feeling,
              energy_level,
              muscle_pump,
              notes,
              next_day_soreness,
              next_day_feeling,
              next_day_energy_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            training_session_data.id,
            training_session_data.feedback.feeling,
            training_session_data.feedback.energy_level,
            training_session_data.feedback.muscle_pump,
            training_session_data.feedback.notes,
            training_session_data.feedback.next_day_soreness,
            training_session_data.feedback.next_day_feeling,
            training_session_data.feedback.next_day_energy_level
          ]);
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request) {
  const client = await getClient();
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('id');

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify ownership
    const { rows } = await client.query(
      'SELECT id FROM training_sessions WHERE id = $1 AND user_id = $2',
      [session_id, session.user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Delete feedback
      await client.query('DELETE FROM session_feedback WHERE session_id = $1', [session_id]);
      
      // Delete sets and exercises
      await client.query(`
        DELETE FROM session_sets
        WHERE session_exercise_id IN (
          SELECT id FROM session_exercises WHERE session_id = $1
        )
      `, [session_id]);
      
      await client.query('DELETE FROM session_exercises WHERE session_id = $1', [session_id]);
      
      // Delete session
      await client.query('DELETE FROM training_sessions WHERE id = $1', [session_id]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 