import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

async function check_admin_access(user_id: number): Promise<boolean> {
  const user_role = await SingleQuery(
    'SELECT role FROM users WHERE id = $1',
    [user_id]
  );
  return user_role.rows[0]?.role === 'admin';
}

function parse_user_id(id: string | null): number | null {
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function GET(request: Request) {
  try {
    console.log('API route: Starting authentication check');
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('API route: Unauthorized - no user ID in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get target user ID from query params
    const { searchParams } = new URL(request.url);
    const target_user_id = searchParams.get('user_id');

    // If target_user_id is provided and user is admin, use that; otherwise use current user's ID
    const session_user_id = parseInt(session.user.id);
    const parsed_target_user_id = parse_user_id(target_user_id);
    const is_admin = await check_admin_access(session_user_id);
    const effective_user_id = parsed_target_user_id && is_admin ? parsed_target_user_id : session_user_id;

    console.log('Session User ID:', session_user_id, 'Target User ID:', parsed_target_user_id, 'Is Admin:', is_admin, 'Effective User ID:', effective_user_id);

    // Base query with common parts
    const base_query = `
      SELECT 
        rp.id,
        rp.program_name,
        rp.notes as description,
        rp.periodization_type,
        rp.user_id,
        rp.start_date,
        rp.end_date,
        TO_CHAR(rp.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        TO_CHAR(rp.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at,
        (
          SELECT json_agg(
            json_build_object(
              'name', COALESCE(el.exercise_name, pde.custom_exercise_name),
              'id', pde.id
            )
          )
          FROM program_weeks pw
          LEFT JOIN program_days pd ON pw.id = pd.program_week_id
          LEFT JOIN program_day_exercises pde ON pd.id = pde.program_day_id
          LEFT JOIN exercise_library el ON pde.exercise_library_id = el.id
          WHERE pw.resistance_program_id = rp.id
          AND pw.week_number = 1
        ) as exercises
        ${is_admin ? ', u.first_name, u.last_name, u.email' : ''}
      FROM resistance_programs rp
      ${is_admin ? 'LEFT JOIN users u ON rp.user_id = u.id' : ''}
      WHERE rp.user_id = $1
      ORDER BY rp.created_at DESC
    `;

    console.log('Executing query for user:', effective_user_id);
    const result = await SingleQuery(
      base_query,
      [effective_user_id]
    );
    console.log('Query result count:', result.rows.length);

    return NextResponse.json({ programs: result.rows });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 