import { type NextRequest, NextResponse } from "next/server";
import { getClient, SingleQuery } from "@/app/lib/dbAdapter";
import { auth } from "@/app/auth";

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
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update user settings
export async function PUT(request: NextRequest) {
  const client = await getClient();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await request.json();
    const dbSettings = mapCanonicalToDbSettings(settings);

    await client.query("BEGIN");

    const updateQuery = `
      INSERT INTO user_settings (
        user_id,
        height_unit,
        weight_unit,
        temperature_unit,
        time_format,
        date_format,
        language,
        sidebar_expand_mode,
        notifications_email,
        notifications_text,
        notifications_app,
        fitness_settings,
        health_settings,
        lifestyle_settings,
        nutrition_settings,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        height_unit = EXCLUDED.height_unit,
        weight_unit = EXCLUDED.weight_unit,
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
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      session.user.id,
      dbSettings.height_unit || "imperial",
      dbSettings.weight_unit || "lbs",
      dbSettings.temperature_unit || "F",
      dbSettings.time_format || "12h",
      dbSettings.date_format || "MM/DD/YYYY",
      dbSettings.language || "en",
      dbSettings.sidebar_expand_mode || "hover",
      dbSettings.notifications_email ?? true,
      dbSettings.notifications_text ?? false,
      dbSettings.notifications_app ?? false,
      JSON.stringify(dbSettings.fitness_settings),
      JSON.stringify(dbSettings.health_settings),
      JSON.stringify(dbSettings.lifestyle_settings),
      JSON.stringify(dbSettings.nutrition_settings),
    ];

    const result = await client.query(updateQuery, values);
    await client.query("COMMIT");

    return NextResponse.json(mapDbSettingsToCanonical(result.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Map flat DB structure to canonical UserSettings structure
function mapDbSettingsToCanonical(db: any) {
  return {
    general: {
      heightUnit: db.height_unit,
      weightUnit: db.weight_unit,
      temperatureUnit: db.temperature_unit,
      timeFormat: db.time_format,
      dateFormat: db.date_format,
      language: db.language,
      sidebarExpandMode: db.sidebar_expand_mode || 'hover',
      notificationsEmail: db.notifications_email,
      notificationsText: db.notifications_text,
      notificationsApp: db.notifications_app,
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
    temperature_unit: general.temperatureUnit,
    time_format: general.timeFormat,
    date_format: general.dateFormat,
    language: general.language,
    sidebar_expand_mode: general.sidebarExpandMode || 'hover',
    notifications_email: general.notificationsEmail,
    notifications_text: general.notificationsText,
    notifications_app: general.notificationsApp,
    fitness_settings: settings.fitness || {},
    health_settings: settings.health || {},
    lifestyle_settings: settings.lifestyle || {},
    nutrition_settings: settings.nutrition || {},
  };
}
