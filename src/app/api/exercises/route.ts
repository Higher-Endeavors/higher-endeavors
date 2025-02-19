import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the table structure
    const tableCheck = await SingleQuery(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'exercise_library'
      )`,
      []
    );

    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ 
        error: 'Database not properly initialized',
        details: 'exercise_library table does not exist'
      }, { status: 500 });
    }

    // Query that combines user exercises and library exercises with proper sorting
    const result = await SingleQuery(
      `WITH combined_exercises AS (
        -- User exercises
        SELECT 
          'user' as source,
          ue.id as id,
          ue.exercise_name,
          NULL as difficulty_id,
          NULL as target_muscle_group_id,
          NULL as prime_mover_muscle_id,
          NULL as primary_equipment_id,
          NULL as secondary_equipment_id,
          NULL as exercise_family_id,
          NULL as body_region_id,
          NULL as move_pattern_1_id,
          NULL as move_plane_1_id,
          NULL as laterality_id,
          0 as sort_order
        FROM user_exercises ue
        WHERE ue.user_id = $1
        
        UNION ALL
        
        -- Library exercises
        SELECT 
          'library' as source,
          el.id as id,
          el.exercise_name,
          el.difficulty_id,
          el.target_muscle_group_id,
          el.prime_mover_muscle_id,
          el.primary_equipment_id,
          el.secondary_equipment_id,
          el.exercise_family_id,
          el.body_region_id,
          el.move_pattern_1_id,
          el.move_plane_1_id,
          el.laterality_id,
          CASE 
            WHEN d.name = 'Basic' THEN 1
            WHEN d.name = 'Beginner' THEN 2
            WHEN d.name = 'Novice' THEN 3
            WHEN d.name = 'Intermediate' THEN 4
            WHEN d.name = 'Advanced' THEN 5
            WHEN d.name = 'Expert' THEN 6
            WHEN d.name = 'Master' THEN 7
            WHEN d.name = 'Grand Master' THEN 8
            WHEN d.name = 'Legendary' THEN 9
            ELSE 10
          END as sort_order
        FROM exercise_library el
        LEFT JOIN difficulties d ON el.difficulty_id = d.id
      )
      SELECT 
        ce.source,
        ce.id,
        ce.exercise_name as name,
        ce.difficulty_id,
        d.name as difficulty_name,
        ce.target_muscle_group_id,
        mg.name as target_muscle_group,
        ce.prime_mover_muscle_id,
        m1.name as prime_mover_muscle,
        ce.primary_equipment_id,
        e1.name as primary_equipment,
        ce.secondary_equipment_id,
        e2.name as secondary_equipment,
        ce.exercise_family_id,
        ef.name as exercise_family,
        ce.body_region_id,
        br.name as body_region,
        ce.move_pattern_1_id,
        mp.name as movement_pattern,
        ce.move_plane_1_id,
        mpl.name as movement_plane,
        ce.laterality_id,
        l.name as laterality
      FROM combined_exercises ce
      LEFT JOIN difficulties d ON ce.difficulty_id = d.id
      LEFT JOIN muscle_groups mg ON ce.target_muscle_group_id = mg.id
      LEFT JOIN muscles m1 ON ce.prime_mover_muscle_id = m1.id
      LEFT JOIN equipment e1 ON ce.primary_equipment_id = e1.id
      LEFT JOIN equipment e2 ON ce.secondary_equipment_id = e2.id
      LEFT JOIN exercise_family ef ON ce.exercise_family_id = ef.id
      LEFT JOIN body_regions br ON ce.body_region_id = br.id
      LEFT JOIN movement_patterns mp ON ce.move_pattern_1_id = mp.id
      LEFT JOIN movement_planes mpl ON ce.move_plane_1_id = mpl.id
      LEFT JOIN lateralities l ON ce.laterality_id = l.id
      ORDER BY ce.sort_order, ce.exercise_name ASC`,
      [session.user.id]
    );
    
    // Log the result for debugging
    console.log('Query result:', {
      rowCount: result.rowCount,
      firstRow: result.rows[0],
      isArray: Array.isArray(result.rows)
    });

    // Ensure we always return an array, even if empty
    const exercises = result.rows || [];
    return NextResponse.json(exercises);
    
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 