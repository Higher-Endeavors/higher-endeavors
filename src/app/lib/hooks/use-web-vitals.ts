// hooks/useWebVitalsBatcher.ts
import { useCallback, useEffect, useRef } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  safeValidateWebVitalMetric, 
  type WebVitalMetric,
  type WebVitalsBatch 
} from '@/app/lib/types/web-vitals';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface BatchConfig {
  maxBatchSize?: number;
  flushInterval?: number; // milliseconds
  endpoint?: string;
  enableValidation?: boolean; // Option to disable client-side validation
  enabled?: boolean; // Whether web vitals collection is enabled
  samplingRate?: number; // Sampling rate between 0 and 1
}

const DEFAULT_CONFIG: Required<BatchConfig> = {
  maxBatchSize: 10,
  flushInterval: 30000, // 30 seconds
  endpoint: '/api/web-vitals',
  enableValidation: true,
  enabled: true,
  samplingRate: 1.0
};

export function useWebVitalsBatcher(config: BatchConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const metricsQueue = useRef<WebVitalMetric[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(generateSessionId());
  const currentUrl = useRef<string>('');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      clientLogger.info('Web Vitals Batcher initialized with config:', { finalConfig });
      clientLogger.info('Current URL:', { url: window.location.href });
      currentUrl.current = window.location.href;
    }
  }, [finalConfig]);

  // Track route changes using Next.js navigation
  useEffect(() => {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl.current) {
      if (process.env.NODE_ENV === 'development') {
        clientLogger.info('Route changed from', { from: currentUrl.current, to: newUrl });
        clientLogger.info('Pathname:', { pathname });
        clientLogger.info('Search params:', { searchParams: searchParams.toString() });
      }
      currentUrl.current = newUrl;
      
      // Flush any pending metrics when route changes
      if (metricsQueue.current.length > 0) {
        flushQueue();
      }
    }
  }, [pathname, searchParams]);

  const sendBatch = useCallback(async (metrics: WebVitalMetric[]) => {
    if (metrics.length === 0) return;

    const batchData: WebVitalsBatch = {
      metrics,
      batchId: generateBatchId(),
      timestamp: Date.now()
    };
    clientLogger.info('Sending web vitals batch:', { batchData });

    // Debug logging
    // if (process.env.NODE_ENV === 'development') {
    //   clientLogger.info('Sending web vitals batch:', { batchId: batchData.batchId, metricCount: metrics.length, metrics: metrics.map(m => m.name) });
    // }

    // Optional client-side validation before sending
    if (finalConfig.enableValidation) {
      try {
        // Validate each metric in the batch
        for (const metric of metrics) {
          const validationResult = safeValidateWebVitalMetric(metric);
          if (!validationResult.success) {
            clientLogger.warn('Invalid metric detected, skipping:', {
              metric: metric,
              errors: validationResult.error.issues
            });
            return; // Skip this batch if any metric is invalid
          }
        }
      } catch (error) {
        clientLogger.error('Validation error in batch:', error);
        return;
      }
    }

    const payload = JSON.stringify(batchData);

    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const success = navigator.sendBeacon(finalConfig.endpoint, blob);
      
      if (!success) {
        clientLogger.warn('sendBeacon failed, trying fetch fallback');
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
        clientLogger.warn('Failed to send web vitals:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
      }
    } catch (error) {
      clientLogger.warn('Fetch fallback failed:', { error });
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
    // Check if web vitals collection is enabled
    if (!finalConfig.enabled) {
      if (process.env.NODE_ENV === 'development') {
        clientLogger.info('Web vitals collection is disabled, skipping metric:', { metric: metric.name });
      }
      return;
    }

    // Apply sampling rate
    if (finalConfig.samplingRate < 1.0 && Math.random() > finalConfig.samplingRate) {
      if (process.env.NODE_ENV === 'development') {
        clientLogger.info('Metric skipped due to sampling rate:', { metric: metric.name });
      }
      return; // Skip this metric based on sampling rate
    }

    // Optional client-side validation before adding to queue
    if (finalConfig.enableValidation) {
      const validationResult = safeValidateWebVitalMetric(metric);
      if (!validationResult.success) {
        clientLogger.warn('Invalid metric received, skipping:', {
          metric,
          errors: validationResult.error.issues
        });
        return;
      }
    }

    // Debug logging
    // if (process.env.NODE_ENV === 'development') {
    //   clientLogger.info('Adding web vital metric:', { name: metric.name, value: metric.value, url: metric.url, queueSize: metricsQueue.current.length });
    // }

    metricsQueue.current.push(metric);
    
    // Flush immediately if batch size reached
    if (metricsQueue.current.length >= finalConfig.maxBatchSize) {
      flushQueue();
    } else {
      scheduleFlush();
    }
  }, [flushQueue, scheduleFlush, finalConfig.maxBatchSize, finalConfig.enableValidation, finalConfig.enabled, finalConfig.samplingRate]);

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
      
      // Debug logging for metric collection
      // if (process.env.NODE_ENV === 'development') {
      //   clientLogger.info('Web vital metric collected:', { name: webVitalMetric.name, value: webVitalMetric.value, url: webVitalMetric.url });
      // }
      
      addMetric(webVitalMetric);
    } catch (error) {
      clientLogger.error('Error processing web vital metric:', error);
    }
  });

  // Track URL changes for debugging
  useEffect(() => {
    const handleUrlChange = () => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl.current) {
        if (process.env.NODE_ENV === 'development') {
          clientLogger.info('URL changed from', { from: currentUrl.current, to: newUrl });
        }
        currentUrl.current = newUrl;
      }
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleUrlChange);
    
    // For Next.js client-side navigation, we can also listen to route changes
    // This is a basic approach - you might want to use Next.js router events
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleUrlChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

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