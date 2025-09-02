import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { getStravaConnection, stravaApiRequest } from "@/app/lib/strava";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await getStravaConnection(parseInt(session.user.id));
    if (!connection) {
      return NextResponse.json({ 
        error: "No Strava connection found",
        message: "Please connect your Strava account first"
      }, { status: 404 });
    }

    // Get a few activities to see the raw data structure
    const activities = await stravaApiRequest('/athlete/activities?per_page=3', connection.access_token);
    
    // Also get athlete profile data
    const athlete = await stravaApiRequest('/athlete', connection.access_token);

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.strava_connections_id,
        athlete_id: connection.strava_athlete_id,
        last_sync: connection.last_sync_at,
        is_active: connection.is_active
      },
      athlete: athlete,
      activities: activities,
      activityCount: activities.length,
      sampleActivity: activities[0] || null,
      message: "Raw Strava data fetched successfully"
    });

  } catch (error: any) {
    console.error('Error fetching Strava debug data:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
}
