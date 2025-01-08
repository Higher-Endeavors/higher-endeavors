import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const difficulty = searchParams.get('difficulty');

    // Build the query
    let query = `
      SELECT 
        el.id,
        el.exercise_name,
        d.name as difficulty,
        mg.name as target_muscle_group,
        m1.name as primary_mover_muscle,
        m2.name as secondary_muscle,
        m3.name as tertiary_muscle,
        e1.name as primary_equipment,
        e2.name as secondary_equipment,
        p.name as posture,
        sda.name as single_double_arm,
        caa.name as continuous_alternating_arms,
        g.name as grip,
        elp.name as ending_load_position,
        fe.name as foot_elevation,
        ce.name as combination_exercise,
        mp1.name as move_pattern_1,
        mp2.name as move_pattern_2,
        mp3.name as move_pattern_3,
        mpl1.name as move_plane_1,
        mpl2.name as move_plane_2,
        mpl3.name as move_plane_3,
        br.name as body_region,
        ft.name as force_type,
        m.name as mechanics,
        l.name as laterality,
        em.name as exercise_modality
      FROM exercise_library el
      LEFT JOIN difficulties d ON el.difficulty_id = d.id
      LEFT JOIN muscle_groups mg ON el.target_muscle_group_id = mg.id
      LEFT JOIN muscles m1 ON el.prime_mover_muscle_id = m1.id
      LEFT JOIN muscles m2 ON el.secondary_muscle_id = m2.id
      LEFT JOIN muscles m3 ON el.tertiary_muscle_id = m3.id
      LEFT JOIN equipment e1 ON el.primary_equipment_id = e1.id
      LEFT JOIN equipment e2 ON el.secondary_equipment_id = e2.id
      LEFT JOIN postures p ON el.posture_id = p.id
      LEFT JOIN single_double_arm sda ON el.single_double_arm_id = sda.id
      LEFT JOIN continuous_alternating_arms caa ON el.continuous_alternating_arms_id = caa.id
      LEFT JOIN grips g ON el.grip_id = g.id
      LEFT JOIN ending_load_positions elp ON el.ending_load_position_id = elp.id
      LEFT JOIN foot_elevations fe ON el.foot_elevation_id = fe.id
      LEFT JOIN combination_exercises ce ON el.combination_exercise_id = ce.id
      LEFT JOIN movement_patterns mp1 ON el.move_pattern_1_id = mp1.id
      LEFT JOIN movement_patterns mp2 ON el.move_pattern_2_id = mp2.id
      LEFT JOIN movement_patterns mp3 ON el.move_pattern_3_id = mp3.id
      LEFT JOIN movement_planes mpl1 ON el.move_plane_1_id = mpl1.id
      LEFT JOIN movement_planes mpl2 ON el.move_plane_2_id = mpl2.id
      LEFT JOIN movement_planes mpl3 ON el.move_plane_3_id = mpl3.id
      LEFT JOIN body_regions br ON el.body_region_id = br.id
      LEFT JOIN force_types ft ON el.force_type_id = ft.id
      LEFT JOIN mechanics m ON el.mechanics_id = m.id
      LEFT JOIN lateralities l ON el.laterality_id = l.id
      LEFT JOIN exercise_modalities em ON el.exercise_modality_id = em.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND el.exercise_name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (muscleGroup) {
      query += ` AND mg.name = $${paramIndex}`;
      params.push(muscleGroup);
      paramIndex++;
    }

    if (equipment) {
      query += ` AND (e1.name = $${paramIndex} OR e2.name = $${paramIndex})`;
      params.push(equipment);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND d.name = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    query += ' ORDER BY el.exercise_name ASC';

    // Execute the query
    const result = await SingleQuery(query, params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 