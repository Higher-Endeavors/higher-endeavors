import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TrainingSession } from '@/app/(protected)/tools/(fitness)/resistance-training/shared/types';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const programId = searchParams.get('programId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    if (sessionId) {
      query += ` AND ts.id = $${paramIndex}`;
      params.push(sessionId);
      paramIndex++;
    }

    if (programId) {
      query += ` AND ts.program_id = $${paramIndex}`;
      params.push(programId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND ts.scheduled_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND ts.scheduled_date <= $${paramIndex}`;
      params.push(endDate);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainingSession: TrainingSession = await request.json();

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Insert session
      const { rows: [newSession] } = await client.query(`
        INSERT INTO training_sessions (
          program_id,
          user_id,
          scheduled_date,
          actual_date,
          status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        trainingSession.programId,
        session.user.id,
        trainingSession.scheduledDate,
        trainingSession.actualDate,
        trainingSession.status
      ]);

      // Insert exercises and sets
      for (const exercise of trainingSession.exercises) {
        const { rows: [newExercise] } = await client.query(`
          INSERT INTO session_exercises (
            session_id,
            exercise_library_id,
            pairing,
            planned_sets
          ) VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [
          newSession.id,
          exercise.exerciseLibraryId,
          exercise.pairing,
          exercise.plannedSets
        ]);

        // Insert sets
        for (const set of exercise.actualSets) {
          await client.query(`
            INSERT INTO session_sets (
              session_exercise_id,
              set_number,
              planned_reps,
              actual_reps,
              planned_load,
              actual_load,
              tempo,
              rest_time,
              rpe,
              rir,
              notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            newExercise.id,
            set.setNumber,
            set.plannedReps,
            set.actualReps,
            set.plannedLoad,
            set.actualLoad,
            set.tempo,
            set.restTime,
            set.rpe,
            set.rir,
            set.notes
          ]);
        }
      }

      // Insert feedback if provided
      if (trainingSession.feedback) {
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
          newSession.id,
          trainingSession.feedback.feeling,
          trainingSession.feedback.energyLevel,
          trainingSession.feedback.musclePump,
          trainingSession.feedback.notes,
          trainingSession.feedback.nextDaySoreness,
          trainingSession.feedback.nextDayFeeling,
          trainingSession.feedback.nextDayEnergyLevel
        ]);
      }

      await client.query('COMMIT');
      return NextResponse.json(newSession);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainingSession: TrainingSession = await request.json();

    // Verify ownership
    const { rows } = await client.query(
      'SELECT id FROM training_sessions WHERE id = $1 AND user_id = $2',
      [trainingSession.id, session.user.id]
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
        trainingSession.actualDate,
        trainingSession.status,
        trainingSession.id
      ]);

      // Update exercises and sets
      for (const exercise of trainingSession.exercises) {
        // Update or insert exercise
        const { rows: [existingExercise] } = await client.query(
          'SELECT id FROM session_exercises WHERE id = $1',
          [exercise.id]
        );

        if (existingExercise) {
          await client.query(`
            UPDATE session_exercises
            SET planned_sets = $1
            WHERE id = $2
          `, [exercise.plannedSets, exercise.id]);
        } else {
          await client.query(`
            INSERT INTO session_exercises (
              session_id,
              exercise_library_id,
              pairing,
              planned_sets
            ) VALUES ($1, $2, $3, $4)
          `, [
            trainingSession.id,
            exercise.exerciseLibraryId,
            exercise.pairing,
            exercise.plannedSets
          ]);
        }

        // Update sets
        for (const set of exercise.actualSets) {
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
              set.actualReps,
              set.actualLoad,
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
                tempo,
                rest_time,
                rpe,
                rir,
                notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
              exercise.id,
              set.setNumber,
              set.plannedReps,
              set.actualReps,
              set.plannedLoad,
              set.actualLoad,
              set.tempo,
              set.restTime,
              set.rpe,
              set.rir,
              set.notes
            ]);
          }
        }
      }

      // Update feedback
      if (trainingSession.feedback) {
        const { rows: [existingFeedback] } = await client.query(
          'SELECT id FROM session_feedback WHERE session_id = $1',
          [trainingSession.id]
        );

        if (existingFeedback) {
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
            trainingSession.feedback.feeling,
            trainingSession.feedback.energyLevel,
            trainingSession.feedback.musclePump,
            trainingSession.feedback.notes,
            trainingSession.feedback.nextDaySoreness,
            trainingSession.feedback.nextDayFeeling,
            trainingSession.feedback.nextDayEnergyLevel,
            trainingSession.id
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
            trainingSession.id,
            trainingSession.feedback.feeling,
            trainingSession.feedback.energyLevel,
            trainingSession.feedback.musclePump,
            trainingSession.feedback.notes,
            trainingSession.feedback.nextDaySoreness,
            trainingSession.feedback.nextDayFeeling,
            trainingSession.feedback.nextDayEnergyLevel
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify ownership
    const { rows } = await client.query(
      'SELECT id FROM training_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, session.user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Delete feedback
      await client.query('DELETE FROM session_feedback WHERE session_id = $1', [sessionId]);
      
      // Delete sets and exercises
      await client.query(`
        DELETE FROM session_sets
        WHERE session_exercise_id IN (
          SELECT id FROM session_exercises WHERE session_id = $1
        )
      `, [sessionId]);
      
      await client.query('DELETE FROM session_exercises WHERE session_id = $1', [sessionId]);
      
      // Delete session
      await client.query('DELETE FROM training_sessions WHERE id = $1', [sessionId]);

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