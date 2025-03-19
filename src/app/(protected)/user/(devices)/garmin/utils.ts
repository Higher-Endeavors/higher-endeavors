import { SingleQuery } from '@/app/lib/dbAdapter';

export async function getGarminConnection(userId: string | number) {
  const result = await SingleQuery(
    'SELECT garmin_user_id, oauth_token, oauth_token_secret FROM user_garmin_tokens WHERE user_id = $1',
    [userId]
  );
  
  return result.rows[0] || null;
}