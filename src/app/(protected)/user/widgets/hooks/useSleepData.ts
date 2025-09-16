import { SleepSummary } from '@/app/api/garmin-connect/health/types';

export interface SleepData {
  latestSleep: SleepSummary | null;
  loading: boolean;
  error: string | null;
}

export async function getSleepData(): Promise<SleepData> {
  try {
    // Fetch the latest sleep data using the Garmin health API
    const response = await fetch('/api/garmin-connect/health/data?type=sleeps&days=1&limit=1');
    
    if (!response.ok) {
      throw new Error('Failed to fetch sleep data');
    }

    const result = await response.json();
    
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      // The API returns an array of data, get the first (most recent) entry
      const latestEntry = result.data[0];
      const sleepData = latestEntry?.data;
      
      if (sleepData) {
        return {
          latestSleep: sleepData,
          loading: false,
          error: null
        };
      } else {
        return {
          latestSleep: null,
          loading: false,
          error: 'No sleep data available in result'
        };
      }
    } else {
      return {
        latestSleep: null,
        loading: false,
        error: 'No sleep data available'
      };
    }

  } catch (err) {
    return {
      latestSleep: null,
      loading: false,
      error: err instanceof Error ? err.message : 'An error occurred'
    };
  }
}

// Helper function to format sleep duration from seconds to hours and minutes
export function formatSleepDuration(durationInSeconds: number): string {
  // Handle invalid input
  if (!durationInSeconds || isNaN(durationInSeconds) || durationInSeconds < 0) {
    console.error('Invalid duration in seconds:', durationInSeconds);
    return '0h 0m';
  }
  
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return `${hours}h ${minutes}m`;
}

// Helper function to format sleep stage duration (shorter format for breakdown)
export function formatSleepStageDuration(durationInSeconds: number): string {
  if (!durationInSeconds || isNaN(durationInSeconds) || durationInSeconds < 0) {
    return '0m';
  }
  
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return `${hours}h ${minutes}m`;
}

// Helper function to calculate sleep stage percentages
export function calculateSleepStagePercentages(sleepData: SleepSummary): {
  deep: { duration: number; percentage: number };
  light: { duration: number; percentage: number };
  rem: { duration: number; percentage: number };
  awake: { duration: number; percentage: number };
} {
  const totalDuration = sleepData.durationInSeconds;
  const deepDuration = sleepData.deepSleepDurationInSeconds || 0;
  const lightDuration = sleepData.lightSleepDurationInSeconds || 0;
  const remDuration = sleepData.remSleepInSeconds || 0;
  const awakeDuration = sleepData.awakeDurationInSeconds || 0;
  
  return {
    deep: {
      duration: deepDuration,
      percentage: totalDuration > 0 ? Math.round((deepDuration / totalDuration) * 100) : 0
    },
    light: {
      duration: lightDuration,
      percentage: totalDuration > 0 ? Math.round((lightDuration / totalDuration) * 100) : 0
    },
    rem: {
      duration: remDuration,
      percentage: totalDuration > 0 ? Math.round((remDuration / totalDuration) * 100) : 0
    },
    awake: {
      duration: awakeDuration,
      percentage: totalDuration > 0 ? Math.round((awakeDuration / totalDuration) * 100) : 0
    }
  };
}

// Helper function to calculate sleep quality based on duration and sleep stages
export function calculateSleepQuality(sleepData: SleepSummary): {
  score: number;
  qualifier: 'Excellent' | 'Good' | 'Fair' | 'Poor';
} {
  const durationHours = sleepData.durationInSeconds / 3600;
  const deepSleepHours = (sleepData.deepSleepDurationInSeconds || 0) / 3600;
  const remSleepHours = (sleepData.remSleepInSeconds || 0) / 3600;
  
  // Basic scoring based on duration (7-9 hours is optimal)
  let score = 0;
  if (durationHours >= 7 && durationHours <= 9) {
    score = 80;
  } else if (durationHours >= 6 && durationHours < 7) {
    score = 60;
  } else if (durationHours >= 9 && durationHours <= 10) {
    score = 70;
  } else if (durationHours < 6) {
    score = 30;
  } else {
    score = 40;
  }
  
  // Adjust based on sleep stages (if available)
  if (deepSleepHours > 0 && remSleepHours > 0) {
    const deepSleepPercentage = (deepSleepHours / durationHours) * 100;
    const remSleepPercentage = (remSleepHours / durationHours) * 100;
    
    // Optimal ranges: Deep sleep 15-20%, REM sleep 20-25%
    if (deepSleepPercentage >= 15 && deepSleepPercentage <= 20) {
      score += 10;
    }
    if (remSleepPercentage >= 20 && remSleepPercentage <= 25) {
      score += 10;
    }
  }
  
  // Use Garmin's overall sleep score if available
  if (sleepData.overallSleepScore?.value) {
    score = sleepData.overallSleepScore.value;
  }
  
  // Determine qualifier
  let qualifier: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  if (score >= 80) {
    qualifier = 'Excellent';
  } else if (score >= 60) {
    qualifier = 'Good';
  } else if (score >= 40) {
    qualifier = 'Fair';
  } else {
    qualifier = 'Poor';
  }
  
  return { score, qualifier };
}