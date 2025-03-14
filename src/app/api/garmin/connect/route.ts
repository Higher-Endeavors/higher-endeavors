import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { garminOAuth, GARMIN_CONFIG } from '@/app/lib/utils/garmin';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request token
    const requestToken = await garminOAuth.getRequestToken();

    // Build the authorization URL
    const authUrl = new URL(GARMIN_CONFIG.AUTH_URL);
    authUrl.searchParams.set('oauth_token', requestToken.oauth_token);

    // Redirect to Garmin's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Garmin connection:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
} 