import { DailySummary } from '@/app/api/garmin-connect/health/types';

export interface CalorieData {
  latestCalories: DailySummary | null;
  previousCalories: DailySummary | null;
  loading: boolean;
  error: string | null;
}

export async function getCalorieData(): Promise<CalorieData> {
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
          latestCalories: dailyData,
          previousCalories: previousData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestCalories: null,
          previousCalories: null,
          loading: false,
          error: 'No daily data available in result'
        };
      }
    } else {
      return {
        latestCalories: null,
        previousCalories: null,
        loading: false,
        error: 'No daily data available'
      };
    }

  } catch (err) {
    return {
      latestCalories: null,
      previousCalories: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to calculate total calories burned
export function calculateTotalCalories(dailyData: DailySummary): number {
  const activeCalories = dailyData.activeKilocalories || 0;
  const bmrCalories = dailyData.bmrKilocalories || 0;
  return activeCalories + bmrCalories;
}

// Helper function to calculate calorie trend
export function calculateCalorieTrend(currentCalories: number, previousCalories?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousCalories) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentCalories - previousCalories;
  const changePercent = Math.round((change / previousCalories) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 15) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant calorie increase - great activity!' : 'Significant calorie decrease - consider more activity';
  } else if (absChangePercent >= 8) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate calorie increase - good activity level' : 'Moderate calorie decrease - may need more movement';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight calorie increase' : change < 0 ? 'Slight calorie decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}

// Helper function to format calorie values
export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString();
}

// Helper function to get calorie goal (can be customized per user)
export function getCalorieGoal(): number {
  // Default goal - can be made configurable later
  return 3000;
}