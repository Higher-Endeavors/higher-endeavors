import { DailySummary } from '@/app/api/garmin-connect/health/types';

export interface ActiveMinutesData {
  latestActiveMinutes: DailySummary | null;
  previousActiveMinutes: DailySummary | null;
  loading: boolean;
  error: string | null;
}

export async function getActiveMinutesData(): Promise<ActiveMinutesData> {
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
          latestActiveMinutes: latestData,
          previousActiveMinutes: previousData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestActiveMinutes: null,
          previousActiveMinutes: null,
          loading: false,
          error: 'No daily data available in result'
        };
      }
    } else {
      return {
        latestActiveMinutes: null,
        previousActiveMinutes: null,
        loading: false,
        error: 'No daily data available'
      };
    }

  } catch (err) {
    return {
      latestActiveMinutes: null,
      previousActiveMinutes: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to get active minutes from daily data
export function getActiveMinutes(dailyData: DailySummary): number {
  const activeTimeInSeconds = dailyData.activeTimeInSeconds || 0;
  return Math.round(activeTimeInSeconds / 60); // Convert seconds to minutes
}

// Helper function to calculate active minutes trend
export function calculateActiveMinutesTrend(currentMinutes: number, previousMinutes?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousMinutes) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentMinutes - previousMinutes;
  const changePercent = Math.round((change / previousMinutes) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 30) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant activity increase - excellent progress!' : 'Significant activity decrease - consider more movement';
  } else if (absChangePercent >= 15) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate activity increase - good progress' : 'Moderate activity decrease - may need more exercise';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight activity increase' : change < 0 ? 'Slight activity decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}

// Helper function to format active minutes values
export function formatActiveMinutes(minutes: number): string {
  return Math.round(minutes).toLocaleString();
}

// Helper function to get active minutes goal (can be customized per user)
export function getActiveMinutesGoal(): number {
  // Default goal - can be made configurable later
  return 60; // 60 minutes per day
}

// Helper function to calculate active minutes progress
export function calculateActiveMinutesProgress(currentMinutes: number, goal: number): {
  percentage: number;
  remaining: number;
  status: 'exceeded' | 'achieved' | 'in_progress';
} {
  const percentage = Math.min((currentMinutes / goal) * 100, 100);
  const remaining = Math.max(goal - currentMinutes, 0);
  
  let status: 'exceeded' | 'achieved' | 'in_progress' = 'in_progress';
  if (currentMinutes >= goal) {
    status = currentMinutes > goal ? 'exceeded' : 'achieved';
  }
  
  return { percentage, remaining, status };
}