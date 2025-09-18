import { DailySummary } from 'api/garmin-connect/health/types';

export interface StressData {
  latestStress: DailySummary | null;
  previousStress: DailySummary | null;
  loading: boolean;
  error: string | null;
}

export async function getStressData(): Promise<StressData> {
  try {
    // Fetch the latest daily data (which includes average_stress_level) and previous day's data for trend calculation
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
      // The API now returns an array of data, get the first (most recent) entry
      const latestEntry = latestResult.data[0];
      const dailyData = latestEntry?.data;
      
      if (dailyData) {
        return {
          latestStress: dailyData,
          previousStress: previousData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestStress: null,
          previousStress: null,
          loading: false,
          error: 'No daily data available in result'
        };
      }
    } else {
      return {
        latestStress: null,
        previousStress: null,
        loading: false,
        error: 'No daily data available'
      };
    }

  } catch (err) {
    return {
      latestStress: null,
      previousStress: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to get average stress level from daily data
export function calculateAverageStressLevel(dailyData: DailySummary): number {
  // Use Garmin's pre-calculated average stress level
  return dailyData.averageStressLevel || 0;
}

// Helper function to calculate stress breakdown from daily data
export function calculateTimeWeightedStressLevel(dailyData: DailySummary): {
  average: number;
  breakdown: {
    rest: { duration: number; percentage: number };
    low: { duration: number; percentage: number };
    medium: { duration: number; percentage: number };
    high: { duration: number; percentage: number };
  };
} {
  // Use Garmin's pre-calculated average stress level
  const average = dailyData.averageStressLevel || 0;
  
  // Convert seconds to minutes for display
  const restMinutes = Math.round((dailyData.restStressDurationInSeconds || 0) / 60);
  const lowMinutes = Math.round((dailyData.lowStressDurationInSeconds || 0) / 60);
  const mediumMinutes = Math.round((dailyData.mediumStressDurationInSeconds || 0) / 60);
  const highMinutes = Math.round((dailyData.highStressDurationInSeconds || 0) / 60);
  
  const totalMinutes = restMinutes + lowMinutes + mediumMinutes + highMinutes;
  
  // Calculate percentages
  const restPercentage = totalMinutes > 0 ? Math.round((restMinutes / totalMinutes) * 100) : 0;
  const lowPercentage = totalMinutes > 0 ? Math.round((lowMinutes / totalMinutes) * 100) : 0;
  const mediumPercentage = totalMinutes > 0 ? Math.round((mediumMinutes / totalMinutes) * 100) : 0;
  const highPercentage = totalMinutes > 0 ? Math.round((highMinutes / totalMinutes) * 100) : 0;

  return {
    average,
    breakdown: {
      rest: { duration: restMinutes, percentage: restPercentage },
      low: { duration: lowMinutes, percentage: lowPercentage },
      medium: { duration: mediumMinutes, percentage: mediumPercentage },
      high: { duration: highMinutes, percentage: highPercentage }
    }
  };
}

// Helper function to get peak stress level from daily data
export function calculatePeakStressLevel(dailyData: DailySummary): number {
  // Use Garmin's pre-calculated max stress level
  return dailyData.maxStressLevel || 0;
}

// Helper function to determine stress level category
export function getStressLevelCategory(stressLevel: number): {
  label: 'Rest' | 'Low' | 'Moderate' | 'High';
  color: string;
  bgColor: string;
  description: string;
} {
  if (stressLevel <= 25) {
    return {
      label: 'Rest',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Excellent recovery and stress management! ��'
    };
  } else if (stressLevel <= 50) {
    return {
      label: 'Low',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Good balance - monitor for stress buildup'
    };
  } else if (stressLevel <= 75) {
    return {
      label: 'Moderate',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Consider stress management and recovery techniques'
    };
  } else {
    return {
      label: 'High',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High stress - focus on recovery and consider support'
    };
  }
}

// Helper function to calculate stress trend
export function calculateStressTrend(currentStress: number, previousStress?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousStress) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentStress - previousStress;
  const changePercent = Math.round((change / previousStress) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 20) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant stress increase - monitor closely' : 'Significant stress decrease - great improvement';
  } else if (absChangePercent >= 10) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate stress increase - consider stress management' : 'Moderate stress decrease - good progress';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight stress increase' : change < 0 ? 'Slight stress decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}

// Helper function to calculate Body Battery metrics
// Note: Body Battery data is not available in dailies table, only in stress_details
// This function is kept for compatibility but will return default values
export function calculateBodyBatteryMetrics(dailyData: DailySummary): {
  charged: number;
  drained: number;
  net: number;
  level: 'High' | 'Medium' | 'Low';
} {
  // Body Battery data is not available in daily summaries
  // Return default values or fetch from stress_details if needed
  return { 
    charged: 0, 
    drained: 0, 
    net: 0, 
    level: 'Low' 
  };
}