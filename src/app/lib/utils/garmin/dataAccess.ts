import { SingleQuery, Query } from '@/app/lib/dbAdapter';

// Daily Summary Types
export interface DailySummary {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  steps?: number;
  distance_meters?: number;
  active_calories?: number;
  total_calories?: number;
  floors_climbed?: number;
  floors_descended?: number;
  minutes_sedentary?: number;
  minutes_lightly_active?: number;
  minutes_moderately_active?: number;
  minutes_intensely_active?: number;
}

// Sleep Data Types
export interface SleepData {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  duration_seconds?: number;
  validation_type?: string;
  deep_sleep_seconds?: number;
  light_sleep_seconds?: number;
  rem_sleep_seconds?: number;
  awake_sleep_seconds?: number;
  unmeasurable_sleep_seconds?: number;
}

// Activity Types - expanded based on API documentation
export interface Activity {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  activity_id?: string;
  activity_type: string;
  activity_name?: string;
  start_time: Date;
  duration_seconds?: number;
  distance_meters?: number;
  avg_speed_mps?: number;
  max_speed_mps?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  calories?: number;
  device_name?: string;
  manual: boolean;
  is_parent: boolean;
  parent_summary_id?: string;
  is_web_upload?: boolean;
  average_bike_cadence?: number;
  average_run_cadence?: number;
  average_swim_cadence?: number;
  average_pace_minutes_per_km?: number;
  max_bike_cadence?: number;
  max_run_cadence?: number;
  max_pace_minutes_per_km?: number;
  number_of_active_lengths?: number;
  starting_latitude?: number;
  starting_longitude?: number;
  total_elevation_gain?: number;
  total_elevation_loss?: number;
  pushes?: number;
  average_push_cadence?: number;
  max_push_cadence?: number;
  steps?: number;
}

// Activity Details
export interface ActivityDetails {
  id: number;
  activity_id: number;
  user_id: number;
  samples: ActivitySample[];
  laps: ActivityLap[];
}

// Activity Sample
export interface ActivitySample {
  id: number;
  activity_details_id: number;
  start_time_seconds: number;
  latitude?: number;
  longitude?: number;
  elevation_meters?: number;
  heart_rate?: number;
  speed_meters_per_second?: number;
  steps_per_minute?: number;
  total_distance_meters?: number;
  timer_duration_seconds?: number;
  clock_duration_seconds?: number;
  moving_duration_seconds?: number;
  power_watts?: number;
  bike_cadence_rpm?: number;
  wheelchair_cadence?: number;
  swim_cadence?: number;
  air_temperature_celsius?: number;
}

// Activity Lap
export interface ActivityLap {
  id: number;
  activity_details_id: number;
  start_time_seconds: number;
}

// MoveIQ Event
export interface MoveIQEvent {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  start_time_offset_seconds?: number;
  duration_seconds?: number;
  activity_type: string;
  activity_sub_type?: string;
}

// Date Range Type
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Epoch Types
export interface EpochData {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  start_time: Date;
  start_time_offset_seconds?: number;
  activity_type: string;
  duration_seconds?: number;
  active_time_seconds?: number;
  steps?: number;
  distance_meters?: number;
  active_calories?: number;
  met?: number;
  intensity?: string;
}

// Stress Details Types
export interface StressData {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  duration_seconds?: number;
  average_stress_level?: number;
  max_stress_level?: number;
  stress_duration_seconds?: number;
  rest_stress_duration_seconds?: number;
  activity_stress_duration_seconds?: number;
  low_stress_duration_seconds?: number;
  medium_stress_duration_seconds?: number;
  high_stress_duration_seconds?: number;
  stress_qualifier?: string;
}

// Body Composition Types
export interface BodyComposition {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  timestamp: Date;
  weight_kg?: number;
  bmi?: number;
  body_fat_percentage?: number;
  bone_mass_kg?: number;
  muscle_mass_kg?: number;
  water_percentage?: number;
}

// User Metrics Types
export interface UserMetrics {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  vo2_max?: number;
  vo2_max_cycling?: number;
  enhanced?: boolean;
  fitness_age?: number;
}

// Pulse Ox Types
export interface PulseOx {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  duration_seconds?: number;
  on_demand: boolean;
  readings: PulseOxReading[];
}

export interface PulseOxReading {
  id: number;
  pulse_ox_id: number;
  time_offset_seconds: number;
  spo2_value: number;
}

// Respiration Types
export interface Respiration {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  start_time: Date;
  duration_seconds?: number;
  readings: RespirationReading[];
}

export interface RespirationReading {
  id: number;
  respiration_id: number;
  time_offset_seconds: number;
  breaths_per_minute: number;
}

// Health Snapshot Types
export interface HealthSnapshot {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  duration_seconds?: number;
  metrics: HealthSnapshotMetric[];
}

export interface HealthSnapshotMetric {
  id: number;
  health_snapshot_id: number;
  summary_type: string;
  min_value?: number;
  max_value?: number;
  avg_value?: number;
  readings: HealthSnapshotReading[];
}

export interface HealthSnapshotReading {
  id: number;
  health_snapshot_metrics_id: number;
  time_offset_seconds: number;
  value: number;
}

// HRV Types
export interface HRV {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  duration_seconds?: number;
  last_night_avg?: number;
  last_night_5min_high?: number;
  readings: HRVReading[];
}

export interface HRVReading {
  id: number;
  hrv_id: number;
  time_offset_seconds: number;
  hrv_value: number;
}

// Blood Pressure Types
export interface BloodPressure {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  measurement_time: Date;
  systolic: number;
  diastolic: number;
  pulse?: number;
  source_type: string;
}

// Skin Temperature Types
export interface SkinTemperature {
  id: number;
  user_id: number;
  garmin_user_id: string;
  summary_id: string;
  calendar_date: string;
  start_time: Date;
  duration_seconds?: number;
  avg_deviation_celsius?: number;
}

// Garmin Data Access
export const GarminDataAccess = {
  // Check if a user has connected their Garmin account
  async isConnected(userId: number): Promise<boolean> {
    const result = await SingleQuery(
      'SELECT COUNT(*) as count FROM user_garmin_tokens WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].count > 0;
  },

  // Get daily summaries for a user in a date range
  async getDailySummaries(userId: number, dateRange: DateRange): Promise<DailySummary[]> {
    const result = await Query(
      `SELECT * FROM garmin_daily_summaries 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY calendar_date ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get sleep data for a user in a date range
  async getSleepData(userId: number, dateRange: DateRange): Promise<SleepData[]> {
    const result = await Query(
      `SELECT * FROM garmin_sleep_data 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY calendar_date ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get activities for a user in a date range
  async getActivities(userId: number, dateRange: DateRange): Promise<Activity[]> {
    const result = await Query(
      `SELECT * FROM garmin_activities 
       WHERE user_id = $1 
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time DESC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get activities by type for a user in a date range
  async getActivitiesByType(userId: number, activityType: string, dateRange: DateRange): Promise<Activity[]> {
    const result = await Query(
      `SELECT * FROM garmin_activities 
       WHERE user_id = $1 
       AND activity_type = $2
       AND start_time BETWEEN $3 AND $4
       ORDER BY start_time DESC`,
      [userId, activityType, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get activity summary stats (count, total distance, total duration, etc.)
  async getActivitySummaryStats(userId: number, dateRange: DateRange): Promise<any> {
    const result = await Query(
      `SELECT 
         activity_type,
         COUNT(*) as activity_count,
         SUM(duration_seconds) as total_duration_seconds,
         SUM(distance_meters) as total_distance_meters,
         SUM(calories) as total_calories
       FROM garmin_activities 
       WHERE user_id = $1 
       AND start_time BETWEEN $2 AND $3
       GROUP BY activity_type
       ORDER BY activity_count DESC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get epoch data (15-minute intervals) for a user in a date range
  async getEpochData(userId: number, dateRange: DateRange): Promise<EpochData[]> {
    const result = await Query(
      `SELECT * FROM garmin_epochs 
       WHERE user_id = $1 
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get epoch data by activity type
  async getEpochDataByActivityType(userId: number, activityType: string, dateRange: DateRange): Promise<EpochData[]> {
    const result = await Query(
      `SELECT * FROM garmin_epochs 
       WHERE user_id = $1 
       AND activity_type = $2
       AND start_time BETWEEN $3 AND $4
       ORDER BY start_time ASC`,
      [userId, activityType, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get stress data for a user in a date range
  async getStressData(userId: number, dateRange: DateRange): Promise<StressData[]> {
    const result = await Query(
      `SELECT * FROM garmin_stress_details 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY calendar_date ASC, start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get stress summary stats for a date range
  async getStressSummaryStats(userId: number, dateRange: DateRange): Promise<any> {
    const result = await Query(
      `SELECT 
         AVG(average_stress_level) as avg_stress,
         MAX(max_stress_level) as max_stress,
         SUM(stress_duration_seconds) as total_stress_seconds,
         SUM(rest_stress_duration_seconds) as total_rest_seconds,
         SUM(activity_stress_duration_seconds) as total_activity_seconds,
         SUM(low_stress_duration_seconds) as total_low_stress_seconds,
         SUM(medium_stress_duration_seconds) as total_medium_stress_seconds,
         SUM(high_stress_duration_seconds) as total_high_stress_seconds
       FROM garmin_stress_details 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows[0];
  },

  // Get body composition data for a user in a date range
  async getBodyComposition(userId: number, dateRange: DateRange): Promise<BodyComposition[]> {
    const result = await Query(
      `SELECT * FROM garmin_body_composition 
       WHERE user_id = $1 
       AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp DESC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get latest body composition data for a user
  async getLatestBodyComposition(userId: number): Promise<BodyComposition | null> {
    const result = await Query(
      `SELECT * FROM garmin_body_composition 
       WHERE user_id = $1 
       ORDER BY timestamp DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows.length ? result.rows[0] : null;
  },

  // Get user metrics for a user in a date range
  async getUserMetrics(userId: number, dateRange: DateRange): Promise<UserMetrics[]> {
    const result = await Query(
      `SELECT * FROM garmin_user_metrics 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY calendar_date DESC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get latest user metrics for a user
  async getLatestUserMetrics(userId: number): Promise<UserMetrics | null> {
    const result = await Query(
      `SELECT * FROM garmin_user_metrics 
       WHERE user_id = $1 
       ORDER BY calendar_date DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows.length ? result.rows[0] : null;
  },

  // Get pulse ox data with readings for a user in a date range
  async getPulseOxData(userId: number, dateRange: DateRange): Promise<PulseOx[]> {
    const result = await Query(
      `SELECT * FROM garmin_pulse_ox 
       WHERE user_id = $1 
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    
    const pulseOxData: PulseOx[] = result.rows;
    
    // Load readings for each pulse ox record
    for (const pulseOx of pulseOxData) {
      const readingsResult = await Query(
        `SELECT * FROM garmin_pulse_ox_readings 
         WHERE pulse_ox_id = $1
         ORDER BY time_offset_seconds ASC`,
        [pulseOx.id]
      );
      pulseOx.readings = readingsResult.rows;
    }
    
    return pulseOxData;
  },

  // Get on-demand pulse ox measurements for a user in a date range
  async getOnDemandPulseOx(userId: number, dateRange: DateRange): Promise<PulseOx[]> {
    const result = await Query(
      `SELECT * FROM garmin_pulse_ox 
       WHERE user_id = $1 
       AND on_demand = true
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    
    const pulseOxData: PulseOx[] = result.rows;
    
    // Load readings for each pulse ox record
    for (const pulseOx of pulseOxData) {
      const readingsResult = await Query(
        `SELECT * FROM garmin_pulse_ox_readings 
         WHERE pulse_ox_id = $1
         ORDER BY time_offset_seconds ASC`,
        [pulseOx.id]
      );
      pulseOx.readings = readingsResult.rows;
    }
    
    return pulseOxData;
  },

  // Get respiration data with readings for a user in a date range
  async getRespirationData(userId: number, dateRange: DateRange): Promise<Respiration[]> {
    const result = await Query(
      `SELECT * FROM garmin_respiration 
       WHERE user_id = $1 
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    
    const respirationData: Respiration[] = result.rows;
    
    // Load readings for each respiration record
    for (const respiration of respirationData) {
      const readingsResult = await Query(
        `SELECT * FROM garmin_respiration_readings 
         WHERE respiration_id = $1
         ORDER BY time_offset_seconds ASC`,
        [respiration.id]
      );
      respiration.readings = readingsResult.rows;
    }
    
    return respirationData;
  },

  // Get health snapshot data with metrics and readings for a user in a date range
  async getHealthSnapshotData(userId: number, dateRange: DateRange): Promise<HealthSnapshot[]> {
    const result = await Query(
      `SELECT * FROM garmin_health_snapshot 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    
    const snapshotData: HealthSnapshot[] = result.rows;
    
    // Load metrics and readings for each health snapshot
    for (const snapshot of snapshotData) {
      const metricsResult = await Query(
        `SELECT * FROM garmin_health_snapshot_metrics 
         WHERE health_snapshot_id = $1`,
        [snapshot.id]
      );
      
      snapshot.metrics = metricsResult.rows;
      
      // Load readings for each metric
      for (const metric of snapshot.metrics) {
        const readingsResult = await Query(
          `SELECT * FROM garmin_health_snapshot_readings 
           WHERE health_snapshot_metrics_id = $1
           ORDER BY time_offset_seconds ASC`,
          [metric.id]
        );
        metric.readings = readingsResult.rows;
      }
    }
    
    return snapshotData;
  },

  // Get HRV data with readings for a user in a date range
  async getHRVData(userId: number, dateRange: DateRange): Promise<HRV[]> {
    const result = await Query(
      `SELECT * FROM garmin_hrv 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    
    const hrvData: HRV[] = result.rows;
    
    // Load readings for each HRV record
    for (const hrv of hrvData) {
      const readingsResult = await Query(
        `SELECT * FROM garmin_hrv_readings 
         WHERE hrv_id = $1
         ORDER BY time_offset_seconds ASC`,
        [hrv.id]
      );
      hrv.readings = readingsResult.rows;
    }
    
    return hrvData;
  },

  // Get blood pressure data for a user in a date range
  async getBloodPressure(userId: number, dateRange: DateRange): Promise<BloodPressure[]> {
    const result = await Query(
      `SELECT * FROM garmin_blood_pressure 
       WHERE user_id = $1 
       AND measurement_time BETWEEN $2 AND $3
       ORDER BY measurement_time DESC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },

  // Get skin temperature data for a user in a date range
  async getSkinTemperature(userId: number, dateRange: DateRange): Promise<SkinTemperature[]> {
    const result = await Query(
      `SELECT * FROM garmin_skin_temperature 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY calendar_date ASC, start_time ASC`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows;
  },
  
  // Get average skin temperature deviation for a user in a date range
  async getAverageSkinTemperature(userId: number, dateRange: DateRange): Promise<number | null> {
    const result = await Query(
      `SELECT AVG(avg_deviation_celsius) as avg_temp 
       FROM garmin_skin_temperature 
       WHERE user_id = $1 
       AND calendar_date BETWEEN $2 AND $3`,
      [userId, dateRange.startDate, dateRange.endDate]
    );
    return result.rows[0]?.avg_temp || null;
  },

  // Get activity details with samples and laps
  async getActivityDetails(activityId: number): Promise<ActivityDetails | null> {
    // Get activity details
    const detailsResult = await Query(
      `SELECT * FROM garmin_activity_details 
       WHERE activity_id = $1`,
      [activityId]
    );
    
    if (detailsResult.rows.length === 0) {
      return null;
    }
    
    const details: ActivityDetails = detailsResult.rows[0];
    details.samples = [];
    details.laps = [];
    
    // Get samples
    const samplesResult = await Query(
      `SELECT * FROM garmin_activity_samples 
       WHERE activity_details_id = $1
       ORDER BY start_time_seconds ASC`,
      [details.id]
    );
    details.samples = samplesResult.rows;
    
    // Get laps
    const lapsResult = await Query(
      `SELECT * FROM garmin_activity_laps 
       WHERE activity_details_id = $1
       ORDER BY start_time_seconds ASC`,
      [details.id]
    );
    details.laps = lapsResult.rows;
    
    return details;
  },
  
  // Get activity details by summary ID
  async getActivityDetailsBySummaryId(summaryId: string): Promise<ActivityDetails | null> {
    // First get the activity ID
    const activityResult = await Query(
      `SELECT id FROM garmin_activities 
       WHERE summary_id = $1`,
      [summaryId]
    );
    
    if (activityResult.rows.length === 0) {
      return null;
    }
    
    return this.getActivityDetails(activityResult.rows[0].id);
  },
  
  // Get activity file meta-data
  async getActivityFiles(activityId: number): Promise<any[]> {
    const result = await Query(
      `SELECT id, user_id, file_type, created_at, updated_at
       FROM garmin_activity_files
       WHERE activity_id = $1`,
      [activityId]
    );
    return result.rows;
  },
  
  // Get MoveIQ events for a user in a date range
  async getMoveIQEvents(userId: number, dateRange: DateRange): Promise<MoveIQEvent[]> {
    const result = await Query(
      `SELECT * FROM garmin_moveiq_events
       WHERE user_id = $1
       AND calendar_date BETWEEN $2 AND $3
       ORDER BY start_time ASC`,
      [userId, dateRange.startDate.toISOString().split('T')[0], dateRange.endDate.toISOString().split('T')[0]]
    );
    return result.rows;
  },
  
  // Get MoveIQ events by activity type
  async getMoveIQEventsByType(userId: number, activityType: string, dateRange: DateRange): Promise<MoveIQEvent[]> {
    const result = await Query(
      `SELECT * FROM garmin_moveiq_events
       WHERE user_id = $1
       AND activity_type = $2
       AND calendar_date BETWEEN $3 AND $4
       ORDER BY start_time ASC`,
      [userId, activityType, dateRange.startDate.toISOString().split('T')[0], dateRange.endDate.toISOString().split('T')[0]]
    );
    return result.rows;
  },
  
  // Get MoveIQ summary stats
  async getMoveIQSummaryStats(userId: number, dateRange: DateRange): Promise<any> {
    const result = await Query(
      `SELECT 
         activity_type,
         COUNT(*) as event_count,
         SUM(duration_seconds) as total_duration_seconds
       FROM garmin_moveiq_events
       WHERE user_id = $1
       AND calendar_date BETWEEN $2 AND $3
       GROUP BY activity_type
       ORDER BY event_count DESC`,
      [userId, dateRange.startDate.toISOString().split('T')[0], dateRange.endDate.toISOString().split('T')[0]]
    );
    return result.rows;
  },
}; 