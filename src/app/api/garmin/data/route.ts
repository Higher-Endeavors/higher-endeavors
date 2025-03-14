import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { garminOAuth } from '@/app/lib/utils/garmin/oauth';
import { GARMIN_CONFIG } from '@/app/lib/utils/garmin/config';

// Define supported data types
export type GarminDataType = 
  // Health data
  | 'dailySummary' 
  | 'epochs' 
  | 'sleep' 
  | 'bodyComp' 
  | 'stress' 
  | 'heartRate' 
  | 'pulseOx' 
  | 'respiration'
  // Activity data
  | 'activities'
  | 'activityDetails'
  | 'activityTypes'
  // Training data
  | 'trainingStatus'
  | 'trainingLoad'
  | 'trainingEffect'
  | 'trainingReadiness';

// Map data types to their API endpoints
const dataTypeToEndpoint: Record<GarminDataType, string> = {
  // Health data
  dailySummary: GARMIN_CONFIG.HEALTH_API.DAILY_SUMMARY,
  epochs: GARMIN_CONFIG.HEALTH_API.EPOCHS,
  sleep: GARMIN_CONFIG.HEALTH_API.SLEEP,
  bodyComp: GARMIN_CONFIG.HEALTH_API.BODY_COMP,
  stress: GARMIN_CONFIG.HEALTH_API.STRESS,
  heartRate: GARMIN_CONFIG.HEALTH_API.HEART_RATE,
  pulseOx: GARMIN_CONFIG.HEALTH_API.PULSE_OX,
  respiration: GARMIN_CONFIG.HEALTH_API.RESPIRATION,
  // Activity data
  activities: GARMIN_CONFIG.ACTIVITY_API.ACTIVITIES,
  activityDetails: GARMIN_CONFIG.ACTIVITY_API.ACTIVITY_DETAILS,
  activityTypes: GARMIN_CONFIG.ACTIVITY_API.ACTIVITY_TYPES,
  // Training data
  trainingStatus: GARMIN_CONFIG.TRAINING_API.TRAINING_STATUS,
  trainingLoad: GARMIN_CONFIG.TRAINING_API.TRAINING_LOAD,
  trainingEffect: GARMIN_CONFIG.TRAINING_API.TRAINING_EFFECT,
  trainingReadiness: GARMIN_CONFIG.TRAINING_API.TRAINING_READINESS,
};

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const dataTypes = searchParams.get('dataTypes')?.split(',') as GarminDataType[];

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start time and end time are required' },
        { status: 400 }
      );
    }

    if (!dataTypes || dataTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one data type must be specified' },
        { status: 400 }
      );
    }

    // Validate data types
    const invalidDataTypes = dataTypes.filter(type => !dataTypeToEndpoint[type]);
    if (invalidDataTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid data types: ${invalidDataTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user's Garmin tokens
    const tokens = await garminOAuth.getUserGarminTokens(session.user.id);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Garmin account not connected' },
        { status: 404 }
      );
    }

    // Fetch all requested data types in parallel
    const results = await Promise.all(
      dataTypes.map(async (dataType) => {
        try {
          const data = await garminOAuth.makeAuthenticatedRequest(tokens, {
            url: dataTypeToEndpoint[dataType],
            method: 'GET',
            params: {
              uploadStartTimeInSeconds: startTime,
              uploadEndTimeInSeconds: endTime,
            },
          });
          return { type: dataType, data, status: 'success' };
        } catch (error) {
          console.error(`Error fetching ${dataType} data:`, error);
          return { type: dataType, error: 'Failed to fetch data', status: 'error' };
        }
      })
    );

    // Organize results by data type
    const response = results.reduce((acc, result) => {
      acc[result.type] = result;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Garmin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Garmin data' },
      { status: 500 }
    );
  }
} 