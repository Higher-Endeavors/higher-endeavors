import { DailySummary } from '@/app/api/garmin-connect/health/types';
import type { DistanceUnit } from '@/app/lib/types/userSettings.zod';

export interface StepsData {
  latestSteps: DailySummary | null;
  previousSteps: DailySummary | null;
  loading: boolean;
  error: string | null;
}

export async function getStepsData(): Promise<StepsData> {
  try {
    // Fetch the latest available daily data (last 30 days to ensure we get the most recent entry)
    const response = await fetch('/api/garmin-connect/health/data?type=dailies&days=30&limit=10');
    
    if (!response.ok) {
      throw new Error('Failed to fetch daily data');
    }

    const result = await response.json();

    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      // Get the most recent entry (first in the array)
      const latestEntry = result.data[0];
      const latestData = latestEntry?.data;
      
      // Get the second most recent entry for trend calculation
      const previousEntry = result.data[1];
      const previousData = previousEntry?.data || null;
      
      if (latestData) {
        return {
          latestSteps: latestData,
          previousSteps: previousData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestSteps: null,
          previousSteps: null,
          loading: false,
          error: 'No daily data available in result'
        };
      }
    } else {
      return {
        latestSteps: null,
        previousSteps: null,
        loading: false,
        error: 'No daily data available'
      };
    }

  } catch (err) {
    return {
      latestSteps: null,
      previousSteps: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to get step count
export function getStepCount(dailyData: DailySummary): number {
  return dailyData.steps || 0;
}

// Helper function to calculate steps trend
export function calculateStepsTrend(currentSteps: number, previousSteps?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousSteps) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentSteps - previousSteps;
  const changePercent = Math.round((change / previousSteps) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 20) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant step increase - excellent activity!' : 'Significant step decrease - consider more movement';
  } else if (absChangePercent >= 10) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate step increase - good activity level' : 'Moderate step decrease - may need more walking';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight step increase' : change < 0 ? 'Slight step decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}

// Helper function to format step values
export function formatSteps(steps: number): string {
  return Math.round(steps).toLocaleString();
}

// Helper function to get steps goal (can be customized per user)
export function getStepsGoal(): number {
  // Default goal - can be made configurable later
  return 10000;
}

// Helper function to calculate steps progress
export function calculateStepsProgress(currentSteps: number, goal: number): {
  percentage: number;
  remaining: number;
  status: 'exceeded' | 'achieved' | 'in_progress';
} {
  const percentage = Math.min((currentSteps / goal) * 100, 100);
  const remaining = Math.max(goal - currentSteps, 0);
  
  let status: 'exceeded' | 'achieved' | 'in_progress' = 'in_progress';
  if (currentSteps >= goal) {
    status = currentSteps > goal ? 'exceeded' : 'achieved';
  }
  
  return { percentage, remaining, status };
}

// Helper function to get distance in meters from daily data
export function getDistanceInMeters(dailyData: DailySummary): number {
  return dailyData.distanceInMeters || 0;
}

// Helper function to convert meters to user's preferred distance unit
export function convertDistance(meters: number, unit: DistanceUnit): {
  value: number;
  unit: string;
  displayUnit: string;
} {
  switch (unit) {
    case 'miles':
      const miles = meters * 0.000621371;
      return {
        value: miles,
        unit: 'miles',
        displayUnit: 'mi'
      };
    case 'km':
      const km = meters / 1000;
      return {
        value: km,
        unit: 'km',
        displayUnit: 'km'
      };
    case 'm':
    default:
      return {
        value: meters,
        unit: 'm',
        displayUnit: 'm'
      };
  }
}

// Helper function to format distance values
export function formatDistance(meters: number, unit: DistanceUnit): string {
  const converted = convertDistance(meters, unit);
  
  if (converted.unit === 'miles') {
    return `${converted.value.toFixed(2)} ${converted.displayUnit}`;
  } else if (converted.unit === 'km') {
    return `${converted.value.toFixed(2)} ${converted.displayUnit}`;
  } else {
    return `${Math.round(converted.value).toLocaleString()} ${converted.displayUnit}`;
  }
}

// Helper function to calculate distance trend
export function calculateDistanceTrend(currentDistance: number, previousDistance?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousDistance) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentDistance - previousDistance;
  const changePercent = Math.round((change / previousDistance) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 20) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant distance increase - great activity!' : 'Significant distance decrease - consider more movement';
  } else if (absChangePercent >= 10) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate distance increase - good activity level' : 'Moderate distance decrease - may need more walking';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight distance increase' : change < 0 ? 'Slight distance decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}

export function getFloorsClimbed(dailyData: DailySummary): number {
  return dailyData.floorsClimbed || 0;
}

export function formatFloors(floors: number): string {
  return Math.round(floors).toLocaleString();
}

export function calculateFloorsTrend(currentFloors: number, previousFloors?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousFloors) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentFloors - previousFloors;
  const changePercent = Math.round((change / previousFloors) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 50) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant increase in floors climbed - great vertical activity!' : 'Significant decrease in floors climbed - try stairs more often';
  } else if (absChangePercent >= 25) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate increase in floors climbed - good vertical movement' : 'Moderate decrease in floors climbed - consider taking stairs';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight increase in floors climbed' : change < 0 ? 'Slight decrease in floors climbed' : 'No significant change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}