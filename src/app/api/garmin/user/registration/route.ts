import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function DELETE(request: Request) {
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

    // Return 204 as specified in documentation
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 