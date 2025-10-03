import { NextResponse } from 'next/server';
import { auth } from 'auth';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `
      SELECT
        resist_phase_id,
        resist_phase_name
      FROM resist_phase
      ORDER BY resist_phase_name
    `;

    const result = await SingleQuery(query);
    const rows = result.rows as Array<{
      resist_phase_id: number;
      resist_phase_name: string;
    }>;

    return NextResponse.json({
      phases: rows.map(row => ({
        resistPhaseId: row.resist_phase_id,
        resistPhaseName: row.resist_phase_name,
      })),
    });
  } catch (error) {
    await serverLogger.error('Error fetching resistance phases', error);
    return NextResponse.json({ error: 'Failed to fetch resistance phases' }, { status: 500 });
  }
}

