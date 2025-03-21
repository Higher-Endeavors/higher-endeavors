import { NextResponse } from 'next/server';
import { garminOAuth } from '@/app/lib/utils/garmin/oauth';
import { GARMIN_CONFIG } from '@/app/lib/utils/garmin/config';

export async function GET(request: Request) {
  try {
    // Get the base URL from the current request
    const baseUrl = new URL(request.url).origin;
    
    // Construct callback URL dynamically
    const callbackUrl = `${baseUrl}/api/garmin/callback`;
    console.log("Using callback URL:", callbackUrl);
    
    const tokenResponse = await garminOAuth.getRequestToken(callbackUrl);
    
    // Create authorization URL with the token
    const authUrl = `${GARMIN_CONFIG.AUTH_URL}?oauth_token=${tokenResponse.oauth_token}`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Garmin OAuth:', error);
    return NextResponse.redirect(new URL('/user/garmin?error=oauth_failed', request.url));
  }
}