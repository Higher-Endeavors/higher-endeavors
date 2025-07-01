'use server';

import { auth } from '@/app/auth';
import { SingleQuery, getClient } from '@/app/lib/dbAdapter';
import { UserSettingsSchema, type UserSettings } from '@/app/lib/types/userSettings.zod';

// --- Canonical mapping logic (copied from API route) ---
function mapDbSettingsToCanonical(db: any): UserSettings {
  function ensureArray(val: any): any[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return [];
  }
  let pillarSettings = db.pillar_settings;
  while (typeof pillarSettings === 'string') {
    try { pillarSettings = JSON.parse(pillarSettings); } catch { pillarSettings = {}; break; }
  }
  pillarSettings = pillarSettings || {};
  const health = {
    ...pillarSettings.health,
    circumferenceMeasurements: ensureArray(pillarSettings.health?.circumferenceMeasurements),
    bodyFatMethods: ensureArray(pillarSettings.health?.bodyFatMethods),
    trackingPreferences: ensureArray(pillarSettings.health?.trackingPreferences),
    circumferenceUnit: pillarSettings.health?.circumferenceUnit || 'in',
  };
  const nutrition = {
    ...pillarSettings.nutrition,
    foodAllergies: ensureArray(pillarSettings.nutrition?.foodAllergies),
    dietaryStyles: ensureArray(pillarSettings.nutrition?.dietaryStyles),
    customMealSchedules: ensureArray(pillarSettings.nutrition?.customMealSchedules),
    scheduleAssignments: pillarSettings.nutrition?.scheduleAssignments || {},
    macronutrientTargets: pillarSettings.nutrition?.macronutrientTargets || { protein: 0, carbs: 0, fat: 0 },
    defaultMealSchedule: pillarSettings.nutrition?.defaultMealSchedule || {
      id: 'default', name: 'Default', meals: [], nutrientDistribution: { mode: 'even' },
    },
  };
  const lifestyle = {
    ...pillarSettings.lifestyle,
    deviceIntegration: pillarSettings.lifestyle?.deviceIntegration || { enabled: false, devices: [] },
  };
  const fitness = {
    ...pillarSettings.fitness,
    resistanceTraining: pillarSettings.fitness?.resistanceTraining || {
      loadUnit: 'lbs', trackRPE: false, trackRIR: false, availableEquipment: [], rpeScale: '0-10',
    },
    cardioMetabolic: pillarSettings.fitness?.cardioMetabolic || { speedUnit: 'mph' },
  };
  return {
    general: {
      heightUnit: db.height_unit === 'imperial' ? 'ft_in' : db.height_unit === 'metric' ? 'cm' : db.height_unit,
      weightUnit: db.weight_unit,
      temperatureUnit: db.temperature_unit,
      timeFormat: db.time_format,
      dateFormat: db.date_format,
      language: db.language,
      notifications: [
        ...(db.notifications_email ? ['email'] : []),
        ...(db.notifications_text ? ['text'] : []),
        ...(db.notifications_app ? ['app'] : []),
      ],
    },
    health, nutrition, lifestyle, fitness,
  } as UserSettings;
}

// --- Server Actions ---
export async function getUserSettings(): Promise<UserSettings | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const query = 'SELECT * FROM user_settings WHERE user_id = $1';
  const result = await SingleQuery(query, [session.user.id]);
  if (result.rows.length === 0) return null;
  return mapDbSettingsToCanonical(result.rows[0]);
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
  const merged = { ...mapDbSettingsToCanonical(current), ...parsed.data };
  // Prepare DB fields (flatten)
  const general = merged.general;
  const notifications_email = general.notifications?.includes('email') ?? true;
  const notifications_text = general.notifications?.includes('text') ?? false;
  const notifications_app = general.notifications?.includes('app') ?? false;
  const height_unit = general.heightUnit === 'ft_in' ? 'imperial' : general.heightUnit === 'cm' ? 'metric' : general.heightUnit;
  const values = [
    session.user.id,
    height_unit,
    general.weightUnit,
    general.temperatureUnit,
    general.timeFormat,
    general.dateFormat,
    general.language,
    notifications_email,
    notifications_text,
    notifications_app,
    JSON.stringify({
      health: merged.health,
      nutrition: merged.nutrition,
      lifestyle: merged.lifestyle,
      fitness: merged.fitness,
    }),
  ];
  const updateQuery = `
    INSERT INTO user_settings (
      user_id, height_unit, weight_unit, temperature_unit, time_format, date_format, language,
      notifications_email, notifications_text, notifications_app, pillar_settings, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
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
      pillar_settings = EXCLUDED.pillar_settings,
      updated_at = NOW()
    RETURNING *
  `;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await client.query(updateQuery, values);
    await client.query('COMMIT');
    // Optionally: revalidate cache here (if using Next.js revalidatePath or similar)
    return mapDbSettingsToCanonical(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} 