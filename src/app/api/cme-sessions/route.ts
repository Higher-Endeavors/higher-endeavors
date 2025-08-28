import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';
import { serverLogger } from '@/app/lib/logging/logger.server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const userId = searchParams.get('userId') || session.user.id;

    if (sessionId) {
      // Fetch specific session with exercises
      const sessionQuery = `
        SELECT 
          s.cme_session_id,
          s.user_id,
          s.session_name,
          s.macrocycle_phase,
          s.focus_block,
          s.notes,
          s.start_date,
          s.end_date,
          s.created_at,
          s.updated_at
        FROM cme_sessions s
        WHERE s.cme_session_id = $1 AND s.user_id = $2
      `;
      const sessionValues = [sessionId, userId];
      const sessionResult = await SingleQuery(sessionQuery, sessionValues);

      if (!sessionResult.rows.length) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Fetch exercises separately
      const exercisesQuery = `
        SELECT 
          sa.cme_session_activity_id,
          sa.cme_session_id,
          sa.cme_activity_family_id,
          sa.cme_activity_library_id,
          sa.planned_steps,
          sa.actual_steps,
          sa.notes,
          sa.created_at,
          sa.updated_at,
          cal.activity as activity_name,
          caf.activity_family_name as activity_family
        FROM cme_sessions_activities sa
        LEFT JOIN cme_activity_library cal ON sa.cme_activity_library_id = cal.cme_activity_library_id
        LEFT JOIN cme_activity_family caf ON sa.cme_activity_family_id = caf.cme_activity_family_id
        WHERE sa.cme_session_id = $1
        ORDER BY sa.created_at
      `;
      const exercisesValues = [sessionId];
      const exercisesResult = await SingleQuery(exercisesQuery, exercisesValues);

      // Combine session and exercises
      const sessionData = sessionResult.rows[0];
      const exercises = exercisesResult.rows.map((ex: any) => ({
        cme_session_activity_id: ex.cme_session_activity_id,
        cme_session_id: ex.cme_session_id,
        cme_activity_family_id: ex.cme_activity_family_id,
        cme_activity_library_id: ex.cme_activity_library_id,
        planned_steps: ex.planned_steps,
        actual_steps: ex.actual_steps,
        notes: ex.notes,
        created_at: ex.created_at,
        updated_at: ex.updated_at,
        activity_name: ex.activity_name,
        activity_family: ex.activity_family,
      }));

      return NextResponse.json({
        session_id: sessionData.cme_session_id,
        user_id: sessionData.user_id,
        session_name: sessionData.session_name,
        macrocycle_phase: sessionData.macrocycle_phase,
        focus_block: sessionData.focus_block,
        notes: sessionData.notes,
        start_date: sessionData.start_date,
        end_date: sessionData.end_date,
        created_at: sessionData.created_at,
        updated_at: sessionData.updated_at,
        exercises,
      });
    } else {
      // Fetch list of sessions for the user
      const sessionsQuery = `
        SELECT 
          s.cme_session_id,
          s.user_id,
          s.session_name,
          s.macrocycle_phase,
          s.focus_block,
          s.notes,
          s.start_date,
          s.end_date,
          s.created_at,
          s.updated_at,
          COUNT(sa.cme_session_activity_id) as exercise_count,
          STRING_AGG(
            COALESCE(cal.activity, 'Unknown Activity'), 
            ', ' 
            ORDER BY sa.created_at
          ) as exercise_summary
        FROM cme_sessions s
        LEFT JOIN cme_sessions_activities sa ON s.cme_session_id = sa.cme_session_id
        LEFT JOIN cme_activity_library cal ON sa.cme_activity_library_id = cal.cme_activity_library_id
        WHERE s.user_id = $1
        GROUP BY s.cme_session_id, s.user_id, s.session_name, s.macrocycle_phase, s.focus_block, s.notes, s.start_date, s.end_date, s.created_at, s.updated_at
        ORDER BY s.created_at DESC
      `;
      const sessionsValues = [userId];
      const sessionsResult = await SingleQuery(sessionsQuery, sessionsValues);

      const sessions = sessionsResult.rows.map((session: any) => ({
        cme_session_id: session.cme_session_id,
        user_id: session.user_id,
        session_name: session.session_name,
        macrocycle_phase: session.macrocycle_phase,
        focus_block: session.focus_block,
        notes: session.notes,
        start_date: session.start_date,
        end_date: session.end_date,
        created_at: session.created_at,
        updated_at: session.updated_at,
        exercise_count: parseInt(session.exercise_count) || 0,
        exercise_summary: session.exercise_summary || 'No exercises',
      }));

      return NextResponse.json({ sessions });
    }
  } catch (error) {
    serverLogger.error('Error fetching CME sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
