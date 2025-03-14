import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { garminOAuth } from '@/app/lib/utils/garmin';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const garminTokens = await garminOAuth.getUserGarminTokens(session.user.id);

    return NextResponse.json({
      isConnected: !!garminTokens,
      garminUserId: garminTokens?.garmin_user_id || null
    });
  } catch (error) {
    console.error('Error checking Garmin connection status:', error);
    return NextResponse.json(
      { error: 'Failed to check Garmin connection status' },
      { status: 500 }
    );
  }
} 