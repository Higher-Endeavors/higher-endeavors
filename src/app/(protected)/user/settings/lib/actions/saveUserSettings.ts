'use server';

import { getClient } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';
import type { UserSettings } from 'lib/types/userSettings.zod';

interface SaveUserSettingsInput {
  settings: UserSettings;
}

export async function saveUserSettings({ settings }: SaveUserSettingsInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  const userId = session.user.id;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO user_settings (
        user_id, height_unit, weight_unit, distance_unit, temperature_unit, time_format, date_format, language, sidebar_expand_mode,
        notifications_email, notifications_text, notifications_app,
        fitness_settings, health_settings, lifestyle_settings, nutrition_settings
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (user_id) DO UPDATE SET
        height_unit = EXCLUDED.height_unit,
        weight_unit = EXCLUDED.weight_unit,
        distance_unit = EXCLUDED.distance_unit,
        temperature_unit = EXCLUDED.temperature_unit,
        time_format = EXCLUDED.time_format,
        date_format = EXCLUDED.date_format,
        language = EXCLUDED.language,
        sidebar_expand_mode = EXCLUDED.sidebar_expand_mode,
        notifications_email = EXCLUDED.notifications_email,
        notifications_text = EXCLUDED.notifications_text,
        notifications_app = EXCLUDED.notifications_app,
        fitness_settings = EXCLUDED.fitness_settings,
        health_settings = EXCLUDED.health_settings,
        lifestyle_settings = EXCLUDED.lifestyle_settings,
        nutrition_settings = EXCLUDED.nutrition_settings,
        updated_at = now()
      `,
      [
        userId,
        settings.general.heightUnit,
        settings.general.weightUnit,
        settings.general.distanceUnit,
        settings.general.temperatureUnit,
        settings.general.timeFormat,
        settings.general.dateFormat,
        settings.general.language,
        settings.general.sidebarExpandMode,
        settings.general.notificationsEmail,
        settings.general.notificationsText,
        settings.general.notificationsApp,
        JSON.stringify(settings.fitness),
        JSON.stringify(settings.health),
        JSON.stringify(settings.lifestyle),
        JSON.stringify(settings.nutrition)
      ]
    );
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    await serverLogger.error('Failed to save user settings', error, { userId });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    client.release();
  }
}
// TODO: Add validation and schema enforcement for settings 