import { NextResponse } from 'next/server';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = `
    SELECT 
      cal.cme_activity_library_id,
      cal.activity as name,
      'cme_library' as source,
      caf.activity_family_name as activity_family,
      ce.equipment_name as equipment
    FROM cme_activity_library cal
    LEFT JOIN cme_activity_family caf ON cal.activity_family = caf.cme_activity_family_id
    LEFT JOIN cme_equipment ce ON cal.equipment_id = ce.cme_equipment_id
  `;
  
  let values: any[] = [];

  if (id) {
    query += ' WHERE cal.cme_activity_library_id = $1';
    values.push(id);
  }

  try {
    const result = await SingleQuery(query, values);
    const rows = result?.rows || [];
    return NextResponse.json(rows);
  } catch (error) {
    serverLogger.error('Error fetching CME activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 