import { sql } from '@vercel/postgres';
import { GarminTokens } from '../garmin/types';

export interface GarminUserTokens extends GarminTokens {
  permissions: string[];
  updated_at: Date;
}

export async function saveGarminTokens(userId: string, tokens: GarminTokens, permissions: string[] = []) {
  const result = await sql`
    INSERT INTO user_garmin_tokens (
      user_id, 
      access_token, 
      refresh_token, 
      garmin_user_id,
      permissions
    ) 
    VALUES (
      ${userId}, 
      ${tokens.accessToken}, 
      ${tokens.refreshToken}, 
      ${tokens.garminUserId},
      ${JSON.stringify(permissions)}::jsonb
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      garmin_user_id = EXCLUDED.garmin_user_id,
      permissions = EXCLUDED.permissions,
      updated_at = NOW()
    RETURNING *;
  `;
  return result.rows[0] as GarminUserTokens;
}

export async function getGarminTokens(userId: string): Promise<GarminUserTokens | null> {
  const result = await sql`
    SELECT 
      user_id as "userId",
      access_token as "accessToken",
      refresh_token as "refreshToken",
      garmin_user_id as "garminUserId",
      permissions,
      updated_at as "updatedAt"
    FROM user_garmin_tokens 
    WHERE user_id = ${userId};
  `;
  return result.rows[0] || null;
}

export async function updateGarminPermissions(userId: string, permissions: string[]) {
  const result = await sql`
    UPDATE user_garmin_tokens
    SET 
      permissions = ${JSON.stringify(permissions)}::jsonb,
      updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING *;
  `;
  return result.rows[0] as GarminUserTokens;
}

export async function deleteGarminTokens(userId: string) {
  await sql`
    DELETE FROM user_garmin_tokens 
    WHERE user_id = ${userId};
  `;
}

export async function getUsersByPermission(permission: string) {
  const result = await sql`
    SELECT 
      user_id as "userId",
      access_token as "accessToken",
      refresh_token as "refreshToken",
      garmin_user_id as "garminUserId",
      permissions,
      updated_at as "updatedAt"
    FROM user_garmin_tokens 
    WHERE permissions @> ${JSON.stringify([permission])}::jsonb;
  `;
  return result.rows as GarminUserTokens[];
} 