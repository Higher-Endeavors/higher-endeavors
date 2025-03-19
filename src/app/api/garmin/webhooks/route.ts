import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';

// Types for webhook payloads
interface DeregistrationPayload {
  userId: string;
  userAccessToken: string;
}

interface PermissionChangePayload {
  userId: string;
  userAccessToken: string;
  permissions: string[];
  changeTimeInSeconds: number;
}

// Data notification types - Basic structures
interface GarminBaseData {
  userId: string;
  userAccessToken: string;
  summaryId: string;
}

// Health data types
interface DailySummaryData extends GarminBaseData {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  steps?: number;
  distanceInMeters?: number;
  activeKilocalories?: number;
  bmrKilocalories?: number;
  // Other daily summary fields
}

interface SleepData extends GarminBaseData {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds: number;
  unmeasurableSleepInSeconds?: number;
  deepSleepDurationInSeconds?: number;
  lightSleepDurationInSeconds?: number;
  remSleepInSeconds?: number;
  awakeDurationInSeconds?: number;
  // Other sleep fields
}

interface ActivityData extends GarminBaseData {
  activityType: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds?: number;
  distanceInMeters?: number;
  activeKilocalories?: number;
  // Other activity fields
}

interface BodyCompData extends GarminBaseData {
  measurementTimeInSeconds: number;
  measurementTimeOffsetInSeconds: number;
  weightInGrams?: number;
  bodyFatInPercent?: number;
  bodyMassIndex?: number;
  // Other body comp fields
}

interface EpochData extends GarminBaseData {
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityType: string;
  durationInSeconds: number;
  activeTimeInSeconds: number;
  steps?: number;
  distanceInMeters?: number;
  activeKilocalories?: number;
  met?: number;
  intensity?: string;
  // Other epoch fields
}

interface StressData extends GarminBaseData {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds: number;
  averageStressLevel?: number;
  maxStressLevel?: number;
  // Other stress fields
}

// Add a new interface for MoveIQ events
interface MoveIQData extends GarminBaseData {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds: number;
  activityType: string;
  activitySubType?: string;
}

// Add a new interface for activity files
interface ActivityFileData extends GarminBaseData {
  fileType: string; // FIT, TCX, or GPX 
  activityId: string;
  activityType: string;
  startTimeInSeconds: number;
  activityName?: string;
  activityDescription?: string;
  manual: boolean;
  callbackURL: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Handle deregistrations
    if (body.deregistrations) {
      for (const deregistration of body.deregistrations as DeregistrationPayload[]) {
        await SingleQuery(
          'DELETE FROM user_garmin_tokens WHERE garmin_user_id = $1',
          [deregistration.userId]
        );
      }
    }

    // Handle permission changes
    if (body.userPermissionsChange) {
      for (const change of body.userPermissionsChange as PermissionChangePayload[]) {
        if (change.permissions.length === 0) {
          // If no permissions, remove the tokens
          await SingleQuery(
            'DELETE FROM user_garmin_tokens WHERE garmin_user_id = $1',
            [change.userId]
          );
        }
        // Could store permissions in a separate table if needed
      }
    }

    // Handle health data push notifications
    if (body.dailies) {
      await storeHealthData('dailies', body.dailies);
    }
    
    if (body.sleeps) {
      await storeHealthData('sleeps', body.sleeps);
    }

    if (body.bodyComps) {
      await storeHealthData('bodyComps', body.bodyComps);
    }

    if (body.epochs) {
      await storeHealthData('epochs', body.epochs);
    }

    if (body.stressDetails) {
      await storeHealthData('stressDetails', body.stressDetails);
    }

    if (body.userMetrics) {
      await storeHealthData('userMetrics', body.userMetrics);
    }

    if (body.pulseox) {
      await storeHealthData('pulseox', body.pulseox);
    }

    if (body.respiration || body.allDayRespiration) {
      await storeHealthData('respiration', body.respiration || body.allDayRespiration);
    }

    if (body.healthSnapshot) {
      await storeHealthData('healthSnapshot', body.healthSnapshot);
    }

    if (body.hrv) {
      await storeHealthData('hrv', body.hrv);
    }

    if (body.bloodPressures) {
      await storeHealthData('bloodPressures', body.bloodPressures);
    }

    if (body.skinTemp) {
      await storeHealthData('skinTemp', body.skinTemp);
    }

    // Handle activity data
    if (body.activities) {
      await storeActivityData(body.activities);
    }
    
    // Handle Move IQ events (automatically detected activities)
    if (body.moveIQ) {
      await storeMoveIQData(body.moveIQ);
    }
    
    // Handle activity files
    if (body.activityFiles) {
      await processActivityFiles(body.activityFiles);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function storeHealthData(type: string, data: any[]) {
  try {
    console.log(`Storing ${type} data:`, data.length, 'records');
    
    // Use a switch case to handle different data types
    switch (type) {
      case 'dailies':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          await SingleQuery(
            `INSERT INTO garmin_daily_summaries 
             (user_id, garmin_user_id, summary_id, calendar_date, start_time, 
              start_time_offset_seconds, steps, distance_meters, active_calories, 
              total_calories, floors_climbed, minutes_sedentary, minutes_lightly_active, 
              minutes_moderately_active, minutes_intensely_active)
             VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (summary_id) DO UPDATE
             SET steps = $7, distance_meters = $8, active_calories = $9, 
                 total_calories = $10, floors_climbed = $11, minutes_sedentary = $12, 
                 minutes_lightly_active = $13, minutes_moderately_active = $14, 
                 minutes_intensely_active = $15,
                 updated_at = NOW()`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.calendarDate,
              item.startTimeInSeconds,
              item.startTimeOffsetInSeconds,
              item.steps || null,
              item.distanceInMeters || null,
              item.activeKilocalories || null,
              item.bmrKilocalories || null,
              item.floorsClimbed || null,
              item.minutesSedentary || null,
              item.minutesLightlyActive || null,
              item.moderateIntensityDurationInSeconds ? Math.floor(item.moderateIntensityDurationInSeconds / 60) : null,
              item.vigorousIntensityDurationInSeconds ? Math.floor(item.vigorousIntensityDurationInSeconds / 60) : null
            ]
          );
        }
        break;

      case 'sleeps':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          await SingleQuery(
            `INSERT INTO garmin_sleep_data 
             (user_id, garmin_user_id, summary_id, calendar_date, start_time, 
              duration_seconds, validation_type, deep_sleep_seconds, light_sleep_seconds, 
              rem_sleep_seconds, awake_sleep_seconds, unmeasurable_sleep_seconds)
             VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (summary_id) DO UPDATE
             SET duration_seconds = $6, validation_type = $7, deep_sleep_seconds = $8,
                 light_sleep_seconds = $9, rem_sleep_seconds = $10, 
                 awake_sleep_seconds = $11, unmeasurable_sleep_seconds = $12,
                 updated_at = NOW()`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.calendarDate,
              item.startTimeInSeconds,
              item.durationInSeconds || null,
              item.validation || null,
              item.deepSleepDurationInSeconds || null,
              item.lightSleepDurationInSeconds || null,
              item.remSleepInSeconds || null,
              item.awakeDurationInSeconds || null,
              item.unmeasurableSleepInSeconds || null
            ]
          );
        }
        break;
        
      case 'bodyComps':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          await SingleQuery(
            `INSERT INTO garmin_body_composition 
             (user_id, garmin_user_id, summary_id, timestamp, weight_kg, 
              bmi, body_fat_percentage, bone_mass_kg, muscle_mass_kg, water_percentage)
             VALUES ($1, $2, $3, to_timestamp($4), $5, $6, $7, $8, $9, $10)
             ON CONFLICT (summary_id) DO UPDATE
             SET weight_kg = $5, bmi = $6, body_fat_percentage = $7, 
                 bone_mass_kg = $8, muscle_mass_kg = $9, water_percentage = $10,
                 updated_at = NOW()`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.measurementTimeInSeconds,
              item.weightInGrams ? item.weightInGrams / 1000 : null,
              item.bodyMassIndex || null,
              item.bodyFatInPercent || null,
              item.boneMassInGrams ? item.boneMassInGrams / 1000 : null,
              item.muscleMassInGrams ? item.muscleMassInGrams / 1000 : null,
              item.bodyWaterInPercent || null
            ]
          );
        }
        break;
        
      case 'epochs':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          await SingleQuery(
            `INSERT INTO garmin_epochs 
             (user_id, garmin_user_id, summary_id, start_time, start_time_offset_seconds, 
              activity_type, duration_seconds, active_time_seconds, steps, distance_meters, 
              active_calories, met, intensity)
             VALUES ($1, $2, $3, to_timestamp($4), $5, $6, $7, $8, $9, $10, $11, $12, $13)
             ON CONFLICT (summary_id) DO UPDATE
             SET activity_type = $6, duration_seconds = $7, active_time_seconds = $8, 
                 steps = $9, distance_meters = $10, active_calories = $11, 
                 met = $12, intensity = $13,
                 updated_at = NOW()`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.startTimeInSeconds,
              item.startTimeOffsetInSeconds,
              item.activityType || 'UNKNOWN',
              item.durationInSeconds || null,
              item.activeTimeInSeconds || null,
              item.steps || null,
              item.distanceInMeters || null,
              item.activeKilocalories || null,
              item.met || null,
              item.intensity || null
            ]
          );
        }
        break;
        
      case 'stressDetails':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          await SingleQuery(
            `INSERT INTO garmin_stress_details 
             (user_id, garmin_user_id, summary_id, calendar_date, start_time, 
              start_time_offset_seconds, duration_seconds, average_stress_level, 
              max_stress_level, stress_duration_seconds, rest_stress_duration_seconds, 
              activity_stress_duration_seconds, low_stress_duration_seconds, 
              medium_stress_duration_seconds, high_stress_duration_seconds, stress_qualifier)
             VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (summary_id) DO UPDATE
             SET average_stress_level = $8, max_stress_level = $9, 
                 stress_duration_seconds = $10, rest_stress_duration_seconds = $11, 
                 activity_stress_duration_seconds = $12, low_stress_duration_seconds = $13, 
                 medium_stress_duration_seconds = $14, high_stress_duration_seconds = $15,
                 stress_qualifier = $16,
                 updated_at = NOW()`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.calendarDate,
              item.startTimeInSeconds,
              item.startTimeOffsetInSeconds,
              item.durationInSeconds || null,
              item.averageStressLevel || null,
              item.maxStressLevel || null,
              item.stressDurationInSeconds || null,
              item.restStressDurationInSeconds || null,
              item.activityStressDurationInSeconds || null,
              item.lowStressDurationInSeconds || null,
              item.mediumStressDurationInSeconds || null,
              item.highStressDurationInSeconds || null,
              item.stressQualifier || null
            ]
          );
        }
        break;
        
      // Add cases for other types as needed
      case 'userMetrics':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          await SingleQuery(
            `INSERT INTO garmin_user_metrics 
             (user_id, garmin_user_id, summary_id, calendar_date, vo2_max, vo2_max_cycling,
              enhanced, fitness_age)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (summary_id) DO UPDATE
             SET vo2_max = $5, vo2_max_cycling = $6, enhanced = $7, fitness_age = $8,
                 updated_at = NOW()`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.calendarDate,
              item.vo2Max || null,
              item.vo2MaxCycling || null,
              item.enhanced || false,
              item.fitnessAge || null
            ]
          );
        }
        break;
        
      // More complex data types with nested readings would require multiple queries
      case 'pulseox':
        for (const item of data) {
          const userId = await getUserIdFromGarminId(item.userId);
          if (!userId) continue;
          
          // Insert the main record
          const result = await SingleQuery(
            `INSERT INTO garmin_pulse_ox 
             (user_id, garmin_user_id, summary_id, calendar_date, start_time, 
              start_time_offset_seconds, duration_seconds, on_demand)
             VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8)
             ON CONFLICT (summary_id) DO UPDATE
             SET duration_seconds = $7, on_demand = $8,
                 updated_at = NOW()
             RETURNING id`,
            [
              userId, 
              item.userId, 
              item.summaryId, 
              item.calendarDate,
              item.startTimeInSeconds,
              item.startTimeOffsetInSeconds,
              item.durationInSeconds || 0,
              item.onDemand || false
            ]
          );
          
          const pulseOxId = result.rows[0]?.id;
          if (pulseOxId && item.timeOffsetSpo2Values) {
            // First clear existing readings
            await SingleQuery(
              'DELETE FROM garmin_pulse_ox_readings WHERE pulse_ox_id = $1',
              [pulseOxId]
            );
            
            // Insert new readings
            for (const [offset, value] of Object.entries(item.timeOffsetSpo2Values)) {
              await SingleQuery(
                `INSERT INTO garmin_pulse_ox_readings
                 (pulse_ox_id, time_offset_seconds, spo2_value)
                 VALUES ($1, $2, $3)`,
                [pulseOxId, parseInt(offset), value]
              );
            }
          }
        }
        break;
      
      default:
        console.log(`Storage for ${type} not yet implemented`);
    }
  } catch (error) {
    console.error(`Error storing ${type} data:`, error);
  }
}

async function storeActivityData(activities: any[]) {
  try {
    console.log('Storing activity data:', activities.length, 'records');
    
    for (const activity of activities) {
      const userId = await getUserIdFromGarminId(activity.userId);
      if (!userId) continue;
      
      // Insert main activity record
      const result = await SingleQuery(
        `INSERT INTO garmin_activities
         (user_id, garmin_user_id, summary_id, activity_id, activity_type, 
          activity_name, start_time, duration_seconds, distance_meters,
          avg_speed_mps, max_speed_mps, avg_heart_rate, max_heart_rate, 
          calories, device_name, manual, is_parent, parent_summary_id,
          is_web_upload, average_bike_cadence, average_run_cadence,
          average_swim_cadence, average_pace_minutes_per_km, max_bike_cadence,
          max_run_cadence, max_pace_minutes_per_km, number_of_active_lengths,
          starting_latitude, starting_longitude, total_elevation_gain,
          total_elevation_loss, pushes, average_push_cadence, max_push_cadence,
          steps)
         VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), $8, $9, $10, $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, 
                $32, $33, $34, $35)
         ON CONFLICT (summary_id) DO UPDATE
         SET activity_type = $5, activity_name = $6, duration_seconds = $8, 
             distance_meters = $9, avg_speed_mps = $10, max_speed_mps = $11,
             avg_heart_rate = $12, max_heart_rate = $13, calories = $14,
             device_name = $15, manual = $16, is_parent = $17, parent_summary_id = $18,
             is_web_upload = $19, average_bike_cadence = $20, average_run_cadence = $21,
             average_swim_cadence = $22, average_pace_minutes_per_km = $23, 
             max_bike_cadence = $24, max_run_cadence = $25, max_pace_minutes_per_km = $26,
             number_of_active_lengths = $27, starting_latitude = $28, starting_longitude = $29,
             total_elevation_gain = $30, total_elevation_loss = $31, pushes = $32,
             average_push_cadence = $33, max_push_cadence = $34, steps = $35,
             updated_at = NOW()
         RETURNING id`,
        [
          userId, 
          activity.userId, 
          activity.summaryId, 
          activity.activityId || null,
          activity.activityType || 'UNKNOWN',
          activity.activityName || null,
          activity.startTimeInSeconds,
          activity.durationInSeconds || null,
          activity.distanceInMeters || null,
          activity.averageSpeedInMetersPerSecond || null,
          activity.maxSpeedInMetersPerSecond || null,
          activity.averageHeartRateInBeatsPerMinute || null,
          activity.maxHeartRateInBeatsPerMinute || null,
          activity.activeKilocalories || null,
          activity.deviceName || null,
          activity.manual || false,
          activity.isParent || false,
          activity.parentSummaryId || null,
          activity.isWebUpload || false,
          activity.averageBikeCadenceInRoundsPerMinute || null,
          activity.averageRunCadenceInStepsPerMinute || null,
          activity.averageSwimCadenceInStrokesPerMinute || null,
          activity.averagePaceInMinutesPerKilometer || null,
          activity.maxBikeCadenceInRoundsPerMinute || null,
          activity.maxRunCadenceInStepsPerMinute || null,
          activity.maxPaceInMinutesPerKilometer || null,
          activity.numberOfActiveLengths || null,
          activity.startingLatitudeInDegree || null,
          activity.startingLongitudeInDegree || null,
          activity.totalElevationGainInMeters || null,
          activity.totalElevationLossInMeters || null,
          activity.pushes || null,
          activity.averagePushCadenceInPushesPerMinute || null,
          activity.maxPushCadenceInPushesPerMinute || null,
          activity.steps || null
        ]
      );
      
      // If we have detail samples, store them as well
      const activityId = result.rows[0]?.id;
      if (activityId && activity.samples && activity.samples.length > 0) {
        // First create activity details record
        const detailsResult = await SingleQuery(
          `INSERT INTO garmin_activity_details
           (activity_id, user_id)
           VALUES ($1, $2)
           RETURNING id`,
          [activityId, userId]
        );
        
        const activityDetailsId = detailsResult.rows[0]?.id;
        if (activityDetailsId) {
          // Insert each sample
          for (const sample of activity.samples) {
            await SingleQuery(
              `INSERT INTO garmin_activity_samples
               (activity_details_id, start_time_seconds, latitude, longitude, 
                elevation_meters, heart_rate, speed_meters_per_second, steps_per_minute,
                total_distance_meters, timer_duration_seconds, clock_duration_seconds,
                moving_duration_seconds, power_watts, bike_cadence_rpm, wheelchair_cadence,
                swim_cadence, air_temperature_celsius)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
              [
                activityDetailsId,
                sample.startTimeInSeconds,
                sample.latitudeInDegree || null,
                sample.longitudeInDegree || null,
                sample.elevationInMeters || null,
                sample.heartRate || null,
                sample.speedMetersPerSecond || null,
                sample.stepsPerMinute || null,
                sample.totalDistanceInMeters || null,
                sample.timerDurationInSeconds || null,
                sample.clockDurationInSeconds || null,
                sample.movingDurationInSeconds || null,
                sample.powerInWatts || null,
                sample.bikeCadenceInRPM || null,
                sample.directWheelchairCadence || null,
                sample.swimCadenceInStrokesPerMinute || null,
                sample.airTemperatureCelcius || null
              ]
            );
          }
          
          // Insert laps if present
          if (activity.laps && activity.laps.length > 0) {
            for (const lap of activity.laps) {
              await SingleQuery(
                `INSERT INTO garmin_activity_laps
                 (activity_details_id, start_time_seconds)
                 VALUES ($1, $2)`,
                [activityDetailsId, lap.startTimeInSeconds]
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error storing activity data:', error);
  }
}

// Function to store Move IQ events
async function storeMoveIQData(moveIQEvents: MoveIQData[]) {
  try {
    console.log('Storing Move IQ data:', moveIQEvents.length, 'records');
    
    for (const event of moveIQEvents) {
      const userId = await getUserIdFromGarminId(event.userId);
      if (!userId) continue;
      
      await SingleQuery(
        `INSERT INTO garmin_moveiq_events
         (user_id, garmin_user_id, summary_id, calendar_date, start_time,
          start_time_offset_seconds, duration_seconds, activity_type, activity_sub_type)
         VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9)
         ON CONFLICT (summary_id) DO UPDATE
         SET calendar_date = $4, start_time = to_timestamp($5),
             start_time_offset_seconds = $6, duration_seconds = $7,
             activity_type = $8, activity_sub_type = $9,
             updated_at = NOW()`,
        [
          userId,
          event.userId,
          event.summaryId,
          event.calendarDate,
          event.startTimeInSeconds,
          event.startTimeOffsetInSeconds,
          event.durationInSeconds,
          event.activityType,
          event.activitySubType || null
        ]
      );
    }
  } catch (error) {
    console.error('Error storing Move IQ data:', error);
  }
}

// Process activity files ping notifications
async function processActivityFiles(activityFiles: ActivityFileData[]) {
  try {
    console.log('Processing activity files ping:', activityFiles.length, 'files');
    
    for (const fileData of activityFiles) {
      const userId = await getUserIdFromGarminId(fileData.userId);
      if (!userId) continue;
      
      // Store file metadata in database
      await SingleQuery(
        `INSERT INTO garmin_activity_files
         (user_id, garmin_user_id, file_type, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [
          userId,
          fileData.userId,
          fileData.fileType
        ]
      );
      
      // Note: We could download the actual file content using the callbackURL,
      // but since it requires additional HTTP requests and the URL is only valid 
      // for 24 hours, we're just storing the metadata for now.
      
      // If we wanted to download the file, we would make a GET request to fileData.callbackURL
      // and store the binary data in the file_data column.
      
      console.log(`Activity file metadata stored: ${fileData.fileType} file for ${fileData.activityType} activity ${fileData.activityId}`);
    }
  } catch (error) {
    console.error('Error processing activity files:', error);
  }
}

// Helper function to get user_id from Garmin user ID
async function getUserIdFromGarminId(garminUserId: string): Promise<number | null> {
  try {
    const result = await SingleQuery(
      'SELECT user_id FROM user_garmin_tokens WHERE garmin_user_id = $1',
      [garminUserId]
    );
    
    return result.rows[0]?.user_id || null;
  } catch (error) {
    console.error('Error getting user ID from Garmin ID:', error);
    return null;
  }
} 