import { NextResponse } from 'next/server';
import { deleteGarminTokens, updateGarminPermissions } from '@/app/lib/utils/db/garmin';

// Types for webhook payloads
interface DeregistrationPayload {
  deregistrations: Array<{
    userId: string;
    userAccessToken: string;
  }>;
}

interface PermissionChangePayload {
  permissionChanges: Array<{
    userId: string;
    scope: string[];
  }>;
}

async function handleDeregistrations(payload: DeregistrationPayload) {
  const promises = payload.deregistrations.map(async (deregistration) => {
    try {
      await deleteGarminTokens(deregistration.userId);
      console.log(`Successfully deregistered Garmin user: ${deregistration.userId}`);
    } catch (error) {
      console.error(`Error deregistering Garmin user ${deregistration.userId}:`, error);
    }
  });

  await Promise.all(promises);
}

async function handlePermissionChanges(payload: PermissionChangePayload) {
  const promises = payload.permissionChanges.map(async (change) => {
    try {
      await updateGarminPermissions(change.userId, change.scope);
      console.log(`Successfully updated permissions for Garmin user: ${change.userId}`);
    } catch (error) {
      console.error(`Error updating permissions for Garmin user ${change.userId}:`, error);
    }
  });

  await Promise.all(promises);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Handle deregistrations
    if ('deregistrations' in payload) {
      await handleDeregistrations(payload as DeregistrationPayload);
    }

    // Handle permission changes
    if ('permissionChanges' in payload) {
      await handlePermissionChanges(payload as PermissionChangePayload);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Garmin webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 