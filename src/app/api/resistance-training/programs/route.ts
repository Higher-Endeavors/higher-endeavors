import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

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
          program_id,
          user_id,
          program_name,
          phase_focus,
          periodization_type,
          progression_rules,
          program_duration,
          notes,
          start_date,
          end_date,
          created_at,
          updated_at
        FROM resist_programs
        WHERE program_id = $1 AND user_id = $2
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
          p.phase_focus as "phaseFocus",
          p.periodization_type as "periodizationType",
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
              SELECT json_agg(DISTINCT jsonb_build_object('name', COALESCE(el.exercise_name, uel.exercise_name)))
              FROM resist_program_exercises pe
              LEFT JOIN exercise_library el ON pe.exercise_library_id = el.exercise_library_id
              LEFT JOIN resist_user_exercise_library uel ON pe.user_exercise_library_id = uel.user_exercise_library_id
              WHERE pe.program_id = p.program_id
            ), '[]'::json)
          ) as exercise_summary
        FROM resist_programs p
        WHERE p.user_id = $1 AND (p.deleted IS NULL OR p.deleted = false)
        ORDER BY p.created_at DESC
      `;
      const values = [userId];
      const result = await SingleQuery(query, values);

      return NextResponse.json({ programs: result.rows });
    }
  } catch (error) {
    console.error('Error fetching resistance training programs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('id');
    const userId = session.user.id;

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    // Soft delete by setting deleted flag
    const query = `
      UPDATE resist_programs 
      SET deleted = true, updated_at = NOW()
      WHERE program_id = $1 AND user_id = $2
    `;
    const values = [programId, userId];
    const result = await SingleQuery(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resistance training program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 