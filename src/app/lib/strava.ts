import { pool } from "@/app/lib/dbAdapter";

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_temp?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  description?: string;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium?: string;
  profile?: string;
  city?: string;
  state?: string;
  country?: string;
  sex?: string;
  premium?: boolean;
  summit?: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id?: number;
  weight?: number;
  friend_count?: number;
  follower_count?: number;
  mutual_friend_count?: number;
  athlete_type?: number;
  date_preference?: string;
  measurement_preference?: string;
  email?: string;
  ftp?: number;
  max_heartrate?: number;
}

/**
 * Get Strava connection for a user
 */
export async function getStravaConnection(userId: number) {
  const result = await pool.query(
    'SELECT * FROM strava_connections WHERE user_id = $1 AND is_active = true',
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Refresh Strava access token
 */
export async function refreshStravaToken(refreshToken: string) {
  const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Strava token: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Make authenticated request to Strava API
 */
export async function stravaApiRequest(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const response = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Strava API request failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Sync Strava activities for a user
 */
export async function syncStravaActivities(userId: number) {
  const connection = await getStravaConnection(userId);
  if (!connection) {
    throw new Error('No active Strava connection found');
  }

  let accessToken = connection.access_token;
  
  // Check if token needs refresh
  if (new Date() >= new Date(connection.token_expires_at)) {
    const refreshed = await refreshStravaToken(connection.refresh_token);
    accessToken = refreshed.access_token;
    
    // Update connection with new tokens
    await pool.query(`
      UPDATE strava_connections 
      SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [
      refreshed.access_token,
      refreshed.refresh_token,
      new Date(refreshed.expires_at * 1000),
      connection.id
    ]);
  }

  // Fetch activities from Strava
  const activities = await stravaApiRequest('/athlete/activities?per_page=200', accessToken);
  
  // Store activities in database
  for (const activity of activities) {
    // Prepare the activity data with proper null handling - includes ALL Strava fields
    const activityData = {
      strava_connection_id: connection.strava_connections_id,
      strava_activity_id: activity.id,
      external_id: activity.external_id || null,
      upload_id: activity.upload_id || null,
      upload_id_str: activity.upload_id_str || null,
      name: activity.name || null,
      sport_type: activity.sport_type || null,
      type: activity.type || null,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      timezone: activity.timezone || null,
      utc_offset: activity.utc_offset || null,
      distance: activity.distance || null,
      moving_time: activity.moving_time || null,
      elapsed_time: activity.elapsed_time || null,
      total_elevation_gain: activity.total_elevation_gain || null,
      elev_high: activity.elev_high || null,
      elev_low: activity.elev_low || null,
      average_speed: activity.average_speed || null,
      max_speed: activity.max_speed || null,
      average_cadence: activity.average_cadence || null,
      average_temp: activity.average_temp || null,
      average_watts: activity.average_watts || null,
      weighted_average_watts: activity.weighted_average_watts || null,
      max_watts: activity.max_watts || null,
      kilojoules: activity.kilojoules || null,
      calories: activity.calories || null,
      has_heartrate: activity.has_heartrate || null,
      average_heartrate: activity.average_heartrate || null,
      max_heartrate: activity.max_heartrate || null,
      heartrate_opt_out: activity.heartrate_opt_out || null,
      display_hide_heartrate_option: activity.display_hide_heartrate_option || null,
      location_city: activity.location_city || null,
      location_state: activity.location_state || null,
      location_country: activity.location_country || null,
      start_latlng: activity.start_latlng ? JSON.stringify(activity.start_latlng) : null,
      end_latlng: activity.end_latlng ? JSON.stringify(activity.end_latlng) : null,
      map_id: activity.map?.id || null,
      summary_polyline: activity.map?.summary_polyline || null,
      device_watts: activity.device_watts || null,
      trainer: activity.trainer || null,
      commute: activity.commute || null,
      manual: activity.manual || null,
      private: activity.private || null,
      visibility: activity.visibility || null,
      flagged: activity.flagged || null,
      hide_from_home: activity.hide_from_home || null,
      workout_type: activity.workout_type || null,
      gear_id: activity.gear_id || null,
      achievement_count: activity.achievement_count || null,
      kudos_count: activity.kudos_count || null,
      comment_count: activity.comment_count || null,
      athlete_count: activity.athlete_count || null,
      photo_count: activity.photo_count || null,
      total_photo_count: activity.total_photo_count || null,
      has_kudoed: activity.has_kudoed || null,
      pr_count: activity.pr_count || null,
      suffer_score: activity.suffer_score || null,
      from_accepted_tag: activity.from_accepted_tag || null,
      description: activity.description || null,
      raw_data: JSON.stringify(activity)
    };

    await pool.query(`
      INSERT INTO strava_activities (
        strava_connection_id, strava_activity_id, external_id, upload_id, upload_id_str,
        name, sport_type, type, start_date, start_date_local, timezone, utc_offset,
        distance, moving_time, elapsed_time, total_elevation_gain, elev_high, elev_low,
        average_speed, max_speed, average_cadence, average_temp, average_watts,
        weighted_average_watts, max_watts, kilojoules, calories, has_heartrate,
        average_heartrate, max_heartrate, heartrate_opt_out, display_hide_heartrate_option,
        location_city, location_state, location_country, start_latlng, end_latlng,
        map_id, summary_polyline, device_watts, trainer, commute, manual, private,
        visibility, flagged, hide_from_home, workout_type, gear_id, achievement_count,
        kudos_count, comment_count, athlete_count, photo_count, total_photo_count,
        has_kudoed, pr_count, suffer_score, from_accepted_tag, description, raw_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
        $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61
      )
      ON CONFLICT (strava_activity_id) 
      DO UPDATE SET 
        external_id = EXCLUDED.external_id,
        upload_id = EXCLUDED.upload_id,
        upload_id_str = EXCLUDED.upload_id_str,
        name = EXCLUDED.name,
        sport_type = EXCLUDED.sport_type,
        type = EXCLUDED.type,
        start_date = EXCLUDED.start_date,
        start_date_local = EXCLUDED.start_date_local,
        timezone = EXCLUDED.timezone,
        utc_offset = EXCLUDED.utc_offset,
        distance = EXCLUDED.distance,
        moving_time = EXCLUDED.moving_time,
        elapsed_time = EXCLUDED.elapsed_time,
        total_elevation_gain = EXCLUDED.total_elevation_gain,
        elev_high = EXCLUDED.elev_high,
        elev_low = EXCLUDED.elev_low,
        average_speed = EXCLUDED.average_speed,
        max_speed = EXCLUDED.max_speed,
        average_cadence = EXCLUDED.average_cadence,
        average_temp = EXCLUDED.average_temp,
        average_watts = EXCLUDED.average_watts,
        weighted_average_watts = EXCLUDED.weighted_average_watts,
        max_watts = EXCLUDED.max_watts,
        kilojoules = EXCLUDED.kilojoules,
        calories = EXCLUDED.calories,
        has_heartrate = EXCLUDED.has_heartrate,
        average_heartrate = EXCLUDED.average_heartrate,
        max_heartrate = EXCLUDED.max_heartrate,
        heartrate_opt_out = EXCLUDED.heartrate_opt_out,
        display_hide_heartrate_option = EXCLUDED.display_hide_heartrate_option,
        location_city = EXCLUDED.location_city,
        location_state = EXCLUDED.location_state,
        location_country = EXCLUDED.location_country,
        start_latlng = EXCLUDED.start_latlng,
        end_latlng = EXCLUDED.end_latlng,
        map_id = EXCLUDED.map_id,
        summary_polyline = EXCLUDED.summary_polyline,
        device_watts = EXCLUDED.device_watts,
        trainer = EXCLUDED.trainer,
        commute = EXCLUDED.commute,
        manual = EXCLUDED.manual,
        private = EXCLUDED.private,
        visibility = EXCLUDED.visibility,
        flagged = EXCLUDED.flagged,
        hide_from_home = EXCLUDED.hide_from_home,
        workout_type = EXCLUDED.workout_type,
        gear_id = EXCLUDED.gear_id,
        achievement_count = EXCLUDED.achievement_count,
        kudos_count = EXCLUDED.kudos_count,
        comment_count = EXCLUDED.comment_count,
        athlete_count = EXCLUDED.athlete_count,
        photo_count = EXCLUDED.photo_count,
        total_photo_count = EXCLUDED.total_photo_count,
        has_kudoed = EXCLUDED.has_kudoed,
        pr_count = EXCLUDED.pr_count,
        suffer_score = EXCLUDED.suffer_score,
        from_accepted_tag = EXCLUDED.from_accepted_tag,
        description = EXCLUDED.description,
        raw_data = EXCLUDED.raw_data,
        updated_at = CURRENT_TIMESTAMP
    `, [
      activityData.strava_connection_id,
      activityData.strava_activity_id,
      activityData.external_id,
      activityData.upload_id,
      activityData.upload_id_str,
      activityData.name,
      activityData.sport_type,
      activityData.type,
      activityData.start_date,
      activityData.start_date_local,
      activityData.timezone,
      activityData.utc_offset,
      activityData.distance,
      activityData.moving_time,
      activityData.elapsed_time,
      activityData.total_elevation_gain,
      activityData.elev_high,
      activityData.elev_low,
      activityData.average_speed,
      activityData.max_speed,
      activityData.average_cadence,
      activityData.average_temp,
      activityData.average_watts,
      activityData.weighted_average_watts,
      activityData.max_watts,
      activityData.kilojoules,
      activityData.calories,
      activityData.has_heartrate,
      activityData.average_heartrate,
      activityData.max_heartrate,
      activityData.heartrate_opt_out,
      activityData.display_hide_heartrate_option,
      activityData.location_city,
      activityData.location_state,
      activityData.location_country,
      activityData.start_latlng,
      activityData.end_latlng,
      activityData.map_id,
      activityData.summary_polyline,
      activityData.device_watts,
      activityData.trainer,
      activityData.commute,
      activityData.manual,
      activityData.private,
      activityData.visibility,
      activityData.flagged,
      activityData.hide_from_home,
      activityData.workout_type,
      activityData.gear_id,
      activityData.achievement_count,
      activityData.kudos_count,
      activityData.comment_count,
      activityData.athlete_count,
      activityData.photo_count,
      activityData.total_photo_count,
      activityData.has_kudoed,
      activityData.pr_count,
      activityData.suffer_score,
      activityData.from_accepted_tag,
      activityData.description,
      activityData.raw_data
    ]);
  }

  // Update last sync time
  await pool.query(
    'UPDATE strava_connections SET last_sync_at = CURRENT_TIMESTAMP WHERE strava_connections_id = $1',
    [connection.strava_connections_id]
  );

  return activities.length;
}

/**
 * Get Strava athlete profile data (for reference, not stored separately)
 */
export async function getStravaAthleteProfile(userId: number) {
  const connection = await getStravaConnection(userId);
  if (!connection) {
    throw new Error('No active Strava connection found');
  }

  let accessToken = connection.access_token;
  
  // Check if token needs refresh
  if (new Date() >= new Date(connection.token_expires_at)) {
    const refreshed = await refreshStravaToken(connection.refresh_token);
    accessToken = refreshed.access_token;
  }

  // Fetch athlete profile from Strava
  const athlete = await stravaApiRequest('/athlete', accessToken);
  
  return athlete;
}

/**
 * Disconnect Strava account
 */
export async function disconnectStrava(userId: number) {
  const connection = await getStravaConnection(userId);
  if (!connection) {
    throw new Error('No active Strava connection found');
  }

  // Deactivate the connection
  await pool.query(
    'UPDATE strava_connections SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE strava_connections_id = $1',
    [connection.strava_connections_id]
  );

  return true;
}
