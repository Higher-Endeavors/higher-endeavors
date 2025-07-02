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
      return NextResponse.json(newSettings.rows[0]);
    }

    return NextResponse.json(result.rows[0]);
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

    await client.query("BEGIN");

    // Extract general and pillar settings from canonical UserSettings structure
    const general = settings.general || {};
    const fitness = settings.fitness || {};
    const health = settings.health || {};
    const lifestyle = settings.lifestyle || {};
    const nutrition = settings.nutrition || {};

    const updateQuery = `
      INSERT INTO user_settings (
        user_id,
        height_unit,
        weight_unit,
        temperature_unit,
        time_format,
        date_format,
        language,
        notifications_email,
        notifications_text,
        notifications_app,
        fitness_settings,
        health_settings,
        lifestyle_settings,
        nutrition_settings,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
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

    const values = [
      session.user.id,
      general.heightUnit || "imperial",
      general.weightUnit || "lbs",
      general.temperatureUnit || "F",
      general.timeFormat || "12h",
      general.dateFormat || "MM/DD/YYYY",
      general.language || "en",
      general.notifications_email ?? true,
      general.notifications_text ?? false,
      general.notifications_app ?? false,
      JSON.stringify(fitness),
      JSON.stringify(health),
      JSON.stringify(lifestyle),
      JSON.stringify(nutrition),
    ];

    const result = await client.query(updateQuery, values);
    await client.query("COMMIT");

    return NextResponse.json(result.rows[0]);
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
  // Canonical defaults for each section
  console.log("RAW DB ROW:", db);
  console.log(
    "pillarSettings.health:",
    JSON.stringify(db.pillar_settings.health, null, 2)
  );
  console.log(
    "pillarSettings.nutrition:",
    JSON.stringify(db.pillar_settings.nutrition, null, 2)
  );
  console.log(
    "pillarSettings.fitness:",
    JSON.stringify(db.pillar_settings.fitness, null, 2)
  );
  const defaultHealth = {
    circumferenceUnit: "in",
    circumferenceMeasurements: [],
    bodyFatMethods: [],
    trackingPreferences: [],
  };
  const defaultNutrition = {
    foodMeasurement: "grams",
    hydrationUnit: "oz",
    calorieTarget: 0,
    macronutrientTargets: { protein: 0, carbs: 0, fat: 0 },
    macronutrientTargetMode: "grams",
    defaultMealSchedule: {
      id: "default",
      name: "Default",
      meals: [],
      nutrientDistribution: { mode: "even" },
    },
    customMealSchedules: [],
    scheduleAssignments: {},
    foodAllergies: [],
    dietaryBase: "omnivore",
    dietaryStyles: [],
  };
  const defaultLifestyle = {
    deviceIntegration: { enabled: false, devices: [] },
  };
  const defaultFitness = {
    resistanceTraining: {
      loadUnit: "lbs",
      trackRPE: false,
      trackRIR: false,
      availableEquipment: [],
      rpeScale: "0-10",
    },
    cardioMetabolic: { speedUnit: "mph" },
  };

  // Helper to ensure a value is always an array
  function ensureArray(val: any): any[] {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  }

  let pillarSettings = db.pillar_settings;
  while (typeof pillarSettings === "string") {
    try {
      pillarSettings = JSON.parse(pillarSettings);
    } catch {
      pillarSettings = {};
      break;
    }
  }
  pillarSettings = pillarSettings || {};

  const health = {
    ...pillarSettings.health,
    circumferenceMeasurements: ensureArray(
      pillarSettings.health?.circumferenceMeasurements
    ),
    bodyFatMethods: ensureArray(pillarSettings.health?.bodyFatMethods),
    trackingPreferences: ensureArray(
      pillarSettings.health?.trackingPreferences
    ),
    circumferenceUnit: pillarSettings.health?.circumferenceUnit || "in",
  };
  const nutrition = {
    ...pillarSettings.nutrition,
    foodAllergies: ensureArray(pillarSettings.nutrition?.foodAllergies),
    dietaryStyles: ensureArray(pillarSettings.nutrition?.dietaryStyles),
    customMealSchedules: ensureArray(
      pillarSettings.nutrition?.customMealSchedules
    ),
    scheduleAssignments: pillarSettings.nutrition?.scheduleAssignments || {},
    macronutrientTargets: pillarSettings.nutrition?.macronutrientTargets || {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    defaultMealSchedule: pillarSettings.nutrition?.defaultMealSchedule || {
      id: "default",
      name: "Default",
      meals: [],
      nutrientDistribution: { mode: "even" },
    },
  };
  const lifestyle = {
    ...pillarSettings.lifestyle,
    deviceIntegration: pillarSettings.lifestyle?.deviceIntegration || {
      enabled: false,
      devices: [],
    },
  };
  const fitness = {
    ...pillarSettings.fitness,
    resistanceTraining: pillarSettings.fitness?.resistanceTraining || {
      loadUnit: "lbs",
      trackRPE: false,
      trackRIR: false,
      availableEquipment: [],
      rpeScale: "0-10",
    },
    cardioMetabolic: pillarSettings.fitness?.cardioMetabolic || {
      speedUnit: "mph",
    },
  };

  return {
    general: {
      heightUnit:
        db.height_unit === "imperial"
          ? "ft_in"
          : db.height_unit === "metric"
          ? "cm"
          : db.height_unit,
      weightUnit: db.weight_unit,
      temperatureUnit: db.temperature_unit,
      timeFormat: db.time_format,
      dateFormat: db.date_format,
      language: db.language,
      notifications: [
        ...(db.notifications_email ? ["email"] : []),
        ...(db.notifications_text ? ["text"] : []),
        ...(db.notifications_app ? ["app"] : []),
      ],
    },
    health,
    nutrition,
    lifestyle,
    fitness,
  };
}
