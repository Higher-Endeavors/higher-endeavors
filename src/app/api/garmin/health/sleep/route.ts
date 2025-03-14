import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { garminOAuth } from '@/app/lib/utils/garmin/oauth';
import { GARMIN_CONFIG } from '@/app/lib/utils/garmin/config';

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

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start time and end time are required' },
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

    // Fetch sleep data from Garmin
    const data = await garminOAuth.makeAuthenticatedRequest(tokens, {
      url: GARMIN_CONFIG.HEALTH_API.SLEEP,
      method: 'GET',
      params: {
        uploadStartTimeInSeconds: startTime,
        uploadEndTimeInSeconds: endTime,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Garmin sleep data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Garmin data' },
      { status: 500 }
    );
  }
} 