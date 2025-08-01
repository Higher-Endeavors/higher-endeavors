'use server';

import { getClient } from '@/app/lib/dbAdapter';
import { serverLogger } from '@/app/lib/logging/logger.server';
import { 
  validateWebVitalsBatch, 
  safeValidateWebVitalsBatch,
  type WebVitalsBatch,
  type WebVitalMetric 
} from '@/app/lib/types/web-vitals';
import { analyzeClockSkew, type ClockSkewAnalysis } from '@/app/lib/web-vitals/web-vitals-analyze-clock-skew';

// Rating lookup map for performance
const RATING_ID_MAP: Record<string, number> = {
  'good': 1,
  'needs-improvement': 2,
  'poor': 3
};

export interface WebVitalsInsertResult {
  success: boolean;
  processed: number;
  batchId: string;
  timestamp: number;
  clockSkewAnalysis?: ClockSkewAnalysis;
}

export async function insertWebVitalsBatch(batchData: unknown): Promise<WebVitalsInsertResult> {
  try {
    // Validate the batch data using Zod
    const validationResult = safeValidateWebVitalsBatch(batchData);
    
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ')}`);
    }

    const batch = validationResult.data;
    const insertedCount = await insertWebVitalsMetrics(batch.metrics);
    
    // Perform clock skew analysis
    let clockSkewAnalysis: ClockSkewAnalysis | undefined;
    try {
      const batchData = [{
        timestamp: batch.timestamp,
        receivedAt: Date.now()
      }];
      clockSkewAnalysis = analyzeClockSkew(batchData);
    } catch (error) {
      await serverLogger.error('Error performing clock skew analysis', error);
      // Don't fail the entire operation if skew analysis fails
    }
    
    return {
      success: true,
      processed: insertedCount,
      batchId: batch.batchId,
      timestamp: batch.timestamp,
      clockSkewAnalysis
    };
  } catch (error) {
    await serverLogger.error('Error processing web vitals batch', error);
    throw error;
  }
}

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
    await serverLogger.error('Failed to insert web vitals metrics', error);
    throw error;
  } finally {
    client.release();
  }
} 