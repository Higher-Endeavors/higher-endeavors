import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = `
    SELECT 
      el.id,
      el.exercise_name as name,
      'library' as source,
      ef.name as exercise_family,
      br.name as body_region,
      mg.name as muscle_group,
      mp1.name as movement_pattern,
      mpl1.name as movement_plane,
      eq.name as equipment,
      lat.name as laterality,
      diff.name as difficulty
    FROM exercise_library el
    LEFT JOIN exercise_family ef ON el.exercise_family_id = ef.id
    LEFT JOIN body_regions br ON el.body_region_id = br.id
    LEFT JOIN muscle_groups mg ON el.target_muscle_group_id = mg.id
    LEFT JOIN movement_patterns mp1 ON el.move_pattern_1_id = mp1.id
    LEFT JOIN movement_planes mpl1 ON el.move_plane_1_id = mpl1.id
    LEFT JOIN equipment eq ON el.primary_equipment_id = eq.id
    LEFT JOIN lateralities lat ON el.laterality_id = lat.id
    LEFT JOIN difficulties diff ON el.difficulty_id = diff.id
  `;
  
  let values: any[] = [];

  if (id) {
    query += ' WHERE el.id = $1';
    values.push(id);
  }

  try {
    const result = await SingleQuery(query, values);
    const rows = result?.rows || [];
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 