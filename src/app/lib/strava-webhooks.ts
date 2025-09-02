import { pool } from '@/app/lib/dbAdapter';

export interface StravaWebhookSubscription {
  strava_webhook_subscriptions_id: number;
  subscription_id: number;
  callback_url: string;
  verify_token: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a Strava webhook subscription
 */
export async function createStravaWebhookSubscription(callbackUrl: string, verifyToken: string) {
  const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      callback_url: callbackUrl,
      verify_token: verifyToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create webhook subscription: ${error}`);
  }

  const subscription = await response.json();
  return subscription;
}

/**
 * Get existing Strava webhook subscriptions
 */
export async function getStravaWebhookSubscriptions() {
  const response = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get webhook subscriptions: ${error}`);
  }

  return await response.json();
}

/**
 * Delete a Strava webhook subscription
 */
export async function deleteStravaWebhookSubscription(subscriptionId: number) {
  const response = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete webhook subscription: ${error}`);
  }

  return response.status === 204; // 204 No Content indicates success
}

/**
 * Store webhook subscription info in database
 */
export async function storeWebhookSubscription(subscriptionId: number, callbackUrl: string, verifyToken: string) {
  await pool.query(`
    INSERT INTO strava_webhook_subscriptions (subscription_id, callback_url, verify_token, created_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (subscription_id) 
    DO UPDATE SET 
      callback_url = EXCLUDED.callback_url,
      verify_token = EXCLUDED.verify_token,
      updated_at = CURRENT_TIMESTAMP
  `, [subscriptionId, callbackUrl, verifyToken]);
}

/**
 * Get webhook subscription from database
 */
export async function getWebhookSubscription() {
  const result = await pool.query(
    'SELECT * FROM strava_webhook_subscriptions ORDER BY created_at DESC LIMIT 1'
  );
  return result.rows[0] || null;
}

/**
 * Delete webhook subscription from database
 */
export async function deleteWebhookSubscription(subscriptionId: number) {
  await pool.query(
    'DELETE FROM strava_webhook_subscriptions WHERE subscription_id = $1',
    [subscriptionId]
  );
}

/**
 * Check if we're in development mode
 */
export function isDevelopmentMode() {
  return process.env.NODE_ENV === 'development' || process.env.AUTH_URL?.includes('localhost');
}

/**
 * Setup webhook subscription (create if not exists, or update if exists)
 */
export async function setupStravaWebhook() {
  try {
    // Check if we're in development mode
    if (isDevelopmentMode()) {
      throw new Error('Webhooks are disabled in development mode. Use manual sync for testing. Webhooks will be enabled in production.');
    }

    // Check if we already have a subscription
    const existingSubscriptions = await getStravaWebhookSubscriptions();
    
    if (existingSubscriptions.length > 0) {
      console.log('Existing webhook subscription found:', existingSubscriptions[0]);
      return existingSubscriptions[0];
    }

    // Create new subscription
    const callbackUrl = `${process.env.AUTH_URL}/api/strava/webhook`;
    const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'STRAVA_WEBHOOK_VERIFY';
    
    const subscription = await createStravaWebhookSubscription(callbackUrl, verifyToken);
    
    // Store in database
    await storeWebhookSubscription(subscription.id, callbackUrl, verifyToken);
    
    console.log('Created new webhook subscription:', subscription);
    return subscription;
    
  } catch (error) {
    console.error('Error setting up Strava webhook:', error);
    throw error;
  }
}
