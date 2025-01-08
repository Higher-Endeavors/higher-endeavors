import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('id');

  try {
    if (programId) {
      const query = `
        SELECT 
          p.*,
          json_agg(e.*) as exercises,
          json_agg(pr.*) as progression_rules,
          json_agg(vt.*) as volume_targets
        FROM resistance_programs p
        LEFT JOIN session_exercises e ON p.id = e.program_id
        LEFT JOIN program_progression pr ON p.id = pr.program_id
        LEFT JOIN volume_targets vt ON p.id = vt.program_id
        WHERE p.id = $1 AND p.user_id = $2
        GROUP BY p.id
      `;
      const values = [programId, session.user.id];
      const result = await SingleQuery(query, values);

      if (!result.length) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    } else {
      const query = `
        SELECT 
          p.id,
          p.name,
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

  const program = await request.json();

  try {
    // Start transaction
    const beginQuery = 'BEGIN';
    await SingleQuery(beginQuery, []);

    try {
      // Insert program
      const programQuery = `
        INSERT INTO resistance_programs (
          user_id,
          name,
          phase_focus,
          periodization_type,
          start_date,
          end_date
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const programValues = [
        session.user.id,
        program.name,
        program.phaseFocus,
        program.periodizationType,
        program.startDate,
        program.endDate
      ];
      const programResult = await SingleQuery(programQuery, programValues);
      const newProgramId = programResult[0].id;

      // Insert exercises
      for (const exercise of program.exercises) {
        const exerciseQuery = `
          INSERT INTO session_exercises (
            program_id,
            exercise_library_id,
            pairing,
            sets,
            reps,
            load,
            tempo,
            rest,
            notes,
            rpe,
            rir,
            display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        const exerciseValues = [
          newProgramId,
          exercise.exerciseLibraryId,
          exercise.pairing,
          exercise.sets,
          exercise.reps,
          exercise.load,
          exercise.tempo,
          exercise.rest,
          exercise.notes,
          exercise.rpe,
          exercise.rir,
          program.exercises.indexOf(exercise)
        ];
        await SingleQuery(exerciseQuery, exerciseValues);
      }

      // Insert progression rules
      const progressionQuery = `
        INSERT INTO program_progression (
          program_id,
          type,
          settings
        ) VALUES ($1, $2, $3)
      `;
      const progressionValues = [
        newProgramId,
        program.progressionRules.type,
        JSON.stringify(program.progressionRules.settings)
      ];
      await SingleQuery(progressionQuery, progressionValues);

      // Insert volume targets
      for (const target of program.volumeTargets) {
        const targetQuery = `
          INSERT INTO volume_targets (
            program_id,
            type,
            muscle_group_id,
            exercise_id,
            rep_volume_target,
            load_volume_target,
            time_under_tension_target
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const targetValues = [
          newProgramId,
          target.type,
          target.muscleGroupId,
          target.exerciseId,
          target.repVolumeTarget,
          target.loadVolumeTarget,
          target.timeUnderTensionTarget
        ];
        await SingleQuery(targetQuery, targetValues);
      }

      // Commit transaction
      await SingleQuery('COMMIT', []);
      return NextResponse.json({ id: newProgramId });
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