export interface TrainingStatus {
  userId: string;
  measurementTime: number;
  status: 'UNPRODUCTIVE' | 'PRODUCTIVE' | 'MAINTAINING' | 'RECOVERY' | 'NO_STATUS';
  vo2Max: number;
  loadLowActivityBoundary: number;
  loadOptimalLowBoundary: number;
  loadOptimalHighBoundary: number;
  loadHighActivityBoundary: number;
  currentLoad: number;
  previousDayLoad: number;
  weeklyLoad: number;
  lastUpdateTime: number;
}

export interface TrainingLoad {
  userId: string;
  measurementTime: number;
  overallLoad: number;
  anaerobicLoad: number;
  aerobicHighLoad: number;
  aerobicLowLoad: number;
  loadRatingDescription: string;
  loadLevel: 'LOW' | 'OPTIMAL' | 'HIGH';
}

export interface TrainingEffect {
  userId: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  aerobicTrainingEffect: {
    value: number;
    benefitCategory: string;
  };
  anaerobicTrainingEffect: {
    value: number;
    benefitCategory: string;
  };
}

export interface TrainingReadiness {
  userId: string;
  measurementTimeInSeconds: number;
  readinessScore: number;
  readinessStatus: 'GOOD' | 'MODERATE' | 'LOW';
  factors: {
    sleepQuality?: {
      qualityLevel: 'GOOD' | 'MODERATE' | 'POOR';
      durationInSeconds: number;
    };
    recovery?: {
      recoveryLevel: 'GOOD' | 'MODERATE' | 'POOR';
      hrvStatus: string;
    };
    acuteLoad?: {
      loadLevel: 'LOW' | 'OPTIMAL' | 'HIGH';
      value: number;
    };
    hrVariability?: {
      value: number;
      status: 'GOOD' | 'MODERATE' | 'POOR';
    };
  };
} 