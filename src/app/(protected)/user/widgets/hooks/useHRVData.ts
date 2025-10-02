import { HRVSummary } from 'api/garmin-connect/health/types';

export interface HRVData {
  latestHRV: HRVSummary | null;
  previousHRV: HRVSummary | null;
  loading: boolean;
  error: string | null;
}

export async function getHRVData(): Promise<HRVData> {
  try {
    // Fetch the latest HRV data and previous day's data for trend calculation
    const [latestResponse, previousResponse] = await Promise.all([
      fetch('/api/garmin-connect/health/data?type=hrv&days=1&limit=1'),
      fetch('/api/garmin-connect/health/data?type=hrv&days=2&limit=2')
    ]);
    
    if (!latestResponse.ok) {
      throw new Error('Failed to fetch latest HRV data');
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
      const hrvData = latestEntry?.data;
      
      if (hrvData) {
        return {
          latestHRV: hrvData,
          previousHRV: previousData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestHRV: null,
          previousHRV: null,
          loading: false,
          error: 'No HRV data available in result'
        };
      }
    } else {
      return {
        latestHRV: null,
        previousHRV: null,
        loading: false,
        error: 'No HRV data available'
      };
    }

  } catch (err) {
    return {
      latestHRV: null,
      previousHRV: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to format HRV values
export function formatHRVValue(value: number): string {
  return Math.round(value).toString();
}

// Helper function to determine HRV status based on last night average
export function getHRVStatus(lastNightAvg: number): {
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  description: string;
} {
  // HRV ranges are highly individual, but we can use general guidelines
  // These ranges are approximate and should be personalized based on individual baselines
  if (lastNightAvg >= 50) {
    return {
      status: 'Excellent',
      color: 'text-green-600',
      description: 'Excellent recovery - great autonomic nervous system balance'
    };
  } else if (lastNightAvg >= 35) {
    return {
      status: 'Good',
      color: 'text-blue-600',
      description: 'Good recovery - well-balanced nervous system'
    };
  } else if (lastNightAvg >= 25) {
    return {
      status: 'Fair',
      color: 'text-yellow-600',
      description: 'Fair recovery - may need more rest'
    };
  } else {
    return {
      status: 'Poor',
      color: 'text-red-600',
      description: 'Poor recovery - focus on stress management and rest'
    };
  }
}

// Helper function to calculate HRV trend
export function calculateHRVTrend(currentHRV: number, previousHRV?: number): {
  trend: 'up' | 'down' | 'neutral';
  change: number;
  changePercent: number;
  significance: 'low' | 'moderate' | 'high';
  interpretation: string;
} {
  if (!previousHRV) {
    return { 
      trend: 'neutral', 
      change: 0, 
      changePercent: 0, 
      significance: 'low',
      interpretation: 'No previous data for comparison'
    };
  }

  const change = currentHRV - previousHRV;
  const changePercent = Math.round((change / previousHRV) * 100);
  const absChangePercent = Math.abs(changePercent);
  
  // Determine significance based on percentage change
  let significance: 'low' | 'moderate' | 'high' = 'low';
  let interpretation = '';
  
  if (absChangePercent >= 15) {
    significance = 'high';
    interpretation = change > 0 ? 'Significant HRV improvement - excellent recovery' : 'Significant HRV decrease - monitor stress and recovery';
  } else if (absChangePercent >= 8) {
    significance = 'moderate';
    interpretation = change > 0 ? 'Moderate HRV improvement - good recovery trend' : 'Moderate HRV decrease - consider recovery strategies';
  } else {
    significance = 'low';
    interpretation = change > 0 ? 'Slight HRV improvement' : change < 0 ? 'Slight HRV decrease' : 'No change';
  }
  
  if (change > 0) {
    return { trend: 'up', change, changePercent, significance, interpretation };
  } else if (change < 0) {
    return { trend: 'down', change: Math.abs(change), changePercent: absChangePercent, significance, interpretation };
  } else {
    return { trend: 'neutral', change: 0, changePercent: 0, significance, interpretation };
  }
}