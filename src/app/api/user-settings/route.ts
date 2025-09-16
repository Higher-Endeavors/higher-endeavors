import { type NextRequest, NextResponse } from "next/server";
import { getClient, SingleQuery } from "@/app/lib/dbAdapter";
import { auth } from "@/app/auth";
import { serverLogger } from '@/app/lib/logging/logger.server';

// GET endpoint to retrieve user settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = `
      SELECT * FROM user_settings 
      WHERE user_id = $1
    `;

    const result = await SingleQuery(query, [session.user.id]);

    if (result.rows.length === 0) {
      // If no settings exist, create default settings
      const insertQuery = `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        RETURNING *
      `;
      const newSettings = await SingleQuery(insertQuery, [session.user.id]);
      return NextResponse.json(mapDbSettingsToCanonical(newSettings.rows[0]));
    }

    return NextResponse.json(mapDbSettingsToCanonical(result.rows[0]));
  } catch (error) {
    await serverLogger.error('Error fetching user settings', error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// Map flat DB structure to canonical UserSettings structure
function mapDbSettingsToCanonical(db: any) {
  return {
    general: {
      heightUnit: db.height_unit,
      weightUnit: db.weight_unit,
      distanceUnit: db.distance_unit,
      temperatureUnit: db.temperature_unit,
      timeFormat: db.time_format,
      dateFormat: db.date_format,
      language: db.language,
      sidebarExpandMode: db.sidebar_expand_mode || 'hover',
      notificationsEmail: db.notifications_email,
      notificationsText: db.notifications_text,
      notificationsApp: db.notifications_app,
      garminConnect: db.garmin_connect_settings || undefined,
    },
    fitness: db.fitness_settings || {},
    health: db.health_settings || {},
    lifestyle: db.lifestyle_settings || {},
    nutrition: db.nutrition_settings || {},
  };
}

// Map canonical UserSettings (camelCase) to DB-ready snake_case
function mapCanonicalToDbSettings(settings: any) {
  const general = settings.general || {};
  return {
    height_unit: general.heightUnit,
    weight_unit: general.weightUnit,
    distance_unit: general.distanceUnit,
    temperature_unit: general.temperatureUnit,
    time_format: general.timeFormat,
    date_format: general.dateFormat,
    language: general.language,
    sidebar_expand_mode: general.sidebarExpandMode || 'hover',
    notifications_email: general.notificationsEmail,
    notifications_text: general.notificationsText,
    notifications_app: general.notificationsApp,
    garmin_connect_settings: general.garminConnect || null,
    fitness_settings: settings.fitness || {},
    health_settings: settings.health || {},
    lifestyle_settings: settings.lifestyle || {},
    nutrition_settings: settings.nutrition || {},
  };
}
