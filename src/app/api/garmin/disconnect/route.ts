import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the user's Garmin tokens
    await SingleQuery(
      'DELETE FROM user_garmin_tokens WHERE user_id = $1',
      [session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Garmin:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect from Garmin' },
      { status: 500 }
    );
  }
}
