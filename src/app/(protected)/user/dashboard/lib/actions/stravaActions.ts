'use server'

import { auth } from '@/app/auth';
import { pool } from '@/app/lib/dbAdapter';

export async function getRecentStravaActivities() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      activities: [],
      error: 'Unauthorized'
    };
  }

  try {
    // Get user's Strava connection
    const connectionResult = await pool.query(
      'SELECT strava_connections_id FROM strava_connections WHERE user_id = $1 AND is_active = true',
      [session.user.id]
    );

    if (connectionResult.rows.length === 0) {
      return {
        success: true,
        activities: [],
        error: null
      };
    }

    const connectionId = connectionResult.rows[0].strava_connections_id;

    // Get recent activities
    const activitiesResult = await pool.query(`
      SELECT 
        strava_activity_id,
        name,
        sport_type,
        start_date,
        distance,
        moving_time,
        total_elevation_gain,
        average_speed,
        calories
      FROM strava_activities 
      WHERE strava_connection_id = $1 
      ORDER BY start_date DESC 
      LIMIT 10
    `, [connectionId]);

    return {
      success: true,
      activities: activitiesResult.rows,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching recent Strava activities:', error);
    return {
      success: false,
      activities: [],
      error: error.message || 'Failed to fetch activities'
    };
  }
}
