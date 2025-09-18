import { DailySummary } from 'api/garmin-connect/health/types';

export interface ActiveMinutesData {
  latestActiveMinutes: DailySummary | null;
  previousActiveMinutes: DailySummary | null;
  loading: boolean;
  error: string | null;
}

export async function getActiveMinutesData(): Promise<ActiveMinutesData> {
  try {
    // Fetch the latest daily data and previous day's data for trend calculation
    const [latestResponse, previousResponse] = await Promise.all([
      fetch('/api/garmin-connect/health/data?type=dailies&days=1&limit=1'),
      fetch('/api/garmin-connect/health/data?type=dailies&days=2&limit=2')
    ]);
    
    if (!latestResponse.ok) {
      throw new Error('Failed to fetch latest daily data');
    }

    const latestResult = await latestResponse.json();
    let previousData = null;

    // Try to get previous day's data if available
    if (previousResponse.ok) {
      const previousResult = await previousResponse.json();
      if (previousResult.success && previousResult.data && Array.isArray(previousResult.data)) {
        // Get the second most recent entry (previous day)
        const previousEntry = previousResult.data[1];
        if (previousEntry && previousEntry.data) {
          previousData = previousEntry.data;
        }
      }
    }

    if (latestResult.success && latestResult.data && Array.isArray(latestResult.data) && latestResult.data.length > 0) {
      // The API returns an array of data, get the first (most recent) entry
      const latestEntry = latestResult.data[0];
      const dailyData = latestEntry?.data;
      
      if (dailyData) {
        return {
          latestActiveMinutes: dailyData,
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