import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user ID
    const userResult = await SingleQuery(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );
    
    const userId = userResult.rows[0]?.id;
    if (!userId) {
      await serverLogger.error('User ID not found for email', null, { email: session.user.email });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get current Garmin settings to extract access token
    const settingsResult = await SingleQuery(
      'SELECT garmin_connect_settings FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    const garminData = settingsResult.rows[0]?.garmin_connect_settings;
    
    if (garminData?.accessToken) {
      // Call Garmin API to delete user registration
      try {
        await fetch('https://apis.garmin.com/wellness-api/rest/user/registration', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${garminData.accessToken}`,
          },
        });
      } catch (error) {
        // Log error but continue with local disconnect
        await serverLogger.warn('Failed to delete Garmin registration', { error });
      }
    }
    
    // Remove Garmin connection data from user settings
    const disconnectedData = {
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      userId: null,
      permissions: null,
      lastSyncAt: null,
    };
    
    await SingleQuery(
      'UPDATE user_settings SET garmin_connect_settings = $1 WHERE user_id = $2',
      [JSON.stringify(disconnectedData), userId]
    );
    
    await serverLogger.info('Garmin Connect successfully disconnected', {
      userEmail: session.user.email
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    await serverLogger.error('Error disconnecting Garmin Connect', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
