import { DailySummary } from '@/app/api/garmin-connect/health/types';

export interface HeartRateData {
  latestHeartRate: DailySummary | null;
  previousHeartRate: DailySummary | null;
  loading: boolean;
  error: string | null;
}

export async function getHeartRateData(): Promise<HeartRateData> {
  try {
    // Fetch the latest daily data and previous day's data for trend calculation
    const [latestResponse, previousResponse] = await Promise.all([
      fetch('/api/garmin-connect/health/data?type=dailies&days=1&limit=1'),
      fetch('/api/garmin-connect/health/data?type=dailies&days=2&limit=2')
    ]);
    
    if (!latestResponse.ok) {
      throw new Error('Failed to fetch latest heart rate data');
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
          latestHeartRate: dailyData,
          previousHeartRate: previousData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestHeartRate: null,
          previousHeartRate: null,
          loading: false,
          error: 'No heart rate data available in result'
        };
      }
    } else {
      return {
        latestHeartRate: null,
        previousHeartRate: null,
        loading: false,
        error: 'No heart rate data available'
      };
    }

  } catch (err) {
    return {
      latestHeartRate: null,
      previousHeartRate: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to determine heart rate zone based on resting heart rate
export function calculateHeartRateZone(restingHR: number): {
  zone: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  range: string;
  color: string;
} {
  if (restingHR <= 50) {
    return { zone: 'Excellent', range: '≤50', color: 'bg-green-500' };
  } else if (restingHR <= 60) {
    return { zone: 'Good', range: '51-60', color: 'bg-blue-500' };
  } else if (restingHR <= 70) {
    return { zone: 'Fair', range: '61-70', color: 'bg-yellow-500' };
  } else {
    return { zone: 'Poor', range: '>70', color: 'bg-red-500' };
  }
}

// Helper function to calculate heart rate trend (comparing to previous data)
export function calculateHeartRateTrend(currentHR: number, previousHR?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousHR) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentHR - previousHR;
  const changePercent = Math.round((change / previousHR) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 10) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant increase - monitor for stress/illness' : 'Significant decrease - good recovery';
  } else if (absChangePercent >= 5) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate increase - may indicate stress' : 'Moderate decrease - improving fitness';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight increase' : change < 0 ? 'Slight decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}