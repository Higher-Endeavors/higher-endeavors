import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';
import crypto from 'crypto';
import { getApiBaseUrl } from 'lib/utils/apiUtils';

// Garmin OAuth2 PKCE Configuration
const GARMIN_CONNECT_CLIENT_ID = process.env.GARMIN_CONNECT_CLIENT_ID;
const GARMIN_CONNECT_CLIENT_SECRET = process.env.GARMIN_CONNECT_CLIENT_SECRET;
const GARMIN_CONNECT_REDIRECT_URI = process.env.GARMIN_CONNECT_REDIRECT_URI;

if (!GARMIN_CONNECT_CLIENT_ID || !GARMIN_CONNECT_CLIENT_SECRET) {
  throw new Error('Garmin OAuth credentials not configured');
}

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();
    
    // Generate state parameter for security
    const state = crypto.randomBytes(16).toString('base64url');
    
    // Store PKCE parameters in session or database for later use
    // For now, we'll encode them in the state parameter
    const stateData = {
      codeVerifier,
      state,
      userEmail: session.user.email,
      timestamp: Date.now()
    };
    
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    
    // Build authorization URL
    const apiBaseUrl = await getApiBaseUrl();
    const garminRedirectUri = `${apiBaseUrl}${GARMIN_CONNECT_REDIRECT_URI}`;
    const authUrl = new URL('https://connect.garmin.com/oauth2Confirm');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', GARMIN_CONNECT_CLIENT_ID!);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('redirect_uri', garminRedirectUri);
    authUrl.searchParams.set('state', encodedState);
    
    await serverLogger.info('Garmin OAuth authorization initiated', {
      userEmail: session.user.email,
      authUrl: authUrl.toString()
    });
    
    return NextResponse.json({ 
      authUrl: authUrl.toString(),
      state: encodedState 
    });
    
  } catch (error) {
    await serverLogger.error('Error initiating Garmin OAuth', error);
    return NextResponse.json({ error: 'Failed to initiate authorization' }, { status: 500 });
  }
}
