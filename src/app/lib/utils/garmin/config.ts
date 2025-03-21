if (!process.env.GARMIN_CONSUMER_KEY || !process.env.GARMIN_CONSUMER_SECRET) {
  throw new Error('Missing required Garmin API credentials in environment variables');
}

export const GARMIN_CONFIG = {
    BASE_URL: 'https://connectapi.garmin.com',
    AUTH_URL: 'https://connect.garmin.com/oauthConfirm',
    REQUEST_TOKEN_URL: 'https://connectapi.garmin.com/oauth-service/oauth/request_token',
    ACCESS_TOKEN_URL: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
    USER_ID_URL: 'https://apis.garmin.com/wellness-api/rest/user/id',
    PERMISSIONS_URL: 'https://connectapi.garmin.com/oauth-service/oauth/user/permissions',
    CONSUMER_KEY: process.env.GARMIN_CONSUMER_KEY!,
    CONSUMER_SECRET: process.env.GARMIN_CONSUMER_SECRET!,
    
    // Health API Endpoints
    HEALTH_API: {
      DAILY_SUMMARY: 'https://apis.garmin.com/wellness-api/rest/dailies',
      EPOCHS: 'https://apis.garmin.com/wellness-api/rest/epochs',
      SLEEP: 'https://apis.garmin.com/wellness-api/rest/sleeps',
      BODY_COMP: 'https://apis.garmin.com/wellness-api/rest/bodyComps',
      STRESS: 'https://apis.garmin.com/wellness-api/rest/stressDetails',
      HEART_RATE: 'https://apis.garmin.com/wellness-api/rest/heartRates',
      PULSE_OX: 'https://apis.garmin.com/wellness-api/rest/pulseOx',
      RESPIRATION: 'https://apis.garmin.com/wellness-api/rest/respiration',
    },

    // Activity API Endpoints
    ACTIVITY_API: {
      ACTIVITIES: 'https://apis.garmin.com/activitylist-service/activities/search/activities',
      ACTIVITY_DETAILS: 'https://apis.garmin.com/activity-service/activity',
      ACTIVITY_TYPES: 'https://apis.garmin.com/activity-service/activity/types',
    },

    // Training API Endpoints
    TRAINING_API: {
      TRAINING_STATUS: 'https://apis.garmin.com/training-service/trainingStatus',
      TRAINING_LOAD: 'https://apis.garmin.com/training-service/trainingLoad',
      TRAINING_EFFECT: 'https://apis.garmin.com/training-service/trainingEffect',
      TRAINING_READINESS: 'https://apis.garmin.com/training-service/trainingReadiness',
    }
  };