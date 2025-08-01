import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

// Type for equipment row
interface EquipmentRow {
  id: string;
  name: string;
}

export async function GET() {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query to get all unique equipment used in the exercise library
    const result = await SingleQuery(
      `SELECT DISTINCT e.id, e.name
       FROM equipment e
       WHERE e.id IN (
         SELECT DISTINCT primary_equipment_id FROM exercise_library WHERE primary_equipment_id IS NOT NULL
         UNION
         SELECT DISTINCT secondary_equipment_id FROM exercise_library WHERE secondary_equipment_id IS NOT NULL
       )
       ORDER BY e.name ASC`,
      []
    );

    const equipment: EquipmentRow[] = result.rows;
    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 