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
        resist_periodization_id,
        resist_periodization_name
      FROM resist_periodization_type
      ORDER BY resist_periodization_name
    `;

    const result = await SingleQuery(query);
    const rows = result.rows as Array<{
      resist_periodization_id: number;
      resist_periodization_name: string;
    }>;

    return NextResponse.json({
      periodizationTypes: rows.map(row => ({
        resistPeriodizationId: row.resist_periodization_id,
        resistPeriodizationName: row.resist_periodization_name,
      })),
    });
  } catch (error) {
    await serverLogger.error('Error fetching resistance periodization types', error);
    return NextResponse.json({ error: 'Failed to fetch resistance periodization types' }, { status: 500 });
  }
}

