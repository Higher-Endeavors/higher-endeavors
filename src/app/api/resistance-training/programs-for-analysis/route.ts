import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    // Allow admin to specify user_id, otherwise use session user
    const userId = searchParams.get('user_id') || session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query to get programs with exercise counts and actual data indicators for analysis
    const query = `
      SELECT 
        rp.program_id as "resistanceProgramId",
        rp.program_name as "programName",
        rp.program_duration as "programDuration",
        rp.phase_focus as "phaseFocus",
        rp.periodization_type as "periodizationType",
        rp.created_at as "createdAt",
        COUNT(rpe.program_exercises_id) as "exerciseCount",
        COUNT(CASE WHEN rpe.actual_sets IS NOT NULL AND rpe.actual_sets::text != '[]' THEN 1 END) as "actualDataCount"
      FROM resist_programs rp
      LEFT JOIN resist_program_exercises rpe ON rp.program_id = rpe.program_id
      WHERE rp.user_id = $1 AND rp.deleted IS NOT TRUE
      GROUP BY rp.program_id, rp.program_name, rp.program_duration, rp.phase_focus, rp.periodization_type, rp.created_at
      HAVING COUNT(rpe.program_exercises_id) > 0
      ORDER BY rp.created_at DESC
    `;

    const result = await SingleQuery(query, [userId]);

    const programs = result.rows.map((row: any) => ({
      resistanceProgramId: row.resistanceProgramId,
      programName: row.programName,
      programDuration: row.programDuration || 0,
      phaseFocus: row.phaseFocus,
      periodizationType: row.periodizationType,
      createdAt: row.createdAt,
      hasActualData: parseInt(row.actualDataCount) > 0,
      exerciseCount: parseInt(row.exerciseCount)
    }));

    return NextResponse.json({
      success: true,
      programs
    });

  } catch (error) {
    await serverLogger.error('Error fetching programs for analysis', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch programs for analysis' 
      },
      { status: 500 }
    );
  }
}
