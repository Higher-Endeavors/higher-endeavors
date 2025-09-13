import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { 
  getActivityData, 
  getLatestActivityDataByType, 
  getActivityDataSummary, 
  getActivityDataById,
  getActivityStatsByType
} from '../lib/activity-data-utils';

// GET endpoint to retrieve activity data for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const userResult = await SingleQuery('SELECT id FROM users WHERE email = $1', [session.user.email]);
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
    const stats = searchParams.get('stats') === 'true';
    const id = searchParams.get('id');
    const activityType = searchParams.get('activityType');

    // Get specific record by ID
    if (id && dataType) {
      const record = await getActivityDataById(dataType, parseInt(id));
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
      const latestData = await getLatestActivityDataByType(userId);
      return NextResponse.json({ 
        success: true, 
        data: latestData,
        timestamp: new Date().toISOString()
      });
    }

    // Get summary statistics
    if (summary) {
      const summaryData = await getActivityDataSummary(userId, days);
      return NextResponse.json({ 
        success: true, 
        data: summaryData,
        timestamp: new Date().toISOString()
      });
    }

    // Get activity statistics by type
    if (stats) {
      const statsData = await getActivityStatsByType(userId, days);
      return NextResponse.json({ 
        success: true, 
        data: statsData,
        timestamp: new Date().toISOString()
      });
    }

    // Get specific data type
    if (dataType) {
      const activityData = await getActivityData({
        userId,
        dataType,
        limit,
        activityType: activityType || undefined,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      });

      // Populate full data for each record
      const fullData = await Promise.all(
        activityData.map(async (record) => {
          const fullRecord = await getActivityDataById(record.dataType, record.id);
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
        availableTypes: ['activityDetails', 'manuallyUpdatedActivities'],
        message: 'Specify a data type using the ?type= parameter'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await serverLogger.error('Error retrieving activity data', error);
    return NextResponse.json({ error: 'Failed to retrieve activity data' }, { status: 500 });
  }
}

// DELETE endpoint to clean up old activity data
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const userResult = await SingleQuery('SELECT id FROM users WHERE email = $1', [session.user.email]);
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
      // Delete from specific data type (filter by manual flag)
      let sql = `
        DELETE FROM garmin_activities
        WHERE user_id = $1 
          AND created_at < NOW() - INTERVAL '${olderThanDays} days'
      `;

      if (dataType === 'activityDetails') {
        sql += ` AND manual = false`;
      } else if (dataType === 'manuallyUpdatedActivities') {
        sql += ` AND manual = true`;
      } else {
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
      }

      const result = await SingleQuery(sql, [userId]);
      totalDeleted = result.rowCount || 0;
      deletedByType[dataType] = totalDeleted;
    } else {
      // Delete from all data types
      const dataTypes = ['activityDetails', 'manuallyUpdatedActivities'];
      
      for (const type of dataTypes) {
        try {
          let sql = `
            DELETE FROM garmin_activities
            WHERE user_id = $1 
              AND created_at < NOW() - INTERVAL '${olderThanDays} days'
          `;

          if (type === 'activityDetails') {
            sql += ` AND manual = false`;
          } else if (type === 'manuallyUpdatedActivities') {
            sql += ` AND manual = true`;
          }

          const result = await SingleQuery(sql, [userId]);
          
          const deletedCount = result.rowCount || 0;
          totalDeleted += deletedCount;
          deletedByType[type] = deletedCount;
        } catch (error) {
          await serverLogger.warn(`Error deleting old ${type} data`, { userId, olderThanDays, error: error instanceof Error ? error.message : String(error) });
          deletedByType[type] = 0;
        }
      }
    }

    await serverLogger.info('Activity data cleanup completed', {
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
      message: `Deleted activity data older than ${olderThanDays} days`
    });

  } catch (error) {
    await serverLogger.error('Error cleaning up activity data', error);
    return NextResponse.json({ error: 'Failed to clean up activity data' }, { status: 500 });
  }
}
