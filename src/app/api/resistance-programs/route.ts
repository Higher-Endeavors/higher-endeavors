import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const program_id = searchParams.get('id');

  try {
    if (program_id) {
      const query = `
        SELECT 
          p.*,
          json_agg(e.*) as exercises,
          json_agg(pr.*) as progression_rules
          -- Volume targets functionality to be implemented later
          -- json_agg(vt.*) as volume_targets
        FROM resistance_programs p
        LEFT JOIN session_exercises e ON p.id = e.program_id
        LEFT JOIN program_progression pr ON p.id = pr.program_id
        -- Volume targets join to be implemented later
        -- LEFT JOIN volume_targets vt ON p.id = vt.program_id
        WHERE p.id = $1 AND p.user_id = $2
        GROUP BY p.id
      `;
      const values = [program_id, session.user.id];
      const result = await SingleQuery(query, values);

      if (!result.length) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    } else {
      const query = `
        SELECT 
          p.id,
          p.program_name,
          p.phase_focus,
          p.periodization_type,
          p.start_date,
          p.end_date,
          p.created_at,
          p.updated_at,
          COUNT(e.id) as exercise_count
        FROM resistance_programs p
        LEFT JOIN session_exercises e ON p.id = e.program_id
        WHERE p.user_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      const values = [session.user.id];
      const result = await SingleQuery(query, values);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    program_name,
    phase_focus,
    periodization_type,
    start_date,
    end_date,
    exercises,
    progression_rules,
    // volume_targets  // To be implemented
  } = await request.json();

  try {
    // Start transaction
    const beginQuery = 'BEGIN';
    await SingleQuery(beginQuery, []);

    try {
      // Insert program
      const programQuery = `
        INSERT INTO resistance_programs (
          user_id,
          program_name,
          phase_focus,
          periodization_type,
          start_date,
          end_date
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const programValues = [
        session.user.id,
        program_name,
        phase_focus,
        periodization_type,
        start_date,
        end_date
      ];
      const programResult = await SingleQuery(programQuery, programValues);
      const new_program_id = programResult[0].id;

      // Insert exercises
      for (const exercise of exercises) {
        const exerciseQuery = `
          INSERT INTO session_exercises (
            program_id,
            exercise_library_id,
            pairing,
            set_number,
            planned_reps,
            planned_load,
            planned_tempo,
            planned_rest,
            notes,
            rpe,
            rir,
            order_index
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        const exerciseValues = [
          new_program_id,
          exercise.exercise_library_id,
          exercise.pairing,
          exercise.set_number,
          exercise.planned_reps,
          exercise.planned_load,
          exercise.planned_tempo,
          exercise.planned_rest,
          exercise.notes,
          exercise.rpe,
          exercise.rir,
          exercises.indexOf(exercise)
        ];
        await SingleQuery(exerciseQuery, exerciseValues);
      }

      // Insert progression rules
      const progressionQuery = `
        INSERT INTO program_progression (
          program_id,
          progression_type,
          settings
        ) VALUES ($1, $2, $3)
      `;
      const progressionValues = [
        new_program_id,
        progression_rules.progression_type,
        JSON.stringify(progression_rules.settings)
      ];
      await SingleQuery(progressionQuery, progressionValues);

      /* Volume targets functionality to be implemented
      // Insert volume targets
      for (const target of volume_targets) {
        const targetQuery = `
          INSERT INTO volume_targets (
            program_id,
            target_type,
            muscle_group_id,
            exercise_id,
            rep_volume_target,
            load_volume_target,
            time_under_tension_target
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const targetValues = [
          new_program_id,
          target.target_type,
          target.muscle_group_id,
          target.exercise_id,
          target.rep_volume_target,
          target.load_volume_target,
          target.time_under_tension_target
        ];
        await SingleQuery(targetQuery, targetValues);
      }
      */

      // Commit transaction
      await SingleQuery('COMMIT', []);
      return NextResponse.json({ id: new_program_id });
    } catch (error) {
      // Rollback on error
      await SingleQuery('ROLLBACK', []);
      throw error;
    }
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 