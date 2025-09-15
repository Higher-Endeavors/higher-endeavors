import { NextRequest, NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { 
  HealthData, 
  getHealthDataType,
  isBloodPressureSummary,
  isBodyCompositionSummary,
  isHRVSummary,
  isPulseOxSummary,
  isRespirationSummary,
  isSkinTemperatureSummary,
  isSleepSummary,
  isStressDetailsSummary,
  isDailySummary,
  isEpochSummary,
  isHealthSnapshotSummary,
  isUserMetricsSummary,
  HealthWebhookPayloadSchema,
  BloodPressureSummarySchema,
  BodyCompositionSummarySchema,
  HRVSummarySchema,
  PulseOxSummarySchema,
  RespirationSummarySchema,
  SkinTemperatureSummarySchema,
  SleepSummarySchema,
  StressDetailsSummarySchema,
  DailySummarySchema,
  EpochSummarySchema,
  HealthSnapshotSummarySchema,
  UserMetricsSummarySchema
} from './types';

// Types for Garmin Health API webhook notifications
interface DeregistrationNotification {
  userId: string;
}

interface UserPermissionChangeNotification {
  userId: string;
  permissions: string[];
}

interface HealthWebhookPayload {
  // Deregistration notifications
  deregistrations?: DeregistrationNotification[];
  
  // User permission change notifications
  userPermissions?: UserPermissionChangeNotification[];
  
  // Health data notifications
  bloodPressures?: HealthData[];
  bodyComps?: HealthData[];
  hrv?: HealthData[];
  pulseox?: HealthData[];
  respiration?: HealthData[];
  skinTemp?: HealthData[];
  sleeps?: HealthData[];
  stressDetails?: HealthData[];
  dailies?: HealthData[];
  epochs?: HealthData[];
  healthSnapshot?: HealthData[];
  userMetrics?: HealthData[];
}

// Helper function to get the appropriate Zod schema for health data type
function getHealthDataSchema(dataType: string) {
  switch (dataType) {
    case 'bloodPressures':
      return BloodPressureSummarySchema;
    case 'bodyComps':
      return BodyCompositionSummarySchema;
    case 'hrv':
      return HRVSummarySchema;
    case 'pulseox':
      return PulseOxSummarySchema;
    case 'respiration':
      return RespirationSummarySchema;
    case 'skinTemp':
      return SkinTemperatureSummarySchema;
    case 'sleeps':
      return SleepSummarySchema;
    case 'stressDetails':
      return StressDetailsSummarySchema;
    case 'dailies':
      return DailySummarySchema;
    case 'epochs':
      return EpochSummarySchema;
    case 'healthSnapshot':
      return HealthSnapshotSummarySchema;
    case 'userMetrics':
      return UserMetricsSummarySchema;
    default:
      throw new Error(`Unknown health data type: ${dataType}`);
  }
}

// Helper function to get user ID from Garmin user ID
async function getUserIdFromGarminId(garminUserId: string): Promise<number | null> {
  try {
    const result = await SingleQuery(
      `SELECT u.id FROM users u
       JOIN user_settings us ON u.id = us.user_id
       WHERE us.garmin_connect_settings->>'userId' = $1`,
      [garminUserId]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    await serverLogger.error('Error looking up user by Garmin ID', error, { garminUserId });
    return null;
  }
}

// Helper function to validate health data
function validateHealthData(data: any): HealthData | null {
  // Try to determine the data type and validate accordingly
  const dataType = getHealthDataType(data);
  
  if (!dataType) {
    return null;
  }
  
  // Additional validation based on data type
  switch (dataType) {
    case 'bloodPressures':
      return isBloodPressureSummary(data) ? data : null;
    case 'bodyComps':
      return isBodyCompositionSummary(data) ? data : null;
    case 'hrv':
      return isHRVSummary(data) ? data : null;
    case 'pulseox':
      return isPulseOxSummary(data) ? data : null;
    case 'respiration':
      return isRespirationSummary(data) ? data : null;
    case 'skinTemp':
      return isSkinTemperatureSummary(data) ? data : null;
    case 'sleeps':
      return isSleepSummary(data) ? data : null;
    case 'stressDetails':
      return isStressDetailsSummary(data) ? data : null;
    case 'dailies':
      return isDailySummary(data) ? data : null;
    case 'epochs':
      return isEpochSummary(data) ? data : null;
    case 'healthSnapshot':
      return isHealthSnapshotSummary(data) ? data : null;
    case 'userMetrics':
      return isUserMetricsSummary(data) ? data : null;
    default:
      return null;
  }
}

// Helper function to store health data in specific tables
async function storeHealthData(
  userId: number, 
  dataType: string, 
  data: any
): Promise<void> {
  try {
    // Data is already validated by Zod, so we can proceed directly
    
    // Store data in the appropriate table based on data type
    switch (dataType) {
      case 'bloodPressures':
        await storeBloodPressureData(userId, data);
        break;
      case 'bodyComps':
        await storeBodyCompositionData(userId, data);
        break;
      case 'hrv':
        await storeHRVData(userId, data);
        break;
      case 'pulseox':
        await storePulseOxData(userId, data);
        break;
      case 'respiration':
        await storeRespirationData(userId, data);
        break;
      case 'skinTemp':
        await storeSkinTemperatureData(userId, data);
        break;
      case 'sleeps':
        await storeSleepData(userId, data);
        break;
      case 'stressDetails':
        await storeStressDetailsData(userId, data);
        break;
      case 'dailies':
        await storeDailyData(userId, data);
        break;
      case 'epochs':
        await storeEpochData(userId, data);
        break;
      case 'healthSnapshot':
        await storeHealthSnapshotData(userId, data);
        break;
      case 'userMetrics':
        await storeUserMetricsData(userId, data);
        break;
      default:
        await serverLogger.warn('Unknown data type', { dataType });
        return;
    }
    
    await serverLogger.info('Health data stored successfully', {
      userId,
      dataType,
      summaryId: data.summaryId
    });
  } catch (error) {
    await serverLogger.error('Error storing health data', error, {
      userId,
      dataType,
      summaryId: data.summaryId
    });
  }
}

// Individual storage functions for each data type
async function storeBloodPressureData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_blood_pressures (
      user_id, summary_id, measurement_time_in_seconds, measurement_time_offset_in_seconds,
      systolic, diastolic, pulse, source_type
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      measurement_time_in_seconds = $3,
      measurement_time_offset_in_seconds = $4,
      systolic = $5,
      diastolic = $6,
      pulse = $7,
      source_type = $8,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.measurementTimeInSeconds,
      data.measurementTimeOffsetInSeconds,
      data.systolic,
      data.diastolic,
      data.pulse,
      data.sourceType
    ]
  );
}

async function storeBodyCompositionData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_body_compositions (
      user_id, summary_id, measurement_time_in_seconds, measurement_time_offset_in_seconds,
      muscle_mass_in_grams, bone_mass_in_grams, body_water_in_percent, 
      body_fat_in_percent, body_mass_index, weight_in_grams
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      measurement_time_in_seconds = $3,
      measurement_time_offset_in_seconds = $4,
      muscle_mass_in_grams = $5,
      bone_mass_in_grams = $6,
      body_water_in_percent = $7,
      body_fat_in_percent = $8,
      body_mass_index = $9,
      weight_in_grams = $10,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.measurementTimeInSeconds,
      data.measurementTimeOffsetInSeconds,
      data.muscleMassInGrams || null,
      data.boneMassInGrams || null,
      data.bodyWaterInPercent || null,
      data.bodyFatInPercent || null,
      data.bodyMassIndex || null,
      data.weightInGrams || null
    ]
  );
}

async function storeHRVData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_hrv (
      user_id, summary_id, calendar_date, start_time_in_seconds, duration_in_seconds,
      start_time_offset_in_seconds, last_night_avg, last_night_5min_high, hrv_values
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      start_time_in_seconds = $4,
      duration_in_seconds = $5,
      start_time_offset_in_seconds = $6,
      last_night_avg = $7,
      last_night_5min_high = $8,
      hrv_values = $9,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.startTimeInSeconds,
      data.durationInSeconds,
      data.startTimeOffsetInSeconds,
      data.lastNightAvg,
      data.lastNight5MinHigh,
      JSON.stringify(data.hrvValues)
    ]
  );
}

async function storePulseOxData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_pulse_ox (
      user_id, summary_id, calendar_date, start_time_in_seconds, duration_in_seconds,
      start_time_offset_in_seconds, time_offset_spo2_values, on_demand
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      start_time_in_seconds = $4,
      duration_in_seconds = $5,
      start_time_offset_in_seconds = $6,
      time_offset_spo2_values = $7,
      on_demand = $8,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.startTimeInSeconds,
      data.durationInSeconds,
      data.startTimeOffsetInSeconds,
      JSON.stringify(data.timeOffsetSpo2Values),
      data.onDemand
    ]
  );
}

async function storeRespirationData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_respiration (
      user_id, summary_id, start_time_in_seconds, duration_in_seconds,
      start_time_offset_in_seconds, time_offset_epoch_to_breaths
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      start_time_in_seconds = $3,
      duration_in_seconds = $4,
      start_time_offset_in_seconds = $5,
      time_offset_epoch_to_breaths = $6,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.startTimeInSeconds,
      data.durationInSeconds,
      data.startTimeOffsetInSeconds,
      JSON.stringify(data.timeOffsetEpochToBreaths)
    ]
  );
}

async function storeSkinTemperatureData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_skin_temperature (
      user_id, summary_id, calendar_date, avg_deviation_celsius, duration_in_seconds,
      start_time_in_seconds, start_time_offset_in_seconds
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      avg_deviation_celsius = $4,
      duration_in_seconds = $5,
      start_time_in_seconds = $6,
      start_time_offset_in_seconds = $7,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.avgDeviationCelsius,
      data.durationInSeconds,
      data.startTimeInSeconds,
      data.startTimeOffsetInSeconds
    ]
  );
}

async function storeSleepData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_sleeps (
      user_id, summary_id, calendar_date, start_time_in_seconds, start_time_offset_in_seconds,
      duration_in_seconds, total_nap_duration_in_seconds, unmeasurable_sleep_in_seconds,
      deep_sleep_duration_in_seconds, light_sleep_duration_in_seconds, rem_sleep_in_seconds,
      awake_duration_in_seconds, sleep_levels_map, validation, time_offset_sleep_respiration,
      time_offset_sleep_spo2, overall_sleep_score, sleep_scores, naps
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      start_time_in_seconds = $4,
      start_time_offset_in_seconds = $5,
      duration_in_seconds = $6,
      total_nap_duration_in_seconds = $7,
      unmeasurable_sleep_in_seconds = $8,
      deep_sleep_duration_in_seconds = $9,
      light_sleep_duration_in_seconds = $10,
      rem_sleep_in_seconds = $11,
      awake_duration_in_seconds = $12,
      sleep_levels_map = $13,
      validation = $14,
      time_offset_sleep_respiration = $15,
      time_offset_sleep_spo2 = $16,
      overall_sleep_score = $17,
      sleep_scores = $18,
      naps = $19,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.startTimeInSeconds,
      data.startTimeOffsetInSeconds,
      data.durationInSeconds,
      data.totalNapDurationInSeconds || null,
      data.unmeasurableSleepInSeconds || null,
      data.deepSleepDurationInSeconds || null,
      data.lightSleepDurationInSeconds || null,
      data.remSleepInSeconds || null,
      data.awakeDurationInSeconds || null,
      JSON.stringify(data.sleepLevelsMap || {}),
      data.validation,
      JSON.stringify(data.timeOffsetSleepRespiration || {}),
      JSON.stringify(data.timeOffsetSleepSpo2 || {}),
      JSON.stringify(data.overallSleepScore || {}),
      JSON.stringify(data.sleepScores || {}),
      JSON.stringify(data.naps || [])
    ]
  );
}

async function storeStressDetailsData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_stress_details (
      user_id, summary_id, calendar_date, start_time_in_seconds, start_time_offset_in_seconds,
      duration_in_seconds, body_battery_charged_value, body_battery_drained_value,
      time_offset_stress_level_values, time_offset_body_battery_values,
      body_battery_dynamic_feedback_event, body_battery_activity_events
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      start_time_in_seconds = $4,
      start_time_offset_in_seconds = $5,
      duration_in_seconds = $6,
      body_battery_charged_value = $7,
      body_battery_drained_value = $8,
      time_offset_stress_level_values = $9,
      time_offset_body_battery_values = $10,
      body_battery_dynamic_feedback_event = $11,
      body_battery_activity_events = $12,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.startTimeInSeconds,
      data.startTimeOffsetInSeconds,
      data.durationInSeconds,
      data.bodyBatteryChargedValue || null,
      data.bodyBatteryDrainedValue || null,
      JSON.stringify(data.timeOffsetStressLevelValues),
      JSON.stringify(data.timeOffsetBodyBatteryValues || {}),
      JSON.stringify(data.bodyBatteryDynamicFeedbackEvent || {}),
      JSON.stringify(data.bodyBatteryActivityEvents || [])
    ]
  );
}

async function storeDailyData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_dailies (
      user_id, summary_id, calendar_date, start_time_in_seconds, start_time_offset_in_seconds,
      activity_type, duration_in_seconds, steps, pushes, distance_in_meters, push_distance_in_meters,
      active_time_in_seconds, active_kilocalories, bmr_kilocalories, moderate_intensity_duration_in_seconds,
      vigorous_intensity_duration_in_seconds, floors_climbed, min_heart_rate_in_beats_per_minute,
      average_heart_rate_in_beats_per_minute, max_heart_rate_in_beats_per_minute, resting_heart_rate_in_beats_per_minute,
      time_offset_heart_rate_samples, average_stress_level, max_stress_level, stress_duration_in_seconds,
      rest_stress_duration_in_seconds, activity_stress_duration_in_seconds, low_stress_duration_in_seconds,
      medium_stress_duration_in_seconds, high_stress_duration_in_seconds, stress_qualifier, steps_goal,
      pushes_goal, intensity_duration_goal_in_seconds, floors_climbed_goal
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      start_time_in_seconds = $4,
      start_time_offset_in_seconds = $5,
      activity_type = $6,
      duration_in_seconds = $7,
      steps = $8,
      pushes = $9,
      distance_in_meters = $10,
      push_distance_in_meters = $11,
      active_time_in_seconds = $12,
      active_kilocalories = $13,
      bmr_kilocalories = $14,
      moderate_intensity_duration_in_seconds = $15,
      vigorous_intensity_duration_in_seconds = $16,
      floors_climbed = $17,
      min_heart_rate_in_beats_per_minute = $18,
      average_heart_rate_in_beats_per_minute = $19,
      max_heart_rate_in_beats_per_minute = $20,
      resting_heart_rate_in_beats_per_minute = $21,
      time_offset_heart_rate_samples = $22,
      average_stress_level = $23,
      max_stress_level = $24,
      stress_duration_in_seconds = $25,
      rest_stress_duration_in_seconds = $26,
      activity_stress_duration_in_seconds = $27,
      low_stress_duration_in_seconds = $28,
      medium_stress_duration_in_seconds = $29,
      high_stress_duration_in_seconds = $30,
      stress_qualifier = $31,
      steps_goal = $32,
      pushes_goal = $33,
      intensity_duration_goal_in_seconds = $34,
      floors_climbed_goal = $35,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.startTimeInSeconds,
      data.startTimeOffsetInSeconds,
      data.activityType,
      data.durationInSeconds,
      data.steps || null,
      data.pushes || null,
      data.distanceInMeters || null,
      data.pushDistanceInMeters || null,
      data.activeTimeInSeconds || null,
      data.activeKilocalories || null,
      data.bmrKilocalories || null,
      data.moderateIntensityDurationInSeconds || null,
      data.vigorousIntensityDurationInSeconds || null,
      data.floorsClimbed || null,
      data.minHeartRateInBeatsPerMinute || null,
      data.averageHeartRateInBeatsPerMinute || null,
      data.maxHeartRateInBeatsPerMinute || null,
      data.restingHeartRateInBeatsPerMinute || null,
      JSON.stringify(data.timeOffsetHeartRateSamples || {}),
      data.averageStressLevel || null,
      data.maxStressLevel || null,
      data.stressDurationInSeconds || null,
      data.restStressDurationInSeconds || null,
      data.activityStressDurationInSeconds || null,
      data.lowStressDurationInSeconds || null,
      data.mediumStressDurationInSeconds || null,
      data.highStressDurationInSeconds || null,
      data.stressQualifier || null,
      data.stepsGoal || null,
      data.pushesGoal || null,
      data.intensityDurationGoalInSeconds || null,
      data.floorsClimbedGoal || null
    ]
  );
}

async function storeEpochData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_epochs (
      user_id, summary_id, start_time_in_seconds, start_time_offset_in_seconds, activity_type,
      duration_in_seconds, active_time_in_seconds, steps, pushes, distance_in_meters, push_distance_in_meters,
      active_kilocalories, met, intensity, mean_motion_intensity, max_motion_intensity
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      start_time_in_seconds = $3,
      start_time_offset_in_seconds = $4,
      activity_type = $5,
      duration_in_seconds = $6,
      active_time_in_seconds = $7,
      steps = $8,
      pushes = $9,
      distance_in_meters = $10,
      push_distance_in_meters = $11,
      active_kilocalories = $12,
      met = $13,
      intensity = $14,
      mean_motion_intensity = $15,
      max_motion_intensity = $16,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.startTimeInSeconds,
      data.startTimeOffsetInSeconds,
      data.activityType,
      data.durationInSeconds,
      data.activeTimeInSeconds || null,
      data.steps || null,
      data.pushes || null,
      data.distanceInMeters || null,
      data.pushDistanceInMeters || null,
      data.activeKilocalories || null,
      data.met || null,
      data.intensity || null,
      data.meanMotionIntensity || null,
      data.maxMotionIntensity || null
    ]
  );
}

async function storeHealthSnapshotData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_health_snapshots (
      user_id, summary_id, calendar_date, start_time_in_seconds, duration_in_seconds,
      start_time_offset_in_seconds, summaries
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      start_time_in_seconds = $4,
      duration_in_seconds = $5,
      start_time_offset_in_seconds = $6,
      summaries = $7,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.startTimeInSeconds,
      data.durationInSeconds,
      data.startTimeOffsetInSeconds,
      JSON.stringify(data.summaries)
    ]
  );
}

async function storeUserMetricsData(userId: number, data: any): Promise<void> {
  await SingleQuery(
    `INSERT INTO garmin_user_metrics (
      user_id, summary_id, calendar_date, vo2_max, vo2_max_cycling, enhanced, fitness_age
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, summary_id) 
    DO UPDATE SET 
      calendar_date = $3,
      vo2_max = $4,
      vo2_max_cycling = $5,
      enhanced = $6,
      fitness_age = $7,
      updated_at = NOW()`,
    [
      userId,
      data.summaryId,
      data.calendarDate,
      data.vo2Max || null,
      data.vo2MaxCycling || null,
      data.enhanced || null,
      data.fitnessAge || null
    ]
  );
}

// Helper function to handle deregistration
async function handleDeregistration(garminUserId: string): Promise<void> {
  try {
    const userId = await getUserIdFromGarminId(garminUserId);
    if (!userId) {
      await serverLogger.warn('User not found for deregistration', { garminUserId });
      return;
    }
    
    // Update user settings to mark Garmin as disconnected
    await SingleQuery(
      `UPDATE user_settings 
       SET garmin_connect_settings = jsonb_set(
         COALESCE(garmin_connect_settings, '{}'::jsonb),
         '{isConnected}', 'false'::jsonb
       )
       WHERE user_id = $1`,
      [userId]
    );
    
    // Optionally, you might want to delete all health data for this user
    // await SingleQuery('DELETE FROM garmin_health_data WHERE user_id = $1', [userId]);
    
    await serverLogger.info('User deregistered from Garmin', {
      userId,
      garminUserId
    });
  } catch (error) {
    await serverLogger.error('Error handling deregistration', error, { garminUserId });
  }
}

// Helper function to handle user permission changes
async function handleUserPermissionChange(
  garminUserId: string, 
  permissions: string[]
): Promise<void> {
  try {
    const userId = await getUserIdFromGarminId(garminUserId);
    if (!userId) {
      await serverLogger.warn('User not found for permission change', { garminUserId });
      return;
    }
    
    // Update user permissions in settings
    await SingleQuery(
      `UPDATE user_settings 
       SET garmin_connect_settings = jsonb_set(
         COALESCE(garmin_connect_settings, '{}'::jsonb),
         '{permissions}', $2::jsonb
       )
       WHERE user_id = $1`,
      [userId, JSON.stringify(permissions)]
    );
    
    await serverLogger.info('User permissions updated', {
      userId,
      garminUserId,
      permissions
    });
  } catch (error) {
    await serverLogger.error('Error handling user permission change', error, {
      garminUserId,
      permissions
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the webhook payload
    const rawPayload = await request.json();
    
    // Validate the entire payload using Zod
    const validationResult = HealthWebhookPayloadSchema.safeParse(rawPayload);
    
    if (!validationResult.success) {
      await serverLogger.error('Invalid Garmin Health webhook payload', {
        errors: validationResult.error.errors,
        payload: rawPayload
      });
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }
    
    const payload = validationResult.data;
    
    await serverLogger.info('Received Garmin Health webhook', {
      payloadKeys: Object.keys(payload),
      timestamp: new Date().toISOString()
    });
    
    // Handle deregistration notifications
    if (payload.deregistrations) {
      for (const deregistration of payload.deregistrations) {
        await handleDeregistration(deregistration.userId);
      }
    }
    
    // Handle user permission change notifications
    if (payload.userPermissions) {
      for (const permissionChange of payload.userPermissions) {
        await handleUserPermissionChange(
          permissionChange.userId, 
          permissionChange.permissions
        );
      }
    }
    
    // Handle health data notifications
    const healthDataTypes = [
      'bloodPressures',
      'bodyComps', 
      'hrv',
      'pulseox',
      'respiration',
      'skinTemp',
      'sleeps',
      'stressDetails',
      'dailies',
      'epochs',
      'healthSnapshot',
      'userMetrics'
    ] as const;
    
    for (const dataType of healthDataTypes) {
      const dataArray = payload[dataType] as HealthData[] | undefined;
      
      if (dataArray && Array.isArray(dataArray)) {
        for (const data of dataArray) {
          // Validate individual health data using appropriate schema
          const schema = getHealthDataSchema(dataType);
          const validationResult = schema.safeParse(data);
          
          if (!validationResult.success) {
            await serverLogger.warn('Invalid health data received', {
              dataType,
              errors: validationResult.error.errors,
              data: data
            });
            continue;
          }
          
          const validatedData = validationResult.data;
          
          const userId = await getUserIdFromGarminId(validatedData.userId);
          if (userId) {
            await storeHealthData(userId, dataType, validatedData);
          } else {
            await serverLogger.warn('User not found for health data', {
              garminUserId: validatedData.userId,
              dataType,
              summaryId: validatedData.summaryId
            });
          }
        }
      }
    }
    
    // Always return 200 OK to acknowledge receipt
    // This is critical for Garmin's retry logic
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    await serverLogger.error('Error processing Garmin Health webhook', error);
    
    // Still return 200 to prevent retries for malformed requests
    // Log the error for debugging
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 200 });
  }
}

// Handle GET requests for webhook verification (if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Garmin Health webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
