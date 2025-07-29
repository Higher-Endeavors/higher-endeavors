// pages/api/web-vitals.ts or app/api/web-vitals/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getClient, SingleQuery } from "@/app/lib/dbAdapter";
import { ZodError } from 'zod';
import { 
  validateWebVitalsBatch, 
  safeValidateWebVitalsBatch,
  type WebVitalsBatch,
  type WebVitalMetric 
} from '@/app/lib/types/web-vitals';


// Rating lookup map for performance
const RATING_ID_MAP: Record<string, number> = {
  'good': 1,
  'needs-improvement': 2,
  'poor': 3
};

async function insertWebVitalsMetrics(metrics: WebVitalMetric[]): Promise<number> {

  const client = await getClient();
  let insertedCount = 0;
  
  try {
    await client.query('BEGIN');
    
    const insertQuery = `
      INSERT INTO web_vitals_metrics (
        metric_id, metric_name, value, delta, metric_ratings_id,
        timestamp, url, user_agent, session_id, user_id,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
      )
      ON CONFLICT (metric_id) DO UPDATE SET
        value = EXCLUDED.value,
        delta = EXCLUDED.delta,
        metric_ratings_id = EXCLUDED.metric_ratings_id,
        updated_at = NOW()
      RETURNING metric_id
    `;
    
    for (const metric of metrics) {
      const ratingId = RATING_ID_MAP[metric.rating];
      
      if (!ratingId) {
        throw new Error(`Invalid rating: ${metric.rating}`);
      }
      
      const result = await client.query(insertQuery, [
        metric.id,
        metric.name,
        metric.value,
        metric.delta,
        ratingId,
        new Date(metric.timestamp),
        metric.url,
        metric.userAgent,
        metric.sessionId,
        metric.userId || null,
      ]);
      
      if (result.rows.length > 0) {
        insertedCount++;
      }
    }
    
    await client.query('COMMIT');
    return insertedCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// For App Router (app/api/web-vitals/route.ts)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body using Zod
    const validationResult = safeValidateWebVitalsBatch(body);
    
    if (!validationResult.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validationResult.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }

    const batch = validationResult.data;
    const insertedCount = await insertWebVitalsMetrics(batch.metrics);
    
    return Response.json({ 
      success: true, 
      processed: insertedCount,
      batchId: batch.batchId,
      timestamp: batch.timestamp
    });
  } catch (error) {
    console.error('Error processing web vitals:', error);
    
    if (error instanceof ZodError) {
      return Response.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Additional API endpoints with Zod validation

// GET endpoint for retrieving metrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7 days';
    const metricName = searchParams.get('metricName');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate query parameters
    if (limit < 1 || limit > 1000) {
      return Response.json({ error: 'Limit must be between 1 and 1000' }, { status: 400 });
    }

    if (offset < 0) {
      return Response.json({ error: 'Offset must be non-negative' }, { status: 400 });
    }

    const metrics = await getMetricsByTimeframe(timeframe, metricName, limit, offset);
    
    return Response.json({
      success: true,
      data: metrics,
      pagination: {
        limit,
        offset,
        total: metrics.length
      }
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getMetricsByTimeframe(
  timeframe: string, 
  metricName?: string | null, 
  limit: number = 100, 
  offset: number = 0
) {
  
  try {
    let query = `
      SELECT 
        m.*,
        r.rating_name,
        r.description as rating_description
      FROM web_vitals_metrics m
      JOIN web_vitals_ratings r ON m.metric_rating_id = r.web_vitals_rating_id
      WHERE m.timestamp >= NOW() - INTERVAL $1
    `;
    const params: any[] = [timeframe];
    
    if (metricName) {
      query += ' AND m.metric_name = $2';
      params.push(metricName);
      query += ' ORDER BY m.timestamp DESC LIMIT $3 OFFSET $4';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY m.timestamp DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    }
    
    const result = await SingleQuery(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    throw error;
  }
}