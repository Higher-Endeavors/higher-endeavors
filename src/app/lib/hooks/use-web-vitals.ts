// hooks/useWebVitalsBatcher.ts
import { useCallback, useEffect, useRef } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { 
  safeValidateWebVitalMetric, 
  type WebVitalMetric,
  type WebVitalsBatch 
} from '@/app/lib/types/web-vitals';

interface BatchConfig {
  maxBatchSize?: number;
  flushInterval?: number; // milliseconds
  endpoint?: string;
  enableValidation?: boolean; // Option to disable client-side validation
}

const DEFAULT_CONFIG: Required<BatchConfig> = {
  maxBatchSize: 10,
  flushInterval: 30000, // 30 seconds
  endpoint: '/api/web-vitals',
  enableValidation: true
};

export function useWebVitalsBatcher(config: BatchConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const metricsQueue = useRef<WebVitalMetric[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(generateSessionId());

  const sendBatch = useCallback(async (metrics: WebVitalMetric[]) => {
    if (metrics.length === 0) return;

    const batchData: WebVitalsBatch = {
      metrics,
      batchId: generateBatchId(),
      timestamp: Date.now()
    };

    // Optional client-side validation before sending
    if (finalConfig.enableValidation) {
      try {
        // Validate each metric in the batch
        for (const metric of metrics) {
          const validationResult = safeValidateWebVitalMetric(metric);
          if (!validationResult.success) {
            console.warn('Invalid metric detected, skipping:', {
              metric: metric,
              errors: validationResult.error.issues
            });
            return; // Skip this batch if any metric is invalid
          }
        }
      } catch (error) {
        console.error('Validation error in batch:', error);
        return;
      }
    }

    const payload = JSON.stringify(batchData);

    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const success = navigator.sendBeacon(finalConfig.endpoint, blob);
      
      if (!success) {
        console.warn('sendBeacon failed, trying fetch fallback');
        await fetchFallback(payload);
      }
    } else {
      // Fallback for browsers without sendBeacon
      await fetchFallback(payload);
    }
  }, [finalConfig.endpoint, finalConfig.enableValidation]);

  const fetchFallback = useCallback(async (payload: string) => {
    try {
      const response = await fetch(finalConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Failed to send web vitals:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
      }
    } catch (error) {
      console.warn('Fetch fallback failed:', error);
    }
  }, [finalConfig.endpoint]);

  const flushQueue = useCallback(() => {
    if (metricsQueue.current.length > 0) {
      sendBatch([...metricsQueue.current]);
      metricsQueue.current = [];
    }
    
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
  }, [sendBatch]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return;
    
    flushTimer.current = setTimeout(flushQueue, finalConfig.flushInterval);
  }, [flushQueue, finalConfig.flushInterval]);

  const addMetric = useCallback((metric: WebVitalMetric) => {
    // Optional client-side validation before adding to queue
    if (finalConfig.enableValidation) {
      const validationResult = safeValidateWebVitalMetric(metric);
      if (!validationResult.success) {
        console.warn('Invalid metric received, skipping:', {
          metric,
          errors: validationResult.error.issues
        });
        return;
      }
    }

    metricsQueue.current.push(metric);
    
    // Flush immediately if batch size reached
    if (metricsQueue.current.length >= finalConfig.maxBatchSize) {
      flushQueue();
    } else {
      scheduleFlush();
    }
  }, [flushQueue, scheduleFlush, finalConfig.maxBatchSize, finalConfig.enableValidation]);

  // Set up the web vitals reporting
  useReportWebVitals((metric) => {
    try {
      const webVitalMetric: WebVitalMetric = {
        id: metric.id,
        name: metric.name as any, // Type assertion needed due to next/web-vitals types
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: sessionId.current,
        // Add userId if available (e.g., from auth context)
        userId: getUserId() // Implement this based on your auth system
      };
      
      addMetric(webVitalMetric);
    } catch (error) {
      console.error('Error processing web vital metric:', error);
    }
  });

  // Flush on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushQueue();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushQueue();
      }
    };

    const handlePageHide = () => {
      flushQueue();
    };

    // Multiple event listeners for better coverage
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
      flushQueue(); // Final flush on cleanup
    };
  }, [flushQueue]);

  return { 
    flushQueue,
    getQueueSize: () => metricsQueue.current.length,
    getSessionId: () => sessionId.current
  };
}

// Utility functions
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateBatchId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getUserId(): string | undefined {
  // Implement based on your authentication system
  // Example: return useAuth()?.user?.id;
  return undefined;
}