// lib/schemas.ts
import { z } from 'zod';

// Web Vitals rating enum
export const WebVitalsRatingSchema = z.enum(['good', 'needs-improvement', 'poor'], {
  errorMap: (issue, ctx) => ({
    message: `Invalid rating: ${ctx.data}. Must be one of: good, needs-improvement, poor`
  })
});

// Web Vitals metric names enum
export const WebVitalsMetricNameSchema = z.enum([
  'CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP'
], {
  errorMap: (issue, ctx) => ({
    message: `Invalid metric name: ${ctx.data}. Must be one of: CLS, FID, FCP, LCP, TTFB, INP`
  })
});

// Individual Web Vital metric schema
export const WebVitalMetricSchema = z.object({
  id: z.string()
    .min(1, 'Metric ID is required')
    .max(255, 'Metric ID too long'),
  
  name: WebVitalsMetricNameSchema,
  
  value: z.number()
    .min(0, 'Value must be non-negative')
    .max(999999, 'Value too large')
    .refine(val => !isNaN(val), 'Value must be a valid number'),
  
  delta: z.number()
    .min(-999999, 'Delta too small')
    .max(999999, 'Delta too large')
    .refine(val => !isNaN(val), 'Delta must be a valid number'),
  
  rating: WebVitalsRatingSchema,
  
  timestamp: z.number()
    .int('Timestamp must be an integer')
    .min(0, 'Timestamp must be positive')
    .max(Date.now() + 86400000, 'Timestamp cannot be more than 1 day in the future') // Allow some clock skew
    .refine(val => val > 1600000000000, 'Timestamp seems too old'), // After 2020
  
  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long'),
  
  userAgent: z.string()
    .min(1, 'User agent is required')
    .max(1000, 'User agent too long'),
  
  sessionId: z.string()
    .min(1, 'Session ID is required')
    .max(255, 'Session ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Session ID contains invalid characters'),
  
  userId: z.string()
    .max(255, 'User ID too long')
    .optional()
});

// Batch schema
export const WebVitalsBatchSchema = z.object({
  metrics: z.array(WebVitalMetricSchema)
    .min(1, 'Batch must contain at least one metric')
    .max(50, 'Batch too large, maximum 50 metrics allowed'),
  
  batchId: z.string()
    .min(1, 'Batch ID is required')
    .max(255, 'Batch ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Batch ID contains invalid characters'),
  
  timestamp: z.number()
    .int('Batch timestamp must be an integer')
    .min(0, 'Batch timestamp must be positive')
    .max(Date.now() + 60000, 'Batch timestamp cannot be more than 1 minute in the future')
});

// Database insertion schema (after validation)
export const DatabaseMetricSchema = WebVitalMetricSchema.extend({
  ratingId: z.number().int().min(1).max(3)
}).omit({ rating: true });

// Query parameter schemas for API endpoints
export const TimeframeQuerySchema = z.object({
  timeframe: z.string()
    .regex(/^\d+\s+(days?|hours?|minutes?)$/, 'Invalid timeframe format. Use format like "7 days" or "24 hours"')
    .default('30 days')
});

export const MetricNameQuerySchema = z.object({
  metricName: WebVitalsMetricNameSchema.optional()
});

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  
  offset: z.coerce.number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be non-negative')
    .default(0)
});

export const SessionQuerySchema = z.object({
  sessionId: z.string()
    .min(1, 'Session ID is required')
    .max(255, 'Session ID too long')
});

export const UserQuerySchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .max(255, 'User ID too long')
});

// Type exports
export type WebVitalMetric = z.infer<typeof WebVitalMetricSchema>;
export type WebVitalsBatch = z.infer<typeof WebVitalsBatchSchema>;
export type WebVitalsRating = z.infer<typeof WebVitalsRatingSchema>;
export type WebVitalsMetricName = z.infer<typeof WebVitalsMetricNameSchema>;
export type DatabaseMetric = z.infer<typeof DatabaseMetricSchema>;

// Validation helper functions
export function validateWebVitalsBatch(data: unknown): WebVitalsBatch {
  return WebVitalsBatchSchema.parse(data);
}

export function validateWebVitalMetric(data: unknown): WebVitalMetric {
  return WebVitalMetricSchema.parse(data);
}

// Safe validation functions that return results instead of throwing
export function safeValidateWebVitalsBatch(data: unknown) {
  return WebVitalsBatchSchema.safeParse(data);
}

export function safeValidateWebVitalMetric(data: unknown) {
  return WebVitalMetricSchema.safeParse(data);
}

// Custom validation for specific use cases
export const WebVitalMetricWithContextSchema = WebVitalMetricSchema.extend({
  referrer: z.string().url().optional(),
  connectionType: z.string().max(50).optional(),
  deviceMemory: z.number().int().min(0).max(32).optional(), // GB
  viewport: z.object({
    width: z.number().int().min(1).max(10000),
    height: z.number().int().min(1).max(10000)
  }).optional()
});

export type WebVitalMetricWithContext = z.infer<typeof WebVitalMetricWithContextSchema>;