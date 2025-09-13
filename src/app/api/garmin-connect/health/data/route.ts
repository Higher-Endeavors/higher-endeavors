import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { getHealthData, getLatestHealthDataByType, getHealthDataSummary, getHealthDataById } from '../lib/health-data-utils';

// GET endpoint to retrieve health data for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const userResult = await SingleQuery(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );
    
    const userId = userResult.rows[0]?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');
    const latest = searchParams.get('latest') === 'true';
    const summary = searchParams.get('summary') === 'true';
    const id = searchParams.get('id');

    // Get specific record by ID
    if (id && dataType) {
      const record = await getHealthDataById(dataType, parseInt(id));
      if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        data: record,
        timestamp: new Date().toISOString()
      });
    }

    // Get latest data for each type
    if (latest) {
      const latestData = await getLatestHealthDataByType(userId);
      return NextResponse.json({ 
        success: true, 
        data: latestData,
        timestamp: new Date().toISOString()
      });
    }

    // Get summary statistics
    if (summary) {
      const summaryData = await getHealthDataSummary(userId, days);
      return NextResponse.json({ 
        success: true, 
        data: summaryData,
        timestamp: new Date().toISOString()
      });
    }

    // Get specific data type
    if (dataType) {
      const healthData = await getHealthData({
        userId,
        dataType,
        limit,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      });

      // Populate full data for each record
      const fullData = await Promise.all(
        healthData.map(async (record) => {
          const fullRecord = await getHealthDataById(record.dataType, record.id);
          return fullRecord || record;
        })
      );

      return NextResponse.json({ 
        success: true, 
        data: fullData,
        count: fullData.length,
        timestamp: new Date().toISOString()
      });
    }

    // If no data type specified, return available data types
    return NextResponse.json({ 
      success: true, 
      data: {
        availableTypes: ['bloodPressures', 'bodyComps', 'hrv', 'pulseox', 'respiration', 'skinTemp', 'sleeps', 'stressDetails'],
        message: 'Specify a data type using the ?type= parameter'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await serverLogger.error('Error retrieving health data', error);
    return NextResponse.json({ error: 'Failed to retrieve health data' }, { status: 500 });
  }
}

// DELETE endpoint to clean up old health data
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const userResult = await SingleQuery(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );
    
    const userId = userResult.rows[0]?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '365');
    const dataType = searchParams.get('type');

    let totalDeleted = 0;
    const deletedByType: Record<string, number> = {};

    if (dataType) {
      // Delete from specific table
      const tableMapping: Record<string, string> = {
        bloodPressures: 'garmin_blood_pressures',
        bodyComps: 'garmin_body_compositions',
        hrv: 'garmin_hrv',
        pulseox: 'garmin_pulse_ox',
        respiration: 'garmin_respiration',
        skinTemp: 'garmin_skin_temperature',
        sleeps: 'garmin_sleeps',
        stressDetails: 'garmin_stress_details'
      };

      const tableName = tableMapping[dataType];
      if (!tableName) {
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
      }

      const result = await SingleQuery(
        `DELETE FROM ${tableName}
         WHERE user_id = $1 
           AND created_at < NOW() - INTERVAL '${olderThanDays} days'`,
        [userId]
      );

      totalDeleted = result.rowCount || 0;
      deletedByType[dataType] = totalDeleted;
    } else {
      // Delete from all tables
      const tableMapping = {
        bloodPressures: 'garmin_blood_pressures',
        bodyComps: 'garmin_body_compositions',
        hrv: 'garmin_hrv',
        pulseox: 'garmin_pulse_ox',
        respiration: 'garmin_respiration',
        skinTemp: 'garmin_skin_temperature',
        sleeps: 'garmin_sleeps',
        stressDetails: 'garmin_stress_details'
      };

      for (const [type, tableName] of Object.entries(tableMapping)) {
        try {
          const result = await SingleQuery(
            `DELETE FROM ${tableName}
             WHERE user_id = $1 
               AND created_at < NOW() - INTERVAL '${olderThanDays} days'`,
            [userId]
          );
          
          const deletedCount = result.rowCount || 0;
          totalDeleted += deletedCount;
          deletedByType[type] = deletedCount;
        } catch (error) {
          await serverLogger.warn(`Error deleting old ${type} data`, { error, userId, olderThanDays });
          deletedByType[type] = 0;
        }
      }
    }

    await serverLogger.info('Health data cleanup completed', {
      userEmail: session.user.email,
      userId,
      olderThanDays,
      totalDeletedCount: totalDeleted,
      deletedByType
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: totalDeleted,
      deletedByType,
      message: `Deleted health data older than ${olderThanDays} days`
    });

  } catch (error) {
    await serverLogger.error('Error cleaning up health data', error);
    return NextResponse.json({ error: 'Failed to clean up health data' }, { status: 500 });
  }
}
