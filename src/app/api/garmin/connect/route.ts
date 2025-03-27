import { NextRequest, NextResponse } from 'next/server';
import { grantAdapter } from '@/app/lib/utils/grant-adapter';
import { grantConfig } from '@/app/lib/utils/garmin/grantConfig';

export async function GET(request: NextRequest) {
  try {
    // Initialize the Grant OAuth flow
    const grantSession = await grantAdapter(
      request, 
      NextResponse.next(), 
      grantConfig
    );
    
    // Grant will handle redirecting to the authorization URL
    // The flow will continue when the user is redirected back to the callback URL
    return NextResponse.redirect(grantSession.redirect);
  } catch (error) {
    console.error('Error initiating Garmin OAuth:', error);
    return NextResponse.redirect(new URL('/user/garmin?error=oauth_failed', request.url));
  }
}