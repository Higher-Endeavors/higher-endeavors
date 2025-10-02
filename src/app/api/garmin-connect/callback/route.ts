import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';
import { getApiBaseUrl } from 'lib/utils/apiUtils';

const GARMIN_CONNECT_CLIENT_ID = process.env.GARMIN_CONNECT_CLIENT_ID;
const GARMIN_CONNECT_CLIENT_SECRET = process.env.GARMIN_CONNECT_CLIENT_SECRET;
const GARMIN_CONNECT_REDIRECT_URI = process.env.GARMIN_CONNECT_REDIRECT_URI;

if (!GARMIN_CONNECT_CLIENT_ID || !GARMIN_CONNECT_CLIENT_SECRET || !GARMIN_CONNECT_REDIRECT_URI) {
  throw new Error('Garmin OAuth credentials not configured');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      await serverLogger.error('Garmin OAuth error', { error, state });
      return NextResponse.redirect(new URL('/user/settings?garmin_error=' + encodeURIComponent(error), request.url));
    }
    
    if (!code || !state) {
      await serverLogger.error('Missing code or state in Garmin OAuth callback');
      return NextResponse.redirect(new URL('/user/settings?garmin_error=missing_parameters', request.url));
    }
    
    // Decode state to get PKCE parameters
    let stateData;
    try {
      const decodedState = Buffer.from(state, 'base64url').toString('utf-8');
      stateData = JSON.parse(decodedState);
    } catch (error) {
      await serverLogger.error('Invalid state parameter in Garmin OAuth callback', error);
      return NextResponse.redirect(new URL('/user/settings?garmin_error=invalid_state', request.url));
    }
    
    const { codeVerifier, userEmail } = stateData;
    
    // Verify the user is still authenticated
    const session = await auth();
    if (!session?.user?.email || session.user.email !== userEmail) {
      await serverLogger.error('User authentication mismatch in Garmin OAuth callback');
      return NextResponse.redirect(new URL('/user/settings?garmin_error=auth_mismatch', request.url));
    }
    
    // Exchange authorization code for access token
    const apiBaseUrl = await getApiBaseUrl();
    const garminRedirectUri = `${apiBaseUrl}${GARMIN_CONNECT_REDIRECT_URI}`;
    const tokenResponse = await fetch('https://diauth.garmin.com/di-oauth2-service/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: GARMIN_CONNECT_CLIENT_ID!,
        client_secret: GARMIN_CONNECT_CLIENT_SECRET!,
        code: code,
        code_verifier: codeVerifier as string,
        redirect_uri: garminRedirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      await serverLogger.error('Garmin token exchange failed', { 
        status: tokenResponse.status, 
        error: errorText 
      });
      return NextResponse.redirect(new URL('/user/settings?garmin_error=token_exchange_failed', request.url));
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get user ID from Garmin
    const userResponse = await fetch('https://apis.garmin.com/wellness-api/rest/user/id', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      await serverLogger.error('Failed to fetch Garmin user ID');
      return NextResponse.redirect(new URL('/user/settings?garmin_error=user_id_failed', request.url));
    }
    
    const userData = await userResponse.json();
    
    // Get user permissions
    const permissionsResponse = await fetch('https://apis.garmin.com/wellness-api/rest/user/permissions', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    let permissions = [];
    if (permissionsResponse.ok) {
      permissions = await permissionsResponse.json();
    }
    
    // Get internal user ID
    const userResult = await SingleQuery(
      'SELECT id FROM users WHERE email = $1',
      [userEmail]
    );
    
    const userId = userResult.rows[0]?.id;
    if (!userId) {
      await serverLogger.error('User ID not found for email', null, { email: userEmail });
      return NextResponse.redirect(new URL('/user/settings?garmin_error=user_not_found', request.url));
    }
    
    // Store Garmin connection data in user settings
    const garminData = {
      isConnected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: Date.now() + (tokenData.expires_in * 1000),
      refreshTokenExpiresAt: Date.now() + (tokenData.refresh_token_expires_in * 1000),
      userId: userData.userId,
      permissions: permissions,
      lastSyncAt: Date.now(),
    };
    
    // Update user settings with Garmin data
    await SingleQuery(
      `UPDATE user_settings 
       SET garmin_connect_settings = $1
       WHERE user_id = $2`,
      [JSON.stringify(garminData), userId]
    );
    
    await serverLogger.info('Garmin Connect successfully linked', {
      userEmail,
      garminUserId: userData.userId,
      permissions
    });
    
    return NextResponse.redirect(new URL('/user/settings?garmin_success=true', request.url));
    
  } catch (error) {
    await serverLogger.error('Error in Garmin OAuth callback', error);
    return NextResponse.redirect(new URL('/user/settings?garmin_error=callback_error', request.url));
  }
}
