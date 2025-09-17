import { useState, useEffect } from 'react';
import { clientLogger } from '@/app/lib/logging/logger.client';
import { getHeartRateZones } from '@/app/(protected)/user/bio/lib/actions/saveHeartRateZones';

export interface GarminActivity {
  id: number;
  activity_type: string;
  duration_in_seconds: number;
  activity_name?: string;
  start_time_in_seconds: string;
}

export interface WeeklyCMEVolumeData {
  totalVolume: number;
  activities: GarminActivity[];
  loading: boolean;
  error: string | null;
}

export interface HeartRateZone {
  id: number;
  name: string;
  description: string;
  minBpm: number;
  maxBpm: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export interface TimeInZonesData {
  zones: {
    zone: number;
    planned: number;
    actual: number;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }[];
  totalPlanned: number;
  totalActual: number;
  loading: boolean;
  error: string | null;
}

// Mapping from Garmin activity types to CME activity families
const GARMIN_TO_CME_MAPPING: Record<string, string> = {
  // Running activities
  'RUNNING': 'Running',
  'INDOOR_RUNNING': 'Running',
  'OBSTACLE_RUN': 'Running',
  'STREET_RUNNING': 'Running',
  'TRACK_RUNNING': 'Running',
  'TRAIL_RUNNING': 'Running',
  'TREADMILL_RUNNING': 'Running',
  'ULTRA_RUN': 'Running',
  'VIRTUAL_RUN': 'Running',
  
  // Cycling activities
  'CYCLING': 'Cycling',
  'BMX': 'Cycling',
  'CYCLOCROSS': 'Cycling',
  'DOWNHILL_BIKING': 'Cycling',
  'E_BIKE_FITNESS': 'Cycling',
  'E_BIKE_MOUNTAIN': 'Cycling',
  'GRAVEL_CYCLING': 'Cycling',
  'INDOOR_CYCLING': 'Cycling',
  'MOUNTAIN_BIKING': 'Cycling',
  'RECUMBENT_CYCLING': 'Cycling',
  'ROAD_BIKING': 'Cycling',
  'TRACK_CYCLING': 'Cycling',
  'VIRTUAL_RIDE': 'Cycling',
  'HANDCYCLING': 'Cycling',
  'INDOOR_HANDCYCLING': 'Cycling',
  
  // Swimming activities
  'SWIMMING': 'Swimming',
  'LAP_SWIMMING': 'Swimming',
  'OPEN_WATER_SWIMMING': 'Swimming',
  
  // Rowing activities
  'INDOOR_ROWING': 'Rowing',
  'ROWING': 'Rowing',
  'ROWING_V2': 'Rowing',
  
  // Walking activities
  'WALKING': 'Walking',
  'CASUAL_WALKING': 'Walking',
  'SPEED_WALKING': 'Walking',
  'HIKING': 'Walking',
  
  // Nordic & Snow activities
  'CROSS_COUNTRY_SKIING_WS': 'Nordic & Snow',
  'RESORT_SKIING': 'Nordic & Snow',
  'SNOWBOARDING_WS': 'Nordic & Snow',
  'RESORT_SKIING_SNOWBOARDING_WS': 'Nordic & Snow',
  'SKATE_SKIING_WS': 'Nordic & Snow',
  'SKATING_WS': 'Nordic & Snow',
  'SNOW_SHOE_WS': 'Nordic & Snow',
  'SNOWMOBILING_WS': 'Nordic & Snow',
  'BACKCOUNTRY_SNOWBOARDING': 'Nordic & Snow',
  'BACKCOUNTRY_SKIING': 'Nordic & Snow',
  
  // Watersport activities
  'BOATING': 'Watersport',
  'BOATING_V2': 'Watersport',
  'FISHING': 'Watersport',
  'FISHING_V2': 'Watersport',
  'KAYAKING': 'Watersport',
  'KAYAKING_V2': 'Watersport',
  'KITEBOARDING': 'Watersport',
  'KITEBOARDING_V2': 'Watersport',
  'OFFSHORE_GRINDING': 'Watersport',
  'OFFSHORE_GRINDING_V2': 'Watersport',
  'ONSHORE_GRINDING': 'Watersport',
  'ONSHORE_GRINDING_V2': 'Watersport',
  'PADDLING': 'Watersport',
  'PADDLING_V2': 'Watersport',
  'SAILING': 'Watersport',
  'SAILING_V2': 'Watersport',
  'SNORKELING': 'Watersport',
  'STAND_UP_PADDLEBOARDING': 'Watersport',
  'STAND_UP_PADDLEBOARDING_V2': 'Watersport',
  'SURFING': 'Watersport',
  'SURFING_V2': 'Watersport',
  'WAKEBOARDING': 'Watersport',
  'WAKEBOARDING_V2': 'Watersport',
  'WATERSKIING': 'Watersport',
  'WHITEWATER_RAFTING': 'Watersport',
  'WHITEWATER_RAFTING_V2': 'Watersport',
  'WINDSURFING': 'Watersport',
  'WINDSURFING_V2': 'Watersport',
  
  // General activities (fallback for activities that don't fit other categories)
  'FITNESS_EQUIPMENT': 'General',
  'BOULDERING': 'General',
  'ELLIPTICAL': 'General',
  'INDOOR_CARDIO': 'General',
  'HIIT': 'General',
  'INDOOR_CLIMBING': 'General',
  'PILATES': 'General',
  'STAIR_CLIMBING': 'General',
  'STRENGTH_TRAINING': 'General',
  'YOGA': 'General',
  'MEDITATION': 'General',
  'BOXING': 'General',
  'BREATHWORK': 'General',
  'DANCE': 'General',
  'DISC_GOLF': 'General',
  'FLOOR_CLIMBING': 'General',
  'GOLF': 'General',
  'INLINE_SKATING': 'General',
  'JUMP_ROPE': 'General',
  'MIXED_MARTIAL_ARTS': 'General',
  'MOUNTAINEERING': 'General',
  'ROCK_CLIMBING': 'General',
  'STOP_WATCH': 'General',
  'PARA_SPORTS': 'General',
  'WHEELCHAIR_PUSH_RUN': 'General',
  'WHEELCHAIR_PUSH_WALK': 'General'
};


export async function getWeeklyCMEVolumeData(): Promise<WeeklyCMEVolumeData> {
  try {
    // Get current week (Monday to Sunday) in user's local timezone
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Handle Sunday as day 0
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    // Fetch activities from the last 7 days to ensure we get the current week
    const apiUrl = `/api/garmin-connect/activity/data?type=activityDetails&days=7&limit=100`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data && Array.isArray(result.data)) {
      // Filter activities to current week and map to CME families
      const afterDateFilter = result.data.filter((activity: any) => {
        const activityData = activity.data;
        if (!activityData || !activityData.startTimeInSeconds) {
          return false;
        }
        
        // Convert startTimeInSeconds to Date
        const activityDate = new Date(parseInt(activityData.startTimeInSeconds) * 1000);
        const isInWeek = activityDate >= monday && activityDate <= sunday;
        
        return isInWeek;
      });
      
      const currentWeekActivities = afterDateFilter.filter((activity: any) => {
        const activityData = activity.data;
        const activityType = activityData?.activityType;
        const hasCMEMapping = activityType && GARMIN_TO_CME_MAPPING[activityType];
        
        return hasCMEMapping;
      });
      
      const mappedActivities = currentWeekActivities.map((activity: any) => ({
        id: activity.data.id,
        activity_type: activity.data.activityType,
        duration_in_seconds: activity.data.durationInSeconds || 0,
        activity_name: activity.data.activityName,
        start_time_in_seconds: activity.data.startTimeInSeconds
      }));

      // Calculate total volume in minutes
      const totalVolume = mappedActivities.reduce((total: number, activity: GarminActivity) => {
        return total + Math.round(activity.duration_in_seconds / 60);
      }, 0);

      return {
        totalVolume,
        activities: mappedActivities,
        loading: false,
        error: null
      };
    } else {
      return {
        totalVolume: 0,
        activities: [],
        loading: false,
        error: 'No activity data available'
      };
    }

  } catch (err) {
    clientLogger.error('Error in getWeeklyCMEVolumeData', {
      error: err instanceof Error ? err.message : String(err)
    });
    
    return {
      totalVolume: 0,
      activities: [],
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to get CME family for a Garmin activity type
export function getCMEFamilyForActivity(activityType: string): string | null {
  return GARMIN_TO_CME_MAPPING[activityType] || null;
}

// Helper function to format volume in minutes
export function formatVolumeMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Helper function to calculate volume trend (placeholder for now)
export function calculateVolumeTrend(currentVolume: number, previousVolume?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousVolume) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentVolume - previousVolume;
  const changePercent = Math.round((change / previousVolume) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 50) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant volume increase - great training week!' : 'Significant volume decrease - consider increasing activity';
  } else if (absChangePercent >= 25) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate volume increase - good progress' : 'Moderate volume decrease - try to maintain consistency';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight volume increase' : change < 0 ? 'Slight volume decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}

// Helper function to get CME activity type from Garmin activity type
export function getCMEActivityType(garminActivityType: string): string {
  const cmeFamily = GARMIN_TO_CME_MAPPING[garminActivityType];
  if (!cmeFamily) return 'general';
  
  // Map CME families to activity types for heart rate zones
  switch (cmeFamily) {
    case 'Running':
      return 'running';
    case 'Cycling':
      return 'cycling';
    case 'Swimming':
      return 'swimming';
    case 'Rowing':
      return 'rowing';
    default:
      return 'general';
  }
}

// Helper function to process heart rate samples and calculate time in zones
export function processHeartRateSamples(
  samples: any[], 
  heartRateZones: any[]
): { [zoneId: number]: number } {
  const zoneTime: { [zoneId: number]: number } = {};
  
  // Initialize zone times
  heartRateZones.forEach(zone => {
    zoneTime[zone.id] = 0;
  });
  
  if (!samples || samples.length < 2) {
    return zoneTime;
  }
  
  // Sort samples by timestamp
  const sortedSamples = samples
    .filter(sample => sample.heartRate && sample.startTimeInSeconds)
    .sort((a, b) => a.startTimeInSeconds - b.startTimeInSeconds);
  
  // Process each sample to calculate time spent in zones
  for (let i = 0; i < sortedSamples.length - 1; i++) {
    const currentSample = sortedSamples[i];
    const nextSample = sortedSamples[i + 1];
    
    const heartRate = currentSample.heartRate;
    const timeInterval = nextSample.startTimeInSeconds - currentSample.startTimeInSeconds;
    
    // Find which zone this heart rate belongs to
    const zone = heartRateZones.find(z => 
      heartRate >= z.minBpm && heartRate <= z.maxBpm
    );
    
    if (zone) {
      zoneTime[zone.id] += timeInterval;
    }
  }
  
  // Convert seconds to minutes
  Object.keys(zoneTime).forEach(zoneId => {
    zoneTime[parseInt(zoneId)] = Math.round(zoneTime[parseInt(zoneId)] / 60);
  });
  
  return zoneTime;
}

// Main function to get time in zones data
export async function getTimeInZonesData(): Promise<TimeInZonesData> {
  try {
    // Get current week (Monday to Sunday) in user's local timezone
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Handle Sunday as day 0
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    // Fetch activities from the last 7 days
    const apiUrl = `/api/garmin-connect/activity/data?type=activityDetails&days=7&limit=100`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data && Array.isArray(result.data)) {
      // Filter activities to current week and CME activities
      const currentWeekActivities = result.data.filter((activity: any) => {
        const activityData = activity.data;
        if (!activityData || !activityData.startTimeInSeconds) {
          return false;
        }
        
        // Check if activity is in current week
        const activityDate = new Date(parseInt(activityData.startTimeInSeconds) * 1000);
        const isInWeek = activityDate >= monday && activityDate <= sunday;
        
        // Check if activity has CME mapping
        const activityType = activityData?.activityType;
        const hasCMEMapping = activityType && GARMIN_TO_CME_MAPPING[activityType];
        
        return isInWeek && hasCMEMapping;
      });
      
      if (currentWeekActivities.length === 0) {
        return {
          zones: [],
          totalPlanned: 0,
          totalActual: 0,
          loading: false,
          error: 'No activities this week'
        };
      }
      
      // Get user's heart rate zones
      const hrZonesResult = await getHeartRateZones();
      if (!hrZonesResult.success || !hrZonesResult.data || hrZonesResult.data.length === 0) {
        return {
          zones: [],
          totalPlanned: 0,
          totalActual: 0,
          loading: false,
          error: 'No heart rate zones configured'
        };
      }
      
      // Process each activity and accumulate time in zones
      const totalZoneTime: { [zoneId: number]: number } = {};
      let usedZones: any[] = [];
      
      for (const activity of currentWeekActivities) {
        const activityData = activity.data;
        const activityType = activityData.activityType;
        const cmeActivityType = getCMEActivityType(activityType);
        
        // Find heart rate zones for this activity type
        const activityZones = hrZonesResult.data.find(z => z.activityType === cmeActivityType);
        if (!activityZones || !activityZones.zones) {
          continue; // Skip if no zones for this activity type
        }
        
        // Store zones for later use (use the first set of zones we find)
        if (usedZones.length === 0) {
          usedZones = activityZones.zones;
        }
        
        // Process samples if available
        if (activityData.samples && Array.isArray(activityData.samples)) {
          const zoneTime = processHeartRateSamples(activityData.samples, activityZones.zones);
          
          // Accumulate time in each zone
          Object.keys(zoneTime).forEach(zoneId => {
            const id = parseInt(zoneId);
            totalZoneTime[id] = (totalZoneTime[id] || 0) + zoneTime[id];
          });
        }
      }
      
      // Create zone data with default planned values and actual times
      const defaultPlanned = [45, 120, 60, 30, 15]; // Default planned minutes for each zone
      const zones = usedZones.map((zone, index) => ({
        zone: zone.id,
        planned: defaultPlanned[index] || 0,
        actual: totalZoneTime[zone.id] || 0,
        color: `text-${getZoneColor(zone.id)}-600`,
        bgColor: `bg-${getZoneColor(zone.id)}-50`,
        borderColor: `border-${getZoneColor(zone.id)}-200`,
        textColor: `text-${getZoneColor(zone.id)}-800`
      }));
      
      const totalPlanned = zones.reduce((sum, zone) => sum + zone.planned, 0);
      const totalActual = zones.reduce((sum, zone) => sum + zone.actual, 0);
      
      return {
        zones,
        totalPlanned,
        totalActual,
        loading: false,
        error: null
      };
    } else {
      return {
        zones: [],
        totalPlanned: 0,
        totalActual: 0,
        loading: false,
        error: 'No activity data available'
      };
    }

  } catch (err) {
    clientLogger.error('Error in getTimeInZonesData', {
      error: err instanceof Error ? err.message : String(err)
    });
    
    return {
      zones: [],
      totalPlanned: 0,
      totalActual: 0,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to get zone color based on zone ID
function getZoneColor(zoneId: number): string {
  switch (zoneId) {
    case 1: return 'blue';
    case 2: return 'green';
    case 3: return 'yellow';
    case 4: return 'orange';
    case 5: return 'red';
    default: return 'gray';
  }
}
