import { NextResponse } from 'next/server';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET() {
  const query = `
    SELECT 
      cme_activity_family_id as id,
      activity_family_name as name
    FROM cme_activity_family
    ORDER BY activity_family_name
  `;

  try {
    const result = await SingleQuery(query);
    const rows = result?.rows || [];
    return NextResponse.json(rows);
  } catch (error) {
    serverLogger.error('Error fetching CME activity families:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
