'use server';

import { auth } from '@/app/auth';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { UserSettings, UserSettingsSchema } from '@/app/lib/types/userSettings.zod';

// --- Server Actions ---
export async function getUserSettings(): Promise<UserSettings | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const query = 'SELECT * FROM user_settings WHERE user_id = $1';
  const result = await SingleQuery(query, [session.user.id]);
  if (result.rows.length === 0) return null;
  const db = result.rows[0];
  return {
    general: {
      heightUnit: db.height_unit,
      weightUnit: db.weight_unit,
      temperatureUnit: db.temperature_unit,
      timeFormat: db.time_format,
      dateFormat: db.date_format,
      language: db.language,
      sidebarExpandMode: db.sidebar_expand_mode,
      notificationsEmail: db.notifications_email,
      notificationsText: db.notifications_text,
      notificationsApp: db.notifications_app,
    },
    fitness: db.fitness_settings,
    health: db.health_settings,
    lifestyle: db.lifestyle_settings,
    nutrition: db.nutrition_settings,
  };
}

export async function updateUserSettings(data: Partial<UserSettings>): Promise<UserSettings> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  // Validate input (partial)
  const parsed = UserSettingsSchema.partial().safeParse(data);
  if (!parsed.success) throw new Error('Invalid user settings');
  // Fetch current settings
  const query = 'SELECT * FROM user_settings WHERE user_id = $1';
  const result = await SingleQuery(query, [session.user.id]);
  const current = result.rows[0] || {};
  // Merge updates
  const merged = { ...{
    general: {
      heightUnit: current.height_unit,
      weightUnit: current.weight_unit,
      temperatureUnit: current.temperature_unit,
      timeFormat: current.time_format,
      dateFormat: current.date_format,
      language: current.language,
      notificationsEmail: current.notifications_email,
      notificationsText: current.notifications_text,
      notificationsApp: current.notifications_app,
      sidebarExpandMode: current.sidebar_expand_mode,
    },
    fitness: current.fitness_settings,
    health: current.health_settings,
    lifestyle: current.lifestyle_settings,
    nutrition: current.nutrition_settings,
  }, ...parsed.data };
  // Prepare DB fields
  const g = merged.general;
  const values = [
    session.user.id,
    g.heightUnit,
    g.weightUnit,
    g.temperatureUnit,
    g.timeFormat,
    g.dateFormat,
    g.language,
    g.notificationsEmail,
    g.notificationsText,
    g.notificationsApp,
    JSON.stringify(merged.fitness),
    JSON.stringify(merged.health),
    JSON.stringify(merged.lifestyle),
    JSON.stringify(merged.nutrition),
  ];
  const updateQuery = `
    INSERT INTO user_settings (
      user_id, height_unit, weight_unit, temperature_unit, time_format, date_format, language,
      notifications_email, notifications_text, notifications_app,
      fitness_settings, health_settings, lifestyle_settings, nutrition_settings, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      height_unit = EXCLUDED.height_unit,
      weight_unit = EXCLUDED.weight_unit,
      temperature_unit = EXCLUDED.temperature_unit,
      time_format = EXCLUDED.time_format,
      date_format = EXCLUDED.date_format,
      language = EXCLUDED.language,
      notifications_email = EXCLUDED.notifications_email,
      notifications_text = EXCLUDED.notifications_text,
      notifications_app = EXCLUDED.notifications_app,
      fitness_settings = EXCLUDED.fitness_settings,
      health_settings = EXCLUDED.health_settings,
      lifestyle_settings = EXCLUDED.lifestyle_settings,
      nutrition_settings = EXCLUDED.nutrition_settings,
      updated_at = NOW()
    RETURNING *
  `;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await client.query(updateQuery, values);
    await client.query('COMMIT');
    const db = result.rows[0];
    return {
      general: {
        heightUnit: db.height_unit,
        weightUnit: db.weight_unit,
        temperatureUnit: db.temperature_unit,
        timeFormat: db.time_format,
        dateFormat: db.date_format,
        language: db.language,
        notificationsEmail: db.notifications_email,
        notificationsText: db.notifications_text,
        notificationsApp: db.notifications_app,
        sidebarExpandMode: db.sidebar_expand_mode,
      },
      fitness: db.fitness_settings,
      health: db.health_settings,
      lifestyle: db.lifestyle_settings,
      nutrition: db.nutrition_settings,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    await serverLogger.error('Failed to update user settings', error, { userId: session.user.id });
    throw error;
  } finally {
    client.release();
  }
} 