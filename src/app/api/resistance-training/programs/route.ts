import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

async function checkAdminAccess(userId: number): Promise<boolean> {
  const userRole = await SingleQuery(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );
  return userRole.rows[0]?.role === 'admin';
}

function parseUserId(id: string | null): number | null {
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
    const targetUserId = searchParams.get('userId');

    // If targetUserId is provided and user is admin, use that; otherwise use current user's ID
    const sessionUserId = parseInt(session.user.id);
    const parsedTargetUserId = parseUserId(targetUserId);
    const isAdmin = await checkAdminAccess(sessionUserId);
    const effectiveUserId = parsedTargetUserId && isAdmin ? parsedTargetUserId : sessionUserId;

    console.log('Session User ID:', sessionUserId, 'Target User ID:', parsedTargetUserId, 'Is Admin:', isAdmin, 'Effective User ID:', effectiveUserId);

    // Base query with common parts
    const baseQuery = `
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
          SELECT COUNT(DISTINCT pde.id)
          FROM program_weeks pw
          LEFT JOIN program_days pd ON pw.id = pd.program_week_id
          LEFT JOIN program_day_exercises pde ON pd.id = pde.program_day_id
          WHERE pw.resistance_program_id = rp.id
        ) as exercise_count
        ${isAdmin ? ', u.first_name, u.last_name, u.email' : ''}
      FROM resistance_programs rp
      ${isAdmin ? 'LEFT JOIN users u ON rp.user_id = u.id' : ''}
      WHERE rp.user_id = $1
      ORDER BY rp.created_at DESC
    `;

    console.log('Executing query for user:', effectiveUserId);
    const result = await SingleQuery(
      baseQuery,
      [effectiveUserId]
    );
    console.log('Query result count:', result.rows.length);

    return NextResponse.json({ programs: result.rows });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 