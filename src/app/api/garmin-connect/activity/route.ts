import { NextRequest, NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import {
  ActivityData,
  ActivityDetails,
  ManuallyUpdatedActivity,
  ActivityWebhookPayload,
  getActivityDataType,
  isActivityDetails,
  isManuallyUpdatedActivity,
  convertToUnifiedActivityData,
  ActivityWebhookPayloadSchema,
  ActivityDetailsSchema,
  ManuallyUpdatedActivitySchema
} from './types';

// Helper function to get user ID from Garmin user ID
async function getUserIdFromGarminId(garminUserId: string): Promise<number | null> {
  try {
    const result = await SingleQuery(
      `SELECT user_id FROM user_settings 
       WHERE garmin_connect_settings->>'userId' = $1 
       AND garmin_connect_settings->>'isConnected' = 'true'`,
      [garminUserId]
    );
    
    return result.rows[0]?.user_id || null;
  } catch (error) {
    await serverLogger.error('Error looking up user ID from Garmin ID', error, { garminUserId });
    return null;
  }
}

// Helper function to validate activity data using Zod
function validateActivityData(data: ActivityDetails | ManuallyUpdatedActivity): ActivityDetails | ManuallyUpdatedActivity | null {
  try {
    const dataType = getActivityDataType(data);
    
    switch (dataType) {
      case 'activityDetails':
        return ActivityDetailsSchema.parse(data);
      case 'manuallyUpdatedActivities':
        return ManuallyUpdatedActivitySchema.parse(data);
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}

// Helper function to store unified activity data
async function storeActivityData(userId: number, data: ActivityData): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_activities (
      user_id, summary_id, activity_id, start_time_in_seconds, start_time_offset_in_seconds,
      activity_name, activity_type, duration_in_seconds, average_bike_cadence_in_rounds_per_minute,
      average_heart_rate_in_beats_per_minute, average_run_cadence_in_steps_per_minute,
      average_push_cadence_in_pushes_per_minute, average_speed_in_meters_per_second,
      average_swim_cadence_in_strokes_per_minute, average_pace_in_minutes_per_kilometer,
      active_kilocalories, device_name, distance_in_meters, max_bike_cadence_in_rounds_per_minute,
      max_heart_rate_in_beats_per_minute, max_pace_in_minutes_per_kilometer,
      max_run_cadence_in_steps_per_minute, max_push_cadence_in_pushes_per_minute,
      max_speed_in_meters_per_second, number_of_active_lengths, starting_latitude_in_degree,
      starting_longitude_in_degree, steps, pushes, total_elevation_gain_in_meters,
      total_elevation_loss_in_meters, is_parent, parent_summary_id, manual, samples, laps
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      activity_id = $3,
      start_time_in_seconds = $4,
      start_time_offset_in_seconds = $5,
      activity_name = $6,
      activity_type = $7,
      duration_in_seconds = $8,
      average_bike_cadence_in_rounds_per_minute = $9,
      average_heart_rate_in_beats_per_minute = $10,
      average_run_cadence_in_steps_per_minute = $11,
      average_push_cadence_in_pushes_per_minute = $12,
      average_speed_in_meters_per_second = $13,
      average_swim_cadence_in_strokes_per_minute = $14,
      average_pace_in_minutes_per_kilometer = $15,
      active_kilocalories = $16,
      device_name = $17,
      distance_in_meters = $18,
      max_bike_cadence_in_rounds_per_minute = $19,
      max_heart_rate_in_beats_per_minute = $20,
      max_pace_in_minutes_per_kilometer = $21,
      max_run_cadence_in_steps_per_minute = $22,
      max_push_cadence_in_pushes_per_minute = $23,
      max_speed_in_meters_per_second = $24,
      number_of_active_lengths = $25,
      starting_latitude_in_degree = $26,
      starting_longitude_in_degree = $27,
      steps = $28,
      pushes = $29,
      total_elevation_gain_in_meters = $30,
      total_elevation_loss_in_meters = $31,
      is_parent = $32,
      parent_summary_id = $33,
      manual = $34,
      samples = $35,
      laps = $36,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.activityId || null,
      data.startTimeInSeconds,
      data.startTimeOffsetInSeconds,
      data.activityName || null,
      data.activityType,
      data.durationInSeconds,
      data.averageBikeCadenceInRoundsPerMinute || null,
      data.averageHeartRateInBeatsPerMinute || null,
      data.averageRunCadenceInStepsPerMinute || null,
      data.averagePushCadenceInPushesPerMinute || null,
      data.averageSpeedInMetersPerSecond || null,
      data.averageSwimCadenceInStrokesPerMinute || null,
      data.averagePaceInMinutesPerKilometer || null,
      data.activeKilocalories || null,
      data.deviceName || null,
      data.distanceInMeters || null,
      data.maxBikeCadenceInRoundsPerMinute || null,
      data.maxHeartRateInBeatsPerMinute || null,
      data.maxPaceInMinutesPerKilometer || null,
      data.maxRunCadenceInStepsPerMinute || null,
      data.maxPushCadenceInPushesPerMinute || null,
      data.maxSpeedInMetersPerSecond || null,
      data.numberOfActiveLengths || null,
      data.startingLatitudeInDegree || null,
      data.startingLongitudeInDegree || null,
      data.steps || null,
      data.pushes || null,
      data.totalElevationGainInMeters || null,
      data.totalElevationLossInMeters || null,
      data.isParent || false,
      data.parentSummaryId || null,
      data.manual,
      JSON.stringify(data.samples || []),
      JSON.stringify(data.laps || [])
    ]
  );
}

// Helper function to store activity data (unified)
async function storeUnifiedActivityData(
  userId: number, 
  data: ActivityDetails | ManuallyUpdatedActivity
): Promise<void> {
  try {
    // Validate the data before storing
    const validatedData = validateActivityData(data);
    if (!validatedData) {
      const dataType = getActivityDataType(data);
      const schema = dataType === 'activityDetails' ? ActivityDetailsSchema : ManuallyUpdatedActivitySchema;
      const validationResult = schema.safeParse(data);
      
      await serverLogger.warn('Invalid activity data received', {
        userId,
        summaryId: data.summaryId,
        dataType,
        errors: validationResult.success ? [] : validationResult.error.errors,
        data: data
      });
      return;
    }
    
    // Convert to unified format and store
    const unifiedData = convertToUnifiedActivityData(validatedData);
    await storeActivityData(userId, unifiedData);
    
    await serverLogger.info('Activity data stored successfully', {
      userId,
      summaryId: unifiedData.summaryId,
      manual: unifiedData.manual
    });
  } catch (error) {
    await serverLogger.error('Error storing activity data', error, {
      userId,
      summaryId: data.summaryId
    });
  }
}

// Helper function to handle deregistration
async function handleDeregistration(garminUserId: string): Promise<void> {
  try {
    const userId = await getUserIdFromGarminId(garminUserId);
    
    if (userId) {
      // Update user settings to mark as disconnected
      await SingleQuery(
        `UPDATE user_settings 
         SET garmin_connect_settings = jsonb_set(
           jsonb_set(garmin_connect_settings, '{isConnected}', 'false'),
           '{accessToken}', 'null'
         )
         WHERE user_id = $1`,
        [userId]
      );
      
      await serverLogger.info('User deregistered from Garmin Connect', {
        userId,
        garminUserId
      });
    } else {
      await serverLogger.warn('User not found for deregistration', { garminUserId });
    }
  } catch (error) {
    await serverLogger.error('Error handling deregistration', error, { garminUserId });
  }
}

// Helper function to handle user permission changes
async function handleUserPermissionChange(garminUserId: string, permissions: string[]): Promise<void> {
  try {
    const userId = await getUserIdFromGarminId(garminUserId);
    
    if (userId) {
      // Update user settings with new permissions
      await SingleQuery(
        `UPDATE user_settings 
         SET garmin_connect_settings = jsonb_set(
           garmin_connect_settings, 
           '{permissions}', 
           $2::jsonb
         )
         WHERE user_id = $1`,
        [userId, JSON.stringify(permissions)]
      );
      
      await serverLogger.info('User permissions updated', {
        userId,
        garminUserId,
        permissions
      });
    } else {
      await serverLogger.warn('User not found for permission update', { garminUserId });
    }
  } catch (error) {
    await serverLogger.error('Error handling user permission change', error, { garminUserId, permissions });
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.json();
    
    // Validate the entire payload using Zod
    const validationResult = ActivityWebhookPayloadSchema.safeParse(rawPayload);
    
    if (!validationResult.success) {
      console.log('Invalid Garmin Activity webhook payload', validationResult.error.errors);
      console.log('Raw payload', rawPayload);
      await serverLogger.error('Invalid Garmin Activity webhook payload', {
        errors: validationResult.error.errors,
        payload: rawPayload
      });
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }
    
    const payload = validationResult.data;
    
    await serverLogger.info('Received Garmin Activity webhook', {
      activityDetailsCount: payload.activityDetails?.length || 0,
      manuallyUpdatedActivitiesCount: payload.manuallyUpdatedActivities?.length || 0,
      deregistrationsCount: payload.deregistrations?.length || 0,
      userPermissionsCount: payload.userPermissions?.length || 0
    });

    // Handle deregistrations
    if (payload.deregistrations && Array.isArray(payload.deregistrations)) {
      for (const deregistration of payload.deregistrations) {
        if (deregistration.userId) {
          await handleDeregistration(deregistration.userId);
        }
      }
    }

    // Handle user permission changes
    if (payload.userPermissions && Array.isArray(payload.userPermissions)) {
      for (const permissionChange of payload.userPermissions) {
        if (permissionChange.userId && permissionChange.permissions) {
          await handleUserPermissionChange(permissionChange.userId, permissionChange.permissions);
        }
      }
    }

    // Handle activity details
    if (payload.activityDetails && Array.isArray(payload.activityDetails)) {
      for (const activityDetail of payload.activityDetails) {
        if (!activityDetail.userId || !activityDetail.summaryId) {
          await serverLogger.warn('Activity detail missing userId or summaryId', {
            userId: activityDetail.userId,
            summaryId: activityDetail.summaryId
          });
          continue;
        }

        const userId = await getUserIdFromGarminId(activityDetail.userId);
        if (userId) {
          await storeUnifiedActivityData(userId, activityDetail);
        } else {
          await serverLogger.warn('User not found for activity detail', {
            garminUserId: activityDetail.userId,
            summaryId: activityDetail.summaryId
          });
        }
      }
    }

    // Handle manually updated activities
    if (payload.manuallyUpdatedActivities && Array.isArray(payload.manuallyUpdatedActivities)) {
      for (const manualActivity of payload.manuallyUpdatedActivities) {
        if (!manualActivity.userId || !manualActivity.summaryId) {
          await serverLogger.warn('Manual activity missing userId or summaryId', {
            userId: manualActivity.userId,
            summaryId: manualActivity.summaryId
          });
          continue;
        }

        const userId = await getUserIdFromGarminId(manualActivity.userId);
        if (userId) {
          await storeUnifiedActivityData(userId, manualActivity);
        } else {
          await serverLogger.warn('User not found for manual activity', {
            garminUserId: manualActivity.userId,
            summaryId: manualActivity.summaryId
          });
        }
      }
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    await serverLogger.error('Error processing Garmin Activity webhook', error);
    // Always return 200 to prevent retries
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 200 });
  }
}
