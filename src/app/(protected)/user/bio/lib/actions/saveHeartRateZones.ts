'use server';

import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';

export interface HeartRateZone {
  id: number;
  name: string;
  description: string;
  minBpm: number;
  maxBpm: number;
  color: string;
}

export interface HeartRateZoneData {
  calculationMethod: 'age' | 'karvonen' | 'manual' | 'custom';
  activityType: 'general' | 'running' | 'cycling' | 'swimming' | 'rowing';
  zones: HeartRateZone[];
  maxHeartRate?: number;
  restingHeartRate?: number;
}

export interface SaveHeartRateZonesResult {
  success: boolean;
  error?: string;
  hrZoneId?: number;
}

// Interface for storing only essential zone data in database
interface DatabaseZoneData {
  id: number;
  minBpm: number;
  maxBpm: number;
}

// Interface for database row structure
interface DatabaseRow {
  calculation_method: string;
  activity_type: string;
  zone_ranges: DatabaseZoneData[];
  max_heart_rate: number | null;
  resting_heart_rate: number | null;
}

// Interface for database rows that return hr_zone_id
interface DatabaseRowWithId {
  hr_zone_id: number;
}

// Convert full zone data to database format (only essential data)
const convertZonesToDatabaseFormat = (zones: HeartRateZone[]): DatabaseZoneData[] => {
  return zones.map(zone => ({
    id: zone.id,
    minBpm: zone.minBpm,
    maxBpm: zone.maxBpm
  }));
};

// Convert database zone data back to full format
const convertDatabaseZonesToFullFormat = (dbZones: DatabaseZoneData[]): HeartRateZone[] => {
  const defaultZoneInfo = [
    { id: 1, name: 'Zone 1 - Active Recovery', description: 'Very light intensity, active recovery', color: 'bg-blue-100 border-blue-300' },
    { id: 2, name: 'Zone 2 - Aerobic Base', description: 'Light intensity, aerobic base building', color: 'bg-green-100 border-green-300' },
    { id: 3, name: 'Zone 3 - Aerobic Threshold', description: 'Moderate intensity, aerobic threshold', color: 'bg-yellow-100 border-yellow-300' },
    { id: 4, name: 'Zone 4 - Lactate Threshold', description: 'High intensity, lactate threshold', color: 'bg-orange-100 border-orange-300' },
    { id: 5, name: 'Zone 5 - Anaerobic', description: 'Maximum intensity, anaerobic capacity', color: 'bg-red-100 border-red-300' }
  ];

  return dbZones.map(dbZone => {
    const zoneInfo = defaultZoneInfo.find(info => info.id === dbZone.id);
    return {
      id: dbZone.id,
      name: zoneInfo?.name || `Zone ${dbZone.id}`,
      description: zoneInfo?.description || '',
      minBpm: dbZone.minBpm,
      maxBpm: dbZone.maxBpm,
      color: zoneInfo?.color || 'bg-gray-100 border-gray-300'
    };
  });
};

export async function saveHeartRateZones(data: HeartRateZoneData): Promise<SaveHeartRateZonesResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;
    const { calculationMethod, activityType, zones, maxHeartRate, restingHeartRate } = data;

    // Validate zones data
    if (!zones || zones.length === 0) {
      return { success: false, error: 'No zone data provided' };
    }

    // Convert to database format (only essential data)
    const dbZoneData = convertZonesToDatabaseFormat(zones);

    // Check if zones already exist for this user and activity
    const existingZones = await SingleQuery(
      'SELECT hr_zone_id FROM user_bio_hr_zones WHERE user_id = $1 AND activity_type = $2',
      [userId, activityType]
    );

    if (existingZones.rows.length > 0) {
      // Update existing zones
      const result = await SingleQuery(
        `UPDATE user_bio_hr_zones 
         SET calculation_method = $1, 
             zone_ranges = $2, 
             max_heart_rate = $3, 
             resting_heart_rate = $4, 
             updated_date = NOW()
         WHERE user_id = $5 AND activity_type = $6
         RETURNING hr_zone_id`,
        [
          calculationMethod,
          JSON.stringify(dbZoneData),
          maxHeartRate || null,
          restingHeartRate || null,
          userId,
          activityType
        ]
      );

      if (result.rows.length === 0) {
        throw new Error('Failed to update heart rate zones');
      }

      return {
        success: true,
        hrZoneId: (result.rows[0] as DatabaseRowWithId).hr_zone_id
      };
    } else {
      // Insert new zones
      const result = await SingleQuery(
        `INSERT INTO user_bio_hr_zones 
         (user_id, calculation_method, activity_type, zone_ranges, max_heart_rate, resting_heart_rate)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING hr_zone_id`,
        [
          userId,
          calculationMethod,
          activityType,
          JSON.stringify(dbZoneData),
          maxHeartRate || null,
          restingHeartRate || null
        ]
      );

      if (result.rows.length === 0) {
        throw new Error('Failed to insert heart rate zones');
      }

      return {
        success: true,
        hrZoneId: (result.rows[0] as DatabaseRowWithId).hr_zone_id
      };
    }
  } catch (error) {
    await serverLogger.error('Error saving heart rate zones', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getHeartRateZones(): Promise<{
  success: boolean;
  data?: HeartRateZoneData[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    const result = await SingleQuery(
      `SELECT calculation_method, activity_type, zone_ranges, max_heart_rate, resting_heart_rate
       FROM user_bio_hr_zones 
       WHERE user_id = $1
       ORDER BY activity_type`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { success: true, data: [] };
    }

    const zonesData: HeartRateZoneData[] = result.rows.map((row: DatabaseRow) => ({
      calculationMethod: row.calculation_method,
      activityType: row.activity_type,
      zones: convertDatabaseZonesToFullFormat(row.zone_ranges),
      maxHeartRate: row.max_heart_rate,
      restingHeartRate: row.resting_heart_rate
    }));

    return { success: true, data: zonesData };
  } catch (error) {
    await serverLogger.error('Error fetching heart rate zones', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function deleteHeartRateZones(activityType: string): Promise<SaveHeartRateZonesResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    const result = await SingleQuery(
      'DELETE FROM user_bio_hr_zones WHERE user_id = $1 AND activity_type = $2 RETURNING hr_zone_id',
      [userId, activityType]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'No zones found to delete' };
    }

    return { success: true };
  } catch (error) {
    await serverLogger.error('Error deleting heart rate zones', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
