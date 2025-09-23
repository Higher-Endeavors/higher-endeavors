import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';
import { ActivityData, ActivityDetails, ManuallyUpdatedActivity } from 'api/garmin-connect/activity/types';

// Interface for querying activity data
export interface ActivityDataQuery {
  userId: number;
  dataType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  activityType?: string;
}

// Interface for activity data result
export interface ActivityDataResult {
  id: number;
  userId: number;
  dataType: string;
  summaryId: string;
  data: ActivityData;
  createdAt: Date;
  updatedAt: Date;
}

// Unified table name
const ACTIVITIES_TABLE = 'garmin_activities';

// Get activity data for a user from unified table
export async function getActivityData(query: ActivityDataQuery): Promise<ActivityDataResult[]> {
  try {
    let sql = `
      SELECT id, user_id, summary_id, manual, created_at, updated_at
      FROM ${ACTIVITIES_TABLE}
      WHERE user_id = $1
    `;
    const params: any[] = [query.userId];
    let paramIndex = 2;

    // Add manual filter if dataType is specified
    if (query.dataType === 'activityDetails') {
      sql += ` AND manual = false`;
    } else if (query.dataType === 'manuallyUpdatedActivities') {
      sql += ` AND manual = true`;
    }

    // Add activity type filter if specified
    if (query.activityType) {
      sql += ` AND activity_type = $${paramIndex}`;
      params.push(query.activityType);
      paramIndex++;
    }

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
      dataType: row.manual ? 'manuallyUpdatedActivities' : 'activityDetails',
      summaryId: row.summary_id,
      data: {} as ActivityData, // Will be populated by getActivityDataById
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

  } catch (error) {
    await serverLogger.error('Error retrieving activity data', error, query);
    throw error;
  }
}

// Get specific activity data record by ID
export async function getActivityDataById(dataType: string, id: number): Promise<ActivityDataResult | null> {
  try {
    const sql = `SELECT * FROM ${ACTIVITIES_TABLE} WHERE id = $1`;
    
    const result = await SingleQuery(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const actualDataType = row.manual ? 'manuallyUpdatedActivities' : 'activityDetails';
    
    return {
      id: row.id,
      userId: row.user_id,
      dataType: actualDataType,
      summaryId: row.summary_id,
      data: convertRowToActivityData(actualDataType, row),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

  } catch (error) {
    await serverLogger.error('Error retrieving activity data by ID', error, { dataType, id });
    throw error;
  }
}

// Convert database row to ActivityData object
function convertRowToActivityData(dataType: string, row: any): ActivityData {
  return {
    userId: row.user_id.toString(),
    summaryId: row.summary_id,
    activityId: row.activity_id,
    startTimeInSeconds: row.start_time_in_seconds,
    startTimeOffsetInSeconds: row.start_time_offset_in_seconds,
    activityName: row.activity_name,
    activityType: row.activity_type,
    durationInSeconds: row.duration_in_seconds,
    averageBikeCadenceInRoundsPerMinute: row.average_bike_cadence_in_rounds_per_minute,
    averageHeartRateInBeatsPerMinute: row.average_heart_rate_in_beats_per_minute,
    averageRunCadenceInStepsPerMinute: row.average_run_cadence_in_steps_per_minute,
    averagePushCadenceInPushesPerMinute: row.average_push_cadence_in_pushes_per_minute,
    averageSpeedInMetersPerSecond: row.average_speed_in_meters_per_second,
    averageSwimCadenceInStrokesPerMinute: row.average_swim_cadence_in_strokes_per_minute,
    averagePaceInMinutesPerKilometer: row.average_pace_in_minutes_per_kilometer,
    activeKilocalories: row.active_kilocalories,
    deviceName: row.device_name,
    distanceInMeters: row.distance_in_meters,
    maxBikeCadenceInRoundsPerMinute: row.max_bike_cadence_in_rounds_per_minute,
    maxHeartRateInBeatsPerMinute: row.max_heart_rate_in_beats_per_minute,
    maxPaceInMinutesPerKilometer: row.max_pace_in_minutes_per_kilometer,
    maxRunCadenceInStepsPerMinute: row.max_run_cadence_in_steps_per_minute,
    maxPushCadenceInPushesPerMinute: row.max_push_cadence_in_pushes_per_minute,
    maxSpeedInMetersPerSecond: row.max_speed_in_meters_per_second,
    numberOfActiveLengths: row.number_of_active_lengths,
    startingLatitudeInDegree: row.starting_latitude_in_degree,
    startingLongitudeInDegree: row.starting_longitude_in_degree,
    steps: row.steps,
    pushes: row.pushes,
    totalElevationGainInMeters: row.total_elevation_gain_in_meters,
    totalElevationLossInMeters: row.total_elevation_loss_in_meters,
    isParent: row.is_parent,
    parentSummaryId: row.parent_summary_id,
    manual: row.manual,
    samples: row.samples || [],
    laps: row.laps || []
  };
}

// Get latest activity data for each data type for a user
export async function getLatestActivityDataByType(userId: number): Promise<Record<string, ActivityDataResult | null>> {
  try {
    const latestData: Record<string, ActivityDataResult | null> = {
      activityDetails: null,
      manuallyUpdatedActivities: null
    };

    // Get latest activity details (manual = false)
    try {
      const activityDetailsSql = `
        SELECT id, user_id, summary_id, manual, created_at, updated_at
        FROM ${ACTIVITIES_TABLE}
        WHERE user_id = $1 AND manual = false
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const activityDetailsResult = await SingleQuery(activityDetailsSql, [userId]);
      
      if (activityDetailsResult.rows.length > 0) {
        const row = activityDetailsResult.rows[0];
        const fullData = await getActivityDataById('activityDetails', row.id);
        latestData.activityDetails = fullData;
      }
    } catch (error) {
      await serverLogger.warn('Error retrieving latest activity details', { error, userId });
    }

    // Get latest manually updated activities (manual = true)
    try {
      const manualActivitiesSql = `
        SELECT id, user_id, summary_id, manual, created_at, updated_at
        FROM ${ACTIVITIES_TABLE}
        WHERE user_id = $1 AND manual = true
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const manualActivitiesResult = await SingleQuery(manualActivitiesSql, [userId]);
      
      if (manualActivitiesResult.rows.length > 0) {
        const row = manualActivitiesResult.rows[0];
        const fullData = await getActivityDataById('manuallyUpdatedActivities', row.id);
        latestData.manuallyUpdatedActivities = fullData;
      }
    } catch (error) {
      await serverLogger.warn('Error retrieving latest manually updated activities', { error, userId });
    }

    return latestData;

  } catch (error) {
    await serverLogger.error('Error retrieving latest activity data by type', error, { userId });
    throw error;
  }
}

// Get activity data summary statistics for a user
export async function getActivityDataSummary(userId: number, days: number = 30): Promise<Record<string, any>> {
  try {
    const summary: Record<string, any> = {};
    
    // Get summary for activity details (manual = false)
    try {
      const activityDetailsSql = `
        SELECT 
          COUNT(*) as count,
          MIN(created_at) as earliest,
          MAX(created_at) as latest,
          COUNT(DISTINCT activity_type) as unique_activity_types,
          SUM(duration_in_seconds) as total_duration_seconds,
          SUM(active_kilocalories) as total_calories,
          SUM(distance_in_meters) as total_distance_meters
        FROM ${ACTIVITIES_TABLE}
        WHERE user_id = $1 
          AND manual = false
          AND created_at >= NOW() - INTERVAL '${days} days'
      `;

      const activityDetailsResult = await SingleQuery(activityDetailsSql, [userId]);
      
      if (activityDetailsResult.rows.length > 0) {
        const row = activityDetailsResult.rows[0];
        summary.activityDetails = {
          count: parseInt(row.count),
          earliest: row.earliest,
          latest: row.latest,
          uniqueActivityTypes: parseInt(row.unique_activity_types),
          totalDurationSeconds: parseInt(row.total_duration_seconds) || 0,
          totalCalories: parseInt(row.total_calories) || 0,
          totalDistanceMeters: parseFloat(row.total_distance_meters) || 0
        };
      } else {
        summary.activityDetails = {
          count: 0,
          earliest: null,
          latest: null,
          uniqueActivityTypes: 0,
          totalDurationSeconds: 0,
          totalCalories: 0,
          totalDistanceMeters: 0
        };
      }
    } catch (error) {
      await serverLogger.warn('Error retrieving activity details summary', { error, userId, days });
      summary.activityDetails = {
        count: 0,
        earliest: null,
        latest: null,
        uniqueActivityTypes: 0,
        totalDurationSeconds: 0,
        totalCalories: 0,
        totalDistanceMeters: 0,
        error: 'Failed to retrieve'
      };
    }

    // Get summary for manually updated activities (manual = true)
    try {
      const manualActivitiesSql = `
        SELECT 
          COUNT(*) as count,
          MIN(created_at) as earliest,
          MAX(created_at) as latest,
          COUNT(DISTINCT activity_type) as unique_activity_types,
          SUM(duration_in_seconds) as total_duration_seconds,
          SUM(active_kilocalories) as total_calories,
          SUM(distance_in_meters) as total_distance_meters
        FROM ${ACTIVITIES_TABLE}
        WHERE user_id = $1 
          AND manual = true
          AND created_at >= NOW() - INTERVAL '${days} days'
      `;

      const manualActivitiesResult = await SingleQuery(manualActivitiesSql, [userId]);
      
      if (manualActivitiesResult.rows.length > 0) {
        const row = manualActivitiesResult.rows[0];
        summary.manuallyUpdatedActivities = {
          count: parseInt(row.count),
          earliest: row.earliest,
          latest: row.latest,
          uniqueActivityTypes: parseInt(row.unique_activity_types),
          totalDurationSeconds: parseInt(row.total_duration_seconds) || 0,
          totalCalories: parseInt(row.total_calories) || 0,
          totalDistanceMeters: parseFloat(row.total_distance_meters) || 0
        };
      } else {
        summary.manuallyUpdatedActivities = {
          count: 0,
          earliest: null,
          latest: null,
          uniqueActivityTypes: 0,
          totalDurationSeconds: 0,
          totalCalories: 0,
          totalDistanceMeters: 0
        };
      }
    } catch (error) {
      await serverLogger.warn('Error retrieving manually updated activities summary', { error, userId, days });
      summary.manuallyUpdatedActivities = {
        count: 0,
        earliest: null,
        latest: null,
        uniqueActivityTypes: 0,
        totalDurationSeconds: 0,
        totalCalories: 0,
        totalDistanceMeters: 0,
        error: 'Failed to retrieve'
      };
    }

    return summary;

  } catch (error) {
    await serverLogger.error('Error retrieving activity data summary', error, { userId, days });
    throw error;
  }
}

// Delete old activity data (for cleanup)
export async function deleteOldActivityData(userId: number, olderThanDays: number = 365): Promise<number> {
  try {
    const sql = `
      DELETE FROM ${ACTIVITIES_TABLE}
      WHERE user_id = $1 
        AND created_at < NOW() - INTERVAL '${olderThanDays} days'
    `;

    const result = await SingleQuery(sql, [userId]);
    const totalDeleted = result.rowCount || 0;
    
    await serverLogger.info('Deleted old activity data', {
      userId,
      olderThanDays,
      totalDeletedCount: totalDeleted
    });

    return totalDeleted;

  } catch (error) {
    await serverLogger.error('Error deleting old activity data', error, { userId, olderThanDays });
    throw error;
  }
}

// Get activity data for a specific date range and data type
export async function getActivityDataByDateRange(
  userId: number, 
  dataType: string, 
  startDate: Date, 
  endDate: Date
): Promise<ActivityDataResult[]> {
  try {
    let sql = `
      SELECT id, user_id, summary_id, manual, created_at, updated_at
      FROM ${ACTIVITIES_TABLE}
      WHERE user_id = $1 
        AND created_at >= $2
        AND created_at <= $3
    `;

    const params: any[] = [userId, startDate, endDate];

    // Add manual filter based on data type
    if (dataType === 'activityDetails') {
      sql += ` AND manual = false`;
    } else if (dataType === 'manuallyUpdatedActivities') {
      sql += ` AND manual = true`;
    }

    sql += ` ORDER BY created_at ASC`;

    const result = await SingleQuery(sql, params);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      dataType: row.manual ? 'manuallyUpdatedActivities' : 'activityDetails',
      summaryId: row.summary_id,
      data: {} as ActivityData, // Will be populated by getActivityDataById if needed
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

  } catch (error) {
    await serverLogger.error('Error retrieving activity data by date range', error, {
      userId,
      dataType,
      startDate,
      endDate
    });
    throw error;
  }
}

// Get activity statistics by type
export async function getActivityStatsByType(userId: number, days: number = 30): Promise<Record<string, any>> {
  try {
    const stats: Record<string, any> = {};
    
    // Get stats for activity details (manual = false)
    try {
      const activityDetailsSql = `
        SELECT 
          activity_type,
          COUNT(*) as count,
          SUM(duration_in_seconds) as total_duration,
          SUM(active_kilocalories) as total_calories,
          SUM(distance_in_meters) as total_distance,
          AVG(average_heart_rate_in_beats_per_minute) as avg_heart_rate,
          AVG(average_speed_in_meters_per_second) as avg_speed
        FROM ${ACTIVITIES_TABLE}
        WHERE user_id = $1 
          AND manual = false
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY activity_type
        ORDER BY count DESC
      `;

      const activityDetailsResult = await SingleQuery(activityDetailsSql, [userId]);
      
      stats.activityDetails = activityDetailsResult.rows.map((row: any) => ({
        activityType: row.activity_type,
        count: parseInt(row.count),
        totalDurationSeconds: parseInt(row.total_duration) || 0,
        totalCalories: parseInt(row.total_calories) || 0,
        totalDistanceMeters: parseFloat(row.total_distance) || 0,
        averageHeartRate: parseFloat(row.avg_heart_rate) || null,
        averageSpeed: parseFloat(row.avg_speed) || null
      }));
    } catch (error) {
      await serverLogger.warn('Error retrieving activity details stats', { error, userId, days });
      stats.activityDetails = [];
    }

    // Get stats for manually updated activities (manual = true)
    try {
      const manualActivitiesSql = `
        SELECT 
          activity_type,
          COUNT(*) as count,
          SUM(duration_in_seconds) as total_duration,
          SUM(active_kilocalories) as total_calories,
          SUM(distance_in_meters) as total_distance,
          AVG(average_heart_rate_in_beats_per_minute) as avg_heart_rate,
          AVG(average_speed_in_meters_per_second) as avg_speed
        FROM ${ACTIVITIES_TABLE}
        WHERE user_id = $1 
          AND manual = true
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY activity_type
        ORDER BY count DESC
      `;

      const manualActivitiesResult = await SingleQuery(manualActivitiesSql, [userId]);
      
      stats.manuallyUpdatedActivities = manualActivitiesResult.rows.map((row: any) => ({
        activityType: row.activity_type,
        count: parseInt(row.count),
        totalDurationSeconds: parseInt(row.total_duration) || 0,
        totalCalories: parseInt(row.total_calories) || 0,
        totalDistanceMeters: parseFloat(row.total_distance) || 0,
        averageHeartRate: parseFloat(row.avg_heart_rate) || null,
        averageSpeed: parseFloat(row.avg_speed) || null
      }));
    } catch (error) {
      await serverLogger.warn('Error retrieving manually updated activities stats', { error, userId, days });
      stats.manuallyUpdatedActivities = [];
    }

    return stats;

  } catch (error) {
    await serverLogger.error('Error retrieving activity stats by type', error, { userId, days });
    throw error;
  }
}

// Get Garmin device information for a user
export async function getGarminDeviceInfo(userId: number): Promise<{
  deviceName: string | null;
  attribution: string;
}> {
  try {
    // Get the most recent activity to extract device name
    const sql = `
      SELECT device_name
      FROM ${ACTIVITIES_TABLE}
      WHERE user_id = $1 
        AND manual = false
        AND device_name IS NOT NULL
        AND device_name != ''
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await SingleQuery(sql, [userId]);
    
    if (result.rows.length > 0) {
      const deviceName = result.rows[0].device_name;
      
      if (deviceName) {
        // Remove "Garmin" prefix if it exists to avoid redundancy
        const cleanDeviceName = deviceName.startsWith('Garmin ') 
          ? deviceName.substring(7) 
          : deviceName;
        
        return {
          deviceName,
          attribution: `Garmin ${cleanDeviceName}`
        };
      }
    }
    
    return {
      deviceName: null,
      attribution: 'Garmin device-sourced data'
    };

  } catch (error) {
    await serverLogger.error('Error retrieving Garmin device info', error, { userId });
    
    return {
      deviceName: null,
      attribution: 'Garmin device-sourced data'
    };
  }
}
