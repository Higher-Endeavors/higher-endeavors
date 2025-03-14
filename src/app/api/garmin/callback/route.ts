import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { garminOAuth } from '@/app/lib/utils/garmin/oauth';
import { saveGarminTokens } from '@/app/lib/utils/db/garmin';

export async function GET(request: Request) {
  try {
    // Get the user's session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');
    
    if (!sessionToken?.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Here you would validate the session token and get the user ID
    // using your existing authentication system
    const userId = ''; // TODO: Get this from your session management

    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange the request token for access token
    const tokens = await garminOAuth.getAccessToken(oauth_token, oauth_verifier);
    
    // Get the user's permissions from Garmin
    const permissions = await garminOAuth.getUserPermissions(tokens.accessToken);

    // Save tokens and permissions to database
    await saveGarminTokens(userId, tokens, permissions);

    // Redirect to success page
    return NextResponse.redirect(new URL('/garmin/success', request.url));
  } catch (error) {
    console.error('Error in Garmin callback:', error);
    return NextResponse.redirect(new URL('/garmin/error', request.url));
  }
} 