'use client';

import { useWebVitalsBatcher } from '@/app/lib/hooks/use-web-vitals';
import { useEffect } from 'react';

interface WebVitalsProviderProps {
  config?: {
    maxBatchSize?: number;
    flushInterval?: number;
    endpoint?: string;
    enableValidation?: boolean;
    enabled?: boolean;
    samplingRate?: number;
  };
}

export function WebVitalsProvider({ config }: WebVitalsProviderProps) {
  const { flushQueue, getQueueSize, getSessionId } = useWebVitalsBatcher({
    maxBatchSize: config?.maxBatchSize ?? 10,
    flushInterval: config?.flushInterval ?? 30000, // 30 seconds
    endpoint: config?.endpoint ?? '/api/web-vitals',
    enableValidation: config?.enableValidation ?? true,
    enabled: config?.enabled ?? true,
    samplingRate: config?.samplingRate ?? 1.0,
  });

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('WebVitalsProvider initialized with config:', config);
      console.log('Web Vitals session:', getSessionId());
      console.log('Current URL:', window.location.href);
    }
  }, [config, getSessionId]);

  // Optional: Add development tools
  if (process.env.NODE_ENV === 'development') {
    // You can add debugging info here
    console.log('Web Vitals session:', getSessionId());
  }

  // This component doesn't render anything visible
  return null;
}