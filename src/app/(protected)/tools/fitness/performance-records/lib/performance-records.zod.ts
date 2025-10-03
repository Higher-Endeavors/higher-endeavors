import { z } from 'zod';

export const PerformanceRecordSchema = z.object({
  repCount: z.number().int().min(1).max(15),
  maxLoad: z.number().positive(),
  loadUnit: z.string().min(1),
  date: z.string().datetime(),
  programName: z.string().min(1)
});

export const ExercisePerformanceRecordsSchema = z.record(
  z.string(),
  z.array(PerformanceRecordSchema)
);

export const PerformanceRecordsDataSchema = z.object({
  records: ExercisePerformanceRecordsSchema,
  timeframe: z.string(),
  totalExercises: z.number().int().min(0),
  totalRecords: z.number().int().min(0)
});

export const UsePerformanceRecordsResultSchema = z.object({
  data: PerformanceRecordsDataSchema.nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  refetch: z.function()
});

// Export inferred types
export type PerformanceRecord = z.infer<typeof PerformanceRecordSchema>;
export type ExercisePerformanceRecords = z.infer<typeof ExercisePerformanceRecordsSchema>;
export type PerformanceRecordsData = z.infer<typeof PerformanceRecordsDataSchema>;
export type UsePerformanceRecordsResult = z.infer<typeof UsePerformanceRecordsResultSchema>;
