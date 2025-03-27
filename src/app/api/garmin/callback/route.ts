import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { grantAdapter } from '@/app/lib/utils/grant-adapter';
import { grantConfig } from '@/app/lib/utils/garmin/grantConfig';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Let Grant handle the OAuth callback
    const grantSession = await grantAdapter(
      request, 
      NextResponse.next(), 
      grantConfig
    );

    // grantSession will contain the tokens from Garmin
    const { access_token, access_secret, raw } = grantSession;
    
    // Get the Garmin user ID
    const garminUserId = raw.user_id || ''; // Adjust this based on how Grant returns the user ID
    
    // Save tokens to database (similar to your existing code)
    await SingleQuery(
      `INSERT INTO user_garmin_tokens 
        (user_id, garmin_user_id, oauth_token, oauth_token_secret) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE 
        SET garmin_user_id = $2, 
            oauth_token = $3, 
            oauth_token_secret = $4,
            updated_at = NOW()`,
      [session.user.id, garminUserId, access_token, access_secret]
    );

    // Redirect to success page
    return NextResponse.redirect(new URL('/user/devices?status=connected', request.url));
  } catch (error) {
    console.error('Error in Garmin callback:', error);
    return NextResponse.redirect(new URL('/user/devices?error=connection_failed', request.url));
  }
}