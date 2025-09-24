'use client';

import { useState, useEffect, useCallback } from 'react';
import { PerformanceRecordsDataSchema, type PerformanceRecordsData, type UsePerformanceRecordsResult } from '../performance-records.zod';

export function usePerformanceRecords(
  userId: number,
  timeframe: string = 'all'
): UsePerformanceRecordsResult {
  const [data, setData] = useState<PerformanceRecordsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!userId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/resistance-training/performance-records?user_id=${userId}&timeframe=${timeframe}`
      );
      const result = await response.json();

      if (result.success) {
        // Validate the response data with Zod
        const validationResult = PerformanceRecordsDataSchema.safeParse({
          records: result.records,
          timeframe: result.timeframe,
          totalExercises: result.totalExercises,
          totalRecords: result.totalRecords
        });

        if (validationResult.success) {
          setData(validationResult.data);
        } else {
          console.error('Data validation failed:', validationResult.error);
          setError('Invalid data received from server');
        }
      } else {
        setError(result.error || 'Failed to fetch performance records');
      }
    } catch (err) {
      console.error('Error fetching performance records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance records');
    } finally {
      setIsLoading(false);
    }
  }, [userId, timeframe]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRecords
  };
}
