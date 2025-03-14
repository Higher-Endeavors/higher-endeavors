import { NextResponse } from 'next/server';
import { garminOAuth, GARMIN_CONFIG } from '@/app/lib/utils/garmin';

export async function GET() {
  try {
    const requestToken = await garminOAuth.getRequestToken();
    
    // Store the request token secret in session/database for later use
    // ... (implement storage logic)

    // Redirect to Garmin's authorization page
    const authUrl = `${GARMIN_CONFIG.AUTH_URL}?oauth_token=${requestToken.oauth_token}`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Garmin OAuth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}