import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { garminOAuth } from '@/app/lib/utils/garmin/oauth';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
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

    // Save tokens to database
    await SingleQuery(
      `INSERT INTO user_garmin_tokens 
        (user_id, garmin_user_id, oauth_token, oauth_token_secret) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE 
        SET garmin_user_id = $2, 
            oauth_token = $3, 
            oauth_token_secret = $4,
            updated_at = NOW()`,
      [session.user.id, tokens.userId, tokens.oauth_token, tokens.oauth_token_secret]
    );

    // Redirect to success page
    return NextResponse.redirect(new URL('/user/devices?status=connected', request.url));
  } catch (error) {
    console.error('Error in Garmin callback:', error);
    return NextResponse.redirect(new URL('/user/devices?error=connection_failed', request.url));
  }
} 