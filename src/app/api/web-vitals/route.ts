// pages/api/web-vitals.ts or app/api/web-vitals/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getClient, SingleQuery } from "@/app/lib/dbAdapter";
import { ZodError } from 'zod';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { 
  validateWebVitalsBatch, 
  safeValidateWebVitalsBatch,
  type WebVitalsBatch,
  type WebVitalMetric 
} from '@/app/lib/types/web-vitals';
import { analyzeClockSkew, analyzeWebVitalsBatchClockSkew, type ClockSkewAnalysis } from '@/app/lib/web-vitals/web-vitals-analyze-clock-skew';
import { insertWebVitalsBatch } from '@/app/lib/actions/web-vitals';

// Rating lookup map for performance
const RATING_ID_MAP: Record<string, number> = {
  'good': 1,
  'needs-improvement': 2,
  'poor': 3
};



// For App Router (app/api/web-vitals/route.ts)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Use the server action for processing
    const result = await insertWebVitalsBatch(body);
    
    return Response.json(result);
  } catch (error) {
    await serverLogger.error('Error processing web vitals', error);
    
    if (error instanceof ZodError) {
      return Response.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }
    
    // Handle server action errors
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return Response.json({
          error: 'Validation failed',
          details: error.message
        }, { status: 400 });
      }
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
    await serverLogger.error('Error retrieving web vitals metrics', error);
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
      JOIN web_vitals_ratings r ON m.metric_ratings_id = r.web_vitals_ratings_id
      WHERE m.timestamp >= NOW() - INTERVAL '7 days'
      ORDER BY m.timestamp DESC LIMIT 100 OFFSET 0
    `;
    // const params: any[] = [];
    
    // if (metricName) {
    //   query += ' AND m.metric_name = $1';
    //   params.push(metricName);
    //   query += ' ORDER BY m.timestamp DESC LIMIT $3 OFFSET $3';
    //   params.push(limit, offset);
    // } else {
    //   query += ' ORDER BY m.timestamp DESC LIMIT $2 OFFSET $2';
    //   params.push(limit, offset);
    // }
    
    const result = await SingleQuery(query);
    return result.rows;
  } catch (error) {
    await serverLogger.error('Error getting metrics by timeframe', error);
    return [];
  }
}