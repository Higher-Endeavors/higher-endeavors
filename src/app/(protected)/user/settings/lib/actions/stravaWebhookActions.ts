'use server'

import { auth } from '@/app/auth';
import { setupStravaWebhook, getWebhookSubscription, deleteStravaWebhookSubscription, deleteWebhookSubscription, isDevelopmentMode } from '@/app/lib/strava-webhooks';

export async function setupStravaWebhookSubscription() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const subscription = await setupStravaWebhook();
    return {
      success: true,
      subscription,
      message: 'Webhook subscription setup successfully',
    };
  } catch (error: any) {
    console.error('Error setting up webhook subscription:', error);
    return {
      success: false,
      subscription: null,
      message: error.message || 'Failed to setup webhook subscription',
    };
  }
}

export async function getStravaWebhookStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const subscription = await getWebhookSubscription();
    return {
      success: true,
      subscription,
      message: subscription ? 'Webhook subscription active' : 'No webhook subscription found',
    };
  } catch (error: any) {
    console.error('Error getting webhook status:', error);
    return {
      success: false,
      subscription: null,
      message: error.message || 'Failed to get webhook status',
    };
  }
}

export async function deleteStravaWebhookSubscriptionAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const subscription = await getWebhookSubscription();
    if (!subscription) {
      return {
        success: false,
        message: 'No webhook subscription found to delete',
      };
    }

    // Delete from Strava
    await deleteStravaWebhookSubscription(subscription.subscription_id);
    
    // Delete from database
    await deleteWebhookSubscription(subscription.subscription_id);

    return {
      success: true,
      message: 'Webhook subscription deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting webhook subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete webhook subscription',
    };
  }
}

export async function getEnvironmentMode() {
  return {
    isDevelopment: isDevelopmentMode(),
  };
}
