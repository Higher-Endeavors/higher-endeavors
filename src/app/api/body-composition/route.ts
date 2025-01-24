import { type NextRequest, NextResponse } from "next/server";
import { getClient, SingleQuery } from "@/app/lib/dbAdapter";
import { auth } from "@/app/auth";

interface BodyCompositionData {
  weight: number;
  bodyFatPercentage: number;
  entryData: any;
  targetUserId?: string | number;
}

async function checkAdminAccess(userId: number): Promise<boolean> {
  const userRole = await SingleQuery(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );
  return userRole.rows[0]?.role === 'admin';
}

function isValidUserId(id: string | number | undefined | null): boolean {
  if (id === undefined || id === null) return false;
  const numId = typeof id === 'string' ? Number(id) : id;
  return !isNaN(numId) && numId > 0;
}

function parseUserId(id: string | null): number | null {
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json() as BodyCompositionData;
    const { weight, bodyFatPercentage, entryData, targetUserId } = data;

    const parsedTargetUserId = parseUserId(targetUserId);
    const effectiveUserId = parsedTargetUserId && await checkAdminAccess(session.user.id)
      ? parsedTargetUserId
      : session.user.id;

    const result = await SingleQuery(
      `INSERT INTO body_composition_entries 
       (user_id, weight, body_fat_percentage, entry_data) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, created_at`,
      [effectiveUserId, weight, bodyFatPercentage, entryData]
    );

    return NextResponse.json({
      success: true,
      entry: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error in body composition API route:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Starting authentication check');
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('API route: Unauthorized - no user ID in session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get target user ID from query params
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // If targetUserId is provided and user is admin, use that; otherwise use current user's ID
    const parsedTargetUserId = parseUserId(targetUserId);
    const isAdmin = await checkAdminAccess(session.user.id);
    const effectiveUserId = parsedTargetUserId && isAdmin ? parsedTargetUserId : session.user.id;

    console.log('API route: Fetching entries from database');
    const result = await SingleQuery(
      `SELECT * FROM body_composition_entries WHERE user_id = $1 ORDER BY created_at DESC`,
      [effectiveUserId]
    );

    console.log('Debug - Raw DB Result:', JSON.stringify(result.rows[0], null, 2));

    // Transform the data to match the frontend types
    const entries = result.rows.map((entry: any) => {
      // Ensure weight is a number, default to null if invalid
      const weight = typeof entry.weight === 'number' ? entry.weight :
                    typeof entry.weight === 'string' ? Number(entry.weight) : null;
      
      // Ensure body_fat_percentage is a number or null
      const bodyFatPercentage = entry.body_fat_percentage != null ? 
                               Number(entry.body_fat_percentage) : null;
      
      // Calculate fat mass and fat free mass if we have both weight and body fat percentage
      let fatMass = null;
      let fatFreeMass = null;
      if (weight != null && bodyFatPercentage != null) {
        fatMass = (weight * bodyFatPercentage) / 100;
        fatFreeMass = weight - fatMass;
      }

      // Extract circumference and skinfold measurements from entry_data
      const entryData = entry.entry_data || {};

      return {
        id: entry.id.toString(),
        date: entry.created_at,
        weight,
        bodyFatPercentage,
        fatMass,
        fatFreeMass,
        circumferenceMeasurements: entryData.circumferenceMeasurements || {},
        skinfoldMeasurements: entryData.skinfoldMeasurements || {}
      };
    });

    console.log('API route: Successfully fetched entries');
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching body composition entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch body composition entries" },
      { status: 500 }
    );
  }
} 