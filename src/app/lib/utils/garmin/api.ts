import { GARMIN_CONFIG } from './config';
import { garminOAuth } from './oauth';
import { GarminRateLimiter } from './rateLimiter';
import { GarminTokens } from './types';
import * as HealthTypes from './types/health';
import * as ActivityTypes from './types/activity';
import * as TrainingTypes from './types/training';
import { handleGarminAPIError, validateTimestamp } from './errors';

const rateLimiter = new GarminRateLimiter();

export type ActivityFileType = 'FIT' | 'TCX' | 'GPX';

interface ActivityFileMetadata {
  summaryId: string;
  fileType: ActivityFileType;
  activityType: ActivityTypes.GarminActivityType;
  startTimeInSeconds: number;
  activityId: number;
  activityName?: string;
  activityDescription?: string;
  manual: boolean;
}

export class GarminAPI {
  constructor(private tokens: GarminTokens) {}

  // Health API Methods
  async getDailySummary(startTime: number, endTime: number): Promise<HealthTypes.DailySummary[]> {
    try {
      validateTimestamp(startTime);
      validateTimestamp(endTime);
      
      return rateLimiter.withRateLimit('health', async () => {
        const response = await garminOAuth.makeAuthenticatedRequest(
          `${GARMIN_CONFIG.HEALTH_API.DAILY_SUMMARY}?startTime=${startTime}&endTime=${endTime}`,
          this.tokens
        );
        return response.json();
      });
    } catch (error) {
      throw handleGarminAPIError(error);
    }
  }

  async getSleepData(startTime: number, endTime: number): Promise<HealthTypes.SleepData[]> {
    return rateLimiter.withRateLimit('health', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        `${GARMIN_CONFIG.HEALTH_API.SLEEP}?startTime=${startTime}&endTime=${endTime}`,
        this.tokens
      );
      return response.json();
    });
  }

  async getStressData(startTime: number, endTime: number): Promise<HealthTypes.StressData[]> {
    return rateLimiter.withRateLimit('health', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        `${GARMIN_CONFIG.HEALTH_API.STRESS}?startTime=${startTime}&endTime=${endTime}`,
        this.tokens
      );
      return response.json();
    });
  }

  // Activity API Methods
  async getActivities(startTime: number, endTime: number): Promise<ActivityTypes.Activity[]> {
    return rateLimiter.withRateLimit('activity', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        `${GARMIN_CONFIG.ACTIVITY_API.ACTIVITIES}?startTime=${startTime}&endTime=${endTime}`,
        this.tokens
      );
      return response.json();
    });
  }

  async getActivityDetails(activityId: number): Promise<ActivityTypes.ActivityDetails> {
    return rateLimiter.withRateLimit('activity', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        `${GARMIN_CONFIG.ACTIVITY_API.ACTIVITY_DETAILS}/${activityId}`,
        this.tokens
      );
      return response.json();
    });
  }

  // Training API Methods
  async getTrainingStatus(): Promise<TrainingTypes.TrainingStatus> {
    return rateLimiter.withRateLimit('training', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        GARMIN_CONFIG.TRAINING_API.TRAINING_STATUS,
        this.tokens
      );
      return response.json();
    });
  }

  async getTrainingLoad(): Promise<TrainingTypes.TrainingLoad> {
    return rateLimiter.withRateLimit('training', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        GARMIN_CONFIG.TRAINING_API.TRAINING_LOAD,
        this.tokens
      );
      return response.json();
    });
  }

  async getTrainingEffect(activityId: number): Promise<TrainingTypes.TrainingEffect> {
    return rateLimiter.withRateLimit('training', async () => {
      const response = await garminOAuth.makeAuthenticatedRequest(
        `${GARMIN_CONFIG.TRAINING_API.TRAINING_EFFECT}/${activityId}`,
        this.tokens
      );
      return response.json();
    });
  }

  // Activity File Methods
  async getActivityFile(activityId: number): Promise<{ data: Blob; metadata: ActivityFileMetadata }> {
    try {
      return rateLimiter.withRateLimit('activity', async () => {
        const response = await garminOAuth.makeAuthenticatedRequest(
          `${GARMIN_CONFIG.ACTIVITY_API.ACTIVITY_FILES}/${activityId}`,
          this.tokens
        );
        
        const metadata: ActivityFileMetadata = await response.json();
        const fileResponse = await fetch(metadata.callbackURL);
        
        if (!fileResponse.ok) {
          if (fileResponse.status === 410) {
            throw new Error('Activity file download URL has expired (24-hour limit)');
          }
          throw new Error(`Failed to download activity file: ${fileResponse.statusText}`);
        }
        
        const data = await fileResponse.blob();
        return { data, metadata };
      });
    } catch (error) {
      throw handleGarminAPIError(error);
    }
  }

  // Backfill Methods
  async requestBackfill(startTime: number, endTime: number, dataType: 'activities' | 'activityDetails' | 'moveiq'): Promise<void> {
    try {
      validateTimestamp(startTime);
      validateTimestamp(endTime);
      
      // Check if date range is within 90 days
      const daysDiff = (endTime - startTime) / (24 * 60 * 60);
      if (daysDiff > 90) {
        throw new Error('Backfill requests cannot exceed 90 days');
      }
      
      const response = await fetch(
        `${GARMIN_CONFIG.BASE_URL}/backfill/${dataType}?summaryStartTimeInSeconds=${startTime}&summaryEndTimeInSeconds=${endTime}`,
        {
          method: 'GET',
          headers: await garminOAuth.getAuthHeaders(this.tokens),
        }
      );
      
      if (response.status !== 202) {
        throw new Error(`Backfill request failed: ${response.statusText}`);
      }
    } catch (error) {
      throw handleGarminAPIError(error);
    }
  }

  // Utility Methods
  getRemainingRequests(endpoint: string): number {
    return rateLimiter.getRemainingRequests(endpoint);
  }

  getResetTime(endpoint: string): number {
    return rateLimiter.getResetTime(endpoint);
  }
} 