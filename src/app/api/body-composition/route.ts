import { type NextRequest, NextResponse } from "next/server";
import { getClient, SingleQuery } from "@/app/lib/dbAdapter";
import { auth } from "@/app/auth";

export async function POST(request: NextRequest) {
  try {
    console.log('API route: Starting authentication check');
    const session = await auth();
    console.log('API route: Session:', { 
      authenticated: !!session, 
      hasUserId: !!session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('API route: Unauthorized - no user ID in session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('API route: Parsing request body');
    const data = await request.json();
    console.log('API route: Received data:', {
      hasWeight: !!data.weight,
      hasBodyFatPercentage: !!data.bodyFatPercentage,
      hasEntryData: !!data.entryData
    });

    const { 
      weight,
      bodyFatPercentage,
      entryData
    } = data;

    try {
      console.log('API route: Attempting database insertion');
      const result = await SingleQuery(
        `INSERT INTO body_composition_entries 
         (user_id, weight, body_fat_percentage, entry_data) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, created_at`,
        [session.user.id, weight, bodyFatPercentage, entryData]
      );
      console.log('API route: Database insertion successful');

      return NextResponse.json({
        success: true,
        entry: {
          id: result.rows[0].id,
          created_at: result.rows[0].created_at
        }
      });
    } catch (dbError) {
      console.error('API route: Database error:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      return NextResponse.json(
        { error: "Failed to save body composition entry to database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route: Unexpected error:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "An unexpected error occurred" },
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

    console.log('API route: Fetching entries from database');
    const result = await SingleQuery(
      `SELECT 
        id,
        created_at as date,
        weight,
        body_fat_percentage as "bodyFatPercentage",
        entry_data as "entryData"
       FROM body_composition_entries 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [session.user.id]
    );

    // Transform the data to match the frontend types
    const entries = result.rows.map((entry: any) => {
      const weight = Number(entry.weight);
      const bodyFatPercentage = entry.bodyFatPercentage ? Number(entry.bodyFatPercentage) : null;
      
      // Calculate fat mass and fat free mass if we have both weight and body fat percentage
      let fatMass = null;
      let fatFreeMass = null;
      if (weight && bodyFatPercentage) {
        fatMass = (weight * bodyFatPercentage) / 100;
        fatFreeMass = weight - fatMass;
      }

      return {
        id: entry.id.toString(),
        date: entry.date,
        weight,
        bodyFatPercentage,
        fatMass,
        fatFreeMass,
        ...entry.entryData
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