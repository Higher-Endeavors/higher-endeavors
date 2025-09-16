import { z } from 'zod';

// Zod schemas for widget data
export const TrendSchema = z.enum(['up', 'down', 'neutral']);

export const ProgressDataSchema = z.object({
  current: z.number(),
  target: z.number(),
  unit: z.string()
});

export const WidgetDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  trend: TrendSchema.optional(),
  trendValue: z.string().optional(),
  color: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  borderColor: z.string(),
  progress: ProgressDataSchema.optional()
});

export const MetricCardPropsSchema = z.object({
  data: WidgetDataSchema,
  size: z.enum(['small', 'medium', 'large']).optional(),
  className: z.string().optional(),
  onClick: z.function().args().returns(z.void()).optional()
});

export const ProgressBarPropsSchema = z.object({
  current: z.number(),
  target: z.number(),
  unit: z.string().optional(),
  color: z.string().optional(),
  showPercentage: z.boolean().optional(),
  className: z.string().optional()
});

export const TrendIndicatorPropsSchema = z.object({
  trend: TrendSchema,
  value: z.string(),
  className: z.string().optional()
});

// Inferred TypeScript types
export type Trend = z.infer<typeof TrendSchema>;
export type ProgressData = z.infer<typeof ProgressDataSchema>;
export type WidgetData = z.infer<typeof WidgetDataSchema>;
export type MetricCardProps = z.infer<typeof MetricCardPropsSchema>;
export type ProgressBarProps = z.infer<typeof ProgressBarPropsSchema>;
export type TrendIndicatorProps = z.infer<typeof TrendIndicatorPropsSchema>;
