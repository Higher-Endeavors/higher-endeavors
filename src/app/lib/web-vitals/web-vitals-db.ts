// lib/webVitalsDb.ts
import { SingleQuery } from "@/app/lib/dbAdapter";
import { 
  TimeframeQuerySchema,
  MetricNameQuerySchema,
  PaginationQuerySchema,
  SessionQuerySchema,
  UserQuerySchema,
  type WebVitalsMetricName
} from '@/app/lib/types/web-vitals';

// Types
export interface WebVitalMetricWithRating {
  id: string;
  metric_id: string;
  metric_name: string;
  value: number;
  delta: number;
  rating_id: number;
  rating_name: string;
  rating_description: string;
  timestamp: Date;
  url: string;
  user_agent: string;
  session_id: string;
  user_id?: string;
  page_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RatingStats {
  metric_name: string;
  rating_name: string;
  count: number;
  avg_value: number;
  p75_value: number;
  p95_value: number;
}

export interface DailyMetrics {
  date: Date;
  metric_name: string;
  total_metrics: number;
  avg_value: number;
  p75_value: number;
  good_percentage: number;
}

// Rating utilities
export const RATING_ID_MAP = {
  'good': 1,
  'needs-improvement': 2,
  'poor': 3
} as const;

export const RATING_NAME_MAP = {
  1: 'good',
  2: 'needs-improvement',
  3: 'poor'
} as const;

export function getRatingId(rating: string): number | null {
  return RATING_ID_MAP[rating as keyof typeof RATING_ID_MAP] || null;
}

export function getRatingName(ratingId: number): string | null {
  return RATING_NAME_MAP[ratingId as keyof typeof RATING_NAME_MAP] || null;
}

// Helper function to parse timeframe and convert to days
function parseTimeframeToDays(timeframe: string): number {
  const match = timeframe.match(/^(\d+)\s+(days?|hours?|minutes?)$/);
  if (!match) {
    throw new Error(`Invalid timeframe format: ${timeframe}. Expected format like "7 days" or "24 hours"`);
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'day':
    case 'days':
      return value;
    case 'hour':
    case 'hours':
      return Math.ceil(value / 24);
    case 'minute':
    case 'minutes':
      return Math.ceil(value / (24 * 60));
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}

// Database query functions with Zod validation
export async function getMetricsByTimeframe(
  timeframe: string = '7 days',
  metricName?: string,
  limit: number = 100,
  offset: number = 0
): Promise<WebVitalMetricWithRating[]> {
  // Validate parameters
  const timeframeValidation = TimeframeQuerySchema.safeParse({ timeframe });
  if (!timeframeValidation.success) {
    throw new Error(`Invalid timeframe: ${timeframeValidation.error.issues[0].message}`);
  }

  if (metricName) {
    const metricNameValidation = MetricNameQuerySchema.safeParse({ metricName });
    if (!metricNameValidation.success) {
      throw new Error(`Invalid metric name: ${metricNameValidation.error.issues[0].message}`);
    }
  }

  const paginationValidation = PaginationQuerySchema.safeParse({ limit, offset });
  if (!paginationValidation.success) {
    throw new Error(`Invalid pagination: ${paginationValidation.error.issues[0].message}`);
  }

  try {
    const days = parseTimeframeToDays(timeframe);
    
    let query = `
      SELECT * FROM web_vitals_with_ratings
      WHERE timestamp >= NOW() - (INTERVAL '1 day' * $1)
    `;
    const params: any[] = [days];
    
    if (metricName) {
      query += ' AND metric_name = $2';
      params.push(metricName);
      query += ' ORDER BY timestamp DESC LIMIT $3 OFFSET $4';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY timestamp DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    }
    
    const result = await SingleQuery(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    throw error;
  }
}

export async function getRatingStatistics(
  timeframe: string = '30 days'
): Promise<RatingStats[]> {
  // Validate timeframe
  const validation = TimeframeQuerySchema.safeParse({ timeframe });
  if (!validation.success) {
    throw new Error(`Invalid timeframe: ${validation.error.issues[0].message}`);
  }

  try {
    const days = parseTimeframeToDays(timeframe);
    
    const query = `
      SELECT 
        m.metric_name,
        r.rating_name,
        COUNT(*) as count,
        ROUND(AVG(m.value)::numeric, 3) as avg_value,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.value)::numeric, 3) as p75_value,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY m.value)::numeric, 3) as p95_value
      FROM web_vitals_metrics m
      JOIN web_vitals_ratings r ON m.metric_ratings_id = r.web_vitals_ratings_id
      WHERE m.timestamp >= NOW() - (INTERVAL '1 day' * $1)
      GROUP BY m.metric_name, r.rating_name, r.web_vitals_ratings_id
      ORDER BY m.metric_name, r.web_vitals_ratings_id
    `;
    
    const result = await SingleQuery(query, [days]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving rating statistics:', error);
    throw error;
  }
}

export async function getDailyMetrics(
  days: number = 30
): Promise<DailyMetrics[]> {
  // Validate days parameter
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Days must be an integer between 1 and 365');
  }

  try {
    const query = `
      SELECT 
        DATE_TRUNC('day', m.timestamp) as date,
        m.metric_name,
        COUNT(*) as total_metrics,
        ROUND(AVG(m.value)::numeric, 3) as avg_value,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.value)::numeric, 3) as p75_value,
        ROUND((COUNT(CASE WHEN r.rating_name = 'good' THEN 1 END)::FLOAT / COUNT(*) * 100)::numeric, 2) as good_percentage
      FROM web_vitals_metrics m
      JOIN web_vitals_ratings r ON m.metric_ratings_id = r.web_vitals_ratings_id
      WHERE m.timestamp >= NOW() - (INTERVAL '1 day' * $1)
      GROUP BY DATE_TRUNC('day', m.timestamp), m.metric_name
      ORDER BY date DESC, m.metric_name
    `;
    
    const result = await SingleQuery(query, [days]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving daily metrics:', error);
    throw error;
  }
}

export async function getTopPoorPerformingPages(
  metricName: WebVitalsMetricName,
  limit: number = 10,
  timeframe: string = '7 days'
): Promise<Array<{
  page_path: string;
  poor_count: number;
  total_count: number;
  poor_percentage: number;
  avg_value: number;
}>> {
  // Validate parameters
  const metricValidation = MetricNameQuerySchema.safeParse({ metricName });
  if (!metricValidation.success) {
    throw new Error(`Invalid metric name: ${metricValidation.error.issues[0].message}`);
  }

  const timeframeValidation = TimeframeQuerySchema.safeParse({ timeframe });
  if (!timeframeValidation.success) {
    throw new Error(`Invalid timeframe: ${timeframeValidation.error.issues[0].message}`);
  }

  const paginationValidation = PaginationQuerySchema.safeParse({ limit, offset: 0 });
  if (!paginationValidation.success) {
    throw new Error(`Invalid limit: ${paginationValidation.error.issues[0].message}`);
  }

  try {
    const days = parseTimeframeToDays(timeframe);
    
    const query = `
      SELECT 
        m.page_path,
        COUNT(CASE WHEN r.rating_name = 'poor' THEN 1 END) as poor_count,
        COUNT(*) as total_count,
        ROUND((COUNT(CASE WHEN r.rating_name = 'poor' THEN 1 END)::FLOAT / COUNT(*) * 100)::numeric, 2) as poor_percentage,
        ROUND(AVG(m.value)::numeric, 3) as avg_value
      FROM web_vitals_metrics m
      JOIN web_vitals_ratings r ON m.metric_ratings_id = r.web_vitals_ratings_id
      WHERE m.timestamp >= NOW() - (INTERVAL '1 day' * $1)
        AND m.metric_name = $2
        AND m.page_path IS NOT NULL
      GROUP BY m.page_path
      HAVING COUNT(*) >= 5 -- Only include pages with sufficient data
      ORDER BY poor_percentage DESC, poor_count DESC
      LIMIT $3
    `;
    
    const result = await SingleQuery(query, [days, metricName, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving top poor performing pages:', error);
    throw error;
  }
}

export async function getSessionMetrics(
  sessionId: string
): Promise<WebVitalMetricWithRating[]> {
  // Validate session ID
  const validation = SessionQuerySchema.safeParse({ sessionId });
  if (!validation.success) {
    throw new Error(`Invalid session ID: ${validation.error.issues[0].message}`);
  }

  
  try {
    const query = `
      SELECT * FROM web_vitals_with_ratings
      WHERE session_id = $1
      ORDER BY timestamp ASC
    `;
    
    const result = await SingleQuery(query, [sessionId]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving session metrics:', error);
    throw error;
  }
}

export async function getUserMetricsSummary(
  userId: string,
  timeframe: string = '30 days'
): Promise<Array<{
  metric_name: string;
  total_sessions: number;
  avg_value: number;
  best_value: number;
  worst_value: number;
  good_percentage: number;
}>> {
  // Validate parameters
  const userValidation = UserQuerySchema.safeParse({ userId });
  if (!userValidation.success) {
    throw new Error(`Invalid user ID: ${userValidation.error.issues[0].message}`);
  }

  const timeframeValidation = TimeframeQuerySchema.safeParse({ timeframe });
  if (!timeframeValidation.success) {
    throw new Error(`Invalid timeframe: ${timeframeValidation.error.issues[0].message}`);
  }

  try {
    const days = parseTimeframeToDays(timeframe);
    
    const query = `
      SELECT 
        m.metric_name,
        COUNT(DISTINCT m.session_id) as total_sessions,
        ROUND(AVG(m.value)::numeric, 3) as avg_value,
        ROUND(MIN(m.value)::numeric, 3) as best_value,
        ROUND(MAX(m.value)::numeric, 3) as worst_value,
        ROUND((COUNT(CASE WHEN r.rating_name = 'good' THEN 1 END)::FLOAT / COUNT(*) * 100)::numeric, 2) as good_percentage
      FROM web_vitals_metrics m
      JOIN web_vitals_ratings r ON m.metric_ratings_id = r.web_vitals_ratings_id
      WHERE m.user_id = $1
        AND m.timestamp >= NOW() - (INTERVAL '1 day' * $2)
      GROUP BY m.metric_name
      ORDER BY m.metric_name
    `;
    
    const result = await SingleQuery(query, [userId, days]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving user metrics summary:', error);
    throw error;
  }
}

// Advanced query functions with Zod validation

export async function getMetricPercentiles(
  metricName: WebVitalsMetricName,
  timeframe: string = '30 days'
): Promise<{
  metric_name: string;
  count: number;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
}> {
  // Validate parameters
  const metricValidation = MetricNameQuerySchema.safeParse({ metricName });
  if (!metricValidation.success) {
    throw new Error(`Invalid metric name: ${metricValidation.error.issues[0].message}`);
  }

  const timeframeValidation = TimeframeQuerySchema.safeParse({ timeframe });
  if (!timeframeValidation.success) {
    throw new Error(`Invalid timeframe: ${timeframeValidation.error.issues[0].message}`);
  }

  try {
    const days = parseTimeframeToDays(timeframe);
    
    const query = `
      SELECT 
        $2 as metric_name,
        COUNT(*) as count,
        ROUND(MIN(value)::numeric, 3) as min,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value)::numeric, 3) as p25,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY value)::numeric, 3) as p50,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::numeric, 3) as p75,
        ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY value)::numeric, 3) as p90,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value)::numeric, 3) as p95,
        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value)::numeric, 3) as p99,
        ROUND(MAX(value)::numeric, 3) as max
      FROM web_vitals_metrics
      WHERE timestamp >= NOW() - (INTERVAL '1 day' * $1)
        AND metric_name = $2
    `;
    
    const result = await SingleQuery(query, [days, metricName]);
    return result.rows[0];
  } catch (error) {
    console.error('Error retrieving metric percentiles:', error);
    throw error;
  }
}

export async function getMetricsTrends(
  metricName: WebVitalsMetricName,
  days: number = 30,
  groupBy: 'hour' | 'day' = 'day'
): Promise<Array<{
  period: Date;
  count: number;
  avg_value: number;
  p75_value: number;
  good_percentage: number;
}>> {
  // Validate parameters
  const metricValidation = MetricNameQuerySchema.safeParse({ metricName });
  if (!metricValidation.success) {
    throw new Error(`Invalid metric name: ${metricValidation.error.issues[0].message}`);
  }

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Days must be an integer between 1 and 365');
  }

  if (!['hour', 'day'].includes(groupBy)) {
    throw new Error('GroupBy must be either "hour" or "day"');
  }

  try {
    const query = `
      SELECT 
        DATE_TRUNC($3, m.timestamp) as period,
        COUNT(*) as count,
        ROUND(AVG(m.value)::numeric, 3) as avg_value,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.value)::numeric, 3) as p75_value,
        ROUND((COUNT(CASE WHEN r.rating_name = 'good' THEN 1 END)::FLOAT / COUNT(*) * 100)::numeric, 2) as good_percentage
      FROM web_vitals_metrics m
      JOIN web_vitals_ratings r ON m.metric_ratings_id = r.web_vitals_ratings_id
      WHERE m.timestamp >= NOW() - (INTERVAL '1 day' * $1)
        AND m.metric_name = $2
      GROUP BY DATE_TRUNC($3, m.timestamp)
      ORDER BY period ASC
    `;
    
    const result = await SingleQuery(query, [days, metricName, groupBy]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving metrics trends:', error);
    throw error;
  }
}

// Cleanup function to remove old metrics (optional)
export async function cleanupOldMetrics(
  retentionDays: number = 90
): Promise<number> {
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
    throw new Error('Retention days must be an integer between 1 and 3650');
  }

  try {
    const query = `
      DELETE FROM web_vitals_metrics
      WHERE timestamp < NOW() - (INTERVAL '1 day' * $1)
    `;
    
    const result = await SingleQuery(query, [retentionDays]);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning up old metrics:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  totalMetrics: number;
  latestMetric: Date | null;
  oldestMetric: Date | null;
}> {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_metrics,
        MAX(timestamp) as latest_metric,
        MIN(timestamp) as oldest_metric
      FROM web_vitals_metrics
    `;
    
    const result = await SingleQuery(query, []);
    const row = result.rows[0];
    
    return {
      isHealthy: true,
      totalMetrics: parseInt(row.total_metrics),
      latestMetric: row.latest_metric,
      oldestMetric: row.oldest_metric
    };
  } catch (error) {
    return {
      isHealthy: false,
      totalMetrics: 0,
      latestMetric: null,
      oldestMetric: null
    };
  }
}