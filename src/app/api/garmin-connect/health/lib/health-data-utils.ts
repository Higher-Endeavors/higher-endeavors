import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';
import { HealthData, getHealthDataType } from 'api/garmin-connect/health/types';

// Interface for querying health data
export interface HealthDataQuery {
  userId: number;
  dataType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Interface for health data result
export interface HealthDataResult {
  id: number;
  userId: number;
  dataType: string;
  summaryId: string;
  data: HealthData;
  createdAt: Date;
  updatedAt: Date;
}

// Table mapping for data types
const TABLE_MAPPING = {
  bloodPressures: 'garmin_blood_pressures',
  bodyComps: 'garmin_body_compositions',
  hrv: 'garmin_hrv',
  pulseox: 'garmin_pulse_ox',
  respiration: 'garmin_respiration',
  skinTemp: 'garmin_skin_temperature',
  sleeps: 'garmin_sleeps',
  stressDetails: 'garmin_stress_details',
  dailies: 'garmin_dailies',
  epochs: 'garmin_epochs',
  healthSnapshot: 'garmin_health_snapshots',
  userMetrics: 'garmin_user_metrics'
} as const;

// Get health data for a user from specific table
export async function getHealthData(query: HealthDataQuery): Promise<HealthDataResult[]> {
  try {
    if (!query.dataType || !TABLE_MAPPING[query.dataType as keyof typeof TABLE_MAPPING]) {
      throw new Error('Invalid or missing data type');
    }

    const tableName = TABLE_MAPPING[query.dataType as keyof typeof TABLE_MAPPING];
    let sql = `
      SELECT id, user_id, summary_id, created_at, updated_at
      FROM ${tableName}
      WHERE user_id = $1
    `;
    const params: any[] = [query.userId];
    let paramIndex = 2;

    // Add date range filters if specified
    if (query.startDate) {
      sql += ` AND created_at >= $${paramIndex}`;
      params.push(query.startDate);
      paramIndex++;
    }

    if (query.endDate) {
      sql += ` AND created_at <= $${paramIndex}`;
      params.push(query.endDate);
      paramIndex++;
    }

    // Add ordering and pagination
    sql += ` ORDER BY created_at DESC`;
    
    if (query.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(query.limit);
      paramIndex++;
    }

    if (query.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(query.offset);
    }

    const result = await SingleQuery(sql, params);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      dataType: query.dataType!,
      summaryId: row.summary_id,
      data: {} as HealthData, // Will be populated by getHealthDataById
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

  } catch (error) {
    await serverLogger.error('Error retrieving health data', error, query);
    throw error;
  }
}

// Get specific health data record by ID
export async function getHealthDataById(dataType: string, id: number): Promise<HealthDataResult | null> {
  try {
    if (!TABLE_MAPPING[dataType as keyof typeof TABLE_MAPPING]) {
      throw new Error('Invalid data type');
    }

    const tableName = TABLE_MAPPING[dataType as keyof typeof TABLE_MAPPING];
    const sql = `SELECT * FROM ${tableName} WHERE id = $1`;
    
    const result = await SingleQuery(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      dataType,
      summaryId: row.summary_id,
      data: convertRowToHealthData(dataType, row),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

  } catch (error) {
    await serverLogger.error('Error retrieving health data by ID', error, { dataType, id });
    throw error;
  }
}

// Convert database row to HealthData object
function convertRowToHealthData(dataType: string, row: any): HealthData {
  switch (dataType) {
    case 'bloodPressures':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        measurementTimeInSeconds: row.measurement_time_in_seconds,
        measurementTimeOffsetInSeconds: row.measurement_time_offset_in_seconds,
        systolic: row.systolic,
        diastolic: row.diastolic,
        pulse: row.pulse,
        sourceType: row.source_type
      };
    case 'bodyComps':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        measurementTimeInSeconds: row.measurement_time_in_seconds,
        measurementTimeOffsetInSeconds: row.measurement_time_offset_in_seconds,
        muscleMassInGrams: row.muscle_mass_in_grams,
        boneMassInGrams: row.bone_mass_in_grams,
        bodyWaterInPercent: row.body_water_in_percent,
        bodyFatInPercent: row.body_fat_in_percent,
        bodyMassIndex: row.body_mass_index,
        weightInGrams: row.weight_in_grams
      };
    case 'hrv':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        startTimeInSeconds: row.start_time_in_seconds,
        durationInSeconds: row.duration_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        lastNightAvg: row.last_night_avg,
        lastNight5MinHigh: row.last_night_5min_high,
        hrvValues: row.hrv_values
      };
    case 'pulseox':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        startTimeInSeconds: row.start_time_in_seconds,
        durationInSeconds: row.duration_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        timeOffsetSpo2Values: row.time_offset_spo2_values,
        onDemand: row.on_demand
      };
    case 'respiration':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        startTimeInSeconds: row.start_time_in_seconds,
        durationInSeconds: row.duration_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        timeOffsetEpochToBreaths: row.time_offset_epoch_to_breaths
      };
    case 'skinTemp':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        avgDeviationCelsius: row.avg_deviation_celsius,
        durationInSeconds: row.duration_in_seconds,
        startTimeInSeconds: row.start_time_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds
      };
    case 'sleeps':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        startTimeInSeconds: row.start_time_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        durationInSeconds: row.duration_in_seconds,
        totalNapDurationInSeconds: row.total_nap_duration_in_seconds,
        unmeasurableSleepInSeconds: row.unmeasurable_sleep_in_seconds,
        deepSleepDurationInSeconds: row.deep_sleep_duration_in_seconds,
        lightSleepDurationInSeconds: row.light_sleep_duration_in_seconds,
        remSleepInSeconds: row.rem_sleep_in_seconds,
        awakeDurationInSeconds: row.awake_duration_in_seconds,
        sleepLevelsMap: row.sleep_levels_map,
        validation: row.validation,
        timeOffsetSleepRespiration: row.time_offset_sleep_respiration,
        timeOffsetSleepSpo2: row.time_offset_sleep_spo2,
        overallSleepScore: row.overall_sleep_score,
        sleepScores: row.sleep_scores,
        naps: row.naps
      };
    case 'stressDetails':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        startTimeInSeconds: row.start_time_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        durationInSeconds: row.duration_in_seconds,
        bodyBatteryChargedValue: row.body_battery_charged_value,
        bodyBatteryDrainedValue: row.body_battery_drained_value,
        timeOffsetStressLevelValues: row.time_offset_stress_level_values,
        timeOffsetBodyBatteryValues: row.time_offset_body_battery_values,
        bodyBatteryDynamicFeedbackEvent: row.body_battery_dynamic_feedback_event,
        bodyBatteryActivityEvents: row.body_battery_activity_events
      };
    case 'dailies':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        startTimeInSeconds: row.start_time_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        activityType: row.activity_type,
        durationInSeconds: row.duration_in_seconds,
        steps: row.steps,
        pushes: row.pushes,
        distanceInMeters: row.distance_in_meters,
        pushDistanceInMeters: row.push_distance_in_meters,
        activeTimeInSeconds: row.active_time_in_seconds,
        activeKilocalories: row.active_kilocalories,
        bmrKilocalories: row.bmr_kilocalories,
        moderateIntensityDurationInSeconds: row.moderate_intensity_duration_in_seconds,
        vigorousIntensityDurationInSeconds: row.vigorous_intensity_duration_in_seconds,
        floorsClimbed: row.floors_climbed,
        minHeartRateInBeatsPerMinute: row.min_heart_rate_in_beats_per_minute,
        averageHeartRateInBeatsPerMinute: row.average_heart_rate_in_beats_per_minute,
        maxHeartRateInBeatsPerMinute: row.max_heart_rate_in_beats_per_minute,
        restingHeartRateInBeatsPerMinute: row.resting_heart_rate_in_beats_per_minute,
        timeOffsetHeartRateSamples: row.time_offset_heart_rate_samples,
        averageStressLevel: row.average_stress_level,
        maxStressLevel: row.max_stress_level,
        stressDurationInSeconds: row.stress_duration_in_seconds,
        restStressDurationInSeconds: row.rest_stress_duration_in_seconds,
        activityStressDurationInSeconds: row.activity_stress_duration_in_seconds,
        lowStressDurationInSeconds: row.low_stress_duration_in_seconds,
        mediumStressDurationInSeconds: row.medium_stress_duration_in_seconds,
        highStressDurationInSeconds: row.high_stress_duration_in_seconds,
        stressQualifier: row.stress_qualifier,
        stepsGoal: row.steps_goal,
        pushesGoal: row.pushes_goal,
        intensityDurationGoalInSeconds: row.intensity_duration_goal_in_seconds,
        floorsClimbedGoal: row.floors_climbed_goal
      };
    case 'epochs':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        startTimeInSeconds: row.start_time_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        activityType: row.activity_type,
        durationInSeconds: row.duration_in_seconds,
        activeTimeInSeconds: row.active_time_in_seconds,
        steps: row.steps,
        pushes: row.pushes,
        distanceInMeters: row.distance_in_meters,
        pushDistanceInMeters: row.push_distance_in_meters,
        activeKilocalories: row.active_kilocalories,
        met: row.met,
        intensity: row.intensity,
        meanMotionIntensity: row.mean_motion_intensity,
        maxMotionIntensity: row.max_motion_intensity
      };
    case 'healthSnapshot':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        startTimeInSeconds: row.start_time_in_seconds,
        durationInSeconds: row.duration_in_seconds,
        startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
        summaries: row.summaries
      };
    case 'userMetrics':
      return {
        userId: row.user_id.toString(),
        summaryId: row.summary_id,
        calendarDate: row.calendar_date,
        vo2Max: row.vo2_max,
        vo2MaxCycling: row.vo2_max_cycling,
        enhanced: row.enhanced,
        fitnessAge: row.fitness_age
      };
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
}

// Get latest health data for each data type for a user
export async function getLatestHealthDataByType(userId: number): Promise<Record<string, HealthDataResult | null>> {
  try {
    const latestData: Record<string, HealthDataResult | null> = {};
    
    // Initialize all data types as null
    const dataTypes = Object.keys(TABLE_MAPPING);
    dataTypes.forEach(type => {
      latestData[type] = null;
    });

    // Get latest record from each table
    for (const [dataType, tableName] of Object.entries(TABLE_MAPPING)) {
      try {
        const sql = `
          SELECT id, user_id, summary_id, created_at, updated_at
          FROM ${tableName}
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `;

        const result = await SingleQuery(sql, [userId]);
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          const fullData = await getHealthDataById(dataType, row.id);
          latestData[dataType] = fullData;
        }
      } catch (error) {
        await serverLogger.warn(`Error retrieving latest ${dataType} data`, { error, userId });
        // Continue with other data types
      }
    }

    return latestData;

  } catch (error) {
    await serverLogger.error('Error retrieving latest health data by type', error, { userId });
    throw error;
  }
}

// Get health data summary statistics for a user
export async function getHealthDataSummary(userId: number, days: number = 30): Promise<Record<string, any>> {
  try {
    const summary: Record<string, any> = {};
    
    // Get summary for each table
    for (const [dataType, tableName] of Object.entries(TABLE_MAPPING)) {
      try {
        const sql = `
          SELECT 
            COUNT(*) as count,
            MIN(created_at) as earliest,
            MAX(created_at) as latest
          FROM ${tableName}
          WHERE user_id = $1 
            AND created_at >= NOW() - INTERVAL '${days} days'
        `;

        const result = await SingleQuery(sql, [userId]);
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          summary[dataType] = {
            count: parseInt(row.count),
            earliest: row.earliest,
            latest: row.latest
          };
        } else {
          summary[dataType] = {
            count: 0,
            earliest: null,
            latest: null
          };
        }
      } catch (error) {
        await serverLogger.warn(`Error retrieving ${dataType} summary`, { error, userId, days });
        summary[dataType] = {
          count: 0,
          earliest: null,
          latest: null,
          error: 'Failed to retrieve'
        };
      }
    }

    return summary;

  } catch (error) {
    await serverLogger.error('Error retrieving health data summary', error, { userId, days });
    throw error;
  }
}

// Delete old health data (for cleanup)
export async function deleteOldHealthData(userId: number, olderThanDays: number = 365): Promise<number> {
  try {
    let totalDeleted = 0;
    
    // Delete from each table
    for (const [dataType, tableName] of Object.entries(TABLE_MAPPING)) {
      try {
        const sql = `
          DELETE FROM ${tableName}
          WHERE user_id = $1 
            AND created_at < NOW() - INTERVAL '${olderThanDays} days'
        `;

        const result = await SingleQuery(sql, [userId]);
        totalDeleted += result.rowCount || 0;
        
        await serverLogger.info(`Deleted old ${dataType} data`, {
          userId,
          olderThanDays,
          deletedCount: result.rowCount || 0
        });
      } catch (error) {
        await serverLogger.warn(`Error deleting old ${dataType} data`, { error, userId, olderThanDays });
        // Continue with other tables
      }
    }
    
    await serverLogger.info('Deleted old health data', {
      userId,
      olderThanDays,
      totalDeletedCount: totalDeleted
    });

    return totalDeleted;

  } catch (error) {
    await serverLogger.error('Error deleting old health data', error, { userId, olderThanDays });
    throw error;
  }
}

// Get health data for a specific date range and data type
export async function getHealthDataByDateRange(
  userId: number, 
  dataType: string, 
  startDate: Date, 
  endDate: Date
): Promise<HealthDataResult[]> {
  try {
    if (!TABLE_MAPPING[dataType as keyof typeof TABLE_MAPPING]) {
      throw new Error('Invalid data type');
    }

    const tableName = TABLE_MAPPING[dataType as keyof typeof TABLE_MAPPING];
    const sql = `
      SELECT id, user_id, summary_id, created_at, updated_at
      FROM ${tableName}
      WHERE user_id = $1 
        AND created_at >= $2
        AND created_at <= $3
      ORDER BY created_at ASC
    `;

    const result = await SingleQuery(sql, [userId, startDate, endDate]);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      dataType,
      summaryId: row.summary_id,
      data: {} as HealthData, // Will be populated by getHealthDataById if needed
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

  } catch (error) {
    await serverLogger.error('Error retrieving health data by date range', error, {
      userId,
      dataType,
      startDate,
      endDate
    });
    throw error;
  }
}
