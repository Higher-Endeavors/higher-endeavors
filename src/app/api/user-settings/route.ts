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
    
    await client.query('BEGIN');

    // Extract general settings and pillar settings
    const {
      height_unit,
      weight_unit,
      temperature_unit,
      time_format,
      date_format,
      language,
      notifications_email,
      notifications_text,
      notifications_app,
      pillar_settings,
      ...otherSettings
    } = settings;

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
        pillar_settings,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
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
        pillar_settings = EXCLUDED.pillar_settings,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      session.user.id,
      height_unit || 'imperial',
      weight_unit || 'lbs',
      temperature_unit || 'F',
      time_format || '12h',
      date_format || 'MM/DD/YYYY',
      language || 'en',
      notifications_email ?? true,
      notifications_text ?? false,
      notifications_app ?? false,
      pillar_settings || {}
    ];

    const result = await client.query(updateQuery, values);
    await client.query('COMMIT');

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 