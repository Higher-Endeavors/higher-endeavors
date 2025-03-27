import { GARMIN_CONFIG } from './config';

export const grantConfig = {
  defaults: {
    origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    transport: 'session',
    state: true
  },
  garmin: {
    // OAuth 1.0a configuration
    request_url: GARMIN_CONFIG.REQUEST_TOKEN_URL,
    authorize_url: GARMIN_CONFIG.AUTH_URL,
    access_url: GARMIN_CONFIG.ACCESS_TOKEN_URL,
    oauth: 1, // Use OAuth 1.0a
    key: GARMIN_CONFIG.CONSUMER_KEY,
    secret: GARMIN_CONFIG.CONSUMER_SECRET,
    callback: '/api/garmin/callback',
    custom_params: {
      // Add any Garmin-specific parameters needed
    }
  }
};