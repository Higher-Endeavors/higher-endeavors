'use server'

import { auth } from '@/app/auth';
import { getStravaConnection, syncStravaActivities, disconnectStrava } from '@/app/lib/strava';
import { redirect } from 'next/navigation';

export async function getStravaConnectionStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const connection = await getStravaConnection(parseInt(session.user.id));
    return {
      connected: !!connection,
      lastSync: connection?.last_sync_at || null,
      athleteId: connection?.strava_athlete_id || null,
    };
  } catch (error) {
    console.error('Error getting Strava connection status:', error);
    return {
      connected: false,
      lastSync: null,
      athleteId: null,
    };
  }
}

export async function syncStravaData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const activityCount = await syncStravaActivities(parseInt(session.user.id));
    return {
      success: true,
      activityCount,
      message: `Successfully synced ${activityCount} activities from Strava`,
    };
  } catch (error: any) {
    console.error('Error syncing Strava data:', error);
    return {
      success: false,
      activityCount: 0,
      message: error.message || 'Failed to sync Strava data',
    };
  }
}

export async function disconnectStravaAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await disconnectStrava(parseInt(session.user.id));
    return {
      success: true,
      message: 'Successfully disconnected Strava account',
    };
  } catch (error: any) {
    console.error('Error disconnecting Strava account:', error);
    return {
      success: false,
      message: error.message || 'Failed to disconnect Strava account',
    };
  }
}
